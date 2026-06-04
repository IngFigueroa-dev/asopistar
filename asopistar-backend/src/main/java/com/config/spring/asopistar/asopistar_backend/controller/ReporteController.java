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

    // Roles reales del sistema (tal como los almacena la BD y construye Usuario.java)
    private static final String ADMIN             = "ROLE_ADMINISTRADOR_GENERAL";
    private static final String GERENTE_PLANTA    = "ROLE_GERENTE_PLANTA";
    private static final String GERENTE_COMERCIAL = "ROLE_GERENTE_COMERCIAL";
    private static final String CONTADORA         = "ROLE_CONTADORA";
    private static final String BIOLOGO           = "ROLE_BIOLOGO";
    private static final String SECRETARIA        = "ROLE_SECRETARIA";

    @Autowired
    private ReporteService reporteService;

    // ─── GET /reportes/recepciones ────────────────────────────────────────────
    @GetMapping("/recepciones")
    @PreAuthorize("hasAnyAuthority('" + ADMIN + "','" + GERENTE_PLANTA + "','" + CONTADORA + "','" + SECRETARIA + "')")
    public ResponseEntity<List<ReporteRecepcionResponseDTO>> getReporteRecepciones(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String nombreProductor) {

        return ResponseEntity.ok(
                reporteService.getReporteRecepciones(fechaInicio, fechaFin, nombreProductor));
    }

    // ─── GET /reportes/produccion ─────────────────────────────────────────────
    @GetMapping("/produccion")
    @PreAuthorize("hasAnyAuthority('" + ADMIN + "','" + BIOLOGO + "','" + GERENTE_PLANTA + "')")
    public ResponseEntity<List<ReporteProduccionResponseDTO>> getReporteProduccion(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String nombreEspecie) {

        return ResponseEntity.ok(
                reporteService.getReporteProduccion(fechaInicio, fechaFin, estado, nombreEspecie));
    }

    // ─── GET /reportes/lotes ──────────────────────────────────────────────────
    @GetMapping("/lotes")
    @PreAuthorize("hasAnyAuthority('" + ADMIN + "','" + GERENTE_PLANTA + "','" + GERENTE_COMERCIAL + "')")
    public ResponseEntity<List<ReporteLoteResponseDTO>> getReporteLotes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado) {

        return ResponseEntity.ok(
                reporteService.getReporteLotes(fechaInicio, fechaFin, estado));
    }

    // ─── GET /reportes/envios ─────────────────────────────────────────────────
    @GetMapping("/envios")
    @PreAuthorize("hasAnyAuthority('" + ADMIN + "','" + GERENTE_COMERCIAL + "','" + GERENTE_PLANTA + "','" + SECRETARIA + "')")
    public ResponseEntity<List<ReporteEnvioResponseDTO>> getReporteEnvios(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String tipoDestino) {

        return ResponseEntity.ok(
                reporteService.getReporteEnvios(fechaInicio, fechaFin, estado, tipoDestino));
    }

    // ─── GET /reportes/pagos ──────────────────────────────────────────────────
    @GetMapping("/pagos")
    @PreAuthorize("hasAnyAuthority('" + ADMIN + "','" + CONTADORA + "')")
    public ResponseEntity<List<ReportePagoResponseDTO>> getReportePagos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String nombreProductor) {

        return ResponseEntity.ok(
                reporteService.getReportePagos(fechaInicio, fechaFin, estado, nombreProductor));
    }

    // ─── GET /reportes/turnos ─────────────────────────────────────────────────
    @GetMapping("/turnos")
    @PreAuthorize("hasAnyAuthority('" + ADMIN + "','" + GERENTE_PLANTA + "')")
    public ResponseEntity<List<ReporteTurnoResponseDTO>> getReporteTurnos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String tipoPrioridad) {

        return ResponseEntity.ok(
                reporteService.getReporteTurnos(fechaInicio, fechaFin, estado, tipoPrioridad));
    }
}
