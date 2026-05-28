package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
 
@Entity
@Table(name = "insumo", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Insumo {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_insumo")
    private Integer idInsumo;
 
    @Column(name = "nombre", length = 50, nullable = false)
    private String nombre;
 
    @Column(name = "tipo", length = 30, nullable = false)
    private String tipo;   // ALEVINO, CONCENTRADO, OTRO
 
    @Column(name = "unidad_medida", length = 20, nullable = false)
    private String unidadMedida;   // kg, unidad, bulto
 
    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;
 
    @Column(name = "stock_actual", nullable = false, precision = 10, scale = 2)
    private BigDecimal stockActual;
 
    @Column(name = "stock_minimo", nullable = false, precision = 10, scale = 2)
    private BigDecimal stockMinimo;
}

