package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
// import java.io.Serializable;
import java.math.BigDecimal;
 
@Entity
@Table(name = "detalle_envio", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleEnvio {
 
    @EmbeddedId
    private DetalleEnvioId id;
 
    @Column(name = "kilos", nullable = false, precision = 10, scale = 2)
    private BigDecimal kilos;
 
    @Column(name = "precios_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal preciosKg;
 
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idEnvio")
    @JoinColumn(name = "id_envio")
    private Envio envio;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote", nullable = false)
    private LoteCuartoFrio loteCuartoFrio;
}

