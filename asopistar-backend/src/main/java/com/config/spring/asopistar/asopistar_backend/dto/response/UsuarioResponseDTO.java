package com.config.spring.asopistar.asopistar_backend.dto.response;

import com.config.spring.asopistar.asopistar_backend.entity.EstadoUsuario;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de respuesta de usuario. Nunca expone la contraseña.
 * Incluye los campos nuevos del sistema de aprobación.
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UsuarioResponseDTO {

    private Integer idUsuario;
    private String nombre1;
    private String nombre2;
    private String apellido1;
    private String apellido2;
    private String documento;
    private String telefono;
    private String email;
    private String cargoSolicitado;
    private EstadoUsuario estado;
    private Boolean activo;
    private LocalDate fechaCreacion;
    private LocalDateTime fechaAprobacion;
    private String motivoRechazo;
    private String nombreRol;
    private String nombreAprobadoPor;  // nombre completo de quien aprobó/rechazó

    // Datos extra de productor (null para otros roles)
    private LocalDate fechaNacimiento;
    private Integer cantidadHijos;
    private String direccion;

    // NUNCA incluir contrasena, token ni datos sensibles de seguridad aquí
}
