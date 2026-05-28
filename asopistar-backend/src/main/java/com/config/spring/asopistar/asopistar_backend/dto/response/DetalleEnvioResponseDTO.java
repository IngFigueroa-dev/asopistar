package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleEnvioResponseDTO {
 
    private Integer idDetalleEnvio;
    private Integer idEnvio;
    private Integer idLote;
    private String codigoLote;         // código del lote
    private String nombreProductor;    // productor de origen del lote
    private BigDecimal kilos;
    private BigDecimal preciosKg;
    private BigDecimal subtotal;
}
