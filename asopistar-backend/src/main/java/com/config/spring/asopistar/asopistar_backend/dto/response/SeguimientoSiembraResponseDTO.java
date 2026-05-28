package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SeguimientoSiembraResponseDTO {
 
    private Integer idSeguimiento;
    private LocalDate fechaVisita;
    private BigDecimal pesoPromedio;
    private Integer cantidadEstimada;
    private String condicionAgua;
    private String estadoSalud;
    private String observaciones;
    private Character aptoCosecha;
    private Integer idSiembra;
    private String estadoSiembra;   // estado actual de la siembra
    private String nombreEspecie;   // para contexto en el frontend
}
