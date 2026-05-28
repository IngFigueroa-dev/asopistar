package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
// import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
 
@Entity
@Table(name = "cliente", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Cliente {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer idCliente;
 
    @Column(name = "nombre1", length = 20, nullable = false)
    private String nombre1;
 
    @Column(name = "nombre2", length = 20)
    private String nombre2;
 
    @Column(name = "apellido1", length = 20, nullable = false)
    private String apellido1;
 
    @Column(name = "apellido2", length = 20)
    private String apellido2;
 
    @Column(name = "tipo", length = 30, nullable = false)
    private String tipo;   // MAYORISTA, MINORISTA, RESTAURANTE
 
    @Column(name = "ciudad", length = 50, nullable = false)
    private String ciudad;
 
    @Column(name = "telefono", length = 15, nullable = false)
    private String telefono;
 
    @Column(name = "email", length = 15, nullable = false)
    private String email;
 
    @Column(name = "direccion", length = 100, nullable = false)
    private String direccion;
}
