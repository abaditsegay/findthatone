package com.findtheone.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(
    prefix = "azure",
    name = {"client-id", "client-secret", "tenant-id"},
    matchIfMissing = false
)
@ComponentScan(basePackages = "com.findtheone.service")
public class OAuth2EmailConfig {
    // This configuration will only be active when Azure OAuth2 properties are present
}
