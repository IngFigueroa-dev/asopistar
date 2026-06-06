package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;

import java.math.BigDecimal;

/**
 * KPIs del módulo de planta (recepciones + cuarto frío) para el Dashboard.
 * Consumido por: ADMINISTRADOR_GENERAL, GERENTE_PLANTA, PERSONAL_CUARTO_FRIO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardPlantaDTO {

    // ── Recepciones ───────────────────────────────────────────────────────────

    /** Total de recepciones registradas en el mes en curso. */
    private Long recepcionesMes;

    /** Total histórico de recepciones. */
    private Long recepcionesTotal;

    /** Suma de kilos recibidos en el mes en curso. */
    private BigDecimal kilosRecibidosMes;

    /** Suma total histórica de kilos recibidos. */
    private BigDecimal kilosRecibidosTotal;

    // ── Cuarto frío ───────────────────────────────────────────────────────────

    /** Lotes con estado = true (disponibles, no despachados). */
    private Long lotesDisponibles;

    /** Lotes con estado = false (ya despachados). */
    private Long lotesDespachados;

    /** Suma de kilos en lotes disponibles actualmente. */
    private BigDecimal kilosEnFrio;

    // ── Procesamiento ─────────────────────────────────────────────────────────

    /** Lotes con estadoDecision = PENDIENTE_DECISION. */
    private Long lotesPendientesDecision;
}
