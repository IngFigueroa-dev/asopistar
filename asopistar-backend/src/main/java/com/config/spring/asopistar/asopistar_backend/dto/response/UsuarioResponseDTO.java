package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.time.LocalDate;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UsuarioResponseDTO {
 
    private Integer idUsuario;
    private String nombre1;
    private String nombre2;
    private String apellido1;
    private String apellido2;
    private String email;
    private Boolean activo;
    private LocalDate fechaCreacion;
    private String nombreRol;   // Solo el nombre, no el objeto Rol
    // NUNCA incluir contrasena aquí
}
