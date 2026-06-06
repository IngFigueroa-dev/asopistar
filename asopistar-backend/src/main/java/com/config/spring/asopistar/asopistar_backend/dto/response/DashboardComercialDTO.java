package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;

import java.math.BigDecimal;

/**
 * KPIs del módulo comercial (envíos, clientes, puntos de venta) para el Dashboard.
 * Consumido por: ADMINISTRADOR_GENERAL, GERENTE_COMERCIAL, SECRETARIA.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardComercialDTO {

    // ── Envíos ────────────────────────────────────────────────────────────────

    /** Envíos con estado = PREPARADO. */
    private Long enviosPreparados;

    /** Envíos con estado = EN_CAMINO. */
    private Long enviosEnCamino;

    /** Envíos con estado = ENTREGADO en el mes en curso. */
    private Long enviosEntregadosMes;

    /** Total histórico de envíos. */
    private Long enviosTotal;

    /** Suma de kilos despachados en el mes en curso (desde detalle_envio). */
    private BigDecimal kilosDespachadosMes;

    // ── Clientes ──────────────────────────────────────────────────────────────

    /** Total de clientes registrados. */
    private Long clientesTotal;

    // ── Puntos de venta ───────────────────────────────────────────────────────

    /** Puntos de venta con activo = true. */
    private Long puntosVentaActivos;
}
