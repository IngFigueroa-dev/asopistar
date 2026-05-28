package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
// import java.time.LocalDate;
import java.time.LocalDateTime;
 
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
 
    @Column(name = "estado_pagado", length = 20, nullable = false)
    private String estadoPagado;   // PAGADO, PENDIENTE, CREDITO
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_productor")
    private Productor productor;
}

