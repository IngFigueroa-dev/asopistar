package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MetodoPagoRequestDTO {
 
    @NotBlank(message = "El nombre del método es obligatorio")
    @Size(max = 20)
    private String nombre;
 
    @Size(max = 100)
    private String descripcion;
 
    @NotBlank(message = "El estado es obligatorio")
    private String estado;   // ACTIVO, INACTIVO
}
