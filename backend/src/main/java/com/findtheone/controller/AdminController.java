package com.findtheone.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.findtheone.entity.User;
import com.findtheone.entity.VideoVerification;
import com.findtheone.repository.UserRepository;
import com.findtheone.repository.VideoVerificationRepository;
import com.findtheone.service.UrlService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VideoVerificationRepository videoVerificationRepository;

    @Autowired
    private UrlService urlService;

    /**
     * Fix profile photo URLs in the database
     * This endpoint helps migrate from old IP-based URLs to localhost URLs
     */
    @PostMapping("/fix-photo-urls")
    public ResponseEntity<?> fixPhotoUrls() {
        try {
            List<User> users = userRepository.findAll();
            int updatedCount = 0;

            for (User user : users) {
                String profilePhotoUrl = user.getProfilePhotoUrl();
                if (profilePhotoUrl != null) {
                    String originalUrl = profilePhotoUrl;
                    String normalizedUrl = urlService.normalizePhotoUrl(profilePhotoUrl);

                    if (!originalUrl.equals(normalizedUrl)) {
                        System.out.println("Updating user " + user.getEmail() +
                                " photo URL from: " + originalUrl +
                                " to: " + normalizedUrl);
                        user.setProfilePhotoUrl(normalizedUrl);
                        userRepository.save(user);
                        updatedCount++;
                    }
                }
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Photo URLs updated successfully",
                    "updatedUsers", updatedCount,
                    "totalUsers", users.size()));

        } catch (Exception e) {
            System.err.println("Error fixing photo URLs: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to fix photo URLs: " + e.getMessage()));
        }
    }

    /**
     * Get all users with their photo URLs for debugging
     */
    @GetMapping("/debug-photo-urls")
    public ResponseEntity<?> debugPhotoUrls() {
        try {
            List<User> users = userRepository.findAll();

            return ResponseEntity.ok(users.stream().map(user -> Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "profilePhotoUrl", user.getProfilePhotoUrl() != null ? user.getProfilePhotoUrl() : "null"))
                    .toList());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to get photo URLs: " + e.getMessage()));
        }
    }

    /**
     * Verify all users' emails
     * This endpoint sets isEmailVerified to true for all users
     */
    @PostMapping("/verify-all-emails")
    public ResponseEntity<?> verifyAllEmails() {
        try {
            List<User> users = userRepository.findAll();
            int updatedCount = 0;

            for (User user : users) {
                if (!user.getIsEmailVerified()) {
                    System.out.println("Verifying email for user: " + user.getEmail());
                    user.setIsEmailVerified(true);
                    userRepository.save(user);
                    updatedCount++;
                }
            }

            return ResponseEntity.ok(Map.of(
                    "message", "All user emails verified successfully",
                    "updatedUsers", updatedCount,
                    "totalUsers", users.size()));

        } catch (Exception e) {
            System.err.println("Error verifying emails: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to verify emails: " + e.getMessage()));
        }
    }

    /**
     * Get all users with their email verification status for debugging
     */
    @GetMapping("/debug-email-verification")
    public ResponseEntity<?> debugEmailVerification() {
        try {
            List<User> users = userRepository.findAll();

            return ResponseEntity.ok(users.stream().map(user -> Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "name", user.getName(),
                    "isEmailVerified", user.getIsEmailVerified()))
                    .toList());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to get email verification status: " + e.getMessage()));
        }
    }

    /**
     * Get pending video verifications for admin review
     */
    @GetMapping("/video-verifications/pending")
    public ResponseEntity<?> getPendingVideoVerifications() {
        try {
            // Note: This should have admin role checking in a real implementation
            List<VideoVerification> pendingVerifications = 
                    videoVerificationRepository.findByStatusOrderBySubmittedAtAsc(
                            VideoVerification.VerificationStatus.PENDING);

            return ResponseEntity.ok(Map.of(
                    "verifications", pendingVerifications,
                    "count", pendingVerifications.size()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to get pending verifications: " + e.getMessage()));
        }
    }
}
