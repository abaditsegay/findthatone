package com.findtheone.config;

/**
 * Application constants for consistency across the application
 */
public final class AppConstants {

    // URL Configuration
    public static final String LOCALHOST_BASE_URL = "http://localhost:8091";
    public static final String UPLOADS_PATH = "/uploads/photos/";
    public static final String AVATARS_PATH = "/avatars/";
    public static final String DEFAULT_AVATAR = "/avatars/avatar1.svg";
    public static final String PLACEHOLDER_AVATAR = "/placeholder-avatar.png";

    // Validation Constants
    public static final int MIN_AGE = 18;
    public static final int MAX_AGE = 100;
    public static final int MIN_NAME_LENGTH = 2;
    public static final int MAX_NAME_LENGTH = 50;
    public static final int MIN_BIO_LENGTH = 10;
    public static final int MAX_BIO_LENGTH = 500;
    public static final int MIN_LOCATION_LENGTH = 2;
    public static final int MAX_LOCATION_LENGTH = 100;
    public static final int MAX_PHOTOS_PER_USER = 6;
    public static final int MIN_INTERESTS = 1;
    public static final int MAX_INTERESTS = 10;

    // Statistics Constants
    public static final double MAX_POPULARITY_SCORE = 100.0;
    public static final double LIKES_WEIGHT = 1.0;
    public static final double MATCHES_WEIGHT = 2.0;

    // Security Constants
    public static final String JWT_HEADER = "Authorization";
    public static final String JWT_PREFIX = "Bearer ";

    // Response Messages
    public static final String SUCCESS_MESSAGE = "Operation completed successfully";
    public static final String PHOTO_LIMIT_EXCEEDED = "Maximum number of photos reached. You can upload up to " + MAX_PHOTOS_PER_USER + " photos.";
    public static final String INVALID_FILE_TYPE = "Only JPEG and PNG images are allowed";
    public static final String AUTH_REQUIRED = "Authentication required";
    public static final String USER_NOT_FOUND = "User not found";
    public static final String INVALID_INPUT = "Invalid input provided";

    // File Types
    public static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg"};
    public static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"};

    // Pagination Constants
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    private AppConstants() {
        // Utility class - prevent instantiation
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }
}
