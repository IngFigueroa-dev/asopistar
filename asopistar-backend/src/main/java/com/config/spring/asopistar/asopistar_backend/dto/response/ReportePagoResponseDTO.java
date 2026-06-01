package com.config.spring.asopistar.asopistar_backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReportePagoResponseDTO {

    private Integer idPago;
    private LocalDateTime fechaPago;
    private String nombreProductor;
    private String documentoProductor;
    private BigDecimal monto;
    private BigDecimal precioKg;
    private BigDecimal kilosPagados;
    private String estado;
    private String metodoPago;

    public ReportePagoResponseDTO() {}

    public ReportePagoResponseDTO(Integer idPago, LocalDateTime fechaPago,
        String nombreProductor, String documentoProductor,
        BigDecimal monto, BigDecimal precioKg,
        BigDecimal kilosPagados, String estado, String metodoPago) {
        this.idPago = idPago;
        this.fechaPago = fechaPago;
        this.nombreProductor = nombreProductor;
        this.documentoProductor = documentoProductor;
        this.monto = monto;
        this.precioKg = precioKg;
        this.kilosPagados = kilosPagados;
        this.estado = estado;
        this.metodoPago = metodoPago;
    }

    public Integer getIdPago() { return idPago; }
    public void setIdPago(Integer idPago) { this.idPago = idPago; }

    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }

    public String getNombreProductor() { return nombreProductor; }
    public void setNombreProductor(String nombreProductor) { this.nombreProductor = nombreProductor; }

    public String getDocumentoProductor() { return documentoProductor; }
    public void setDocumentoProductor(String documentoProductor) { this.documentoProductor = documentoProductor; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public BigDecimal getPrecioKg() { return precioKg; }
    public void setPrecioKg(BigDecimal precioKg) { this.precioKg = precioKg; }

    public BigDecimal getKilosPagados() { return kilosPagados; }
    public void setKilosPagados(BigDecimal kilosPagados) { this.kilosPagados = kilosPagados; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
}
