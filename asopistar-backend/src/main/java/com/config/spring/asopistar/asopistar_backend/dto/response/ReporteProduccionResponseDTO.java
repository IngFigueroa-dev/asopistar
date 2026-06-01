package com.config.spring.asopistar.asopistar_backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ReporteProduccionResponseDTO {

    private Integer idSiembra;
    private LocalDate fechaSiembra;
    private String nombreEspecie;
    private String nombreEstanque;
    private String codigoEstanque;
    private String nombreProductor;
    private Integer cantidadAlevinos;
    private BigDecimal promedioInicial;
    private String estado;
    private String observaciones;
    private Integer totalSeguimientos;
    private BigDecimal ultimoPesoPromedio;
    private String aptoCosecha;

    public ReporteProduccionResponseDTO() {}

    public ReporteProduccionResponseDTO(Integer idSiembra, LocalDate fechaSiembra,
                                String nombreEspecie, String nombreEstanque,
                                String codigoEstanque, String nombreProductor,
                                Integer cantidadAlevinos, BigDecimal promedioInicial,
                                String estado, String observaciones,
                                Integer totalSeguimientos, BigDecimal ultimoPesoPromedio,
                                String aptoCosecha) {
        this.idSiembra = idSiembra;
        this.fechaSiembra = fechaSiembra;
        this.nombreEspecie = nombreEspecie;
        this.nombreEstanque = nombreEstanque;
        this.codigoEstanque = codigoEstanque;
        this.nombreProductor = nombreProductor;
        this.cantidadAlevinos = cantidadAlevinos;
        this.promedioInicial = promedioInicial;
        this.estado = estado;
        this.observaciones = observaciones;
        this.totalSeguimientos = totalSeguimientos;
        this.ultimoPesoPromedio = ultimoPesoPromedio;
        this.aptoCosecha = aptoCosecha;
    }

    public Integer getIdSiembra() { return idSiembra; }
    public void setIdSiembra(Integer idSiembra) { this.idSiembra = idSiembra; }

    public LocalDate getFechaSiembra() { return fechaSiembra; }
    public void setFechaSiembra(LocalDate fechaSiembra) { this.fechaSiembra = fechaSiembra; }

    public String getNombreEspecie() { return nombreEspecie; }
    public void setNombreEspecie(String nombreEspecie) { this.nombreEspecie = nombreEspecie; }

    public String getNombreEstanque() { return nombreEstanque; }
    public void setNombreEstanque(String nombreEstanque) { this.nombreEstanque = nombreEstanque; }

    public String getCodigoEstanque() { return codigoEstanque; }
    public void setCodigoEstanque(String codigoEstanque) { this.codigoEstanque = codigoEstanque; }

    public String getNombreProductor() { return nombreProductor; }
    public void setNombreProductor(String nombreProductor) { this.nombreProductor = nombreProductor; }

    public Integer getCantidadAlevinos() { return cantidadAlevinos; }
    public void setCantidadAlevinos(Integer cantidadAlevinos) { this.cantidadAlevinos = cantidadAlevinos; }

    public BigDecimal getPromedioInicial() { return promedioInicial; }
    public void setPromedioInicial(BigDecimal promedioInicial) { this.promedioInicial = promedioInicial; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Integer getTotalSeguimientos() { return totalSeguimientos; }
    public void setTotalSeguimientos(Integer totalSeguimientos) { this.totalSeguimientos = totalSeguimientos; }

    public BigDecimal getUltimoPesoPromedio() { return ultimoPesoPromedio; }
    public void setUltimoPesoPromedio(BigDecimal ultimoPesoPromedio) { this.ultimoPesoPromedio = ultimoPesoPromedio; }

    public String getAptoCosecha() { return aptoCosecha; }
    public void setAptoCosecha(String aptoCosecha) { this.aptoCosecha = aptoCosecha; }
}
