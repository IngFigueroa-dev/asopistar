package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "procesamiento", schema = "negocio")
public class Procesamiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_procesamiento")
    private Integer idProcesamiento;

    // PESAJE, EVISCERADO, LIMPIEZA, CONGELAMIENTO, DISTRIBUCION
    @Column(name = "etapa", nullable = false, length = 20)
    private String etapa;

    // EN_PROCESO, COMPLETADO
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "responsable", length = 60)
    private String responsable;

    @Column(name = "observaciones", length = 150)
    private String observaciones;

    // Relación con la recepción origen (todas las etapas del mismo ciclo
    // comparten la misma recepción)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_recepcion", nullable = false)
    private Recepcion recepcion;

    // ── Getters y Setters ────────────────────────────────────────────────────

    public Integer getIdProcesamiento() { return idProcesamiento; }
    public void setIdProcesamiento(Integer id) { this.idProcesamiento = id; }

    public String getEtapa() { return etapa; }
    public void setEtapa(String etapa) { this.etapa = etapa; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }

    public String getResponsable() { return responsable; }
    public void setResponsable(String responsable) { this.responsable = responsable; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Recepcion getRecepcion() { return recepcion; }
    public void setRecepcion(Recepcion recepcion) { this.recepcion = recepcion; }
}
