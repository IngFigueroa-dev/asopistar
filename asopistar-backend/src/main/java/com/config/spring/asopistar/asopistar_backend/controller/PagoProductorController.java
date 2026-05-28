package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.PagoProductorRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoProductorResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.PagoProductorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/pagos-productor")
@RequiredArgsConstructor
public class PagoProductorController {
 
    private final PagoProductorService pagoProductorService;
 
    // GET /pagos-productor
    @GetMapping
    public ResponseEntity<List<PagoProductorResponseDTO>> listarTodos() {
        return ResponseEntity.ok(pagoProductorService.listarTodos());
    }
 
    // GET /pagos-productor/pendientes
    @GetMapping("/pendientes")
    public ResponseEntity<List<PagoProductorResponseDTO>> listarPendientes() {
        return ResponseEntity.ok(pagoProductorService.listarPendientes());
    }
 
    // GET /pagos-productor/productor/{idProductor}
    @GetMapping("/productor/{idProductor}")
    public ResponseEntity<List<PagoProductorResponseDTO>> listarPorProductor(
            @PathVariable Integer idProductor) {
        return ResponseEntity.ok(
            pagoProductorService.listarPorProductor(idProductor));
    }
 
    // GET /pagos-productor/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PagoProductorResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(pagoProductorService.buscarPorId(id));
    }
 
    // POST /pagos-productor
    @PostMapping
    public ResponseEntity<PagoProductorResponseDTO> crear(
            @Valid @RequestBody PagoProductorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(pagoProductorService.crear(dto));
    }
 
    // PATCH /pagos-productor/{id}/marcar-pagado
    @PatchMapping("/{id}/marcar-pagado")
    public ResponseEntity<PagoProductorResponseDTO> marcarComoPagado(
            @PathVariable Integer id) {
        return ResponseEntity.ok(
            pagoProductorService.marcarComoPagado(id));
    }
}
