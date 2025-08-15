package com.findtheone.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow requests from these origins
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:3001", 
            "http://192.168.1.230:3000",
            "http://192.168.1.230:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://98.86.48.169", // AWS deployment IP on port 80
            "http://98.86.48.169:3000", // AWS deployment IP on port 3000
            "http://98.86.48.169:3001" // AWS deployment IP on port 3001
        ));
        
        // Allow all headers
        configuration.addAllowedHeader("*");
        
        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
        ));
        
        // Allow credentials
        configuration.setAllowCredentials(true);
        
        // Apply this configuration to all endpoints including uploads
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
