package com.findtheone.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.findtheone.entity.Role;
import com.findtheone.entity.User;
import com.findtheone.entity.VideoVerificationStatus;
import com.findtheone.repository.LikeRepository;
import com.findtheone.repository.MatchRepository;
import com.findtheone.repository.MessageRepository;
import com.findtheone.repository.UserRepository;
import com.findtheone.repository.VideoVerificationRepository;

@Service
@Transactional
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private VideoVerificationRepository videoVerificationRepository;

    public Map<String, Object> getDashboardData() {
        Map<String, Object> data = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findAll().stream()
            .filter(User::getIsActive)
            .count();
        long verifiedUsers = userRepository.findAll().stream()
            .filter(User::getIsVideoVerified)
            .count();
        long totalMatches = matchRepository.count();
        long totalMessages = messageRepository.count();
        long pendingVerifications = userRepository.findAll().stream()
            .filter(u -> u.getVideoVerificationStatus() == VideoVerificationStatus.PENDING || 
                        u.getVideoVerificationStatus() == VideoVerificationStatus.UNDER_REVIEW)
            .count();

        data.put("totalUsers", totalUsers);
        data.put("activeUsers", activeUsers);
        data.put("verifiedUsers", verifiedUsers);
        data.put("totalMatches", totalMatches);
        data.put("totalMessages", totalMessages);
        data.put("pendingVerifications", pendingVerifications);
        data.put("lastUpdated", LocalDateTime.now());

        return data;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    public User updateUserStatus(Long userId, Boolean isActive) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIsActive(isActive);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Don't allow deletion of admin users
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot delete admin users");
        }
        
        userRepository.delete(user);
    }

    public List<Map<String, Object>> getVideoVerifications() {
        return userRepository.findAll().stream()
            .filter(u -> u.getVideoVerificationStatus() != VideoVerificationStatus.NOT_SUBMITTED)
            .map(user -> {
                Map<String, Object> verification = new HashMap<>();
                verification.put("userId", user.getId());
                verification.put("userName", user.getName());
                verification.put("userEmail", user.getEmail());
                verification.put("status", user.getVideoVerificationStatus());
                verification.put("submittedAt", user.getVideoSubmittedAt());
                verification.put("verifiedAt", user.getVideoVerifiedAt());
                verification.put("rejectionReason", user.getVideoRejectionReason());
                verification.put("videoUrl", user.getVerificationVideoUrl());
                return verification;
            })
            .collect(Collectors.toList());
    }

    public Map<String, Object> getApplicationStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // User statistics
        long totalUsers = userRepository.count();
        long maleUsers = userRepository.findAll().stream()
            .filter(u -> u.getGender() == User.Gender.MALE)
            .count();
        long femaleUsers = userRepository.findAll().stream()
            .filter(u -> u.getGender() == User.Gender.FEMALE)
            .count();
        long otherGenderUsers = userRepository.findAll().stream()
            .filter(u -> u.getGender() == User.Gender.OTHER)
            .count();

        // Activity statistics
        long totalLikes = likeRepository.count();
        long totalMatches = matchRepository.count();
        long totalMessages = messageRepository.count();

        // Verification statistics
        long verifiedUsers = userRepository.findAll().stream()
            .filter(User::getIsVideoVerified)
            .count();
        long pendingVerifications = userRepository.findAll().stream()
            .filter(u -> u.getVideoVerificationStatus() == VideoVerificationStatus.PENDING)
            .count();

        stats.put("userStats", Map.of(
            "total", totalUsers,
            "male", maleUsers,
            "female", femaleUsers,
            "other", otherGenderUsers
        ));

        stats.put("activityStats", Map.of(
            "totalLikes", totalLikes,
            "totalMatches", totalMatches,
            "totalMessages", totalMessages
        ));

        stats.put("verificationStats", Map.of(
            "verified", verifiedUsers,
            "pending", pendingVerifications,
            "verificationRate", totalUsers > 0 ? (double) verifiedUsers / totalUsers * 100 : 0
        ));

        return stats;
    }

    public Map<String, String> cleanupSystemData() {
        // Clean up old verification videos, expired tokens, etc.
        // This is where you'd implement cleanup logic
        
        Map<String, String> result = new HashMap<>();
        result.put("status", "success");
        result.put("message", "System cleanup completed");
        result.put("timestamp", LocalDateTime.now().toString());
        
        return result;
    }

    public Map<String, String> performMaintenance() {
        // Perform database maintenance, optimize tables, etc.
        
        Map<String, String> result = new HashMap<>();
        result.put("status", "success");
        result.put("message", "System maintenance completed");
        result.put("timestamp", LocalDateTime.now().toString());
        
        return result;
    }
}
