package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;

/**
 * Respuesta del endpoint POST /auth/login.
 * El frontend guarda token, rol, nombre e idProductor en localStorage.
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginResponseDTO {

    private String  token;
    private String  tipo;         // siempre "Bearer"
    private String  email;
    private String  rol;          // ej: "ROLE_PRODUCTOR"
    private String  nombre;       // nombre1 + apellido1 para mostrar en el header
    private Integer idUsuario;
    private Integer idProductor;  // null si el usuario NO es ROLE_PRODUCTOR
}
