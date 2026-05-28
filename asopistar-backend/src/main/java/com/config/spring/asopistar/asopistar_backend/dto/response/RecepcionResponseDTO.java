package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RecepcionResponseDTO {
 
    private Integer idRecepcion;
    private LocalDateTime fechaHora;
    private BigDecimal kilosRecibidos;
    private String observaciones;
    private Integer idProductor;
    private String nombreProductor;
    private Integer idTurno;
    private LocalDate fechaTurnoProgramado;
}
