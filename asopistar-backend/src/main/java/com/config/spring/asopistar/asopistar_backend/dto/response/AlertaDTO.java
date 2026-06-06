package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;

/**
 * Representa una alerta operativa individual dentro del panel de alertas del Dashboard.
 * Las alertas son generadas en DashboardServiceImpl a partir de condiciones de negocio
 * detectadas en la base de datos.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertaDTO {

    /**
     * Nivel de prioridad de la alerta.
     * Valores posibles: ALTA | MEDIA | BAJA
     */
    private String prioridad;

    /**
     * Módulo de negocio que origina la alerta.
     * Valores posibles: PRODUCCION | PLANTA | COMERCIAL | FINANZAS | INSUMOS
     */
    private String modulo;

    /** Texto corto que se muestra como título de la alerta en el frontend. */
    private String titulo;

    /** Descripción detallada con cifras concretas. */
    private String descripcion;
}
