package com.config.spring.asopistar.asopistar_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de salida para el módulo de Solicitudes de Acceso.
 * Extiende la información básica del usuario con los campos
 * de reenvío de correo y auditoría.
 *
 * Nota: si ya tienes un UsuarioResponseDTO con estos campos,
 * puedes añadir directamente los campos nuevos a ese DTO
 * en lugar de crear uno separado.
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SolicitudAccesoResponseDTO {

    // ── Identificación ───────────────────────────────────────
    private Integer idUsuario;
    private String  nombre1;
    private String  nombre2;
    private String  apellido1;
    private String  apellido2;
    private String  documento;
    private String  telefono;
    private String  email;
    private String  direccion;
    private LocalDate fechaNacimiento;
    private Integer cantidadHijos;

    // ── Gestión de solicitud ─────────────────────────────────
    private String        cargoSolicitado;
    private String        estado;               // EstadoUsuario.name()
    private LocalDate     fechaCreacion;
    private LocalDateTime fechaAprobacion;
    private String        motivoRechazo;

    // ── Reenvío de correo ────────────────────────────────────
    private Integer       cantidadReenvios;
    private LocalDateTime ultimoReenvio;

    // ── Error SMTP ───────────────────────────────────────────
    /** Mensaje de error SMTP si el correo no pudo enviarse */
    private String        errorEnvioCorreo;

    // ── Rol asignado (post-aprobación) ───────────────────────
    private Integer rolId;
    private String  rolNombre;
}
