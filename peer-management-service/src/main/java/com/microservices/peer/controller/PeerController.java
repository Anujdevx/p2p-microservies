package com.microservices.peer.controller;

import com.microservices.peer.entity.Peer;
import com.microservices.peer.service.PeerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/peers")
public class PeerController {

    @Autowired
    private PeerService service;

    @PostMapping("/register")
    public ResponseEntity<Peer> registerPeer(@RequestBody Peer peer) {
        return ResponseEntity.ok(service.registerPeer(peer));
    }

    @DeleteMapping("/{peerId}/deregister")
    public ResponseEntity<String> deregisterPeer(@PathVariable String peerId) {
        service.deregisterPeer(peerId);
        return ResponseEntity.ok("Peer deregistered successfully");
    }

    @GetMapping("/active")
    public ResponseEntity<List<Peer>> getActivePeers() {
        return ResponseEntity.ok(service.getActivePeers());
    }
}
