package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.NotBlank;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatTurnoDTO {

    // "user" o "model" — coincide con los roles que espera la API de Gemini
    @NotBlank
    private String rol;

    @NotBlank
    private String contenido;
}
