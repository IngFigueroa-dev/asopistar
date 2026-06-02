package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "insumo", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Insumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_insumo")
    private Integer idInsumo;

    @Column(name = "codigo", length = 15, unique = true)
    private String codigo;

    @Column(name = "nombre", length = 50, nullable = false)
    private String nombre;

    @Column(name = "tipo", length = 30, nullable = false)
    private String tipo;

    @Column(name = "unidad_medida", length = 20, nullable = false)
    private String unidadMedida;

    @Column(name = "descripcion", length = 100)
    private String descripcion;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "stock_actual", nullable = false, precision = 10, scale = 2)
    private BigDecimal stockActual;

    @Column(name = "stock_minimo", nullable = false, precision = 10, scale = 2)
    private BigDecimal stockMinimo;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;
}
