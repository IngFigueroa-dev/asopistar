package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class VentaInsumoResponseDTO {
 
    private Integer idVentaInsumo;
    private LocalDateTime fecha;
    private BigDecimal total;
    private String estadoPagado;
    private Integer idProductor;
    private String nombreProductor;
}
