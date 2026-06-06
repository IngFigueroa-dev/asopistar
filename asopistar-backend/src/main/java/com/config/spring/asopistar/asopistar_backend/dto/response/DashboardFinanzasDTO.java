package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;

import java.math.BigDecimal;

/**
 * KPIs del módulo financiero (pagos e ingresos) para el Dashboard.
 * Consumido por: ADMINISTRADOR_GENERAL, CONTADORA.
 * El GERENTE_COMERCIAL recibe solo los campos de ingresos (ver DashboardComercialDTO).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardFinanzasDTO {

    // ── Pagos a productores ───────────────────────────────────────────────────

    /** Suma de montos de pagos con estado = PAGADO. */
    private BigDecimal totalPagado;

    /** Suma de montos de pagos con estado = PENDIENTE. */
    private BigDecimal totalPendiente;

    /** Cantidad de pagos con estado = PAGADO. */
    private Long cantidadPagados;

    /** Cantidad de pagos con estado = PENDIENTE. */
    private Long cantidadPendientes;

    /** Suma de pagos realizados en el mes en curso. */
    private BigDecimal pagadosMes;

    // ── Ingresos de ASOPISTAR ─────────────────────────────────────────────────

    /** Suma de valor_total de ingresos registrados en el mes en curso. */
    private BigDecimal ingresosMes;

    /** Suma histórica de valor_total de todos los ingresos. */
    private BigDecimal ingresosTotal;

    /** Suma de saldo_pendiente de ingresos con estado_pago != PAGADO y != ANULADO. */
    private BigDecimal carteraPendiente;

    /** Cantidad de ingresos con estado_pago = PENDIENTE o PARCIAL. */
    private Long ingresosConSaldo;

    /** Suma de ingresos del mes con tipo_ingreso = VENTA_PESCADO. */
    private BigDecimal ingresosPescadoMes;

    /** Suma de ingresos del mes con tipo_ingreso = VENTA_ALEVINOS o VENTA_CONCENTRADO. */
    private BigDecimal ingresosInsumosMes;
}
