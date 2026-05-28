package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.EstanqueRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EstanqueResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.EstanqueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/estanques")
@RequiredArgsConstructor
public class EstanqueController {
 
    private final EstanqueService estanqueService;
 
    // GET /estanques
    @GetMapping
    public ResponseEntity<List<EstanqueResponseDTO>> listarTodos() {
        return ResponseEntity.ok(estanqueService.listarTodos());
    }
 
    // GET /estanques/productor/{idProductor}
    @GetMapping("/productor/{idProductor}")
    public ResponseEntity<List<EstanqueResponseDTO>> listarPorProductor(
            @PathVariable Integer idProductor) {
        return ResponseEntity.ok(
            estanqueService.listarPorProductor(idProductor));
    }
 
    // GET /estanques/{id}
    @GetMapping("/{id}")
    public ResponseEntity<EstanqueResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(estanqueService.buscarPorId(id));
    }
 
    // POST /estanques
    @PostMapping
    public ResponseEntity<EstanqueResponseDTO> crear(
            @Valid @RequestBody EstanqueRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(estanqueService.crear(dto));
    }
 
    // PUT /estanques/{id}
    @PutMapping("/{id}")
    public ResponseEntity<EstanqueResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody EstanqueRequestDTO dto) {
        return ResponseEntity.ok(estanqueService.actualizar(id, dto));
    }
 
    // DELETE /estanques/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        estanqueService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
