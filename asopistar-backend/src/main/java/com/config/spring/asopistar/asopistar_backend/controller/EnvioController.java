package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EnvioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.EnvioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/envios")
public class EnvioController {

    private final EnvioService envioService;

    public EnvioController(EnvioService envioService) {
        this.envioService = envioService;
    }

    // GET /api/envios
    @GetMapping
    public ResponseEntity<List<EnvioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(envioService.listarTodos());
    }

    // GET /api/envios/{id}
    @GetMapping("/{id}")
    public ResponseEntity<EnvioResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(envioService.buscarPorId(id));
    }

    // POST /api/envios  — crear desde Logística
    @PostMapping
    public ResponseEntity<EnvioResponseDTO> crear(
            @Valid @RequestBody EnvioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(envioService.crear(dto));
    }

    // PATCH /api/envios/{id}/estado
    @PatchMapping("/{id}/estado")
    public ResponseEntity<EnvioResponseDTO> cambiarEstado(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                envioService.cambiarEstado(id, body.get("estado")));
    }
}