package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.SeguimientoSiembraRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.SeguimientoSiembraResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.SeguimientoSiembraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/seguimientos")
@RequiredArgsConstructor
public class SeguimientoSiembraController {
 
    private final SeguimientoSiembraService seguimientoService;
 
    // GET /seguimientos/siembra/{idSiembra}
    @GetMapping("/siembra/{idSiembra}")
    public ResponseEntity<List<SeguimientoSiembraResponseDTO>> listarPorSiembra(
            @PathVariable Integer idSiembra) {
        return ResponseEntity.ok(
            seguimientoService.listarPorSiembra(idSiembra));
    }
 
    // GET /seguimientos/siembra/{idSiembra}/ultimo
    @GetMapping("/siembra/{idSiembra}/ultimo")
    public ResponseEntity<SeguimientoSiembraResponseDTO> ultimoSeguimiento(
            @PathVariable Integer idSiembra) {
        return ResponseEntity.ok(
            seguimientoService.ultimoSeguimiento(idSiembra));
    }
 
    // GET /seguimientos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<SeguimientoSiembraResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(seguimientoService.buscarPorId(id));
    }
 
    // POST /seguimientos
    @PostMapping
    public ResponseEntity<SeguimientoSiembraResponseDTO> crear(
            @Valid @RequestBody SeguimientoSiembraRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(seguimientoService.crear(dto));
    }
}
