package com.findtheone.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.findtheone.entity.User;
import com.findtheone.entity.VideoVerification;
import com.findtheone.entity.VideoVerification.VerificationStatus;
import com.findtheone.repository.UserRepository;
import com.findtheone.repository.VideoVerificationRepository;

@RestController
@RequestMapping("/api/verification")
@CrossOrigin(origins = "*", maxAge = 3600)
public class VideoVerificationController {

    @Autowired
    private VideoVerificationRepository videoVerificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/submit")
    public ResponseEntity<?> submitVideoVerification(
            @RequestParam("video") MultipartFile videoFile,
            Authentication authentication) {

        try {
            // Get user from authentication
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user already has a pending or approved verification
            if (videoVerificationRepository.existsByUserIdAndStatusAndIsActiveTrue(user.getId(), VerificationStatus.PENDING) ||
                videoVerificationRepository.existsByUserIdAndStatusAndIsActiveTrue(user.getId(), VerificationStatus.APPROVED)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "You already have a pending or approved video verification"));
            }

            // Validate video file
            if (videoFile.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Video file is required"));
            }

            String contentType = videoFile.getContentType();
            if (contentType == null || !contentType.startsWith("video/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "File must be a video"));
            }

            // Check file size (max 50MB)
            if (videoFile.getSize() > 50 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "Video file must be less than 50MB"));
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, "verification-videos");
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFilename = videoFile.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".mp4";
            String filename = "verification_" + user.getId() + "_" + UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            videoFile.transferTo(filePath.toFile());

            // Create verification record
            VideoVerification verification = new VideoVerification(user, "/verification-videos/" + filename);
            videoVerificationRepository.save(verification);

            return ResponseEntity.ok(Map.of(
                    "message", "Video verification submitted successfully! It will be reviewed by an admin.",
                    "verificationId", verification.getId(),
                    "status", verification.getStatus().toString()));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to save video file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to submit video verification: " + e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getVerificationStatus(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<VideoVerification> verifications = videoVerificationRepository
                    .findActiveByUserIdOrderBySubmittedAtDesc(user.getId());

            if (verifications.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "hasVerification", false,
                        "message", "No video verification submitted"));
            }

            VideoVerification latestVerification = verifications.get(0);
            return ResponseEntity.ok(Map.of(
                    "hasVerification", true,
                    "status", latestVerification.getStatus().toString(),
                    "submittedAt", latestVerification.getSubmittedAt(),
                    "reviewedAt", latestVerification.getReviewedAt(),
                    "adminNotes", latestVerification.getAdminNotes()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to get verification status: " + e.getMessage()));
        }
    }
}
