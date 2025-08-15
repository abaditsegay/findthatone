package com.findtheone.service;

import org.springframework.stereotype.Service;

/**
 * Service responsible for URL manipulation and validation
 * Consolidates URL-related business logic
 */
@Service
public class UrlService {

    private static final String LOCALHOST_BASE = "http://localhost:8091";
    private static final String UPLOADS_PATH = "/uploads/photos/";
    private static final String DEFAULT_AVATAR = "/avatars/avatar1.svg";

    /**
     * Normalize profile photo URL to ensure consistency
     * 
     * @param photoUrl The original photo URL
     * @return Normalized photo URL
     */
    public String normalizePhotoUrl(String photoUrl) {
        if (photoUrl == null || photoUrl.trim().isEmpty()) {
            return DEFAULT_AVATAR;
        }

        String normalized = photoUrl.trim();

        // Fix old IP address URLs
        if (normalized.contains("192.168.1.230:8091")) {
            normalized = normalized.replace("http://192.168.1.230:8091", LOCALHOST_BASE);
        }

        // Fix URLs that go through API but should be direct
        if (normalized.contains("/api/photos/uploads/")) {
            normalized = normalized.replace("/api/photos/uploads/", UPLOADS_PATH);
        }

        // Fix URLs that have full localhost path but should be relative for static serving
        if (normalized.startsWith(LOCALHOST_BASE + "/uploads/")) {
            normalized = normalized.replace(LOCALHOST_BASE, "");
        }

        // Ensure proper upload path format
        if (normalized.startsWith("/uploads/photos/") || normalized.startsWith("/avatars/")) {
            return normalized;
        }

        // If it's just a filename, prepend the upload path
        if (!normalized.startsWith("http") && !normalized.startsWith("/")) {
            return UPLOADS_PATH + normalized;
        }

        return normalized;
    }

    /**
     * Generate a relative URL for uploaded photos
     * 
     * @param filename The photo filename
     * @return Relative URL path
     */
    public String generatePhotoUrl(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return DEFAULT_AVATAR;
        }
        return UPLOADS_PATH + filename.trim();
    }

    /**
     * Check if a URL is a placeholder/default avatar
     * 
     * @param url The URL to check
     * @return true if it's a placeholder, false otherwise
     */
    public boolean isPlaceholder(String url) {
        if (url == null) {
            return true;
        }
        return url.contains("/placeholder-avatar.png") || 
               url.contains("/avatars/") || 
               url.equals(DEFAULT_AVATAR);
    }

    /**
     * Get the default avatar URL
     * 
     * @return Default avatar URL
     */
    public String getDefaultAvatar() {
        return DEFAULT_AVATAR;
    }

    /**
     * Validate if a URL is a valid photo URL format
     * 
     * @param url The URL to validate
     * @return true if valid, false otherwise
     */
    public boolean isValidPhotoUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }

        String trimmed = url.trim();
        return trimmed.startsWith("/uploads/photos/") ||
               trimmed.startsWith("/avatars/") ||
               trimmed.startsWith("http://") ||
               trimmed.startsWith("https://");
    }
}
