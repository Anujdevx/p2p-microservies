package com.microservices.filemetadata.controller;

import com.microservices.filemetadata.entity.FileMetadata;
import com.microservices.filemetadata.service.FileMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/file-metadata")
@RequiredArgsConstructor
public class FileMetadataController {
    private final FileMetadataService service;
    
    @PostMapping
    public ResponseEntity<FileMetadata> createMetadata(@RequestBody FileMetadata metadata) {
        return ResponseEntity.ok(service.createMetadata(metadata));
    }
    
    @GetMapping("/{fileId}")
    public ResponseEntity<FileMetadata> getMetadata(@PathVariable String fileId) {
        return service.getMetadataByFileId(fileId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<FileMetadata>> getMetadataByOwner(@PathVariable String ownerId) {
        return ResponseEntity.ok(service.getMetadataByOwnerId(ownerId));
    }
    
    @GetMapping
    public ResponseEntity<List<FileMetadata>> getAllMetadata() {
        return ResponseEntity.ok(service.getAllMetadata());
    }
    
    @PutMapping("/{fileId}")
    public ResponseEntity<FileMetadata> updateMetadata(
            @PathVariable String fileId,
            @RequestBody FileMetadata metadata) {
        return ResponseEntity.ok(service.updateMetadata(fileId, metadata));
    }
    
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteMetadata(@PathVariable String fileId) {
        service.deleteMetadata(fileId);
        return ResponseEntity.noContent().build();
    }
}
