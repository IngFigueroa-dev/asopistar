package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "productor", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Productor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_productor")
    private Integer idProductor;

    @Column(name = "nombre1", length = 15, nullable = false)
    private String nombre1;

    @Column(name = "nombre2", length = 15)
    private String nombre2;

    @Column(name = "apellido1", length = 20, nullable = false)
    private String apellido1;

    @Column(name = "apellido2", length = 20)
    private String apellido2;

    @Column(name = "documento", length = 15, nullable = false)
    private String documento;

    @Column(name = "telefono", length = 15, nullable = false)
    private String telefono;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Column(name = "cantidad_hijos")
    private Integer cantidadHijos;

    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "direccion", length = 100, nullable = false)
    private String direccion;

    // La columna id_usuario solo se mapea UNA VEZ, aquí como relación.
    // Para leer el ID sin cargar el objeto usa: productor.getUsuario().getIdUsuario()
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;
}
