package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.PagoProductorRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoEstadisticasResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoProductorResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.PagoProductorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pagos-productor")
public class PagoProductorController {

    private final PagoProductorService service;

    public PagoProductorController(PagoProductorService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_CONTADORA')")
    public ResponseEntity<List<PagoProductorResponseDTO>> listarPagos(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Integer idProductor) {
        return ResponseEntity.ok(service.listarPagos(estado, idProductor));
    }

    @GetMapping("/pendientes")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_CONTADORA')")
    public ResponseEntity<List<PagoProductorResponseDTO>> listarPendientes() {
        return ResponseEntity.ok(service.listarPendientes());
    }

    @GetMapping("/estadisticas")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_CONTADORA')")
    public ResponseEntity<PagoEstadisticasResponseDTO> obtenerEstadisticas() {
        return ResponseEntity.ok(service.obtenerEstadisticas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_CONTADORA')")
    public ResponseEntity<PagoProductorResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_CONTADORA')")
    public ResponseEntity<PagoProductorResponseDTO> registrarPago(
            @Valid @RequestBody PagoProductorRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrarPago(request));
    }

    @PatchMapping("/{id}/marcar-pagado")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL', 'ROLE_CONTADORA')")
    public ResponseEntity<PagoProductorResponseDTO> marcarComoPagado(@PathVariable Integer id) {
        return ResponseEntity.ok(service.marcarComoPagado(id));
    }
}
