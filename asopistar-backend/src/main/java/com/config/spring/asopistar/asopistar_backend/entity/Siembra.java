package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
// import java.time.LocalDateTime;
 
@Entity
@Table(name = "siembra", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Siembra {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_siembra")
    private Integer idSiembra;
 
    @Column(name = "fecha_siembra", nullable = false)
    private LocalDate fechaSiembra;
 
    @Column(name = "cantidad_alevinos", nullable = false)
    private Integer cantidadAlevinos;
 
    @Column(name = "promedio_inicial", nullable = false, precision = 10, scale = 2)
    private BigDecimal promedioInicial;
 
    @Column(name = "estado", length = 20, nullable = false)
    private String estado;   // EN_CURSO, COSECHADO, PERDIDO
 
    @Column(name = "observaciones", length = 100)
    private String observaciones;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_especie", nullable = false)
    private Especie especie;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estanque", nullable = false)
    private Estanque estanque;
}
