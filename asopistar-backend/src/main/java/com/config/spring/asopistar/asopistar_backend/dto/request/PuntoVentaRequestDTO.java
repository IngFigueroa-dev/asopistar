package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PuntoVentaRequestDTO {
 
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 40)
    private String nombre;
 
    @NotBlank(message = "La ciudad es obligatoria")
    @Size(max = 30)
    private String ciudad;
 
    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 50)
    private String direccion;
 
    private Boolean activo;
}
