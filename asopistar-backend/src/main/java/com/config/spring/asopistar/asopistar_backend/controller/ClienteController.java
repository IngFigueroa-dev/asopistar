package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.ClienteRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ClienteResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    // ── GET /clientes  (todos) ──────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_COMERCIAL','ROLE_CONTADORA','ROLE_SECRETARIA')")
    public ResponseEntity<List<ClienteResponseDTO>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    // ── GET /clientes/activos  (para selects en otros módulos) ──
    @GetMapping("/activos")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_COMERCIAL','ROLE_GERENTE_PLANTA','ROLE_CONTADORA','ROLE_SECRETARIA')")
    public ResponseEntity<List<ClienteResponseDTO>> listarActivos() {
        return ResponseEntity.ok(clienteService.listarActivos());
    }

    // ── GET /clientes/{id} ──────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_COMERCIAL','ROLE_CONTADORA','ROLE_SECRETARIA')")
    public ResponseEntity<ClienteResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(clienteService.obtenerPorId(id));
    }

    // ── POST /clientes ──────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_COMERCIAL','ROLE_SECRETARIA')")
    public ResponseEntity<ClienteResponseDTO> crear(@Valid @RequestBody ClienteRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.crear(dto));
    }

    // ── PUT /clientes/{id} ──────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_COMERCIAL','ROLE_SECRETARIA')")
    public ResponseEntity<ClienteResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ClienteRequestDTO dto) {
        return ResponseEntity.ok(clienteService.actualizar(id, dto));
    }

    // ── PATCH /clientes/{id}/estado ─────────────────────────────
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_COMERCIAL')")
    public ResponseEntity<ClienteResponseDTO> cambiarEstado(
            @PathVariable Integer id,
            @RequestParam String estado) {
        return ResponseEntity.ok(clienteService.cambiarEstado(id, estado));
    }

    // ── PATCH /clientes/{id}/clasificacion ──────────────────────
    @PatchMapping("/{id}/clasificacion")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_COMERCIAL')")
    public ResponseEntity<ClienteResponseDTO> cambiarClasificacion(
            @PathVariable Integer id,
            @RequestParam String clasificacion) {
        return ResponseEntity.ok(clienteService.cambiarClasificacion(id, clasificacion));
    }

    // ── GET /clientes/busqueda?q=... ────────────────────────────
    @GetMapping("/busqueda")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_COMERCIAL','ROLE_CONTADORA','ROLE_SECRETARIA')")
    public ResponseEntity<List<ClienteResponseDTO>> busquedaRapida(
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(clienteService.busquedaRapida(q));
    }

    // ── GET /clientes/filtrar ────────────────────────────────────
    @GetMapping("/filtrar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_COMERCIAL','ROLE_CONTADORA','ROLE_SECRETARIA')")
    public ResponseEntity<List<ClienteResponseDTO>> filtrar(
            @RequestParam(required = false) String razonSocial,
            @RequestParam(required = false) String nit,
            @RequestParam(required = false) String ciudad,
            @RequestParam(required = false) String tipoCliente,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String clasificacion) {
        return ResponseEntity.ok(
                clienteService.filtrar(razonSocial, nit, ciudad, tipoCliente, estado, clasificacion));
    }

    // ── GET /clientes/resumen ────────────────────────────────────
    @GetMapping("/resumen")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_COMERCIAL','ROLE_CONTADORA','ROLE_SECRETARIA')")
    public ResponseEntity<Map<String, Object>> resumen() {
        return ResponseEntity.ok(clienteService.resumenEstadistico());
    }
}
