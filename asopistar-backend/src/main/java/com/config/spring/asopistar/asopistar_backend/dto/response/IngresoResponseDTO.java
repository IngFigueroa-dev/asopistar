package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class IngresoResponseDTO {
 
    private Integer idIngreso;
    private LocalDateTime fecha;
    private String concepto;
    private BigDecimal monto;
    private String tipoOrigen;
    private Integer idEnvio;
    private Integer idVentaInsumo;
}

