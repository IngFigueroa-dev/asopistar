package com.config.spring.asopistar.asopistar_backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReporteLoteResponseDTO {

    private Integer idLote;
    private String codigoLote;
    private LocalDateTime fechaIngreso;
    private BigDecimal kilos;
    private Boolean estado;
    private String estadoLabel;
    private String nombreProductor;
    private BigDecimal kilosRecepcion;

    public ReporteLoteResponseDTO() {}

    // Constructor sin espacioOcupado — el campo no existe en la entidad LoteCuartoFrio
    public ReporteLoteResponseDTO(Integer idLote, String codigoLote, LocalDateTime fechaIngreso,
                          BigDecimal kilos, Boolean estado,
                          String nombreProductor, BigDecimal kilosRecepcion) {
        this.idLote = idLote;
        this.codigoLote = codigoLote;
        this.fechaIngreso = fechaIngreso;
        this.kilos = kilos;
        this.estado = estado;
        this.estadoLabel = Boolean.TRUE.equals(estado) ? "DISPONIBLE" : "DESPACHADO";
        this.nombreProductor = nombreProductor;
        this.kilosRecepcion = kilosRecepcion;
    }

    public Integer getIdLote() { return idLote; }
    public void setIdLote(Integer idLote) { this.idLote = idLote; }

    public String getCodigoLote() { return codigoLote; }
    public void setCodigoLote(String codigoLote) { this.codigoLote = codigoLote; }

    public LocalDateTime getFechaIngreso() { return fechaIngreso; }
    public void setFechaIngreso(LocalDateTime fechaIngreso) { this.fechaIngreso = fechaIngreso; }

    public BigDecimal getKilos() { return kilos; }
    public void setKilos(BigDecimal kilos) { this.kilos = kilos; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) {
        this.estado = estado;
        this.estadoLabel = Boolean.TRUE.equals(estado) ? "DISPONIBLE" : "DESPACHADO";
    }

    public String getEstadoLabel() { return estadoLabel; }

    public String getNombreProductor() { return nombreProductor; }
    public void setNombreProductor(String nombreProductor) { this.nombreProductor = nombreProductor; }

    public BigDecimal getKilosRecepcion() { return kilosRecepcion; }
    public void setKilosRecepcion(BigDecimal kilosRecepcion) { this.kilosRecepcion = kilosRecepcion; }
}
