package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.response.*;
import com.config.spring.asopistar.asopistar_backend.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reportes")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    // ─── GET /reportes/recepciones ────────────────────────────────────────────
    // Roles: ADMIN, GERENTE_PLANTA, CONTADORA
    @GetMapping("/recepciones")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_GERENTE_PLANTA','ROLE_CONTADORA')")
    public ResponseEntity<List<ReporteRecepcionResponseDTO>> getReporteRecepciones(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String nombreProductor) {

        List<ReporteRecepcionResponseDTO> result = reporteService.getReporteRecepciones(
                fechaInicio, fechaFin, nombreProductor);
        return ResponseEntity.ok(result);
    }

    // ─── GET /reportes/produccion ─────────────────────────────────────────────
    // Roles: ADMIN, BIOLOGO, GERENTE_PLANTA
    @GetMapping("/produccion")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_BIOLOGO','ROLE_GERENTE_PLANTA')")
    public ResponseEntity<List<ReporteProduccionResponseDTO>> getReporteProduccion(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String nombreEspecie) {

        List<ReporteProduccionResponseDTO> result = reporteService.getReporteProduccion(
                fechaInicio, fechaFin, estado, nombreEspecie);
        return ResponseEntity.ok(result);
    }

    // ─── GET /reportes/lotes ──────────────────────────────────────────────────
    // Roles: ADMIN, GERENTE_PLANTA, GERENTE_COMERCIAL
    @GetMapping("/lotes")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_GERENTE_PLANTA','ROLE_GERENTE_COMERCIAL')")
    public ResponseEntity<List<ReporteLoteResponseDTO>> getReporteLotes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado) {

        List<ReporteLoteResponseDTO> result = reporteService.getReporteLotes(fechaInicio, fechaFin, estado);
        return ResponseEntity.ok(result);
    }

    // ─── GET /reportes/envios ─────────────────────────────────────────────────
    // Roles: ADMIN, GERENTE_COMERCIAL
    @GetMapping("/envios")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_GERENTE_COMERCIAL')")
    public ResponseEntity<List<ReporteEnvioResponseDTO>> getReporteEnvios(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String tipoDestino) {

        List<ReporteEnvioResponseDTO> result = reporteService.getReporteEnvios(
                fechaInicio, fechaFin, estado, tipoDestino);
        return ResponseEntity.ok(result);
    }

    // ─── GET /reportes/pagos ──────────────────────────────────────────────────
    // Roles: ADMIN, CONTADORA
    @GetMapping("/pagos")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_CONTADORA')")
    public ResponseEntity<List<ReportePagoResponseDTO>> getReportePagos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String nombreProductor) {

        List<ReportePagoResponseDTO> result = reporteService.getReportePagos(
                fechaInicio, fechaFin, estado, nombreProductor);
        return ResponseEntity.ok(result);
    }

    // ─── GET /reportes/turnos ─────────────────────────────────────────────────
    // Roles: ADMIN, GERENTE_PLANTA
    @GetMapping("/turnos")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_GERENTE_PLANTA')")
    public ResponseEntity<List<ReporteTurnoResponseDTO>> getReporteTurnos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String tipoPrioridad) {

        List<ReporteTurnoResponseDTO> result = reporteService.getReporteTurnos(
                fechaInicio, fechaFin, estado, tipoPrioridad);
        return ResponseEntity.ok(result);
    }
}
