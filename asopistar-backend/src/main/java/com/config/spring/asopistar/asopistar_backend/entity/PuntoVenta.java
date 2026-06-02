package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Representa un punto de venta propio, aliado o temporal de ASOPISTAR.
 * No se eliminan registros físicamente; se usa el campo {@code estado}.
 */
@Entity
@Table(name = "punto_venta", schema = "negocio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PuntoVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_punto")
    private Integer idPunto;

    // ── Identificación ──────────────────────────────────────────────────────

    @Column(name = "codigo", length = 15)
    private String codigo;

    @Column(name = "nombre", length = 40, nullable = false)
    private String nombre;

    /**
     * PROPIO | ALIADO | TEMPORAL
     */
    @Column(name = "tipo", length = 20)
    private String tipo;

    // ── Ubicación ───────────────────────────────────────────────────────────

    @Column(name = "direccion", length = 50, nullable = false)
    private String direccion;

    /** Columna renombrada desde "ciudadd" en la migración SQL. */
    @Column(name = "ciudad", length = 30, nullable = false)
    private String ciudad;

    @Column(name = "departamento", length = 40)
    private String departamento;

    // ── Contacto ────────────────────────────────────────────────────────────

    @Column(name = "responsable", length = 60)
    private String responsable;

    @Column(name = "cargo_responsable", length = 50)
    private String cargoResponsable;

    @Column(name = "telefono", length = 15)
    private String telefono;

    @Column(name = "correo", length = 60)
    private String correo;

    // ── Operativo ───────────────────────────────────────────────────────────

    @Column(name = "fecha_apertura")
    private LocalDate fechaApertura;

    @Column(name = "observaciones", length = 200)
    private String observaciones;

    /**
     * ACTIVO | INACTIVO | SUSPENDIDO
     */
    @Column(name = "estado", length = 20)
    private String estado;

    /** Conservado por compatibilidad. Se deriva de {@code estado}. */
    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    // ── Auditoría automática ────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "ACTIVO";
        }
        if (this.tipo == null) {
            this.tipo = "PROPIO";
        }
        // Sincronizar activo con estado para compatibilidad con Logística
        this.activo = "ACTIVO".equals(this.estado);
    }

    @PreUpdate
    private void preUpdate() {
        this.activo = "ACTIVO".equals(this.estado);
    }
}
