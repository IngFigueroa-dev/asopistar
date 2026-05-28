package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class VentaInsumoRequestDTO {
 
    @NotNull(message = "La fecha es obligatoria")
    private LocalDateTime fecha;
 
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal total;
 
    @NotBlank(message = "El estado de pago es obligatorio")
    private String estadoPagado;   // PAGADO, PENDIENTE, CREDITO
 
    @NotNull(message = "El productor es obligatorio")
    private Integer idProductor;
}
