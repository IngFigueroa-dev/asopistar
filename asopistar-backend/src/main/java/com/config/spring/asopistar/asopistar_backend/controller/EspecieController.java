package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.EspecieRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EspecieResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.EspecieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/especies")
@RequiredArgsConstructor
public class EspecieController {
 
    private final EspecieService especieService;
 
    @GetMapping
    public ResponseEntity<List<EspecieResponseDTO>> listarTodos() {
        return ResponseEntity.ok(especieService.listarTodos());
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<EspecieResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(especieService.buscarPorId(id));
    }
 
    @PostMapping
    public ResponseEntity<EspecieResponseDTO> crear(
            @Valid @RequestBody EspecieRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(especieService.crear(dto));
    }
 
    @PutMapping("/{id}")
    public ResponseEntity<EspecieResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody EspecieRequestDTO dto) {
        return ResponseEntity.ok(especieService.actualizar(id, dto));
    }
 
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        especieService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
