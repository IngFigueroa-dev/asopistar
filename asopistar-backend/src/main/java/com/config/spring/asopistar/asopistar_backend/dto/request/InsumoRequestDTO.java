package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class InsumoRequestDTO {
 
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50)
    private String nombre;
 
    @NotBlank(message = "El tipo es obligatorio")
    private String tipo;   // ALEVINO, CONCENTRADO, OTRO
 
    @NotBlank(message = "La unidad de medida es obligatoria")
    @Size(max = 20)
    private String unidadMedida;
 
    @NotNull(message = "El precio unitario es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precioUnitario;
 
    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal stockActual;
 
    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal stockMinimo;
}
