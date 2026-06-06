package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Registra cada evento relevante del ciclo de vida de un usuario.
 * Se inserta siempre, nunca se modifica ni elimina.
 */
@Entity
@Table(name = "auditoria_usuario", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditoriaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Integer idAuditoria;

    /** Usuario afectado por la acción */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha", nullable = false)
    @Builder.Default
    private LocalDateTime fecha = LocalDateTime.now();

    /**
     * Tipo de evento.
     * Valores posibles: REGISTRO, CORREO_ENVIADO, CORREO_REENVIADO,
     * ERROR_ENVIO_CORREO, VERIFICACION_REALIZADA, APROBACION_MANUAL,
     * APROBACION_NORMAL, RECHAZO, ACTIVACION, SUSPENSION, DESACTIVACION
     */
    @Column(name = "accion", length = 50, nullable = false)
    private String accion;

    /** Admin que realizó la acción (null si fue automático o por el propio usuario) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_admin")
    private Usuario admin;

    @Column(name = "observaciones", length = 500)
    private String observaciones;
}
