package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
// import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
 
@Entity
@Table(name = "metodo_pago", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MetodoPago {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_metodo_pago")
    private Integer idMetodoPago;
 
    @Column(name = "nombre", length = 20, nullable = false)
    private String nombre;
 
    @Column(name = "descripcion", length = 100)
    private String descripcion;
 
    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}
