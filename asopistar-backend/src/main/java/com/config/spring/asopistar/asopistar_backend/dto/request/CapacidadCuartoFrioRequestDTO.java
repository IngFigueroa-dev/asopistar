package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CapacidadCuartoFrioRequestDTO {
    @NotNull(message = "La capacidad máxima es obligatoria")
    @DecimalMin(value = "1.0", message = "La capacidad mínima es 1 kg")
    private BigDecimal capacidadMaxKg;

    @Size(max = 100)
    private String descripcion;
}
