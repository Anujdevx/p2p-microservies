package com.microservices.filemetadata.repository;

import com.microservices.filemetadata.entity.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {
    Optional<FileMetadata> findByFileId(String fileId);
    List<FileMetadata> findByOwnerId(String ownerId);
    List<FileMetadata> findByStatus(String status);
}
