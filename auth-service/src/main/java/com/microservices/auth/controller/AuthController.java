package com.microservices.auth.controller;

import com.microservices.auth.entity.UserCredentials;
import com.microservices.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.microservices.auth.repository.UserCredentialsRepository;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService service;

    @Autowired
    private UserCredentialsRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<String> addNewUser(@RequestBody UserCredentials user) {
        try {
            return ResponseEntity.ok(service.saveUser(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> getToken(@RequestBody UserCredentials user) {
        Optional<UserCredentials> storedUser = repository.findByUsername(user.getUsername());
        if (storedUser.isPresent() && passwordEncoder.matches(user.getPassword(), storedUser.get().getPassword())) {
            String token = service.generateToken(user.getUsername());
            return ResponseEntity.ok(Map.of("token", token));
        } else {
            return ResponseEntity.status(401).body("Invalid access");
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<String> validateToken(@RequestParam("token") String token) {
        service.validateToken(token);
        return ResponseEntity.ok("Token is valid");
    }
}
