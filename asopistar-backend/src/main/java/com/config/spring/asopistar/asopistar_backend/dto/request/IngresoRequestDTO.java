package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class IngresoRequestDTO {
 
    @NotNull(message = "La fecha es obligatoria")
    private LocalDateTime fecha;
 
    @Size(max = 100)
    private String concepto;
 
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal monto;
 
    @NotBlank(message = "El tipo de origen es obligatorio")
    private String tipoOrigen;   // VENTA_PESCADO, VENTA_INSUMO, OTRO
 
    // Solo uno tendrá valor según tipoOrigen
    private Integer idEnvio;
    private Integer idVentaInsumo;
}
