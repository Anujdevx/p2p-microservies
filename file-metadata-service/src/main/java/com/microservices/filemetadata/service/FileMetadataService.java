package com.microservices.filemetadata.service;

import com.microservices.filemetadata.entity.FileMetadata;
import com.microservices.filemetadata.repository.FileMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileMetadataService {
    private final FileMetadataRepository repository;
    
    public FileMetadata createMetadata(FileMetadata metadata) {
        if (metadata.getFileId() == null) {
            metadata.setFileId(UUID.randomUUID().toString());
        }
        return repository.save(metadata);
    }
    
    public Optional<FileMetadata> getMetadataByFileId(String fileId) {
        return repository.findByFileId(fileId);
    }
    
    public List<FileMetadata> getMetadataByOwnerId(String ownerId) {
        return repository.findByOwnerId(ownerId);
    }
    
    public List<FileMetadata> getAllMetadata() {
        return repository.findAll();
    }
    
    public FileMetadata updateMetadata(String fileId, FileMetadata updatedMetadata) {
        return repository.findByFileId(fileId)
            .map(existing -> {
                existing.setFileName(updatedMetadata.getFileName());
                existing.setFileType(updatedMetadata.getFileType());
                existing.setFileSize(updatedMetadata.getFileSize());
                existing.setChecksum(updatedMetadata.getChecksum());
                existing.setStatus(updatedMetadata.getStatus());
                existing.setDescription(updatedMetadata.getDescription());
                return repository.save(existing);
            })
            .orElseThrow(() -> new RuntimeException("File metadata not found"));
    }
    
    public void deleteMetadata(String fileId) {
        repository.findByFileId(fileId)
            .ifPresent(repository::delete);
    }
}
