package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.response.*;

import java.time.LocalDate;
import java.util.List;

public interface ReporteService {

    List<ReporteRecepcionResponseDTO> getReporteRecepciones(LocalDate fechaInicio, LocalDate fechaFin,
    String nombreProductor);

    List<ReporteProduccionResponseDTO> getReporteProduccion(LocalDate fechaInicio, LocalDate fechaFin,
    String estado, String nombreEspecie);

    List<ReporteLoteResponseDTO> getReporteLotes(LocalDate fechaInicio, LocalDate fechaFin,
    String estado);

    List<ReporteEnvioResponseDTO> getReporteEnvios(LocalDate fechaInicio, LocalDate fechaFin,
    String estado, String tipoDestino);

    List<ReportePagoResponseDTO> getReportePagos(LocalDate fechaInicio, LocalDate fechaFin,
    String estado, String nombreProductor);

    List<ReporteTurnoResponseDTO> getReporteTurnos(LocalDate fechaInicio, LocalDate fechaFin,
    String estado, String tipoPrioridad);
}
