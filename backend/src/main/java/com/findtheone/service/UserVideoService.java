package com.findtheone.service;

import com.findtheone.entity.User;
import com.findtheone.entity.UserVideo;
import com.findtheone.repository.UserVideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class UserVideoService {

    @Autowired
    private UserVideoRepository userVideoRepository;

    /**
     * Save or update user's profile video
     */
    public UserVideo saveUserVideo(User user, String videoUrl, MultipartFile file) {
        try {
            // Deactivate any existing videos for this user
            Optional<UserVideo> existingVideo = userVideoRepository.findByUserAndIsActiveTrue(user);
            if (existingVideo.isPresent()) {
                UserVideo existing = existingVideo.get();
                existing.setActive(false);
                existing.setUpdatedAt(LocalDateTime.now());
                userVideoRepository.save(existing);
            }

            // Create new video record
            UserVideo userVideo = new UserVideo();
            userVideo.setUser(user);
            userVideo.setVideoUrl(videoUrl);
            userVideo.setFileSizeBytes(file.getSize());
            userVideo.setMimeType(file.getContentType());
            userVideo.setActive(true);
            userVideo.setCreatedAt(LocalDateTime.now());
            userVideo.setUpdatedAt(LocalDateTime.now());

            // TODO: In future, extract video metadata like duration, generate thumbnail
            // For now, set defaults
            userVideo.setDurationSeconds(0);
            userVideo.setThumbnailUrl(null);

            return userVideoRepository.save(userVideo);

        } catch (Exception e) {
            throw new RuntimeException("Failed to save user video: " + e.getMessage(), e);
        }
    }

    /**
     * Get user's active profile video
     */
    public Optional<UserVideo> getUserVideo(User user) {
        return userVideoRepository.findByUserAndIsActiveTrue(user);
    }

    /**
     * Delete user's profile video
     */
    public boolean deleteUserVideo(User user) {
        try {
            Optional<UserVideo> userVideo = userVideoRepository.findByUserAndIsActiveTrue(user);
            if (userVideo.isPresent()) {
                UserVideo video = userVideo.get();
                
                // Delete physical file
                if (video.getVideoUrl() != null && video.getVideoUrl().startsWith("/uploads/videos/")) {
                    String filename = video.getVideoUrl().substring("/uploads/videos/".length());
                    Path filePath = Paths.get("uploads/videos/").resolve(filename);
                    try {
                        Files.deleteIfExists(filePath);
                    } catch (IOException e) {
                        System.err.println("Failed to delete video file: " + filePath + " - " + e.getMessage());
                    }
                }

                // Delete thumbnail if exists
                if (video.getThumbnailUrl() != null && video.getThumbnailUrl().startsWith("/uploads/videos/")) {
                    String thumbnailFilename = video.getThumbnailUrl().substring("/uploads/videos/".length());
                    Path thumbnailPath = Paths.get("uploads/videos/").resolve(thumbnailFilename);
                    try {
                        Files.deleteIfExists(thumbnailPath);
                    } catch (IOException e) {
                        System.err.println("Failed to delete thumbnail file: " + thumbnailPath + " - " + e.getMessage());
                    }
                }

                // Mark as inactive (soft delete)
                video.setActive(false);
                video.setUpdatedAt(LocalDateTime.now());
                userVideoRepository.save(video);

                return true;
            }
            return false;
        } catch (Exception e) {
            System.err.println("Error deleting user video: " + e.getMessage());
            return false;
        }
    }

    /**
     * Check if user has an active video
     */
    public boolean hasActiveVideo(User user) {
        return userVideoRepository.existsByUserAndIsActiveTrue(user);
    }

    /**
     * Get video file size for a user
     */
    public long getVideoFileSize(User user) {
        Optional<UserVideo> video = userVideoRepository.findByUserAndIsActiveTrue(user);
        return video.map(UserVideo::getFileSizeBytes).orElse(0L);
    }

    /**
     * Clean up inactive video records (hard delete)
     * This method can be called periodically to clean up old video records
     */
    public void cleanupInactiveVideos() {
        try {
            userVideoRepository.deleteByIsActiveFalse();
        } catch (Exception e) {
            System.err.println("Error cleaning up inactive videos: " + e.getMessage());
        }
    }
}
