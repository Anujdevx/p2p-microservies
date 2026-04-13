package com.microservices.peer.controller;

import com.microservices.peer.dto.ActiveContactDTO;
import com.microservices.peer.dto.ContactDTO;
import com.microservices.peer.dto.FriendRequestDTO;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
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

    @Autowired
    private RestTemplate restTemplate;

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

    /**
     * Check if a user exists via the auth-service.
     * Uses Docker internal hostname for container-to-container communication.
     */
    private boolean userExistsInAuthService(String username) {
        try {
            ResponseEntity<Boolean> response = restTemplate.getForEntity(
                    "http://auth-service:8085/auth/exists/" + username,
                    Boolean.class
            );
            return Boolean.TRUE.equals(response.getBody());
        } catch (Exception e) {
            // If auth-service is unreachable, fail open (don't block)
            return false;
        }
    }

    // ─────────────────────────── Friend Request Endpoints ───────────────────────────

    /**
     * Send a friend request. Validates user exists first.
     */
    @PostMapping("/contacts/{contactUsername}")
    public ResponseEntity<?> addContact(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
                                         @PathVariable String contactUsername) {
        String userId = extractUserId(authHeader);

        // Can't add yourself
        if (userId.equals(contactUsername)) {
            return ResponseEntity.badRequest().body(Map.of("error", "You cannot add yourself"));
        }

        // Check if user exists in auth-service
        if (!userExistsInAuthService(contactUsername)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User '" + contactUsername + "' not found"));
        }

        // Check if a request already exists (in either direction)
        if (contactRepository.existsByUserIdAndContactUserId(userId, contactUsername)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Request already sent to '" + contactUsername + "'"));
        }

        // Check if the other person already sent us a request — auto-accept
        var incomingRequest = contactRepository.findByUserIdAndContactUserId(contactUsername, userId);
        if (incomingRequest.isPresent()) {
            Contact existing = incomingRequest.get();
            if ("PENDING".equals(existing.getStatus())) {
                // Auto-accept: they already wanted to be friends
                existing.setStatus("ACCEPTED");
                contactRepository.save(existing);
                // Create reverse record
                contactRepository.save(new Contact(userId, contactUsername, "ACCEPTED"));
                return ResponseEntity.ok(Map.of("message", "You are now connected with " + contactUsername));
            } else if ("ACCEPTED".equals(existing.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Already connected with '" + contactUsername + "'"));
            }
        }

        // Create pending request
        contactRepository.save(new Contact(userId, contactUsername, "PENDING"));
        return ResponseEntity.ok(Map.of("message", "Friend request sent to " + contactUsername));
    }

    /**
     * Get incoming pending friend requests for the current user.
     */
    @GetMapping("/requests/incoming")
    public ResponseEntity<List<FriendRequestDTO>> getIncomingRequests(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        String userId = extractUserId(authHeader);
        List<Contact> pending = contactRepository.findByContactUserIdAndStatus(userId, "PENDING");
        List<FriendRequestDTO> requests = pending.stream()
                .map(c -> new FriendRequestDTO(c.getId(), c.getUserId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(requests);
    }

    /**
     * Accept a friend request.
     */
    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<?> acceptRequest(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
                                            @PathVariable Long requestId) {
        String userId = extractUserId(authHeader);
        return contactRepository.findById(requestId)
                .filter(c -> c.getContactUserId().equals(userId) && "PENDING".equals(c.getStatus()))
                .map(contact -> {
                    // Accept the incoming request
                    contact.setStatus("ACCEPTED");
                    contactRepository.save(contact);
                    // Create the reverse record (bidirectional friendship)
                    if (!contactRepository.existsByUserIdAndContactUserId(userId, contact.getUserId())) {
                        contactRepository.save(new Contact(userId, contact.getUserId(), "ACCEPTED"));
                    }
                    return ResponseEntity.ok(Map.of("message", "Accepted request from " + contact.getUserId()));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Request not found or already processed")));
    }

    /**
     * Reject a friend request.
     */
    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
                                            @PathVariable Long requestId) {
        String userId = extractUserId(authHeader);
        return contactRepository.findById(requestId)
                .filter(c -> c.getContactUserId().equals(userId) && "PENDING".equals(c.getStatus()))
                .map(contact -> {
                    contact.setStatus("REJECTED");
                    contactRepository.save(contact);
                    return ResponseEntity.ok(Map.of("message", "Rejected request from " + contact.getUserId()));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Request not found or already processed")));
    }

    // ─────────────────────────── Contact Endpoints ───────────────────────────

    /**
     * Returns active contacts as ActiveContactDTOs (only ACCEPTED contacts).
     * Each DTO groups a contact username with all their active sessionIds.
     */
    @GetMapping("/active")
    public ResponseEntity<List<ActiveContactDTO>> getActiveContacts(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        String userId = extractUserId(authHeader);
        List<Contact> contacts = contactRepository.findByUserIdAndStatus(userId, "ACCEPTED");

        List<ActiveContactDTO> activeContacts = new ArrayList<>();
        for (Contact contact : contacts) {
            List<Peer> sessions = peerService.getActiveSessionsForUser(contact.getContactUserId());
            if (!sessions.isEmpty()) {
                List<String> sessionIds = sessions.stream()
                        .map(Peer::getSessionId)
                        .collect(Collectors.toList());
                activeContacts.add(new ActiveContactDTO(contact.getContactUserId(), sessionIds));
            }
        }
        return ResponseEntity.ok(activeContacts);
    }

    /**
     * Returns ALL accepted contacts for the current user, each with their online/offline status.
     */
    @GetMapping("/contacts")
    public ResponseEntity<List<ContactDTO>> getAllContacts(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        String userId = extractUserId(authHeader);
        List<Contact> contacts = contactRepository.findByUserIdAndStatus(userId, "ACCEPTED");

        List<ContactDTO> allContacts = new ArrayList<>();
        for (Contact contact : contacts) {
            List<Peer> sessions = peerService.getActiveSessionsForUser(contact.getContactUserId());
            boolean online = !sessions.isEmpty();
            List<String> sessionIds = sessions.stream()
                    .map(Peer::getSessionId)
                    .collect(Collectors.toList());
            allContacts.add(new ContactDTO(contact.getContactUserId(), online, sessionIds));
        }
        return ResponseEntity.ok(allContacts);
    }

    // ─────────────────────────── Group Endpoints ───────────────────────────

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

    @GetMapping("/groups/mine")
    public ResponseEntity<List<PeerGroup>> getMyGroups(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        String userId = extractUserId(authHeader);
        List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);
        List<Long> groupIds = memberships.stream().map(GroupMember::getGroupId).collect(Collectors.toList());
        List<PeerGroup> myGroups = peerGroupRepository.findAllById(groupIds);
        return ResponseEntity.ok(myGroups);
    }

    /**
     * Returns active group members as ActiveContactDTOs.
     */
    @GetMapping("/groups/{groupId}/active")
    public ResponseEntity<List<ActiveContactDTO>> getActiveGroupMembers(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
                                                            @PathVariable Long groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<ActiveContactDTO> activeGroupMembers = new ArrayList<>();

        for (GroupMember member : members) {
            List<Peer> sessions = peerService.getActiveSessionsForUser(member.getUserId());
            if (!sessions.isEmpty()) {
                List<String> sessionIds = sessions.stream()
                        .map(Peer::getSessionId)
                        .collect(Collectors.toList());
                activeGroupMembers.add(new ActiveContactDTO(member.getUserId(), sessionIds));
            }
        }
        return ResponseEntity.ok(activeGroupMembers);
    }
}
