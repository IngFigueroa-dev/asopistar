package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.SiembraRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.SiembraResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.SiembraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/siembras")
@RequiredArgsConstructor
public class SiembraController {
 
    private final SiembraService siembraService;
 
    // GET /siembras
    @GetMapping
    public ResponseEntity<List<SiembraResponseDTO>> listarTodos() {
        return ResponseEntity.ok(siembraService.listarTodos());
    }
 
    // GET /siembras/activas
    @GetMapping("/activas")
    public ResponseEntity<List<SiembraResponseDTO>> listarActivas() {
        return ResponseEntity.ok(siembraService.listarActivas());
    }
 
    // GET /siembras/listas-para-cosechar
    @GetMapping("/listas-para-cosechar")
    public ResponseEntity<List<SiembraResponseDTO>> listarListasParaCosechar() {
        return ResponseEntity.ok(siembraService.listarListasParaCosechar());
    }
 
    // GET /siembras/{id}
    @GetMapping("/{id}")
    public ResponseEntity<SiembraResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(siembraService.buscarPorId(id));
    }
 
    // POST /siembras
    @PostMapping
    public ResponseEntity<SiembraResponseDTO> crear(
            @Valid @RequestBody SiembraRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(siembraService.crear(dto));
    }
 
    // PUT /siembras/{id}
    @PutMapping("/{id}")
    public ResponseEntity<SiembraResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody SiembraRequestDTO dto) {
        return ResponseEntity.ok(siembraService.actualizar(id, dto));
    }
}
