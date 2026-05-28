package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "lote_cuarto_frio", schema = "negocio")
public class LoteCuartoFrio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lote")
    private Integer idLote;

    @Column(name = "codigo_lote", nullable = false, length = 15)
    private String codigoLote;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDateTime fechaIngreso;

    @Column(name = "kilos", nullable = false, precision = 10, scale = 2)
    private BigDecimal kilos;

    // true = disponible, false = despachado
    @Column(name = "estado")
    private Boolean estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_recepcion", nullable = false)
    private Recepcion recepcion;

    // ── Getters y Setters ────────────────────────────────────────────────────

    public Integer getIdLote() { return idLote; }
    public void setIdLote(Integer idLote) { this.idLote = idLote; }

    public String getCodigoLote() { return codigoLote; }
    public void setCodigoLote(String codigoLote) { this.codigoLote = codigoLote; }

    public LocalDateTime getFechaIngreso() { return fechaIngreso; }
    public void setFechaIngreso(LocalDateTime fechaIngreso) { this.fechaIngreso = fechaIngreso; }

    public BigDecimal getKilos() { return kilos; }
    public void setKilos(BigDecimal kilos) { this.kilos = kilos; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }

    public Recepcion getRecepcion() { return recepcion; }
    public void setRecepcion(Recepcion recepcion) { this.recepcion = recepcion; }
}
