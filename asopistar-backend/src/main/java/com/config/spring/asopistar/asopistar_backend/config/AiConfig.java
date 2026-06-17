package com.config.spring.asopistar.asopistar_backend.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import java.time.Duration;

/**
 * Configuración exclusiva para la integración de IA (ASOPI AI / Gemini).
 * No toca ningún bean ni configuración existente del proyecto.
 */
@Configuration
public class AiConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
            .connectTimeout(Duration.ofSeconds(10))
            .readTimeout(Duration.ofSeconds(25))
            .build();
    }
}
