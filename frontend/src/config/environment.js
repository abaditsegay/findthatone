/**
 * Environment-specific configuration for the FindTheOne application.
 * Controls logging levels, API endpoints, and feature flags based on environment.
 */

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    // Logging configuration
    logging: {
      level: 'DEBUG',
      enableConsoleLogging: true,
      enableFileLogging: false,
      enablePerformanceLogging: true,
      enableUserActionLogging: true,
      enableApiLogging: true,
      enableErrorReporting: true,
      verboseLogging: true
    },
    
    // API configuration
    api: {
      baseUrl: 'http://localhost:8091',
      timeout: 10000,
      retryAttempts: 2,
      enableMockResponses: false
    },
    
    // Feature flags
    features: {
      enableAnalytics: false,
      enableCrashReporting: false,
      enablePerformanceMonitoring: true,
      enableDebugPanel: true,
      enableHotReload: true
    },
    
    // Debug settings
    debug: {
      showReduxLogs: true,
      showNetworkLogs: true,
      showPerformanceLogs: true,
      showUserActionLogs: true
    }
  },
  
  production: {
    // Logging configuration
    logging: {
      level: 'WARN',
      enableConsoleLogging: false,
      enableFileLogging: true,
      enablePerformanceLogging: true,
      enableUserActionLogging: true,
      enableApiLogging: true,
      enableErrorReporting: true,
      verboseLogging: false
    },
    
    // API configuration
    api: {
      baseUrl: process.env.REACT_APP_API_URL || 'https://findtheone-api.azurewebsites.net',
      timeout: 15000,
      retryAttempts: 3,
      enableMockResponses: false
    },
    
    // Feature flags
    features: {
      enableAnalytics: true,
      enableCrashReporting: true,
      enablePerformanceMonitoring: true,
      enableDebugPanel: false,
      enableHotReload: false
    },
    
    // Debug settings
    debug: {
      showReduxLogs: false,
      showNetworkLogs: false,
      showPerformanceLogs: false,
      showUserActionLogs: false
    }
  },
  
  test: {
    // Logging configuration
    logging: {
      level: 'ERROR',
      enableConsoleLogging: false,
      enableFileLogging: false,
      enablePerformanceLogging: false,
      enableUserActionLogging: false,
      enableApiLogging: false,
      enableErrorReporting: false,
      verboseLogging: false
    },
    
    // API configuration
    api: {
      baseUrl: 'http://localhost:8091',
      timeout: 5000,
      retryAttempts: 1,
      enableMockResponses: true
    },
    
    // Feature flags
    features: {
      enableAnalytics: false,
      enableCrashReporting: false,
      enablePerformanceMonitoring: false,
      enableDebugPanel: false,
      enableHotReload: false
    },
    
    // Debug settings
    debug: {
      showReduxLogs: false,
      showNetworkLogs: false,
      showPerformanceLogs: false,
      showUserActionLogs: false
    }
  }
};

// Export the configuration for the current environment
const currentConfig = config[env] || config.development;

// Add environment metadata
currentConfig.environment = {
  name: env,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isTest: env === 'test',
  buildTime: new Date().toISOString(),
  version: process.env.REACT_APP_VERSION || '1.0.0'
};

export default currentConfig;
