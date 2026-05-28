package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.ProductorRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ProductorResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EstanqueResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.ProductorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/productores")
@RequiredArgsConstructor
public class ProductorController {
 
    private final ProductorService productorService;
 
    // GET /productores
    @GetMapping
    public ResponseEntity<List<ProductorResponseDTO>> listarTodos() {
        return ResponseEntity.ok(productorService.listarTodos());
    }
 
    // GET /productores/activos
    @GetMapping("/activos")
    public ResponseEntity<List<ProductorResponseDTO>> listarActivos() {
        return ResponseEntity.ok(productorService.listarActivos());
    }
 
    // GET /productores/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProductorResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(productorService.buscarPorId(id));
    }
 
    // GET /productores/{id}/estanques
    @GetMapping("/{id}/estanques")
    public ResponseEntity<List<EstanqueResponseDTO>> obtenerEstanques(
            @PathVariable Integer id) {
        return ResponseEntity.ok(productorService.obtenerEstanques(id));
    }
 
    // POST /productores
    @PostMapping
    public ResponseEntity<ProductorResponseDTO> crear(
            @Valid @RequestBody ProductorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(productorService.crear(dto));
    }
 
    // PUT /productores/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ProductorResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ProductorRequestDTO dto) {
        return ResponseEntity.ok(productorService.actualizar(id, dto));
    }
 
    // PATCH /productores/{id}/desactivar
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        productorService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
