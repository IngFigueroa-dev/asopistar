package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PagoProductorRequestDTO {
 
    @NotNull(message = "La fecha de pago es obligatoria")
    private LocalDateTime fechaPago;
 
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal monto;
 
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal precioKg;
 
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal kilosPagados;
 
    @NotBlank(message = "El estado es obligatorio")
    private String estado;   // PENDIENTE, PAGADO
 
    private Integer idProductor;
 
    @NotNull(message = "La recepción es obligatoria")
    private Integer idRecepcion;
 
    @NotNull(message = "El método de pago es obligatorio")
    private Integer idMetodoPago;
}

