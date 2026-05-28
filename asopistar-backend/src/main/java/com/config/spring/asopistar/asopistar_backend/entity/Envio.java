package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
// import java.math.BigDecimal;
// import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "envio", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Envio {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_envio")
    private Integer idEnvio;
 
    @Column(name = "fecha_envio", nullable = false)
    private LocalDateTime fechaEnvio;
 
    @Column(name = "destino_ciudad", length = 30, nullable = false)
    private String destinoCiudad;
 
    @Column(name = "tipo_destino", length = 25, nullable = false)
    private String tipoDestino;   // CLIENTE, PUNTO_VENTA
 
    @Column(name = "estado", length = 20, nullable = false)
    private String estado;   // PREPARADO, EN_CAMINO, ENTREGADO
 
    @Column(name = "observaciones", length = 100)
    private String observaciones;
 
    // Nullable: solo uno de los dos tendrá valor según tipo_destino
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_punto")
    private PuntoVenta puntoVenta;
}
