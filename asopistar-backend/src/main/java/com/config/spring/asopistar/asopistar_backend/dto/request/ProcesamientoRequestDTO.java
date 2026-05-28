package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProcesamientoRequestDTO {
 
    @NotBlank(message = "La etapa es obligatoria")
    private String etapa;   // EVISCERADO, LIMPIEZA, CONGELADO
 
    @NotNull(message = "La fecha es obligatoria")
    private LocalDateTime fecha;
 
    @NotBlank(message = "El responsable es obligatorio")
    @Size(max = 20)
    private String responsable;
 
    @NotBlank(message = "Las observaciones son obligatorias")
    @Size(max = 100)
    private String observaciones;
 
    @NotNull(message = "El lote es obligatorio")
    private Integer idLote;
}
