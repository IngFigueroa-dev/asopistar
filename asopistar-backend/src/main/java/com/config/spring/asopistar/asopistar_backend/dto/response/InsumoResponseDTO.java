package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class InsumoResponseDTO {
    private Integer idInsumo;
    private String  codigo;
    private String  nombre;
    private String  tipo;
    private String  unidadMedida;   // derivado del tipo, solo lectura
    private String  descripcion;
    private BigDecimal precioUnitario;
    private BigDecimal stockActual;
    private BigDecimal stockMinimo;
    private String  estado;
    private LocalDate fechaCreacion;
    private boolean bajoStock;      // stockActual <= stockMinimo
}
