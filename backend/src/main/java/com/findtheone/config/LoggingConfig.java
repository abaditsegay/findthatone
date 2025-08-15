package com.findtheone.config;

import org.slf4j.MDC;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;

/**
 * Logging configuration for the FindTheOne application.
 * Provides structured logging with MDC context and request/response logging.
 */
@Configuration
public class LoggingConfig {

    /**
     * Filter to add correlation ID to all requests for tracing
     */
    @Bean
    public Filter correlationIdFilter() {
        return new Filter() {
            @Override
            public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                    throws IOException, ServletException {
                
                HttpServletRequest httpRequest = (HttpServletRequest) request;
                HttpServletResponse httpResponse = (HttpServletResponse) response;
                
                try {
                    // Generate or extract correlation ID
                    String correlationId = httpRequest.getHeader("X-Correlation-ID");
                    if (correlationId == null || correlationId.isEmpty()) {
                        correlationId = UUID.randomUUID().toString();
                    }
                    
                    // Add to MDC for logging
                    MDC.put("correlationId", correlationId);
                    MDC.put("requestMethod", httpRequest.getMethod());
                    MDC.put("requestUri", httpRequest.getRequestURI());
                    MDC.put("userAgent", httpRequest.getHeader("User-Agent"));
                    MDC.put("remoteAddr", getClientIpAddress(httpRequest));
                    
                    // Add correlation ID to response headers
                    httpResponse.setHeader("X-Correlation-ID", correlationId);
                    
                    chain.doFilter(request, response);
                    
                    // Log response status
                    MDC.put("responseStatus", String.valueOf(httpResponse.getStatus()));
                    
                } finally {
                    // Always clear MDC to prevent memory leaks
                    MDC.clear();
                }
            }
        };
    }

    /**
     * Request logging filter for detailed HTTP request/response logging
     */
    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
        filter.setIncludeQueryString(true);
        filter.setIncludePayload(false); // Don't log payload for security/performance
        filter.setIncludeHeaders(true);
        filter.setIncludeClientInfo(true);
        filter.setMaxPayloadLength(1000);
        filter.setAfterMessagePrefix("REQUEST DATA: ");
        return filter;
    }

    /**
     * Extract real client IP address considering proxy headers
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
