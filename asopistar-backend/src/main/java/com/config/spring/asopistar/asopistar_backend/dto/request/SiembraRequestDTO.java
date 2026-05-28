package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SiembraRequestDTO {
 
    @NotNull(message = "La fecha de siembra es obligatoria")
    private LocalDate fechaSiembra;
 
    @NotNull(message = "La cantidad de alevinos es obligatoria")
    @Min(value = 1, message = "Debe sembrar al menos 1 alevino")
    private Integer cantidadAlevinos;
 
    @NotNull(message = "El promedio inicial es obligatorio")
    @DecimalMin(value = "0.01")
    private BigDecimal promedioInicial;
 
    @NotBlank(message = "El estado es obligatorio")
    private String estado;   // EN_CURSO, COSECHADO, PERDIDO
 
    @Size(max = 100)
    private String observaciones;
 
    @NotNull(message = "La especie es obligatoria")
    private Integer idEspecie;
 
    @NotNull(message = "El estanque es obligatorio")
    private Integer idEstanque;
}
