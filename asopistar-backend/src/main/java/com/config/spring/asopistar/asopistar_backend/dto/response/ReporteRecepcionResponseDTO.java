package com.config.spring.asopistar.asopistar_backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReporteRecepcionResponseDTO {

    private Integer idRecepcion;
    private LocalDateTime fechaHora;
    private String nombreProductor;
    private String documentoProductor;
    private BigDecimal kilosRecibidos;
    private String observaciones;
    private String estadoTurno;
    private String codigoLote;

    public ReporteRecepcionResponseDTO() {}

    public ReporteRecepcionResponseDTO(Integer idRecepcion, LocalDateTime fechaHora,
                               String nombreProductor, String documentoProductor,
                               BigDecimal kilosRecibidos, String observaciones,
                               String estadoTurno, String codigoLote) {
        this.idRecepcion = idRecepcion;
        this.fechaHora = fechaHora;
        this.nombreProductor = nombreProductor;
        this.documentoProductor = documentoProductor;
        this.kilosRecibidos = kilosRecibidos;
        this.observaciones = observaciones;
        this.estadoTurno = estadoTurno;
        this.codigoLote = codigoLote;
    }

    public Integer getIdRecepcion() { return idRecepcion; }
    public void setIdRecepcion(Integer idRecepcion) { this.idRecepcion = idRecepcion; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public String getNombreProductor() { return nombreProductor; }
    public void setNombreProductor(String nombreProductor) { this.nombreProductor = nombreProductor; }

    public String getDocumentoProductor() { return documentoProductor; }
    public void setDocumentoProductor(String documentoProductor) { this.documentoProductor = documentoProductor; }

    public BigDecimal getKilosRecibidos() { return kilosRecibidos; }
    public void setKilosRecibidos(BigDecimal kilosRecibidos) { this.kilosRecibidos = kilosRecibidos; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getEstadoTurno() { return estadoTurno; }
    public void setEstadoTurno(String estadoTurno) { this.estadoTurno = estadoTurno; }

    public String getCodigoLote() { return codigoLote; }
    public void setCodigoLote(String codigoLote) { this.codigoLote = codigoLote; }
}

