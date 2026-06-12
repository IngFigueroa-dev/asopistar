package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "capacidad_cuarto_frio", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CapacidadCuartoFrio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_capacidad")
    private Integer idCapacidad;

    @Column(name = "capacidad_max_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal capacidadMaxKg;

    @Column(name = "descripcion", length = 100)
    private String descripcion;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @Column(name = "actualizado_por", length = 60)
    private String actualizadoPor;
}
