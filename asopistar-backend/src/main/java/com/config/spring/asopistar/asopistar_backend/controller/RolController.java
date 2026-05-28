package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.RolRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.RolResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.RolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RolController {
 
    private final RolService rolService;
 
    // GET /roles
    @GetMapping
    public ResponseEntity<List<RolResponseDTO>> listarTodos() {
        return ResponseEntity.ok(rolService.listarTodos());
    }
 
    // GET /roles/{id}
    @GetMapping("/{id}")
    public ResponseEntity<RolResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(rolService.buscarPorId(id));
    }
 
    // POST /roles
    @PostMapping
    public ResponseEntity<RolResponseDTO> crear(
            @Valid @RequestBody RolRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(rolService.crear(dto));
    }
 
    // PUT /roles/{id}
    @PutMapping("/{id}")
    public ResponseEntity<RolResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody RolRequestDTO dto) {
        return ResponseEntity.ok(rolService.actualizar(id, dto));
    }
 
    // DELETE /roles/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        rolService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
