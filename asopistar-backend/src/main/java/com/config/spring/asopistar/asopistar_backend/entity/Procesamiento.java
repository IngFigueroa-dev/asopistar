package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
// import java.math.BigDecimal;
// import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "procesamiento", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Procesamiento {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_procesamiento")
    private Integer idProcesamiento;
 
    @Column(name = "etapa", length = 20, nullable = false)
    private String etapa;   // EVISCERADO, LIMPIEZA, CONGELADO
 
    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;
 
    @Column(name = "responsable", length = 20, nullable = false)
    private String responsable;
 
    @Column(name = "observaciones", length = 100, nullable = false)
    private String observaciones;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote", nullable = false)
    private LoteCuartoFrio loteCuartoFrio;
}
