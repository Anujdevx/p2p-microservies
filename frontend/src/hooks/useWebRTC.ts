import { useState, useRef, useEffect, useCallback } from 'react';
import { networkService } from '@/services/api';

const CHUNK_SIZE = 64 * 1024; // 64 KB chunks for WebRTC DataChannel optimal transfer

type FileTransferMetadata = {
  fileName: string;
  fileSize: number;
  fileType: string;
};

export function useWebRTC(currentUserId: string) {
  // Dictionary: peerId -> RTCPeerConnection
  const connections = useRef<Map<string, RTCPeerConnection>>(new Map());
  // Dictionary: peerId -> RTCDataChannel
  const channels = useRef<Map<string, RTCDataChannel>>(new Map());
  const ws = useRef<WebSocket | null>(null);

  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [transferProgress, setTransferProgress] = useState(0);

  // Initialize unified signaling WebSocket
  useEffect(() => {
    if (!currentUserId) return;

    // Connect to file-transfer-service WebSocket signaling server via API Gateway
    ws.current = new WebSocket(`ws://localhost:8080/ws?userId=${currentUserId}`);

    ws.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      const { type, senderId, targetId, payload } = message;

      if (targetId !== currentUserId) return;

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
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(payload));
      }
    };

    return () => {
      ws.current?.close();
      connections.current.forEach(pc => pc.close());
    };
  }, [currentUserId]);

  const sendSignal = (targetId: string, type: string, payload: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, senderId: currentUserId, targetId, payload }));
    }
  };

  const createPeerConnection = (peerId: string): RTCPeerConnection => {
    if (connections.current.has(peerId)) {
      return connections.current.get(peerId)!;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(peerId, 'ice-candidate', event.candidate);
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      setupDataChannel(peerId, channel);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        connections.current.delete(peerId);
        channels.current.delete(peerId);
        setConnectedPeers(prev => prev.filter(id => id !== peerId));
      }
    };

    connections.current.set(peerId, pc);
    return pc;
  };

  const setupDataChannel = (peerId: string, channel: RTCDataChannel) => {
    channel.binaryType = 'arraybuffer';
    
    channel.onopen = () => {
      channels.current.set(peerId, channel);
      setConnectedPeers(prev => [...new Set([...prev, peerId])]);
    };

    channel.onclose = () => {
      channels.current.delete(peerId);
      setConnectedPeers(prev => prev.filter(id => id !== peerId));
    };

    channel.onmessage = (event) => {
      // In a real implementation you would handle receiving byte chunks and stitching them into a Blob
      console.log(`Received data from ${peerId}:`, event.data);
    };
  };

  const connectToPeer = async (targetId: string) => {
    const pc = createPeerConnection(targetId);
    
    // Create reliable data channel for file transfer
    const channel = pc.createDataChannel('fileTransfer', { ordered: true });
    setupDataChannel(targetId, channel);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal(targetId, 'offer', pc.localDescription);
  };

  const broadcastChunk = (chunk: ArrayBuffer, targetPeers: string[]) => {
    targetPeers.forEach(peerId => {
      const channel = channels.current.get(peerId);
      if (channel && channel.readyState === 'open') {
        channel.send(chunk);
      }
    });
  };

  // WebRTC Mesh logic implementation
  const sendToGroup = async (groupId: number, file: File) => {
    try {
      // 1. Fetch active members in this group from the network service
      const response = await networkService.fetchGroupPeers(groupId);
      const activeMembers = response.data || [];
      const targetPeerIds = activeMembers.map((p: any) => p.peerId).filter((id: string) => id !== currentUserId);

      // 2. Initiate simultaneous WebRTC mesh negotiation for all active members
      await Promise.all(targetPeerIds.map((id: string) => connectToPeer(id)));

      // 3. Wait gracefully for all data channels to verify 'open' state (simplified for demo)
      await new Promise(resolve => setTimeout(resolve, 2000)); 

      // 4. File Slicing and Mesh Broadcasting loop
      const metadata: FileTransferMetadata = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };

      // Broadcast metadata as JSON first
      const metadataStr = JSON.stringify({ type: 'metadata', ...metadata });
      targetPeerIds.forEach(peerId => {
        const channel = channels.current.get(peerId);
        if (channel?.readyState === 'open') channel.send(metadataStr);
      });

      // Slice and Broadcast
      let offset = 0;
      setTransferProgress(0);

      while (offset < file.size) {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const arrayBuffer = await slice.arrayBuffer();
        
        broadcastChunk(arrayBuffer, targetPeerIds);
        
        offset += CHUNK_SIZE;
        setTransferProgress(Math.min(100, Math.round((offset / file.size) * 100)));
        
        // Yield to event loop to prevent locking the browser UI thread
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      console.log(`Successfully broadcasted ${file.name} to mesh group ${groupId}`);
    } catch (err) {
      console.error('Group transmission failed', err);
    }
  };

  return {
    sendToGroup,
    connectToPeer,
    connectedPeers,
    transferProgress
  };
}
