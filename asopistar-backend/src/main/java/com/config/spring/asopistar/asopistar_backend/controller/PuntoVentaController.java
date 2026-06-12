package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.PuntoVentaEstadoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.PuntoVentaRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PuntoVentaResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.PuntoVentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de Puntos de Venta.
 * Base: /api/puntos-venta
 *
 * La seguridad de rutas está configurada en SecurityConfig.
 * Se usa @PreAuthorize adicional donde se necesita granularidad extra.
 */
@RestController
@RequestMapping("/puntos-venta")
@RequiredArgsConstructor
public class PuntoVentaController {

    private final PuntoVentaService service;

    // ── GET /puntos-venta ────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<PuntoVentaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    // ── GET /puntos-venta/activos ────────────────────────────────────────────
    @GetMapping("/activos")
    public ResponseEntity<List<PuntoVentaResponseDTO>> listarActivos() {
        return ResponseEntity.ok(service.listarActivos());
    }

    // ── GET /puntos-venta/{id} ───────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<PuntoVentaResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    // ── GET /puntos-venta/busqueda?q=xxx ────────────────────────────────────
    @GetMapping("/busqueda")
    public ResponseEntity<List<PuntoVentaResponseDTO>> buscar(
            @RequestParam(defaultValue = "") String q) {
        return ResponseEntity.ok(service.buscar(q));
    }

    // ── POST /puntos-venta ───────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_GERENTE_COMERCIAL', 'ROLE_SECRETARIA')")
    public ResponseEntity<PuntoVentaResponseDTO> crear(
            @Valid @RequestBody PuntoVentaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    // ── PUT /puntos-venta/{id} ───────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_GERENTE_COMERCIAL', 'ROLE_SECRETARIA')")
    public ResponseEntity<PuntoVentaResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody PuntoVentaRequestDTO request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    // ── PATCH /puntos-venta/{id}/estado ─────────────────────────────────────
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_GERENTE_COMERCIAL')")
    public ResponseEntity<PuntoVentaResponseDTO> cambiarEstado(
            @PathVariable Integer id,
            @Valid @RequestBody PuntoVentaEstadoRequestDTO request) {
        return ResponseEntity.ok(service.cambiarEstado(id, request));
    }
}
