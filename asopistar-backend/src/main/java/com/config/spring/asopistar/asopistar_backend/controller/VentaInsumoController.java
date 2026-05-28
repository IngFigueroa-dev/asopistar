package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.VentaInsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.VentaInsumoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.VentaInsumoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/ventas-insumo")
@RequiredArgsConstructor
public class VentaInsumoController {
 
    private final VentaInsumoService ventaInsumoService;
 
    // GET /ventas-insumo
    @GetMapping
    public ResponseEntity<List<VentaInsumoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(ventaInsumoService.listarTodos());
    }
 
    // GET /ventas-insumo/pendientes-pago
    @GetMapping("/pendientes-pago")
    public ResponseEntity<List<VentaInsumoResponseDTO>> listarPendientesPago() {
        return ResponseEntity.ok(ventaInsumoService.listarPendientesPago());
    }
 
    // GET /ventas-insumo/productor/{idProductor}
    @GetMapping("/productor/{idProductor}")
    public ResponseEntity<List<VentaInsumoResponseDTO>> listarPorProductor(
            @PathVariable Integer idProductor) {
        return ResponseEntity.ok(
            ventaInsumoService.listarPorProductor(idProductor));
    }
 
    // GET /ventas-insumo/{id}
    @GetMapping("/{id}")
    public ResponseEntity<VentaInsumoResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ventaInsumoService.buscarPorId(id));
    }
 
    // POST /ventas-insumo
    @PostMapping
    public ResponseEntity<VentaInsumoResponseDTO> crear(
            @Valid @RequestBody VentaInsumoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ventaInsumoService.crear(dto));
    }
 
    // PATCH /ventas-insumo/{id}/estado-pago?estado=PAGADO
    @PatchMapping("/{id}/estado-pago")
    public ResponseEntity<VentaInsumoResponseDTO> actualizarEstadoPago(
            @PathVariable Integer id,
            @RequestParam String estado) {
        return ResponseEntity.ok(
            ventaInsumoService.actualizarEstadoPago(id, estado));
    }
}
