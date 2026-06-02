package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioEntregaRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioTransporteRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EnvioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.EnvioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/envios")
@RequiredArgsConstructor
public class EnvioController {

    private final EnvioService envioService;

    // ── Endpoints originales (sin cambios de ruta ni comportamiento) ──────────

    // GET /api/envios
    @GetMapping
    public ResponseEntity<List<EnvioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(envioService.listarTodos());
    }

    // GET /api/envios/{id}
    @GetMapping("/{id}")
    public ResponseEntity<EnvioResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(envioService.buscarPorId(id));
    }

    // POST /api/envios
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_GERENTE_COMERCIAL', 'ROLE_SECRETARIA')")
    public ResponseEntity<EnvioResponseDTO> crear(
            @Valid @RequestBody EnvioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(envioService.crear(dto));
    }

    // PATCH /api/envios/{id}/estado
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_GERENTE_COMERCIAL', 'ROLE_SECRETARIA')")
    public ResponseEntity<EnvioResponseDTO> cambiarEstado(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                envioService.cambiarEstado(id, body.get("estado")));
    }

    // ── Endpoints nuevos ──────────────────────────────────────────────────────

    // GET /api/envios/busqueda?q=xxx
    @GetMapping("/busqueda")
    public ResponseEntity<List<EnvioResponseDTO>> buscar(
            @RequestParam(defaultValue = "") String q) {
        return ResponseEntity.ok(envioService.buscar(q));
    }

    // GET /api/envios/guia/{codigoGuia}
    @GetMapping("/guia/{codigoGuia}")
    public ResponseEntity<EnvioResponseDTO> buscarPorGuia(
            @PathVariable String codigoGuia) {
        return ResponseEntity.ok(envioService.buscarPorGuia(codigoGuia));
    }

    // PATCH /api/envios/{id}/transporte
    @PatchMapping("/{id}/transporte")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_GERENTE_COMERCIAL', 'ROLE_SECRETARIA')")
    public ResponseEntity<EnvioResponseDTO> actualizarTransporte(
            @PathVariable Integer id,
            @RequestBody EnvioTransporteRequestDTO request) {
        return ResponseEntity.ok(envioService.actualizarTransporte(id, request));
    }

    // PATCH /api/envios/{id}/entrega
    @PatchMapping("/{id}/entrega")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_GERENTE_COMERCIAL', 'ROLE_SECRETARIA')")
    public ResponseEntity<EnvioResponseDTO> registrarEntrega(
            @PathVariable Integer id,
            @RequestBody EnvioEntregaRequestDTO request) {
        return ResponseEntity.ok(envioService.registrarEntrega(id, request));
    }

    // GET /api/envios/historial/cliente/{idCliente}
    @GetMapping("/historial/cliente/{idCliente}")
    public ResponseEntity<List<EnvioResponseDTO>> historialCliente(
            @PathVariable Integer idCliente) {
        return ResponseEntity.ok(envioService.historialCliente(idCliente));
    }

    // GET /api/envios/historial/punto-venta/{idPunto}
    @GetMapping("/historial/punto-venta/{idPunto}")
    public ResponseEntity<List<EnvioResponseDTO>> historialPuntoVenta(
            @PathVariable Integer idPunto) {
        return ResponseEntity.ok(envioService.historialPuntoVenta(idPunto));
    }
}
