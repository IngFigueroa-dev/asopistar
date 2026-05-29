package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.LoteDecisionRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.LoteCuartoFrioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.LoteCuartoFrioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lotes-cuarto-frio")
public class LoteCuartoFrioController {

    private final LoteCuartoFrioService loteCuartoFrioService;

    public LoteCuartoFrioController(LoteCuartoFrioService loteCuartoFrioService) {
        this.loteCuartoFrioService = loteCuartoFrioService;
    }

    // GET /api/lotes-cuarto-frio
    @GetMapping
    public ResponseEntity<List<LoteCuartoFrioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(loteCuartoFrioService.listarTodos());
    }

    // GET /api/lotes-cuarto-frio/disponibles
    @GetMapping("/disponibles")
    public ResponseEntity<List<LoteCuartoFrioResponseDTO>> listarDisponibles() {
        return ResponseEntity.ok(loteCuartoFrioService.listarDisponibles());
    }

    // GET /api/lotes-cuarto-frio/{id}
    @GetMapping("/{id}")
    public ResponseEntity<LoteCuartoFrioResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(loteCuartoFrioService.buscarPorId(id));
    }

    // PATCH /api/lotes-cuarto-frio/{id}/decision
    // Toma la decisión: ALMACENAR o DESPACHAR
    @PatchMapping("/{id}/decision")
    public ResponseEntity<LoteCuartoFrioResponseDTO> procesarDecision(
            @PathVariable Integer id,
            @Valid @RequestBody LoteDecisionRequestDTO dto) {
        return ResponseEntity.ok(loteCuartoFrioService.procesarDecision(id, dto));
    }
}