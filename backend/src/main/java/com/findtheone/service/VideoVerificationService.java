package com.findtheone.service;

import com.findtheone.entity.User;
import com.findtheone.entity.VideoVerification;
import com.findtheone.entity.VideoVerification.VerificationStatus;
import com.findtheone.repository.UserRepository;
import com.findtheone.repository.VideoVerificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class VideoVerificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(VideoVerificationService.class);
    
    @Autowired
    private VideoVerificationRepository videoVerificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${app.verification.video.upload-dir:uploads/verification}")
    private String videoUploadDir;
    
    @Value("${app.verification.video.max-size:50MB}")
    private String maxVideoSize;
    
    @Value("${app.verification.video.allowed-formats:mp4,mov,avi,webm}")
    private String allowedFormats;
    
    /**
     * Submit a video for verification
     */
    public VideoVerification submitVideoVerification(Long userId, MultipartFile videoFile) throws IOException {
        logger.info("Processing video verification submission for user: {}", userId);
        
        // Validate user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user already has a pending verification
        if (videoVerificationRepository.hasPendingVerification(userId)) {
            throw new RuntimeException("User already has a pending verification");
        }
        
        // Validate video file
        validateVideoFile(videoFile);
        
        // Save video file
        String videoPath = saveVideoFile(videoFile, userId);
        
        // Create verification record
        VideoVerification verification = new VideoVerification();
        verification.setUserId(userId);
        verification.setVideoUrl(videoPath);
        verification.setOriginalFilename(videoFile.getOriginalFilename());
        verification.setFileSize(videoFile.getSize());
        verification.setMimeType(videoFile.getContentType());
        verification.setStatus(VerificationStatus.PENDING);
        verification.setSubmittedAt(LocalDateTime.now());
        
        // Save verification
        VideoVerification savedVerification = videoVerificationRepository.save(verification);
        
        // Update user status
        user.setVideoVerificationStatus(com.findtheone.entity.VideoVerificationStatus.PENDING);
        user.setVideoSubmittedAt(LocalDateTime.now());
        user.setVerificationVideoUrl(videoPath);
        userRepository.save(user);
        
        logger.info("Video verification submitted successfully for user: {}", userId);
        return savedVerification;
    }
    
    /**
     * Approve a video verification
     */
    public void approveVerification(Long verificationId, String reviewerNotes) {
        VideoVerification verification = videoVerificationRepository.findById(verificationId)
            .orElseThrow(() -> new RuntimeException("Verification not found"));
        
        verification.setStatus(VerificationStatus.APPROVED);
        verification.setReviewedAt(LocalDateTime.now());
        verification.setReviewerNotes(reviewerNotes);
        verification.setConfidenceScore(1.0); // Full confidence for manual approval
        
        videoVerificationRepository.save(verification);
        
        // Update user status
        User user = userRepository.findById(verification.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIsVideoVerified(true);
        user.setVideoVerificationStatus(com.findtheone.entity.VideoVerificationStatus.APPROVED);
        user.setVideoVerifiedAt(LocalDateTime.now());
        userRepository.save(user);
        
        logger.info("Video verification approved for user: {}", verification.getUserId());
    }
    
    /**
     * Reject a video verification
     */
    public void rejectVerification(Long verificationId, String rejectionReason) {
        VideoVerification verification = videoVerificationRepository.findById(verificationId)
            .orElseThrow(() -> new RuntimeException("Verification not found"));
        
        verification.setStatus(VerificationStatus.REJECTED);
        verification.setReviewedAt(LocalDateTime.now());
        verification.setReviewerNotes(rejectionReason);
        
        videoVerificationRepository.save(verification);
        
        // Update user status
        User user = userRepository.findById(verification.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setVideoVerificationStatus(com.findtheone.entity.VideoVerificationStatus.REJECTED);
        user.setVideoRejectionReason(rejectionReason);
        userRepository.save(user);
        
        logger.info("Video verification rejected for user: {}", verification.getUserId());
    }
    
    /**
     * Get verification status for a user
     */
    public Optional<VideoVerification> getUserVerification(Long userId) {
        return videoVerificationRepository.findLatestByUserId(userId);
    }
    
    /**
     * Get all verifications that need review
     */
    public List<VideoVerification> getVerificationsNeedingReview() {
        return videoVerificationRepository.findVerificationsNeedingReview();
    }
    
    /**
     * Check if user is video verified
     */
    public boolean isUserVideoVerified(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        return user != null && user.getIsVideoVerified() != null && user.getIsVideoVerified();
    }
    
    /**
     * Clean up expired pending verifications
     */
    public void cleanupExpiredVerifications() {
        LocalDateTime expiryDate = LocalDateTime.now().minusDays(30);
        List<VideoVerification> expiredVerifications = 
            videoVerificationRepository.findExpiredPendingVerifications(expiryDate);
        
        for (VideoVerification verification : expiredVerifications) {
            verification.setStatus(VerificationStatus.REJECTED);
            verification.setReviewerNotes("Automatically rejected due to expiry");
            verification.setReviewedAt(LocalDateTime.now());
            
            // Update user status
            User user = userRepository.findById(verification.getUserId()).orElse(null);
            if (user != null) {
                user.setVideoVerificationStatus(com.findtheone.entity.VideoVerificationStatus.REJECTED);
                user.setVideoRejectionReason("Verification expired");
                userRepository.save(user);
            }
        }
        
        videoVerificationRepository.saveAll(expiredVerifications);
        logger.info("Cleaned up {} expired verifications", expiredVerifications.size());
    }
    
    /**
     * Validate uploaded video file
     */
    private void validateVideoFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Video file is empty");
        }
        
        // Check file size (50MB max)
        if (file.getSize() > 50 * 1024 * 1024) {
            throw new RuntimeException("Video file is too large. Maximum size is 50MB");
        }
        
        // Check file format
        String contentType = file.getContentType();
        if (contentType == null || !isValidVideoFormat(contentType)) {
            throw new RuntimeException("Invalid video format. Allowed formats: mp4, mov, avi, webm");
        }
    }
    
    /**
     * Check if video format is valid
     */
    private boolean isValidVideoFormat(String contentType) {
        return contentType.equals("video/mp4") ||
               contentType.equals("video/quicktime") ||
               contentType.equals("video/x-msvideo") ||
               contentType.equals("video/webm");
    }
    
    /**
     * Save video file to disk
     */
    private String saveVideoFile(MultipartFile file, Long userId) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(videoUploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : ".mp4";
        
        String filename = "verification_" + userId + "_" + UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(filename);
        
        // Save file
        Files.copy(file.getInputStream(), filePath);
        
        logger.info("Video file saved: {}", filePath.toString());
        return filename; // Return relative path
    }
}
