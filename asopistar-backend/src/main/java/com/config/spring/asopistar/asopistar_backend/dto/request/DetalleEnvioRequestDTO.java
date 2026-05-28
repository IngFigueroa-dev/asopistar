package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleEnvioRequestDTO {
 
    @NotNull(message = "El envío es obligatorio")
    private Integer idEnvio;
 
    @NotNull(message = "El lote es obligatorio")
    private Integer idLote;
 
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal kilos;
 
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal preciosKg;
 
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal subtotal;
}

