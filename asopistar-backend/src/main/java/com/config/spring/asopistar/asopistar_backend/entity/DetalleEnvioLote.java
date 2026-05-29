package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_envio_lote", schema = "negocio")
public class DetalleEnvioLote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Integer idDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_envio", nullable = false)
    private Envio envio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote", nullable = false)
    private LoteCuartoFrio lote;

    @Column(name = "kilos", nullable = false, precision = 10, scale = 2)
    private BigDecimal kilos;

    @Column(name = "observaciones", length = 100)
    private String observaciones;

    // ── Getters y Setters ─────────────────────────────────────────────────

    public Integer getIdDetalle() { return idDetalle; }
    public void setIdDetalle(Integer idDetalle) { this.idDetalle = idDetalle; }

    public Envio getEnvio() { return envio; }
    public void setEnvio(Envio envio) { this.envio = envio; }

    public LoteCuartoFrio getLote() { return lote; }
    public void setLote(LoteCuartoFrio lote) { this.lote = lote; }

    public BigDecimal getKilos() { return kilos; }
    public void setKilos(BigDecimal kilos) { this.kilos = kilos; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}