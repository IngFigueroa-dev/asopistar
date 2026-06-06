package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.response.SolicitudAccesoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Usuario;

import java.util.List;

/**
 * Operaciones administrativas sobre solicitudes de acceso:
 * - Reenvío de correo de verificación por parte del admin
 * - Aprobación manual (saltando la verificación de correo)
 * - Registro de auditoría
 */
public interface SolicitudAccesoService {

    /** Lista solicitudes por estado. Pasa null para traer todas. */
    List<SolicitudAccesoResponseDTO> listarPorEstado(String estado);

    /**
     * El admin reenvía manualmente el correo de verificación.
     * Solo válido para usuarios en PENDIENTE_VERIFICACION o ERROR_ENVIO_CORREO.
     *
     * @param idUsuario  ID del usuario destino
     * @param idAdmin    ID del administrador que ejecuta la acción
     */
    void reenviarCorreoAdmin(Integer idUsuario, Integer idAdmin);

    /**
     * Aprobación manual: pasa el usuario directo a ACTIVO
     * sin necesidad de que haya verificado el correo.
     * Exclusivo para ROLE_ADMINISTRADOR_GENERAL.
     *
     * @param idUsuario      ID del usuario a activar
     * @param idRolAsignado  ID del rol que se le asigna
     * @param idAdmin        ID del administrador responsable
     * @param observaciones  Justificación registrada en auditoría
     */
    SolicitudAccesoResponseDTO aprobarManual(
        Integer idUsuario,
        Integer idRolAsignado,
        Integer idAdmin,
        String  observaciones
    );

    /**
     * Registra un evento en la tabla auditoria_usuario.
     * Llamar desde cualquier servicio que modifique el estado del usuario.
     */
    void registrarAuditoria(Usuario usuario, String accion, Usuario admin, String observaciones);
}
