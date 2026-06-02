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

    @GetMapping
    public ResponseEntity<List<VentaInsumoResponseDTO>> listarTodas() {
        return ResponseEntity.ok(ventaInsumoService.listarTodas());
    }

    @GetMapping("/productor/{idProductor}")
    public ResponseEntity<List<VentaInsumoResponseDTO>> listarPorProductor(
            @PathVariable Integer idProductor) {
        return ResponseEntity.ok(ventaInsumoService.listarPorProductor(idProductor));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaInsumoResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(ventaInsumoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<VentaInsumoResponseDTO> registrar(
            @Valid @RequestBody VentaInsumoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ventaInsumoService.registrar(dto));
    }

    @PatchMapping("/{id}/marcar-pagado")
    public ResponseEntity<VentaInsumoResponseDTO> marcarPagado(@PathVariable Integer id) {
        return ResponseEntity.ok(ventaInsumoService.marcarPagado(id));
    }
}
