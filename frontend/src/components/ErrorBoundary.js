import React from 'react';
import { createLogger } from '../utils/fileLogger';

/**
 * Error Boundary component with integrated logging.
 * Catches JavaScript errors anywhere in the child component tree and logs them.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.logger = createLogger('ErrorBoundary');
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error with detailed context
    this.logger.logError(error, 'component_error', {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'Unknown',
      userId: sessionStorage.getItem('userId') || 'anonymous',
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      props: this.sanitizeProps(this.props)
    });

    // Store error information for display
    this.setState({
      error,
      errorInfo
    });

    // Log business impact
    this.logger.logBusinessEvent('ERROR_BOUNDARY_TRIGGERED', {
      componentName: this.props.name,
      errorMessage: error.message,
      errorType: error.name,
      stack: error.stack
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  sanitizeProps(props) {
    // Remove potentially sensitive data from props before logging
    const sanitized = { ...props };
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'auth'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  handleRetry = () => {
    this.logger.logUserAction('ERROR_RETRY_ATTEMPT', {
      errorMessage: this.state.error?.message,
      componentName: this.props.name
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>🚨 Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development Mode)</summary>
                <div className="error-content">
                  <h3>Error:</h3>
                  <pre>{this.state.error && this.state.error.toString()}</pre>
                  
                  <h3>Component Stack:</h3>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                  
                  <h3>Stack Trace:</h3>
                  <pre>{this.state.error && this.state.error.stack}</pre>
                </div>
              </details>
            )}
            
            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="retry-button"
              >
                Try Again
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="reload-button"
              >
                Reload Page
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="home-button"
              >
                Go Home
              </button>
            </div>
          </div>
          
          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            }
            
            .error-container {
              max-width: 600px;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            
            .error-container h2 {
              margin-bottom: 1rem;
              font-size: 2rem;
              font-weight: 600;
            }
            
            .error-container p {
              margin-bottom: 2rem;
              font-size: 1.1rem;
              opacity: 0.9;
            }
            
            .error-details {
              margin: 1.5rem 0;
              text-align: left;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 8px;
              padding: 1rem;
            }
            
            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              margin-bottom: 1rem;
            }
            
            .error-content pre {
              background: rgba(0, 0, 0, 0.3);
              padding: 1rem;
              border-radius: 4px;
              overflow-x: auto;
              font-size: 0.85rem;
              white-space: pre-wrap;
              word-break: break-word;
            }
            
            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }
            
            .error-actions button {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 6px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            
            .retry-button {
              background: #4CAF50;
              color: white;
            }
            
            .retry-button:hover {
              background: #45a049;
              transform: translateY(-2px);
            }
            
            .reload-button {
              background: #2196F3;
              color: white;
            }
            
            .reload-button:hover {
              background: #1976D2;
              transform: translateY(-2px);
            }
            
            .home-button {
              background: #FF9800;
              color: white;
            }
            
            .home-button:hover {
              background: #F57C00;
              transform: translateY(-2px);
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
