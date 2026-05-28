package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.UsuarioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.UsuarioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {
 
    private final UsuarioService usuarioService;
 
    // GET /usuarios
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }
 
    // GET /usuarios/activos
    @GetMapping("/activos")
    public ResponseEntity<List<UsuarioResponseDTO>> listarActivos() {
        return ResponseEntity.ok(usuarioService.listarActivos());
    }
 
    // GET /usuarios/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }
 
    // POST /usuarios
    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> crear(
            @Valid @RequestBody UsuarioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(usuarioService.crear(dto));
    }
 
    // PUT /usuarios/{id}
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody UsuarioRequestDTO dto) {
        return ResponseEntity.ok(usuarioService.actualizar(id, dto));
    }
 
    // PATCH /usuarios/{id}/desactivar
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        usuarioService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
