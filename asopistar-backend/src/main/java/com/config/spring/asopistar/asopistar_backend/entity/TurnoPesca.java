package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
// import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "turnos_pesca", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TurnoPesca {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_turno")
    private Integer idTurno;
 
    @Column(name = "fecha_programada", nullable = false)
    private LocalDate fechaProgramada;
 
    @Column(name = "hora_programada", nullable = false)
    private LocalDateTime horaProgramada;
 
    @Column(name = "tipo_prioridad", length = 20)
    private String tipoPrioridad;   // NORMAL, EMERGENCIA
 
    @Column(name = "motivo_emergencia", length = 50)
    private String motivoEmergencia;   // Solo aplica si tipoPrioridad = EMERGENCIA
 
    @Column(name = "estado", length = 20, nullable = false)
    private String estado;   // PENDIENTE, CONFIRMADO, REALIZADO, CANCELADO
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_siembra", nullable = false)
    private Siembra siembra;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_productor", nullable = false)
    private Productor productor;
}

