package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EspecieRequestDTO {
 
    @NotBlank(message = "El nombre de la especie es obligatorio")
    @Size(max = 20, message = "El nombre no puede superar 20 caracteres")
    private String nombre;
 
    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 100)
    private String descripcion;
}
