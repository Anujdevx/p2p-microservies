package com.microservices.peer.service;

import com.microservices.peer.entity.Peer;
import com.microservices.peer.repository.PeerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PeerService {

    @Autowired
    private PeerRepository repository;

    public Peer registerPeer(Peer peer) {
        peer.setStatus("ACTIVE");
        peer.setLastSeen(LocalDateTime.now());
        return repository.save(peer);
    }

    public void deregisterPeer(String peerId) {
        repository.findById(peerId).ifPresent(peer -> {
            peer.setStatus("INACTIVE");
            repository.save(peer);
        });
    }

    public List<Peer> getActivePeers() {
        return repository.findByStatus("ACTIVE");
    }
}
