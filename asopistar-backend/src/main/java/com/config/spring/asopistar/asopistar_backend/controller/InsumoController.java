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
 
    // GET /insumos
    @GetMapping
    public ResponseEntity<List<InsumoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(insumoService.listarTodos());
    }
 
    // GET /insumos/bajo-stock
    @GetMapping("/bajo-stock")
    public ResponseEntity<List<InsumoResponseDTO>> listarConBajoStock() {
        return ResponseEntity.ok(insumoService.listarConBajoStock());
    }
 
    // GET /insumos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<InsumoResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(insumoService.buscarPorId(id));
    }
 
    // POST /insumos
    @PostMapping
    public ResponseEntity<InsumoResponseDTO> crear(
            @Valid @RequestBody InsumoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(insumoService.crear(dto));
    }
 
    // PUT /insumos/{id}
    @PutMapping("/{id}")
    public ResponseEntity<InsumoResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody InsumoRequestDTO dto) {
        return ResponseEntity.ok(insumoService.actualizar(id, dto));
    }
}
