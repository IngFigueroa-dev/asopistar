package com.config.spring.asopistar.asopistar_backend.dto.response;

import java.time.LocalDateTime;

public class ReporteEnvioResponseDTO {

    private Integer idEnvio;
    private LocalDateTime fechaEnvio;
    private String destinoCiudad;
    private String tipoDestino;
    private String estado;
    private String observaciones;
    private String nombreCliente;
    private String nombrePuntoVenta;
    private String destinoNombre;

    public ReporteEnvioResponseDTO() {}

    public ReporteEnvioResponseDTO(Integer idEnvio, LocalDateTime fechaEnvio,
                           String destinoCiudad, String tipoDestino, String estado,
                           String observaciones, String nombreCliente, String nombrePuntoVenta) {
        this.idEnvio = idEnvio;
        this.fechaEnvio = fechaEnvio;
        this.destinoCiudad = destinoCiudad;
        this.tipoDestino = tipoDestino;
        this.estado = estado;
        this.observaciones = observaciones;
        this.nombreCliente = nombreCliente;
        this.nombrePuntoVenta = nombrePuntoVenta;
        this.destinoNombre = (nombreCliente != null) ? nombreCliente : nombrePuntoVenta;
    }

    public Integer getIdEnvio() { return idEnvio; }
    public void setIdEnvio(Integer idEnvio) { this.idEnvio = idEnvio; }

    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }

    public String getDestinoCiudad() { return destinoCiudad; }
    public void setDestinoCiudad(String destinoCiudad) { this.destinoCiudad = destinoCiudad; }

    public String getTipoDestino() { return tipoDestino; }
    public void setTipoDestino(String tipoDestino) { this.tipoDestino = tipoDestino; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public String getNombrePuntoVenta() { return nombrePuntoVenta; }
    public void setNombrePuntoVenta(String nombrePuntoVenta) { this.nombrePuntoVenta = nombrePuntoVenta; }

    public String getDestinoNombre() { return destinoNombre; }
    public void setDestinoNombre(String destinoNombre) { this.destinoNombre = destinoNombre; }
}
