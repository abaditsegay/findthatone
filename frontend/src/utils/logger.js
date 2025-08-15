import log from 'loglevel';
import { useMemo } from 'react';

/**
 * Logging utility for the FindTheOne frontend application.
 * Provides structured logging with different levels and context information.
 */

// Configure log levels based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Set log level based on environment
if (isDevelopment) {
    log.setLevel('DEBUG');
} else if (isProduction) {
    log.setLevel('WARN');
} else {
    log.setLevel('INFO');
}

// Add timestamp and structured format to all logs
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);
    
    return function (...args) {
        const timestamp = new Date().toISOString();
        const context = {
            timestamp,
            level: methodName.toUpperCase(),
            environment: process.env.NODE_ENV || 'development',
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: sessionStorage.getItem('userId') || 'anonymous'
        };
        
        // In development, use console formatting for readability
        if (isDevelopment) {
            rawMethod(
                `[${timestamp}] [${methodName.toUpperCase()}]`,
                ...args,
                '\nContext:', context
            );
        } else {
            // In production, use structured JSON logging
            const logEntry = {
                ...context,
                message: args.length === 1 ? args[0] : args,
                stack: methodName === 'error' && args[0] instanceof Error ? args[0].stack : undefined
            };
            rawMethod(JSON.stringify(logEntry));
        }
    };
};
log.setLevel(log.getLevel()); // Re-apply the level to trigger methodFactory

class Logger {
    constructor(component = 'App') {
        this.component = component;
        this.sessionId = this.generateSessionId();
    }

    generateSessionId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    getContext(additionalContext = {}) {
        return {
            component: this.component,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            url: window.location.pathname,
            ...additionalContext
        };
    }

    // User action logging
    logUserAction(action, details = {}) {
        const context = this.getContext({
            type: 'USER_ACTION',
            action,
            details
        });
        
        log.info(`User action: ${action}`, context);
    }

    // API call logging
    logApiCall(method, url, status, duration, details = {}) {
        const context = this.getContext({
            type: 'API_CALL',
            method,
            url,
            status,
            duration,
            details
        });

        if (status >= 400) {
            log.warn(`API call failed: ${method} ${url} - Status ${status}`, context);
        } else {
            log.info(`API call: ${method} ${url} - Status ${status}`, context);
        }
    }

    // Performance logging
    logPerformance(operation, duration, details = {}) {
        const context = this.getContext({
            type: 'PERFORMANCE',
            operation,
            duration,
            details
        });

        if (duration > 2000) {
            log.warn(`Slow operation: ${operation} took ${duration}ms`, context);
        } else {
            log.info(`Operation: ${operation} completed in ${duration}ms`, context);
        }
    }

    // Error logging
    logError(error, operation = 'unknown', details = {}) {
        const context = this.getContext({
            type: 'ERROR',
            operation,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            details
        });

        log.error(`Error in ${operation}: ${error.message}`, context);
    }

    // Navigation logging
    logNavigation(from, to, method = 'click') {
        const context = this.getContext({
            type: 'NAVIGATION',
            from,
            to,
            method
        });

        log.info(`Navigation: ${from} -> ${to}`, context);
    }

    // Authentication logging
    logAuth(event, username = 'unknown', details = {}) {
        const context = this.getContext({
            type: 'AUTHENTICATION',
            event,
            username,
            details
        });

        log.info(`Auth event: ${event} for user ${username}`, context);
    }

    // Business event logging
    logBusinessEvent(event, details = {}) {
        const context = this.getContext({
            type: 'BUSINESS_EVENT',
            event,
            details
        });

        log.info(`Business event: ${event}`, context);
    }

    // Form validation logging
    logFormValidation(formName, field, error, value = '[hidden]') {
        const context = this.getContext({
            type: 'FORM_VALIDATION',
            formName,
            field,
            error,
            value: field.includes('password') ? '[hidden]' : value
        });

        log.warn(`Form validation error in ${formName}.${field}: ${error}`, context);
    }

    // Debug logging (only in development)
    debug(message, details = {}) {
        if (isDevelopment) {
            const context = this.getContext({
                type: 'DEBUG',
                details
            });
            log.debug(message, context);
        }
    }

    // Warning logging
    warn(message, details = {}) {
        const context = this.getContext({
            type: 'WARNING',
            details
        });
        log.warn(message, context);
    }

    // Info logging
    info(message, details = {}) {
        const context = this.getContext({
            type: 'INFO',
            details
        });
        log.info(message, context);
    }
}

// Export singleton instance for global use
export const globalLogger = new Logger('Global');

// Export Logger class for component-specific logging
export { Logger };

// Export log levels for conditional logging
export const LogLevel = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
};

// Utility function to create component-specific logger
export function createLogger(componentName) {
    return new Logger(componentName);
}

// Hook for React components
export function useLogger(componentName) {
    return useMemo(() => new Logger(componentName), [componentName]);
}

export default Logger;
