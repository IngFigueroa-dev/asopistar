package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProcesamientoResponseDTO {

    private Integer idProcesamiento;
    private String etapa;
    private String estado;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String responsable;
    private String observaciones;

    // Datos de la recepción origen
    private Integer idRecepcion;
    private Double kilosRecibidos;
    private String nombreProductor;
}
