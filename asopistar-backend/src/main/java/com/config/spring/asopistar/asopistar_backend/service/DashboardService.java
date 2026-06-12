package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.response.AlertaDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardComercialDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardFinanzasDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardInsumosDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardPlantaDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardProduccionDTO;

import java.util.List;

public interface DashboardService {

    /** KPIs de producción: siembras, seguimientos, turnos, productores, estanques. */
    DashboardProduccionDTO obtenerProduccion();

    /** KPIs de planta: recepciones del mes, kilos recibidos, cuarto frío. */
    DashboardPlantaDTO obtenerPlanta();

    /** KPIs comerciales: envíos por estado, clientes, puntos de venta. */
    DashboardComercialDTO obtenerComercial();

    /** KPIs financieros: pagos a productores e ingresos de ASOPISTAR. */
    DashboardFinanzasDTO obtenerFinanzas();

    /**
     * Lista consolidada de alertas operativas.
     * Cada alerta tiene prioridad (ALTA, MEDIA, BAJA), módulo y descripción.
     * El servicio filtra solo las alertas que aplican según las condiciones actuales.
     */
    List<AlertaDTO> obtenerAlertas();

    /** KPIs de insumos: stock, ventas del mes, insumos bajo minimo. */
    DashboardInsumosDTO obtenerInsumos();
}
