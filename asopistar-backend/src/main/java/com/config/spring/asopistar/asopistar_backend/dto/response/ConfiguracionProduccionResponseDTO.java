package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ConfiguracionProduccionResponseDTO {
    private Integer    idConfig;
    private Integer    idEspecie;
    private String     nombreEspecie;
    private Integer    cicloMeses;
    private BigDecimal pesoCosechaKg;
    private Boolean    activo;
    private String     observaciones;
    private LocalDateTime fechaActualizacion;
    private String     actualizadoPor;
}
