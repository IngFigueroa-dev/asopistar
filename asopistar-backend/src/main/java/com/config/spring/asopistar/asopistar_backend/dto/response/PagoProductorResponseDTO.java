package com.config.spring.asopistar.asopistar_backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PagoProductorResponseDTO {

    private Integer idPago;
    private LocalDateTime fechaPago;
    private BigDecimal monto;
    private BigDecimal precioKg;
    private BigDecimal kilosPagados;
    private String estado;

    // Datos del productor (desnormalizados para el frontend)
    private Integer idProductor;
    private String nombreProductor;       // nombre1 + apellido1
    private String documentoProductor;

    // Datos de la recepción
    private Integer idRecepcion;
    private LocalDateTime fechaRecepcion;
    private BigDecimal kilosRecibidos;

    // Método de pago
    private Integer idMetodoPago;
    private String nombreMetodoPago;

    // Getters y Setters
    public Integer getIdPago() { return idPago; }
    public void setIdPago(Integer idPago) { this.idPago = idPago; }

    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public BigDecimal getPrecioKg() { return precioKg; }
    public void setPrecioKg(BigDecimal precioKg) { this.precioKg = precioKg; }

    public BigDecimal getKilosPagados() { return kilosPagados; }
    public void setKilosPagados(BigDecimal kilosPagados) { this.kilosPagados = kilosPagados; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Integer getIdProductor() { return idProductor; }
    public void setIdProductor(Integer idProductor) { this.idProductor = idProductor; }

    public String getNombreProductor() { return nombreProductor; }
    public void setNombreProductor(String nombreProductor) { this.nombreProductor = nombreProductor; }

    public String getDocumentoProductor() { return documentoProductor; }
    public void setDocumentoProductor(String documentoProductor) { this.documentoProductor = documentoProductor; }

    public Integer getIdRecepcion() { return idRecepcion; }
    public void setIdRecepcion(Integer idRecepcion) { this.idRecepcion = idRecepcion; }

    public LocalDateTime getFechaRecepcion() { return fechaRecepcion; }
    public void setFechaRecepcion(LocalDateTime fechaRecepcion) { this.fechaRecepcion = fechaRecepcion; }

    public BigDecimal getKilosRecibidos() { return kilosRecibidos; }
    public void setKilosRecibidos(BigDecimal kilosRecibidos) { this.kilosRecibidos = kilosRecibidos; }

    public Integer getIdMetodoPago() { return idMetodoPago; }
    public void setIdMetodoPago(Integer idMetodoPago) { this.idMetodoPago = idMetodoPago; }

    public String getNombreMetodoPago() { return nombreMetodoPago; }
    public void setNombreMetodoPago(String nombreMetodoPago) { this.nombreMetodoPago = nombreMetodoPago; }
}
