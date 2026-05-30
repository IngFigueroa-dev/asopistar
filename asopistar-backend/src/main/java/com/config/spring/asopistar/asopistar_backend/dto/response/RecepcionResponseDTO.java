package com.config.spring.asopistar.asopistar_backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de salida para Recepción.
 * Incluye todos los campos que el frontend de Pagos necesita.
 */
public class RecepcionResponseDTO {

    private Integer    idRecepcion;
    private LocalDateTime fechaHora;
    private BigDecimal kilosRecibidos;
    private String     observaciones;

    // Datos del productor (para el select del modal de pagos)
    private Integer    idProductor;
    private String     nombreProductor;

    // Datos del turno asociado
    private Integer    idTurno;

    // ── Constructores ────────────────────────────────────────────────────────
    public RecepcionResponseDTO() {}

    // ── Getters y Setters ────────────────────────────────────────────────────
    public Integer getIdRecepcion() { return idRecepcion; }
    public void setIdRecepcion(Integer idRecepcion) { this.idRecepcion = idRecepcion; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public BigDecimal getKilosRecibidos() { return kilosRecibidos; }
    public void setKilosRecibidos(BigDecimal kilosRecibidos) { this.kilosRecibidos = kilosRecibidos; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Integer getIdProductor() { return idProductor; }
    public void setIdProductor(Integer idProductor) { this.idProductor = idProductor; }

    public String getNombreProductor() { return nombreProductor; }
    public void setNombreProductor(String nombreProductor) { this.nombreProductor = nombreProductor; }

    public Integer getIdTurno() { return idTurno; }
    public void setIdTurno(Integer idTurno) { this.idTurno = idTurno; }
}
