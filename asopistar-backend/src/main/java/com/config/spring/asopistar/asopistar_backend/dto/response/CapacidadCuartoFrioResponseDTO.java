package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CapacidadCuartoFrioResponseDTO {
    private Integer    idCapacidad;
    private BigDecimal capacidadMaxKg;
    private BigDecimal kilosActuales;
    private BigDecimal kilosDisponibles;
    private Integer    porcentajeOcupacion;
    private String     descripcion;
    private LocalDateTime fechaActualizacion;
    private String     actualizadoPor;
}
