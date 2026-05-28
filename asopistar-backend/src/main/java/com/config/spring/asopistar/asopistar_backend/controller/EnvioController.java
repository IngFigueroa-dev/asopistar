package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EnvioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.EnvioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/envios")
@RequiredArgsConstructor
public class EnvioController {
 
    private final EnvioService envioService;
 
    // GET /envios
    @GetMapping
    public ResponseEntity<List<EnvioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(envioService.listarTodos());
    }
 
    // GET /envios/en-camino
    @GetMapping("/en-camino")
    public ResponseEntity<List<EnvioResponseDTO>> listarEnCamino() {
        return ResponseEntity.ok(envioService.listarEnCamino());
    }
 
    // GET /envios/{id}
    @GetMapping("/{id}")
    public ResponseEntity<EnvioResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(envioService.buscarPorId(id));
    }
 
    // POST /envios
    @PostMapping
    public ResponseEntity<EnvioResponseDTO> crear(
            @Valid @RequestBody EnvioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(envioService.crear(dto));
    }
 
    // PATCH /envios/{id}/estado?nuevoEstado=ENTREGADO
    @PatchMapping("/{id}/estado")
    public ResponseEntity<EnvioResponseDTO> cambiarEstado(
            @PathVariable Integer id,
            @RequestParam String nuevoEstado) {
        return ResponseEntity.ok(
            envioService.cambiarEstado(id, nuevoEstado));
    }
}
