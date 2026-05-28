package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TurnoPescaResponseDTO {
 
    private Integer idTurno;
    private LocalDate fechaProgramada;
    private LocalDateTime horaProgramada;
    private String tipoPrioridad;
    private String motivoEmergencia;
    private String estado;
    private Integer idSiembra;
    private LocalDate fechaSiembra;     // para contexto
    private Integer idProductor;
    private String nombreProductor;     // nombre1 + apellido1
    private String codigoEstanque;      // estanque de la siembra
}
