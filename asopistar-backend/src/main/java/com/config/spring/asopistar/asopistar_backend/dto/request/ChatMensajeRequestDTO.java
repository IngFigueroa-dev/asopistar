package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMensajeRequestDTO {

    @NotBlank(message = "El mensaje no puede estar vacío")
    @Size(max = 2000, message = "El mensaje no puede superar 2000 caracteres")
    private String mensaje;

    // Últimos turnos de la conversación (lo arma el frontend desde su estado local).
    // Opcional: si no se envía, se trata como el primer mensaje de la conversación.
    private List<ChatTurnoDTO> historial;
}
