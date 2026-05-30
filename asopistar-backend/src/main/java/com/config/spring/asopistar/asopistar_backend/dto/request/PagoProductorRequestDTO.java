package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PagoProductorRequestDTO {

    @NotNull(message = "El ID del productor es obligatorio")
    private Integer idProductor;

    @NotNull(message = "El ID de la recepción es obligatorio")
    private Integer idRecepcion;

    @NotNull(message = "El ID del método de pago es obligatorio")
    private Integer idMetodoPago;

    @NotNull(message = "El precio por kilogramo es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio por kg debe ser mayor a 0")
    private BigDecimal precioKg;

    @NotNull(message = "Los kilos pagados son obligatorios")
    @DecimalMin(value = "0.01", message = "Los kilos pagados deben ser mayores a 0")
    private BigDecimal kilosPagados;

    private LocalDateTime fechaPago;

    // Getters y Setters
    public Integer getIdProductor() { return idProductor; }
    public void setIdProductor(Integer idProductor) { this.idProductor = idProductor; }

    public Integer getIdRecepcion() { return idRecepcion; }
    public void setIdRecepcion(Integer idRecepcion) { this.idRecepcion = idRecepcion; }

    public Integer getIdMetodoPago() { return idMetodoPago; }
    public void setIdMetodoPago(Integer idMetodoPago) { this.idMetodoPago = idMetodoPago; }

    public BigDecimal getPrecioKg() { return precioKg; }
    public void setPrecioKg(BigDecimal precioKg) { this.precioKg = precioKg; }

    public BigDecimal getKilosPagados() { return kilosPagados; }
    public void setKilosPagados(BigDecimal kilosPagados) { this.kilosPagados = kilosPagados; }

    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }
}
