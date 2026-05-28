package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RecepcionRequestDTO {
 
    @NotNull(message = "La fecha y hora son obligatorias")
    private LocalDateTime fechaHora;
 
    @NotNull(message = "Los kilos recibidos son obligatorios")
    @DecimalMin(value = "0.01", message = "Los kilos deben ser mayores a 0")
    private BigDecimal kilosRecibidos;
 
    @Size(max = 100)
    private String observaciones;
 
    @NotNull(message = "El productor es obligatorio")
    private Integer idProductor;
 
    @NotNull(message = "El turno es obligatorio")
    private Integer idTurno;
}
