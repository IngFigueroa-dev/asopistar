package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
// import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "ingreso", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Ingreso {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ingreso")
    private Integer idIngreso;
 
    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;
 
    @Column(name = "concepto", length = 100)
    private String concepto;
 
    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;
 
    @Column(name = "tipo_origen", length = 30, nullable = false)
    private String tipoOrigen;   // VENTA_PESCADO, VENTA_INSUMO, OTRO
 
    // Nullable: depende del tipo_origen
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_envio")
    private Envio envio;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta_insumo")
    private VentaInsumo ventaInsumo;
}
