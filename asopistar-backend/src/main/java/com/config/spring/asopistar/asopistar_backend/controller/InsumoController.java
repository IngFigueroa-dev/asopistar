package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.InsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.InsumoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.InsumoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/insumos")
@RequiredArgsConstructor
public class InsumoController {

    private final InsumoService insumoService;

    @GetMapping
    public ResponseEntity<List<InsumoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(insumoService.listarTodos());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<InsumoResponseDTO>> listarActivos() {
        return ResponseEntity.ok(insumoService.listarActivos());
    }

    @GetMapping("/bajo-stock")
    public ResponseEntity<List<InsumoResponseDTO>> listarConBajoStock() {
        return ResponseEntity.ok(insumoService.listarConBajoStock());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsumoResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(insumoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<InsumoResponseDTO> crear(
            @Valid @RequestBody InsumoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(insumoService.crear(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsumoResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody InsumoRequestDTO dto) {
        return ResponseEntity.ok(insumoService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<InsumoResponseDTO> desactivar(@PathVariable Integer id) {
        return ResponseEntity.ok(insumoService.desactivar(id));
    }
}
