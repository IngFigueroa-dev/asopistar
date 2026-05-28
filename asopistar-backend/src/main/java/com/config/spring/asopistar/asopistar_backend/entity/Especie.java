package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
// import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
 
@Entity
@Table(name = "especie", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Especie {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_especie")
    private Integer idEspecie;
 
    @Column(name = "nombre", length = 20, nullable = false)
    private String nombre;
 
    @Column(name = "descripcion", length = 100, nullable = false)
    private String descripcion;
}
