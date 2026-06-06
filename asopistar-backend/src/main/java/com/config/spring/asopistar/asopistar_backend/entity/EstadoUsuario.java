package com.config.spring.asopistar.asopistar_backend.entity;

/**
 * Estados del ciclo de vida de un usuario en ASOPISTAR.
 *
 * PENDIENTE_VERIFICACION → usuario registrado, esperando clic en link de correo
 * ERROR_ENVIO_CORREO     → el correo de verificación falló al enviarse (SMTP u otro error)
 * PENDIENTE_APROBACION   → correo verificado, esperando que el admin apruebe
 * ACTIVO                 → aprobado y con acceso al sistema
 * RECHAZADO              → solicitud rechazada por el administrador
 * SUSPENDIDO             → acceso suspendido temporalmente por el admin
 * INACTIVO               → desactivado manualmente por el admin
 */
public enum EstadoUsuario {
    PENDIENTE_VERIFICACION,
    ERROR_ENVIO_CORREO,
    PENDIENTE_APROBACION,
    ACTIVO,
    RECHAZADO,
    SUSPENDIDO,
    INACTIVO
}
