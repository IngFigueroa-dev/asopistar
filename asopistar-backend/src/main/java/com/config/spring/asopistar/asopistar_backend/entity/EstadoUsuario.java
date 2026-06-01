package com.config.spring.asopistar.asopistar_backend.entity;

/**
 * Estados del ciclo de vida de un usuario en ASOPISTAR.
 *
 * PENDIENTE_VERIFICACION → usuario registrado, esperando clic en link de correo
 * PENDIENTE_APROBACION   → correo verificado, esperando que el admin apruebe
 * ACTIVO                 → aprobado y con acceso al sistema
 * RECHAZADO              → solicitud rechazada por el administrador
 * INACTIVO               → desactivado manualmente por el admin
 */
public enum EstadoUsuario {
    PENDIENTE_VERIFICACION,
    PENDIENTE_APROBACION,
    ACTIVO,
    RECHAZADO,
    INACTIVO
}
