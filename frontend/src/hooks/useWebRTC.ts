import { useState, useRef, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { networkService } from '@/services/api';

const CHUNK_SIZE = 64 * 1024; // 64 KB
const BUFFERED_AMOUNT_LOW_THRESHOLD = 1 * 1024 * 1024;  // 1 MB
const MAX_BUFFERED_AMOUNT = 16 * 1024 * 1024;            // 16 MB

type FileTransferMetadata = {
  fileName: string;
  fileSize: number;
  fileType: string;
};

export function useWebRTC(currentUserId: string) {
  const connections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channels = useRef<Map<string, RTCDataChannel>>(new Map());
  const stompClient = useRef<Client | null>(null);

  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [transferProgress, setTransferProgress] = useState(0);

  // ── STOMP signaling setup ──────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const client = new Client({
      // SockJS factory — matches the Spring endpoint /ws with SockJS fallback
      webSocketFactory: () =>
        new SockJS(`http://localhost:8080/file-transfer/ws`) as WebSocket,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to our personal signal queue
        client.subscribe(`/queue/signal-${currentUserId}`, (frame) => {
          handleSignal(JSON.parse(frame.body));
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
      connections.current.forEach((pc) => pc.close());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // ── Signal helpers ─────────────────────────────────────────────────────────
  const sendSignal = (targetId: string, type: string, payload: any) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: '/app/signal',
        body: JSON.stringify({ type, sourcePeerId: currentUserId, targetPeerId: targetId, payload }),
      });
    }
  };

  const handleSignal = async (message: any) => {
    const { type, sourcePeerId: senderId, payload } = message;

    if (type === 'offer') {
      const pc = createPeerConnection(senderId);
      await pc.setRemoteDescription(new RTCSessionDescription(payload));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal(senderId, 'answer', pc.localDescription);
    } else if (type === 'answer') {
      const pc = connections.current.get(senderId);
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(payload));
    } else if (type === 'ice-candidate') {
      const pc = connections.current.get(senderId);
      if (pc && payload) await pc.addIceCandidate(new RTCIceCandidate(payload));
    }
  };

  // ── Peer connection helpers ────────────────────────────────────────────────
  const createPeerConnection = (peerId: string): RTCPeerConnection => {
    if (connections.current.has(peerId)) {
      return connections.current.get(peerId)!;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(peerId, 'ice-candidate', event.candidate);
      }
    };

    pc.ondatachannel = (event) => {
      setupDataChannel(peerId, event.channel);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        connections.current.delete(peerId);
        channels.current.delete(peerId);
        setConnectedPeers((prev) => prev.filter((id) => id !== peerId));
      }
    };

    connections.current.set(peerId, pc);
    return pc;
  };

  const setupDataChannel = (peerId: string, channel: RTCDataChannel) => {
    channel.binaryType = 'arraybuffer';
    channel.bufferedAmountLowThreshold = BUFFERED_AMOUNT_LOW_THRESHOLD;

    channel.onopen = () => {
      channels.current.set(peerId, channel);
      setConnectedPeers((prev) => [...new Set([...prev, peerId])]);
    };

    channel.onclose = () => {
      channels.current.delete(peerId);
      setConnectedPeers((prev) => prev.filter((id) => id !== peerId));
    };

    channel.onmessage = (event) => {
      console.log(`Received data from ${peerId}:`, event.data);
    };
  };

  // ── Connect to a peer and wait for the data channel to open ───────────────
  const connectToPeer = async (targetId: string): Promise<void> => {
    if (channels.current.get(targetId)?.readyState === 'open') return;

    // Clean up any stale connection first
    if (connections.current.has(targetId)) {
      connections.current.get(targetId)!.close();
      connections.current.delete(targetId);
      channels.current.delete(targetId);
    }

    const pc = createPeerConnection(targetId);
    const channel = pc.createDataChannel('fileTransfer', { ordered: true });
    setupDataChannel(targetId, channel);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal(targetId, 'offer', pc.localDescription);

    // Wait for the channel to open (up to 20 s)
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('WebRTC connection timeout — make sure the other peer is online and connected')),
        20000
      );

      // Resolve immediately if it opens via the onopen callback
      const originalOnOpen = channel.onopen;
      channel.onopen = (e) => {
        clearTimeout(timeout);
        if (originalOnOpen) (originalOnOpen as EventListener)(e);
        resolve();
      };

      // Also handle connection failure
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') {
          clearTimeout(timeout);
          reject(new Error('WebRTC connection failed'));
        }
      };
    });
  };

  // ── Send a file to a single peer ──────────────────────────────────────────
  const sendFile = async (targetId: string, file: File): Promise<void> => {
    setTransferProgress(0);
    await connectToPeer(targetId);

    const channel = channels.current.get(targetId);
    if (!channel || channel.readyState !== 'open') {
      throw new Error('Data channel not open after connection');
    }

    // Send metadata header
    const metadata: FileTransferMetadata = { fileName: file.name, fileSize: file.size, fileType: file.type };
    channel.send(JSON.stringify({ type: 'metadata', ...metadata }));

    // Stream chunks with backpressure
    let offset = 0;
    while (offset < file.size) {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const arrayBuffer = await slice.arrayBuffer();
      await waitForBufferDrain(channel);
      channel.send(arrayBuffer);
      offset += CHUNK_SIZE;
      setTransferProgress(Math.min(100, Math.round((offset / file.size) * 100)));
      await new Promise((r) => setTimeout(r, 0)); // yield to UI
    }
  };

  // ── Backpressure helpers ───────────────────────────────────────────────────
  const waitForBufferDrain = (channel: RTCDataChannel): Promise<void> => {
    if (channel.bufferedAmount < MAX_BUFFERED_AMOUNT) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const onLow = () => {
        channel.removeEventListener('bufferedamountlow', onLow);
        resolve();
      };
      channel.addEventListener('bufferedamountlow', onLow);
    });
  };

  const broadcastChunkWithBackpressure = async (chunk: ArrayBuffer, targetPeers: string[]) => {
    for (const peerId of targetPeers) {
      const channel = channels.current.get(peerId);
      if (channel?.readyState === 'open') {
        await waitForBufferDrain(channel);
        channel.send(chunk);
      }
    }
  };

  // ── Send a file to a mesh group ───────────────────────────────────────────
  const sendToGroup = async (groupId: number, file: File) => {
    try {
      const response = await networkService.fetchGroupPeers(groupId);
      const activeMembers = response.data || [];

      const targetPeerIds: string[] = [];
      for (const dto of activeMembers) {
        for (const sid of dto.sessionIds || []) {
          if (sid !== currentUserId) targetPeerIds.push(sid);
        }
      }

      if (targetPeerIds.length === 0) throw new Error('No active peers in group');

      await Promise.all(targetPeerIds.map((id) => connectToPeer(id)));

      const metadataStr = JSON.stringify({ type: 'metadata', fileName: file.name, fileSize: file.size, fileType: file.type });
      targetPeerIds.forEach((peerId) => {
        const ch = channels.current.get(peerId);
        if (ch?.readyState === 'open') ch.send(metadataStr);
      });

      let offset = 0;
      setTransferProgress(0);
      while (offset < file.size) {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const arrayBuffer = await slice.arrayBuffer();
        await broadcastChunkWithBackpressure(arrayBuffer, targetPeerIds);
        offset += CHUNK_SIZE;
        setTransferProgress(Math.min(100, Math.round((offset / file.size) * 100)));
        await new Promise((r) => setTimeout(r, 0));
      }
    } catch (err) {
      console.error('Group transmission failed', err);
      throw err;
    }
  };

  return { sendFile, sendToGroup, connectToPeer, connectedPeers, transferProgress };
}
