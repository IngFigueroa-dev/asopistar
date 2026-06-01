package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO que envía el administrador al aprobar o rechazar una solicitud.
 * - Al aprobar: idRolAsignado es obligatorio.
 * - Al rechazar: motivoRechazo es recomendado (para notificar al usuario).
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AprobacionUsuarioRequestDTO {

    /**
     * ID del rol real que el admin asigna al usuario.
     * Obligatorio cuando la acción es APROBAR.
     */
    private Integer idRolAsignado;

    /**
     * Motivo que se incluye en el correo de rechazo.
     * Recomendado cuando la acción es RECHAZAR.
     */
    private String motivoRechazo;
}
