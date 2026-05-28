package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RolRequestDTO {
 
    @NotBlank(message = "El nombre del rol es obligatorio")
    @Size(max = 30, message = "El nombre no puede superar 30 caracteres")
    private String nombre;
 
    @Size(max = 100, message = "La descripción no puede superar 100 caracteres")
    private String descripcion;
}
