package com.findtheone.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.findtheone.entity.Role;
import com.findtheone.repository.LikeRepository;
import com.findtheone.repository.MatchRepository;
import com.findtheone.repository.MessageRepository;
import com.findtheone.repository.UserPhotoRepository;
import com.findtheone.repository.UserRepository;
import com.findtheone.repository.VideoVerificationRepository;

@Service
@Transactional
public class DatabaseCleanupService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserPhotoRepository userPhotoRepository;

    @Autowired
    private VideoVerificationRepository videoVerificationRepository;

    public void cleanupTestData() {
        System.out.println("Starting database cleanup...");

        // Delete all messages
        messageRepository.deleteAll();
        System.out.println("Deleted all messages");

        // Delete all matches
        matchRepository.deleteAll();
        System.out.println("Deleted all matches");

        // Delete all likes
        likeRepository.deleteAll();
        System.out.println("Deleted all likes");

        // Delete all user photos
        userPhotoRepository.deleteAll();
        System.out.println("Deleted all user photos");

        // Delete all video verifications
        videoVerificationRepository.deleteAll();
        System.out.println("Deleted all video verifications");

        // Delete all non-admin users
        userRepository.findAll().stream()
            .filter(user -> user.getRole() != Role.ADMIN)
            .forEach(user -> {
                System.out.println("Deleting test user: " + user.getEmail());
                userRepository.delete(user);
            });

        System.out.println("Database cleanup completed!");
        System.out.println("Only admin users remain in the system.");
    }
}
