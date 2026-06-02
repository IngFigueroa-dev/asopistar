package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleVentaInsumoResponseDTO {
    private Integer    idDetalleVenta;
    private Integer    idVentaInsumo;
    private Integer    idInsumo;
    private String     nombreInsumo;
    private String     tipo;
    private String     unidadMedida;
    private Integer    cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
}
