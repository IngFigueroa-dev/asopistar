package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.ProcesamientoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ProcesamientoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.ProcesamientoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/procesamientos")
public class ProcesamientoController {

    private final ProcesamientoService procesamientoService;

    public ProcesamientoController(ProcesamientoService procesamientoService) {
        this.procesamientoService = procesamientoService;
    }

    // GET /api/procesamientos
    @GetMapping
    public ResponseEntity<List<ProcesamientoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(procesamientoService.listarTodos());
    }

    // GET /api/procesamientos/recepcion/{idRecepcion}
    @GetMapping("/recepcion/{idRecepcion}")
    public ResponseEntity<List<ProcesamientoResponseDTO>> listarPorRecepcion(
            @PathVariable Integer idRecepcion) {
        return ResponseEntity.ok(procesamientoService.listarPorRecepcion(idRecepcion));
    }

    // GET /api/procesamientos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProcesamientoResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(procesamientoService.buscarPorId(id));
    }

    // PATCH /api/procesamientos/{id}/avanzar
    @PatchMapping("/{id}/avanzar")
    public ResponseEntity<ProcesamientoResponseDTO> avanzarEtapa(
            @PathVariable Integer id,
            @Valid @RequestBody ProcesamientoRequestDTO dto) {
        return ResponseEntity.ok(procesamientoService.avanzarEtapa(id, dto));
    }
}
