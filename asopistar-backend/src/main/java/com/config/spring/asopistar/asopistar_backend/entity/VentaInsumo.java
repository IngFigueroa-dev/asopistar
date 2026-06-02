package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Cabecera de una venta de insumos a un productor.
 * Los detalles (líneas de producto) están en DetalleVentaInsumo.
 */
@Entity
@Table(name = "venta_insumo", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class VentaInsumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta_insumo")
    private Integer idVentaInsumo;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    /** PAGADO | PENDIENTE | CREDITO */
    @Column(name = "estado_pagado", length = 20, nullable = false)
    private String estadoPagado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_productor")
    private Productor productor;

    /**
     * Relación bidireccional para el servicio.
     * mappedBy apunta al campo ventaInsumo de DetalleVentaInsumo.
     * Se usa @ToString.Exclude para evitar ciclos con Lombok.
     */
    @OneToMany(mappedBy = "ventaInsumo", fetch = FetchType.LAZY,
               cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<DetalleVentaInsumo> detalles;
}
