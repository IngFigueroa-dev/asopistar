package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
// import java.time.LocalDateTime;
 
@Entity
@Table(name = "seguimiento_siembra", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SeguimientoSiembra {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seguimiento")
    private Integer idSeguimiento;
 
    @Column(name = "fecha_visita", nullable = false)
    private LocalDate fechaVisita;
 
    @Column(name = "peso_promedio", nullable = false, precision = 10, scale = 2)
    private BigDecimal pesoPromedio;
 
    @Column(name = "cantidad_estimada", nullable = false)
    private Integer cantidadEstimada;
 
    @Column(name = "condicion_agua", length = 50, nullable = false)
    private String condicionAgua;   // BUENA, REGULAR, MALA
 
    @Column(name = "estado_salud", length = 50, nullable = false)
    private String estadoSalud;
 
    @Column(name = "observaciones", length = 100)
    private String observaciones;
 
    @Column(name = "apto_cosecha", nullable = false)
    private Character aptoCosecha;   // 'Y' = apto, 'N' = no apto
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_siembra", nullable = false)
    private Siembra siembra;
}

