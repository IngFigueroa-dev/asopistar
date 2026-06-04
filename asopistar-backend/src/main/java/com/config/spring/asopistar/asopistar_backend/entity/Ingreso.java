package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Ingreso de ASOPISTAR.
 * Versión ampliada del ingreso original.
 * Se añaden: numeroIngreso, tipoIngreso, cliente, valorTotal/Pagado/Saldo,
 * estadoPago, historial de pagos (PagoIngreso).
 *
 * Campos originales conservados sin modificación:
 *   id_ingreso, fecha, concepto, monto, tipo_origen, id_envio, id_venta_insumo
 */
@Entity
@Table(name = "ingreso", schema = "negocio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingreso {

    // ── Campos originales (sin cambios) ───────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ingreso")
    private Integer idIngreso;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "concepto", length = 100)
    private String concepto;

    /** Monto original (se conserva para compatibilidad). valorTotal es el campo principal ahora. */
    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    /** VENTA_PESCADO | VENTA_INSUMO | OTRO — campo original conservado */
    @Column(name = "tipo_origen", length = 30, nullable = false)
    private String tipoOrigen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_envio")
    private Envio envio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta_insumo")
    private VentaInsumo ventaInsumo;

    // ── Campos nuevos ─────────────────────────────────────────────────────────

    /** Código legible. Formato: ING-2024-0001. Generado automáticamente en el servicio. */
    @Column(name = "numero_ingreso", length = 20, unique = true, nullable = false)
    private String numeroIngreso;

    /**
     * Tipo de ingreso del catálogo del módulo.
     * VENTA_PESCADO | VENTA_ALEVINOS | VENTA_CONCENTRADO | OTRO
     */
    @Column(name = "tipo_ingreso", length = 30)
    private String tipoIngreso;

    /** Cliente comprador asociado (nullable: no todos los ingresos tienen cliente directo). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    /** Valor total del ingreso/factura. */
    @Column(name = "valor_total", nullable = false, precision = 14, scale = 2)
    private BigDecimal valorTotal;

    /** Suma de todos los abonos registrados. Actualizado automáticamente por el servicio. */
    @Column(name = "valor_pagado", nullable = false, precision = 14, scale = 2)
    private BigDecimal valorPagado;

    /** valorTotal - valorPagado. Actualizado automáticamente. */
    @Column(name = "saldo_pendiente", nullable = false, precision = 14, scale = 2)
    private BigDecimal saldoPendiente;

    /**
     * Estado del cobro.
     * PENDIENTE → PARCIAL → PAGADO
     * ANULADO (estado terminal)
     */
    @Column(name = "estado_pago", length = 20, nullable = false)
    private String estadoPago;

    @Column(name = "referencia", length = 60)
    private String referencia;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    /** Historial de abonos. mappedBy del campo ingreso en PagoIngreso. */
    @OneToMany(mappedBy = "ingreso", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<PagoIngreso> pagos;

    // ── Ciclo de vida ─────────────────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estadoPago == null)       this.estadoPago    = "PENDIENTE";
        if (this.valorPagado == null)      this.valorPagado   = BigDecimal.ZERO;
        if (this.saldoPendiente == null)   this.saldoPendiente = this.valorTotal != null ? this.valorTotal : BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
