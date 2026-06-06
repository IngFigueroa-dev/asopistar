package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;

import java.math.BigDecimal;

/**
 * KPIs del módulo de producción para el Dashboard.
 * Consumido por: ADMINISTRADOR_GENERAL, GERENTE_PLANTA, BIOLOGO, SECRETARIA.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardProduccionDTO {

    // ── Siembras ──────────────────────────────────────────────────────────────

    /** Siembras con estado EN_CURSO actualmente. */
    private Long siembrasActivas;

    /** Total histórico de siembras registradas. */
    private Long totalSiembras;

    /** Siembras EN_CURSO con al menos un seguimiento apto_cosecha = 'Y'. */
    private Long siembrasListasParaCosechar;

    /** Total de alevinos sembrados en siembras activas. */
    private Long alevinosTotalesActivos;

    // ── Seguimientos ──────────────────────────────────────────────────────────

    /** Siembras activas que NO tienen ningún seguimiento registrado. */
    private Long siembrasSinSeguimiento;

    /** Peso promedio (kg) del último seguimiento registrado en el sistema. */
    private BigDecimal pesoPromedioUltimoSeguimiento;

    // ── Turnos de pesca ───────────────────────────────────────────────────────

    /** Turnos con estado PENDIENTE o CONFIRMADO. */
    private Long turnosPendientes;

    /** Turnos con tipo_prioridad = EMERGENCIA y estado PENDIENTE o CONFIRMADO. */
    private Long turnosEmergencia;

    /** Total histórico de turnos realizados. */
    private Long turnosRealizados;

    // ── Productores ───────────────────────────────────────────────────────────

    /** Productores con activo = true. */
    private Long productoresActivos;

    /** Estanques con estado_estanque = ACTIVO. */
    private Long estanquesActivos;
}
