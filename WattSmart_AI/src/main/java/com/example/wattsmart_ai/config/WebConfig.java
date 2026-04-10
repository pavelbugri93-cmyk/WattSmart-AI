// ============================================================
// FILE: WebConfig.java
// Additional MVC-level CORS configuration.
// Works alongside SecurityConfig to ensure CORS headers
// are applied consistently across all request types.
// ============================================================
package com.example.wattsmart_ai.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final String REACT_DEV_SERVER = "http://localhost:5173";

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(REACT_DEV_SERVER)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*") // Wildcard needed to allow the Authorization header
                .allowCredentials(true);
    }
}
