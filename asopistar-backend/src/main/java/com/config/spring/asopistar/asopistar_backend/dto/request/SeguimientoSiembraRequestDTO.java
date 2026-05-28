package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SeguimientoSiembraRequestDTO {
 
    @NotNull(message = "La fecha de visita es obligatoria")
    private LocalDate fechaVisita;
 
    @NotNull(message = "El peso promedio es obligatorio")
    @DecimalMin(value = "0.01")
    private BigDecimal pesoPromedio;
 
    @NotNull(message = "La cantidad estimada es obligatoria")
    @Min(value = 0)
    private Integer cantidadEstimada;
 
    @NotBlank(message = "La condición del agua es obligatoria")
    private String condicionAgua;   // BUENA, REGULAR, MALA
 
    @NotBlank(message = "El estado de salud es obligatorio")
    private String estadoSalud;
 
    @Size(max = 100)
    private String observaciones;
 
    @NotNull(message = "Debe indicar si está apto para cosecha")
    private Character aptoCosecha;   // 'Y' o 'N'
 
    @NotNull(message = "La siembra es obligatoria")
    private Integer idSiembra;
}

