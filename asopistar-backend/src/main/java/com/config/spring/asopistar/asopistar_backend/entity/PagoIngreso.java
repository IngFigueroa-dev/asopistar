package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Historial de abonos sobre un ingreso.
 * Un ingreso puede tener múltiples pagos parciales.
 * Cada vez que se registra un abono se crea un PagoIngreso
 * y se recalcula el saldo del Ingreso padre.
 */
@Entity
@Table(name = "pago_ingreso", schema = "negocio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoIngreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago_ingreso")
    private Integer idPagoIngreso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ingreso", nullable = false)
    private Ingreso ingreso;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;

    @Column(name = "valor_pago", nullable = false, precision = 14, scale = 2)
    private BigDecimal valorPago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_metodo_pago", nullable = false)
    private MetodoPago metodoPago;

    @Column(name = "referencia", length = 60)
    private String referencia;

    @Column(name = "observaciones", length = 200)
    private String observaciones;

    /** Email del usuario autenticado que registró este abono. */
    @Column(name = "registrado_por", length = 80)
    private String registradoPor;

    @PrePersist
    protected void onCreate() {
        if (this.fechaPago == null) {
            this.fechaPago = LocalDateTime.now();
        }
    }
}
