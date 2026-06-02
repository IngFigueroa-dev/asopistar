package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimiento_insumo", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MovimientoInsumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Integer idMovimiento;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    /** ENTRADA | SALIDA | AJUSTE */
    @Column(name = "tipo_movimiento", length = 20, nullable = false)
    private String tipoMovimiento;

    /** COMPRA | DONACION | AJUSTE_ADMIN | CORRECCION | VENTA | PERDIDA | DANO */
    @Column(name = "motivo", length = 30, nullable = false)
    private String motivo;

    @Column(name = "cantidad", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidad;

    @Column(name = "stock_antes", nullable = false, precision = 10, scale = 2)
    private BigDecimal stockAntes;

    @Column(name = "stock_despues", nullable = false, precision = 10, scale = 2)
    private BigDecimal stockDespues;

    @Column(name = "observacion", length = 150)
    private String observacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_insumo", nullable = false)
    private Insumo insumo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    /** Referencia opcional a la venta que generó este movimiento */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta_insumo")
    private VentaInsumo ventaInsumo;
}
