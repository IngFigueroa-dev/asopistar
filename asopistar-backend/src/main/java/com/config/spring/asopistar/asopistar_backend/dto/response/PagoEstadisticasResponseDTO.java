package com.config.spring.asopistar.asopistar_backend.dto.response;

import java.math.BigDecimal;

/**
 * DTO con estadísticas agregadas para el dashboard de pagos.
 * Devuelto por GET /pagos-productor/estadisticas
 */
public class PagoEstadisticasResponseDTO {

    private BigDecimal totalPagado;
    private BigDecimal totalPendiente;
    private Long cantidadPagados;
    private Long cantidadPendientes;
    private BigDecimal promedioMontoPago;

    public PagoEstadisticasResponseDTO() {}

    public PagoEstadisticasResponseDTO(BigDecimal totalPagado, BigDecimal totalPendiente,
                                        Long cantidadPagados, Long cantidadPendientes,
                                        BigDecimal promedioMontoPago) {
        this.totalPagado = totalPagado;
        this.totalPendiente = totalPendiente;
        this.cantidadPagados = cantidadPagados;
        this.cantidadPendientes = cantidadPendientes;
        this.promedioMontoPago = promedioMontoPago;
    }

    public BigDecimal getTotalPagado() { return totalPagado; }
    public void setTotalPagado(BigDecimal totalPagado) { this.totalPagado = totalPagado; }

    public BigDecimal getTotalPendiente() { return totalPendiente; }
    public void setTotalPendiente(BigDecimal totalPendiente) { this.totalPendiente = totalPendiente; }

    public Long getCantidadPagados() { return cantidadPagados; }
    public void setCantidadPagados(Long cantidadPagados) { this.cantidadPagados = cantidadPagados; }

    public Long getCantidadPendientes() { return cantidadPendientes; }
    public void setCantidadPendientes(Long cantidadPendientes) { this.cantidadPendientes = cantidadPendientes; }

    public BigDecimal getPromedioMontoPago() { return promedioMontoPago; }
    public void setPromedioMontoPago(BigDecimal promedioMontoPago) { this.promedioMontoPago = promedioMontoPago; }
}
