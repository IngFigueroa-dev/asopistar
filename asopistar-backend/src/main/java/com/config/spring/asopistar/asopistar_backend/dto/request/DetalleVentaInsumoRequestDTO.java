package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleVentaInsumoRequestDTO {
 
    @NotNull(message = "La venta es obligatoria")
    private Integer idVentaInsumo;
 
    @NotNull(message = "El insumo es obligatorio")
    private Integer idInsumo;
 
    @NotNull
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;
 
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal precioUnitario;
 
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal subtotal;
}
