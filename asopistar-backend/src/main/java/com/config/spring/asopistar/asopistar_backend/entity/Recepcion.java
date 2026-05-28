package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
// import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "recepcion", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Recepcion {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_recepcion")
    private Integer idRecepcion;
 
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;
 
    @Column(name = "kilos_recibidos", nullable = false, precision = 10, scale = 2)
    private BigDecimal kilosRecibidos;
 
    @Column(name = "observaciones", length = 100)
    private String observaciones;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_productor", nullable = false)
    private Productor productor;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_turno", nullable = false)
    private TurnoPesca turnoPesca;
}
