package com.microservices.peer.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "peers")
public class Peer {
    @Id
    private String peerId;
    private String ipAddress;
    private int port;
    private String status; // e.g., ACTIVE, INACTIVE
    private LocalDateTime lastSeen;

    public Peer() {}

    public Peer(String peerId, String ipAddress, int port, String status) {
        this.peerId = peerId;
        this.ipAddress = ipAddress;
        this.port = port;
        this.status = status;
        this.lastSeen = LocalDateTime.now();
    }

    public String getPeerId() { return peerId; }
    public void setPeerId(String peerId) { this.peerId = peerId; }
    
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public int getPort() { return port; }
    public void setPort(int port) { this.port = port; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(LocalDateTime lastSeen) { this.lastSeen = lastSeen; }
}
