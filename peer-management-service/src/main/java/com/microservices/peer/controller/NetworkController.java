package com.microservices.peer.controller;

import com.microservices.peer.entity.Contact;
import com.microservices.peer.entity.GroupMember;
import com.microservices.peer.entity.Peer;
import com.microservices.peer.entity.PeerGroup;
import com.microservices.peer.repository.ContactRepository;
import com.microservices.peer.repository.GroupMemberRepository;
import com.microservices.peer.repository.PeerGroupRepository;
import com.microservices.peer.service.PeerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/network")
public class NetworkController {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private PeerGroupRepository peerGroupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private PeerService peerService;

    // Helper method to extract the username (sub) from the JWT
    private String extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized");
        }
        String token = authHeader.substring(7);
        String[] parts = token.split("\\.");
        if (parts.length < 2) {
            throw new RuntimeException("Invalid JWT");
        }
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
        // Simple manual parsing to avoid heavy imports just for extracting "sub"
        String search = "\"sub\":\"";
        int start = payload.indexOf(search) + search.length();
        int end = payload.indexOf("\"", start);
        return payload.substring(start, end);
    }

    @PostMapping("/contacts/{contactUsername}")
    public ResponseEntity<String> addContact(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
                                             @PathVariable String contactUsername) {
        String userId = extractUserId(authHeader);
        if (!contactRepository.existsByUserIdAndContactUserId(userId, contactUsername)) {
            contactRepository.save(new Contact(userId, contactUsername));
        }
        return ResponseEntity.ok("Contact added successfully");
    }

    public static class GroupRequest {
        public String groupName;
        public List<String> usernames;
    }

    @PostMapping("/groups")
    public ResponseEntity<PeerGroup> createGroup(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
                                                 @RequestBody GroupRequest request) {
        String userId = extractUserId(authHeader);
        
        PeerGroup group = new PeerGroup(request.groupName, userId);
        group = peerGroupRepository.save(group);
        
        // Add creator
        groupMemberRepository.save(new GroupMember(group.getId(), userId));
        
        // Add other members
        for (String member : request.usernames) {
            if (!member.equals(userId)) {
                groupMemberRepository.save(new GroupMember(group.getId(), member));
            }
        }
        
        return ResponseEntity.ok(group);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Peer>> getActiveContacts(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        String userId = extractUserId(authHeader);
        List<Contact> contacts = contactRepository.findByUserId(userId);
        
        List<Peer> activeContacts = new ArrayList<>();
        List<Peer> allActivePeers = peerService.getActivePeers();
        
        for (Contact contact : contacts) {
            for (Peer peer : allActivePeers) {
                if (peer.getPeerId().equals(contact.getContactUserId())) {
                    activeContacts.add(peer);
                    break;
                }
            }
        }
        return ResponseEntity.ok(activeContacts);
    }
    
    @GetMapping("/groups/mine")
    public ResponseEntity<List<PeerGroup>> getMyGroups(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        String userId = extractUserId(authHeader);
        List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);
        List<Long> groupIds = memberships.stream().map(GroupMember::getGroupId).collect(Collectors.toList());
        List<PeerGroup> myGroups = peerGroupRepository.findAllById(groupIds);
        return ResponseEntity.ok(myGroups);
    }

    @GetMapping("/groups/{groupId}/active")
    public ResponseEntity<List<Peer>> getActiveGroupMembers(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
                                                            @PathVariable Long groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<Peer> activeGroupMembers = new ArrayList<>();
        List<Peer> allActivePeers = peerService.getActivePeers();
        
        for (GroupMember member : members) {
            for (Peer peer : allActivePeers) {
                if (peer.getPeerId().equals(member.getUserId())) {
                    activeGroupMembers.add(peer);
                    break;
                }
            }
        }
        return ResponseEntity.ok(activeGroupMembers);
    }
}
