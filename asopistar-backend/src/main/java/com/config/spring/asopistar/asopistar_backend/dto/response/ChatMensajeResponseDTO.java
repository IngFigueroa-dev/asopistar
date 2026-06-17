package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMensajeResponseDTO {

    private String respuesta;
    private LocalDateTime timestamp;
}
