import axios from 'axios';
import { globalLogger } from './fileLogger';

/**
 * HTTP interceptor for automatic API call logging and error handling.
 * Adds structured logging to all HTTP requests and responses.
 */

// Create a new axios instance with interceptors
const httpClient = axios.create();

// Request interceptor
httpClient.interceptors.request.use(
    (config) => {
        // Add timestamp to track request duration
        config.startTime = Date.now();
        
        // Add correlation ID for request tracking
        config.headers['X-Correlation-ID'] = generateCorrelationId();
        
        // Log API request (excluding sensitive data)
        const logData = {
            method: config.method?.toUpperCase(),
            url: config.url,
            headers: sanitizeHeaders(config.headers),
            hasData: !!config.data
        };
        
        globalLogger.debug('API Request initiated', logData);
        
        return config;
    },
    (error) => {
        globalLogger.logError(error, 'api_request_setup', {
            type: 'REQUEST_INTERCEPTOR_ERROR'
        });
        return Promise.reject(error);
    }
);

// Response interceptor
httpClient.interceptors.response.use(
    (response) => {
        const duration = Date.now() - response.config.startTime;
        
        // Log successful API response
        globalLogger.logApiCall(
            response.config.method?.toUpperCase(),
            response.config.url,
            response.status,
            duration,
            {
                correlationId: response.config.headers['X-Correlation-ID'],
                responseSize: JSON.stringify(response.data).length,
                success: true
            }
        );
        
        // Log slow API calls
        if (duration > 3000) {
            globalLogger.warn('Slow API call detected', {
                method: response.config.method?.toUpperCase(),
                url: response.config.url,
                duration,
                status: response.status
            });
        }
        
        return response;
    },
    (error) => {
        const duration = error.config ? Date.now() - error.config.startTime : 0;
        const status = error.response?.status || 0;
        
        // Log API error
        globalLogger.logApiCall(
            error.config?.method?.toUpperCase() || 'UNKNOWN',
            error.config?.url || 'unknown',
            status,
            duration,
            {
                correlationId: error.config?.headers['X-Correlation-ID'],
                error: error.message,
                errorCode: error.code,
                success: false
            }
        );
        
        // Log specific error types
        if (error.code === 'NETWORK_ERROR') {
            globalLogger.logError(error, 'network_error', {
                type: 'NETWORK_CONNECTIVITY',
                url: error.config?.url
            });
        } else if (status === 401) {
            globalLogger.logAuth('UNAUTHORIZED_ACCESS', 'unknown', {
                url: error.config?.url,
                method: error.config?.method
            });
        } else if (status === 403) {
            globalLogger.logAuth('FORBIDDEN_ACCESS', 'unknown', {
                url: error.config?.url,
                method: error.config?.method
            });
        } else if (status >= 500) {
            globalLogger.logError(error, 'server_error', {
                type: 'SERVER_ERROR',
                status,
                url: error.config?.url
            });
        }
        
        return Promise.reject(error);
    }
);

/**
 * Generate a unique correlation ID for request tracking
 */
function generateCorrelationId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Sanitize headers to remove sensitive information from logs
 */
function sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    sensitiveHeaders.forEach(header => {
        if (sanitized[header]) {
            sanitized[header] = '[REDACTED]';
        }
    });
    
    return sanitized;
}

/**
 * Custom error class for API errors with enhanced logging
 */
export class ApiError extends Error {
    constructor(message, status, url, method, correlationId) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.url = url;
        this.method = method;
        this.correlationId = correlationId;
        this.timestamp = new Date().toISOString();
        
        // Log the API error
        globalLogger.logError(this, 'api_error', {
            status,
            url,
            method,
            correlationId
        });
    }
}

/**
 * Helper function to make logged API calls with automatic error handling
 */
export async function makeApiCall(config, operationName = 'api_call') {
    const startTime = Date.now();
    
    try {
        const response = await httpClient(config);
        
        globalLogger.logPerformance(operationName, Date.now() - startTime, {
            success: true,
            status: response.status,
            url: config.url
        });
        
        return response;
    } catch (error) {
        const duration = Date.now() - startTime;
        
        globalLogger.logPerformance(operationName, duration, {
            success: false,
            error: error.message,
            status: error.response?.status,
            url: config.url
        });
        
        // Transform axios error to custom ApiError
        if (error.response) {
            throw new ApiError(
                error.message,
                error.response.status,
                config.url,
                config.method,
                error.config?.headers['X-Correlation-ID']
            );
        }
        
        throw error;
    }
}

/**
 * Pre-configured API methods with logging
 */
export const api = {
    get: (url, config = {}) => makeApiCall({ ...config, method: 'GET', url }, `GET_${url}`),
    post: (url, data, config = {}) => makeApiCall({ ...config, method: 'POST', url, data }, `POST_${url}`),
    put: (url, data, config = {}) => makeApiCall({ ...config, method: 'PUT', url, data }, `PUT_${url}`),
    delete: (url, config = {}) => makeApiCall({ ...config, method: 'DELETE', url }, `DELETE_${url}`),
    patch: (url, data, config = {}) => makeApiCall({ ...config, method: 'PATCH', url, data }, `PATCH_${url}`)
};

export default httpClient;
