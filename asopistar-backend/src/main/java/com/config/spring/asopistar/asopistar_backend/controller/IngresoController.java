package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.IngresoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.PagoIngresoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.IngresoEstadisticasDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.IngresoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoIngresoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.IngresoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controlador REST del módulo de Ingresos.
 *
 * Los permisos por rol ya están declarados en SecurityConfig:
 *   /ingresos/** → ROLE_ADMINISTRADOR_GENERAL, ROLE_CONTADORA, ROLE_GERENTE_COMERCIAL
 *
 * No se requiere modificar SecurityConfig.
 */
@RestController
@RequestMapping("/ingresos")
public class IngresoController {

    private final IngresoService service;

    public IngresoController(IngresoService service) {
        this.service = service;
    }

    // ── GET /ingresos ─────────────────────────────────────────────────────────
    // Soporta filtros opcionales: ?estado=PENDIENTE&tipo=VENTA_PESCADO&idCliente=3&desde=...&hasta=...

    @GetMapping
    public ResponseEntity<List<IngresoResponseDTO>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Integer idCliente,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {

        if (estado == null && tipo == null && idCliente == null && desde == null && hasta == null) {
            return ResponseEntity.ok(service.listarTodos());
        }
        return ResponseEntity.ok(service.filtrar(estado, tipo, idCliente, desde, hasta));
    }

    // ── GET /ingresos/estadisticas ────────────────────────────────────────────

    @GetMapping("/estadisticas")
    public ResponseEntity<IngresoEstadisticasDTO> estadisticas() {
        return ResponseEntity.ok(service.estadisticas());
    }

    // ── GET /ingresos/{id} ────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<IngresoResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    // ── POST /ingresos ────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<IngresoResponseDTO> crear(
            @Valid @RequestBody IngresoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    // ── PATCH /ingresos/{id}/anular ───────────────────────────────────────────

    @PatchMapping("/{id}/anular")
    public ResponseEntity<IngresoResponseDTO> anular(@PathVariable Integer id) {
        return ResponseEntity.ok(service.anular(id));
    }

    // ── POST /ingresos/{id}/pagos ─────────────────────────────────────────────
    // Registrar un abono; pasa el email del usuario autenticado al servicio.

    @PostMapping("/{id}/pagos")
    public ResponseEntity<PagoIngresoResponseDTO> registrarAbono(
            @PathVariable Integer id,
            @Valid @RequestBody PagoIngresoRequestDTO request,
            Authentication auth) {
        String email = auth != null ? auth.getName() : "sistema";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.registrarAbono(id, request, email));
    }

    // ── GET /ingresos/{id}/pagos ──────────────────────────────────────────────

    @GetMapping("/{id}/pagos")
    public ResponseEntity<List<PagoIngresoResponseDTO>> listarPagos(@PathVariable Integer id) {
        return ResponseEntity.ok(service.listarPagos(id));
    }
}
