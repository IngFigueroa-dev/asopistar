package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MovimientoInsumoRequestDTO {

    @NotNull(message = "El insumo es obligatorio")
    private Integer idInsumo;

    @NotBlank(message = "El tipo de movimiento es obligatorio")
    @Pattern(regexp = "ENTRADA|SALIDA|AJUSTE",
             message = "Tipo debe ser ENTRADA, SALIDA o AJUSTE")
    private String tipoMovimiento;

    @NotBlank(message = "El motivo es obligatorio")
    @Pattern(regexp = "COMPRA|DONACION|AJUSTE_ADMIN|CORRECCION|VENTA|PERDIDA|DANO",
             message = "Motivo no válido")
    private String motivo;

    @NotNull(message = "La cantidad es obligatoria")
    @DecimalMin(value = "0.01", message = "La cantidad debe ser mayor a 0")
    private BigDecimal cantidad;

    @Size(max = 150)
    private String observacion;
}
