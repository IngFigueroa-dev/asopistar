package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
// import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
 
@Entity
@Table(name = "punto_venta", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PuntoVenta {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_punto")
    private Integer idPunto;
 
    @Column(name = "nombre", length = 40, nullable = false)
    private String nombre;
 
    @Column(name = "ciudadd", length = 30, nullable = false)
    private String ciudad;
 
    @Column(name = "direccion", length = 50, nullable = false)
    private String direccion;
 
    @Column(name = "activo")
    private Boolean activo;
}

