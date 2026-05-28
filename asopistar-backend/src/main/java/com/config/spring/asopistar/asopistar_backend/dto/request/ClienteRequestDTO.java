package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ClienteRequestDTO {
 
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 20)
    private String nombre1;
 
    @Size(max = 20)
    private String nombre2;
 
    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 20)
    private String apellido1;
 
    @Size(max = 20)
    private String apellido2;
 
    @NotBlank(message = "El tipo es obligatorio")
    private String tipo;   // MAYORISTA, MINORISTA, RESTAURANTE
 
    @NotBlank(message = "La ciudad es obligatoria")
    @Size(max = 50)
    private String ciudad;
 
    @NotBlank(message = "El teléfono es obligatorio")
    @Size(max = 15)
    private String telefono;
 
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    private String email;
 
    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 100)
    private String direccion;
}
