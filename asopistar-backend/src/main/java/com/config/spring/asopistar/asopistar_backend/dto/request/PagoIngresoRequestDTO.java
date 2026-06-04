package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PagoIngresoRequestDTO {

    @NotNull(message = "El valor del abono es obligatorio")
    @DecimalMin(value = "0.01", message = "El valor del abono debe ser mayor a 0")
    private BigDecimal valorPago;

    @NotNull(message = "El método de pago es obligatorio")
    private Integer idMetodoPago;

    @Size(max = 60)
    private String referencia;

    @Size(max = 200)
    private String observaciones;
}
