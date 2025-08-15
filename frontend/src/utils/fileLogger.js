import log from 'loglevel';
import { useMemo } from 'react';

/**
 * Logging utility for the FindTheOne frontend application.
 * Provides structured logging with file output capabilities.
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

// File logging system for frontend
class FileLogger {
    constructor() {
        this.logs = [];
        this.maxLogSize = 1000; // Maximum number of logs to keep in memory
        this.flushInterval = 5000; // Flush to localStorage every 5 seconds
        this.logFile = 'findtheone_frontend_logs';
        this.isEnabled = true;
        
        // Start periodic flushing
        this.startPeriodicFlush();
        
        // Load existing logs from localStorage
        this.loadLogsFromStorage();
        
        // Setup beforeunload handler to save logs
        window.addEventListener('beforeunload', () => this.flushToStorage());
        
        // Setup error handler for uncaught errors
        window.addEventListener('error', (event) => {
            this.addLog({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                type: 'UNCAUGHT_ERROR',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });
    }

    addLog(logEntry) {
        if (!this.isEnabled) return;
        
        this.logs.push({
            ...logEntry,
            id: this.generateLogId(),
            sessionId: this.getSessionId(),
            timestamp: logEntry.timestamp || new Date().toISOString()
        });
        
        // Keep only the last maxLogSize entries
        if (this.logs.length > this.maxLogSize) {
            this.logs = this.logs.slice(-this.maxLogSize);
        }
    }

    generateLogId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('frontend_session_id');
        if (!sessionId) {
            sessionId = this.generateLogId();
            sessionStorage.setItem('frontend_session_id', sessionId);
        }
        return sessionId;
    }

    flushToStorage() {
        if (this.logs.length === 0) return;
        
        try {
            const existingLogs = JSON.parse(localStorage.getItem(this.logFile) || '[]');
            const allLogs = [...existingLogs, ...this.logs];
            
            // Keep only the last 2000 logs in localStorage
            const trimmedLogs = allLogs.slice(-2000);
            
            localStorage.setItem(this.logFile, JSON.stringify(trimmedLogs));
            this.logs = []; // Clear in-memory logs after flushing
        } catch (error) {
            console.error('Failed to flush logs to storage:', error);
        }
    }

    loadLogsFromStorage() {
        try {
            const storedLogs = JSON.parse(localStorage.getItem(this.logFile) || '[]');
            // Keep stored logs in localStorage, don't load into memory
        } catch (error) {
            console.error('Failed to load logs from storage:', error);
        }
    }

    startPeriodicFlush() {
        setInterval(() => {
            this.flushToStorage();
        }, this.flushInterval);
    }

    exportLogs() {
        this.flushToStorage();
        const allLogs = JSON.parse(localStorage.getItem(this.logFile) || '[]');
        return allLogs;
    }

    downloadLogs() {
        const logs = this.exportLogs();
        const logData = JSON.stringify(logs, null, 2);
        const blob = new Blob([logData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `findtheone-frontend-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearLogs() {
        this.logs = [];
        localStorage.removeItem(this.logFile);
    }

    getLogStats() {
        const logs = this.exportLogs();
        const stats = {
            total: logs.length,
            byLevel: {},
            byType: {},
            errorCount: 0,
            warningCount: 0,
            lastHour: 0
        };

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        logs.forEach(log => {
            // Count by level
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            
            // Count by type
            if (log.type) {
                stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
            }
            
            // Count errors and warnings
            if (log.level === 'ERROR') stats.errorCount++;
            if (log.level === 'WARN') stats.warningCount++;
            
            // Count recent logs
            if (log.timestamp > oneHourAgo) stats.lastHour++;
        });

        return stats;
    }
}

// Create global file logger instance
const fileLogger = new FileLogger();

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
        
        // Create structured log entry for file storage
        const logEntry = {
            ...context,
            message: args.length === 1 ? args[0] : args,
            stack: methodName === 'error' && args[0] instanceof Error ? args[0].stack : undefined
        };
        
        // Save to file logger
        fileLogger.addLog(logEntry);
        
        // In development, also log to console for immediate feedback (but minimal)
        if (isDevelopment) {
            rawMethod(`[${timestamp.split('T')[1].split('.')[0]}] [${methodName.toUpperCase()}]`, args[0]);
        }
        // In production, only log errors to console
        else if (isProduction && methodName === 'error') {
            rawMethod(`[ERROR]`, args[0]);
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

// Export file logger for log management
export { fileLogger };

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
