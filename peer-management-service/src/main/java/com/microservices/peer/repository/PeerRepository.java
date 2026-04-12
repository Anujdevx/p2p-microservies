package com.microservices.peer.repository;

import com.microservices.peer.entity.Peer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PeerRepository extends JpaRepository<Peer, String> {
    List<Peer> findByStatus(String status);
}
