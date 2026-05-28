package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class InsumoResponseDTO {
 
    private Integer idInsumo;
    private String nombre;
    private String tipo;
    private String unidadMedida;
    private BigDecimal precioUnitario;
    private BigDecimal stockActual;
    private BigDecimal stockMinimo;
    private Boolean bajoStock;   // true si stockActual <= stockMinimo
}

