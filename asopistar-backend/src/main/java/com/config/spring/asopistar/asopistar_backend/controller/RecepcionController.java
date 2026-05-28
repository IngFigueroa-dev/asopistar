package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.RecepcionRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.RecepcionResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.RecepcionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/recepciones")
@RequiredArgsConstructor
public class RecepcionController {
 
    private final RecepcionService recepcionService;
 
    // GET /recepciones
    @GetMapping
    public ResponseEntity<List<RecepcionResponseDTO>> listarTodos() {
        return ResponseEntity.ok(recepcionService.listarTodos());
    }
 
    // GET /recepciones/productor/{idProductor}
    @GetMapping("/productor/{idProductor}")
    public ResponseEntity<List<RecepcionResponseDTO>> listarPorProductor(
            @PathVariable Integer idProductor) {
        return ResponseEntity.ok(
            recepcionService.listarPorProductor(idProductor));
    }
 
    // GET /recepciones/{id}
    @GetMapping("/{id}")
    public ResponseEntity<RecepcionResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(recepcionService.buscarPorId(id));
    }
 
    // POST /recepciones
    @PostMapping
    public ResponseEntity<RecepcionResponseDTO> crear(
            @Valid @RequestBody RecepcionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(recepcionService.crear(dto));
    }
}
