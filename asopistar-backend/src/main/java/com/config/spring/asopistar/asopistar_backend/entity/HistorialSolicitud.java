package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_solicitud", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class HistorialSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Integer idHistorial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    /**
     * Acción registrada: APROBADO | RECHAZADO | REENVIO_VERIFICACION | REGISTRO
     */
    @Column(name = "accion", length = 30, nullable = false)
    private String accion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "realizado_por")
    private Usuario realizadoPor;

    @Column(name = "fecha_accion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaAccion = LocalDateTime.now();

    @Column(name = "observacion", length = 255)
    private String observacion;
}
