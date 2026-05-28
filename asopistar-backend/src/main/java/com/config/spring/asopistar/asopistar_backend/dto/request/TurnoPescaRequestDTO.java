package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TurnoPescaRequestDTO {
 
    @NotNull(message = "La fecha programada es obligatoria")
    private LocalDate fechaProgramada;
 
    @NotNull(message = "La hora programada es obligatoria")
    private LocalDateTime horaProgramada;
 
    private String tipoPrioridad;   // NORMAL, EMERGENCIA
 
    // Solo obligatorio si tipoPrioridad = EMERGENCIA
    private String motivoEmergencia;
 
    @NotBlank(message = "El estado es obligatorio")
    private String estado;   // PENDIENTE, CONFIRMADO, REALIZADO, CANCELADO
 
    @NotNull(message = "La siembra es obligatoria")
    private Integer idSiembra;
 
    @NotNull(message = "El productor es obligatorio")
    private Integer idProductor;
}
