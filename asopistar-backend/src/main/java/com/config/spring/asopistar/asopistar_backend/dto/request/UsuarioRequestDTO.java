package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UsuarioRequestDTO {
 
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 15)
    private String nombre1;
 
    @Size(max = 15)
    private String nombre2;
 
    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 15)
    private String apellido1;
 
    @Size(max = 15)
    private String apellido2;
 
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    @Size(max = 30)
    private String email;
 
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener mínimo 8 caracteres")
    private String contrasena;
 
    @NotNull(message = "El rol es obligatorio")
    private Integer idRol;
}
