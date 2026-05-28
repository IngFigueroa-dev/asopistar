package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EstanqueRequestDTO {
 
    @NotBlank(message = "El código es obligatorio")
    @Size(max = 10)
    private String codigo;
 
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 20)
    private String nombre;
 
    @NotNull(message = "La capacidad es obligatoria")
    @DecimalMin(value = "0.01", message = "La capacidad debe ser mayor a 0")
    private BigDecimal capacidad;
 
    @NotBlank(message = "La ubicación es obligatoria")
    @Size(max = 100)
    private String ubicacion;
 
    @NotBlank(message = "El estado es obligatorio")
    private String estadoEstanque;   // ACTIVO, EN_MANTENIMIENTO, INACTIVO
 
    @NotNull(message = "El productor es obligatorio")
    private Integer idProductor;
}

