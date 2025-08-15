package com.findtheone.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

/**
 * Global exception handler for consistent error responses
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PhotoLimitExceededException.class)
    public ResponseEntity<Map<String, Object>> handlePhotoLimitExceeded(
            PhotoLimitExceededException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.BAD_REQUEST,
            "PHOTO_LIMIT_EXCEEDED",
            ex.getMessage(),
            request
        );
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(
            UserNotFoundException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.NOT_FOUND,
            "USER_NOT_FOUND",
            ex.getMessage(),
            request
        );
    }

    @ExceptionHandler(InvalidFileTypeException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidFileType(
            InvalidFileTypeException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.BAD_REQUEST,
            "INVALID_FILE_TYPE",
            ex.getMessage(),
            request
        );
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            ValidationException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.BAD_REQUEST,
            "VALIDATION_ERROR",
            ex.getMessage(),
            request
        );
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(
            AuthenticationException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.UNAUTHORIZED,
            "AUTHENTICATION_ERROR",
            ex.getMessage(),
            request
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(
            Exception ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "INTERNAL_ERROR",
            "An unexpected error occurred",
            request
        );
    }

    private ResponseEntity<Map<String, Object>> createErrorResponse(
            HttpStatus status, String errorCode, String message, WebRequest request) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", status.value());
        errorResponse.put("error", status.getReasonPhrase());
        errorResponse.put("errorCode", errorCode);
        errorResponse.put("message", message);
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));

        return ResponseEntity.status(status).body(errorResponse);
    }
}

// Custom Exception Classes
class PhotoLimitExceededException extends RuntimeException {
    public PhotoLimitExceededException(String message) {
        super(message);
    }
}

class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}

class InvalidFileTypeException extends RuntimeException {
    public InvalidFileTypeException(String message) {
        super(message);
    }
}

class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}

class AuthenticationException extends RuntimeException {
    public AuthenticationException(String message) {
        super(message);
    }
}
