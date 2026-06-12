package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ConfiguracionProduccionRequestDTO {
    @NotNull(message = "El id de especie es obligatorio")
    private Integer idEspecie;

    @NotNull(message = "El ciclo en meses es obligatorio")
    @Min(value = 1, message = "El ciclo mínimo es 1 mes")
    @Max(value = 36, message = "El ciclo máximo es 36 meses")
    private Integer cicloMeses;

    @DecimalMin(value = "0.01", message = "El peso objetivo debe ser mayor a 0")
    private BigDecimal pesoCosechaKg;

    @Size(max = 150)
    private String observaciones;
}
