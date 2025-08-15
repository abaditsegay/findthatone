package com.findtheone.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get the absolute path to the uploads directory
        String uploadsPath = Paths.get("uploads").toAbsolutePath().toString();

        // Configure static resource handler for uploads
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsPath + "/")
                .setCachePeriod(3600); // Cache for 1 hour

        // Also serve from classpath static resources
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Add CORS support for static resources
        registry.addMapping("/uploads/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:3001", 
                    "http://192.168.1.230:3000",
                    "http://192.168.1.230:3001",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:3001"
                )
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
