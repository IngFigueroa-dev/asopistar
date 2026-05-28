package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
 
@Entity
@Table(name = "estanque", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Estanque {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estanque")
    private Integer idEstanque;
 
    @Column(name = "codigo", length = 10, nullable = false)
    private String codigo;
 
    @Column(name = "nombre", length = 20, nullable = false)
    private String nombre;
 
    @Column(name = "capacidad", nullable = false, precision = 10, scale = 2)
    private BigDecimal capacidad;
 
    @Column(name = "ubicacion", length = 100, nullable = false)
    private String ubicacion;
 
    @Column(name = "estado_estanque", length = 20, nullable = false)
    private String estadoEstanque;  // ACTIVO, EN_MANTENIMIENTO, INACTIVO
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_productor", nullable = false)
    private Productor productor;
}

