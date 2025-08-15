package com.findtheone.util;

import org.slf4j.Logger;
import org.slf4j.MDC;

/**
 * Utility class for structured logging with context information.
 * Provides convenient methods for logging with additional context.
 */
public final class LoggingUtils {
    
    private LoggingUtils() {
        // Utility class
    }

    /**
     * Log user action with context
     */
    public static void logUserAction(Logger logger, String action, Long userId, String details) {
        try {
            MDC.put("action", action);
            MDC.put("userId", userId != null ? userId.toString() : "anonymous");
            MDC.put("actionDetails", details);
            
            logger.info("User action: {} by user {} - {}", action, userId, details);
        } finally {
            MDC.remove("action");
            MDC.remove("userId");
            MDC.remove("actionDetails");
        }
    }

    /**
     * Log security event with context
     */
    public static void logSecurityEvent(Logger logger, String event, String username, String ipAddress, String details) {
        try {
            MDC.put("securityEvent", event);
            MDC.put("username", username != null ? username : "unknown");
            MDC.put("ipAddress", ipAddress);
            MDC.put("securityDetails", details);
            
            logger.warn("Security event: {} for user {} from IP {} - {}", event, username, ipAddress, details);
        } finally {
            MDC.remove("securityEvent");
            MDC.remove("username");
            MDC.remove("ipAddress");
            MDC.remove("securityDetails");
        }
    }

    /**
     * Log performance metrics
     */
    public static void logPerformance(Logger logger, String operation, long duration, String details) {
        try {
            MDC.put("operation", operation);
            MDC.put("duration", String.valueOf(duration));
            MDC.put("performanceDetails", details);
            
            if (duration > 5000) { // Warn if operation takes more than 5 seconds
                logger.warn("Slow operation: {} took {}ms - {}", operation, duration, details);
            } else {
                logger.info("Operation: {} completed in {}ms - {}", operation, duration, details);
            }
        } finally {
            MDC.remove("operation");
            MDC.remove("duration");
            MDC.remove("performanceDetails");
        }
    }

    /**
     * Log API endpoint access
     */
    public static void logApiAccess(Logger logger, String endpoint, String method, String userEmail, int responseStatus) {
        try {
            MDC.put("endpoint", endpoint);
            MDC.put("httpMethod", method);
            MDC.put("userEmail", userEmail != null ? userEmail : "anonymous");
            MDC.put("responseStatus", String.valueOf(responseStatus));
            
            logger.info("API access: {} {} by {} - status {}", method, endpoint, userEmail, responseStatus);
        } finally {
            MDC.remove("endpoint");
            MDC.remove("httpMethod");
            MDC.remove("userEmail");
            MDC.remove("responseStatus");
        }
    }

    /**
     * Log business event
     */
    public static void logBusinessEvent(Logger logger, String event, String context, Object... params) {
        try {
            MDC.put("businessEvent", event);
            MDC.put("businessContext", context);
            
            logger.info("Business event: {} in context {} with params {}", event, context, params);
        } finally {
            MDC.remove("businessEvent");
            MDC.remove("businessContext");
        }
    }

    /**
     * Log error with context
     */
    public static void logError(Logger logger, String operation, Throwable error, String context) {
        try {
            MDC.put("errorOperation", operation);
            MDC.put("errorContext", context);
            MDC.put("errorType", error.getClass().getSimpleName());
            
            logger.error("Error in operation: {} - context: {} - error: {}", operation, context, error.getMessage(), error);
        } finally {
            MDC.remove("errorOperation");
            MDC.remove("errorContext");
            MDC.remove("errorType");
        }
    }
}
