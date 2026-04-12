package com.microservices.peer.repository;

import com.microservices.peer.entity.PeerGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PeerGroupRepository extends JpaRepository<PeerGroup, Long> {
}
