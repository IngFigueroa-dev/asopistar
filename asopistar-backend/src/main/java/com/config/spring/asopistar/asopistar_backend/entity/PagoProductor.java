package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
// import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "pago_productor", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PagoProductor {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Integer idPago;
 
    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;
 
    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;
 
    @Column(name = "precio_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioKg;
 
    @Column(name = "kilos_pagados", nullable = false, precision = 10, scale = 2)
    private BigDecimal kilosPagados;
 
    @Column(name = "estado", length = 20, nullable = false)
    private String estado;   // PENDIENTE, PAGADO
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_productor")
    private Productor productor;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_recepcion", nullable = false)
    private Recepcion recepcion;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_metodo_pago", nullable = false)
    private MetodoPago metodoPago;
}
