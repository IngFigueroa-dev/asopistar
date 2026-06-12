package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion_produccion", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ConfiguracionProduccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_config")
    private Integer idConfig;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_especie", nullable = false)
    private Especie especie;

    @Column(name = "ciclo_meses", nullable = false)
    private Integer cicloMeses;

    @Column(name = "peso_cosecha_kg", precision = 10, scale = 2)
    private BigDecimal pesoCosechaKg;

    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "observaciones", length = 150)
    private String observaciones;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "actualizado_por", length = 60)
    private String actualizadoPor;
}
