package com.config.spring.asopistar.asopistar_backend.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReporteTurnoResponseDTO {

    private Integer idTurno;
    private LocalDate fechaProgramada;
    private LocalDateTime horaProgramada;
    private String tipoPrioridad;
    private String motivoEmergencia;
    private String estado;
    private String nombreProductor;
    private String documentoProductor;
    private String nombreEstanque;
    private String codigoEstanque;
    private Integer cantidadAlevinos;

    public ReporteTurnoResponseDTO() {}

    public ReporteTurnoResponseDTO(Integer idTurno, LocalDate fechaProgramada,
                           LocalDateTime horaProgramada, String tipoPrioridad,
                           String motivoEmergencia, String estado,
                           String nombreProductor, String documentoProductor,
                           String nombreEstanque, String codigoEstanque,
                           Integer cantidadAlevinos) {
        this.idTurno = idTurno;
        this.fechaProgramada = fechaProgramada;
        this.horaProgramada = horaProgramada;
        this.tipoPrioridad = tipoPrioridad;
        this.motivoEmergencia = motivoEmergencia;
        this.estado = estado;
        this.nombreProductor = nombreProductor;
        this.documentoProductor = documentoProductor;
        this.nombreEstanque = nombreEstanque;
        this.codigoEstanque = codigoEstanque;
        this.cantidadAlevinos = cantidadAlevinos;
    }

    public Integer getIdTurno() { return idTurno; }
    public void setIdTurno(Integer idTurno) { this.idTurno = idTurno; }

    public LocalDate getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDate fechaProgramada) { this.fechaProgramada = fechaProgramada; }

    public LocalDateTime getHoraProgramada() { return horaProgramada; }
    public void setHoraProgramada(LocalDateTime horaProgramada) { this.horaProgramada = horaProgramada; }

    public String getTipoPrioridad() { return tipoPrioridad; }
    public void setTipoPrioridad(String tipoPrioridad) { this.tipoPrioridad = tipoPrioridad; }

    public String getMotivoEmergencia() { return motivoEmergencia; }
    public void setMotivoEmergencia(String motivoEmergencia) { this.motivoEmergencia = motivoEmergencia; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getNombreProductor() { return nombreProductor; }
    public void setNombreProductor(String nombreProductor) { this.nombreProductor = nombreProductor; }

    public String getDocumentoProductor() { return documentoProductor; }
    public void setDocumentoProductor(String documentoProductor) { this.documentoProductor = documentoProductor; }

    public String getNombreEstanque() { return nombreEstanque; }
    public void setNombreEstanque(String nombreEstanque) { this.nombreEstanque = nombreEstanque; }

    public String getCodigoEstanque() { return codigoEstanque; }
    public void setCodigoEstanque(String codigoEstanque) { this.codigoEstanque = codigoEstanque; }

    public Integer getCantidadAlevinos() { return cantidadAlevinos; }
    public void setCantidadAlevinos(Integer cantidadAlevinos) { this.cantidadAlevinos = cantidadAlevinos; }
}
