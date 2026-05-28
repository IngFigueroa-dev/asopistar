package com.config.spring.asopistar.asopistar_backend.entity;
 
import jakarta.persistence.*;
import lombok.*;
// import java.io.Serializable;
import java.math.BigDecimal;
 
@Entity
@Table(name = "detalle_venta_insumo", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleVentaInsumo {
 
    @EmbeddedId
    private DetalleVentaInsumoId id;
 
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;
 
    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;
 
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idVentaInsumo")
    @JoinColumn(name = "id_venta_insumo")
    private VentaInsumo ventaInsumo;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_insumo", nullable = false)
    private Insumo insumo;
}

