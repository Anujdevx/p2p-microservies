package com.microservices.peer.repository;

import com.microservices.peer.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByUserId(String userId);
    boolean existsByUserIdAndContactUserId(String userId, String contactUserId);
}
