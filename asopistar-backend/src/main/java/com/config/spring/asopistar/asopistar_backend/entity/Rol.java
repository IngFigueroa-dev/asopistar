package com.config.spring.asopistar.asopistar_backend.entity;



import jakarta.persistence.*;
import lombok.*;
// import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.LocalDateTime;

 
@Entity
@Table(name = "rol", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Rol {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Integer idRol;
 
    @Column(name = "nombre", length = 30, nullable = false)
    private String nombre;
 
    @Column(name = "descripcion", length = 100)
    private String descripcion;
}

