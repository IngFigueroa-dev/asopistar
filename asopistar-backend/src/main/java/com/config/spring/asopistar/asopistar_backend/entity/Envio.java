package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad principal de logística.
 * Se amplía con datos de transporte, guía, fechas y evidencia de entrega.
 * Mantiene compatibilidad total con los datos y funcionalidades existentes.
 */
@Entity
@Table(name = "envio", schema = "negocio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Envio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_envio")
    private Integer idEnvio;

    // ── Campos originales (sin cambios) ──────────────────────────────────────

    @Column(name = "fecha_envio", nullable = false)
    private LocalDateTime fechaEnvio;

    @Column(name = "destino_ciudad", length = 30, nullable = false)
    private String destinoCiudad;

    /** CLIENTE | PUNTO_VENTA */
    @Column(name = "tipo_destino", length = 25, nullable = false)
    private String tipoDestino;

    /** PREPARADO | EN_CAMINO | ENTREGADO | CANCELADO */
    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @Column(name = "observaciones", length = 100)
    private String observaciones;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_punto")
    private PuntoVenta puntoVenta;

    // ── Campos nuevos: identificación y trazabilidad ─────────────────────────

    /**
     * Código de guía único. Formato: GUIA-YYYY-NNNNN
     * Se genera automáticamente en el servicio antes de persistir.
     * No editable una vez creado.
     */
    @Column(name = "codigo_guia", length = 20, unique = true)
    private String codigoGuia;

    /** Fecha en que se preparó el envío (asignada al crear). */
    @Column(name = "fecha_preparacion")
    private LocalDateTime fechaPreparacion;

    /** Fecha real en que el vehículo salió de la planta. */
    @Column(name = "fecha_salida")
    private LocalDateTime fechaSalida;

    /** Fecha estimada de llegada al destino. */
    @Column(name = "fecha_entrega_estimada")
    private LocalDate fechaEntregaEstimada;

    /** Fecha real en que se confirmó la entrega. */
    @Column(name = "fecha_entrega_real")
    private LocalDateTime fechaEntregaReal;

    // ── Campos nuevos: transporte ─────────────────────────────────────────────

    @Column(name = "empresa_transportadora", length = 60)
    private String empresaTransportadora;

    @Column(name = "nombre_conductor", length = 60)
    private String nombreConductor;

    @Column(name = "telefono_conductor", length = 15)
    private String telefonoConductor;

    @Column(name = "placa_vehiculo", length = 10)
    private String placaVehiculo;

    @Column(name = "tipo_vehiculo", length = 30)
    private String tipoVehiculo;

    // ── Campos nuevos: evidencia de entrega (arquitectura preparada) ──────────

    /** Observación registrada al momento de la entrega. */
    @Column(name = "observacion_entrega", length = 200)
    private String observacionEntrega;

    /** Nombre de la persona que recibió el pedido. */
    @Column(name = "nombre_receptor", length = 60)
    private String nombreReceptor;

    // ── Auditoría automática ──────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        if (this.fechaEnvio == null) {
            this.fechaEnvio = LocalDateTime.now();
        }
        if (this.fechaPreparacion == null) {
            this.fechaPreparacion = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "PREPARADO";
        }
    }
}
