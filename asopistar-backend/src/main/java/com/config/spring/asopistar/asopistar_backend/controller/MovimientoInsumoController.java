package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.MovimientoInsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.MovimientoInsumoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.MovimientoInsumoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movimientos-insumo")
@RequiredArgsConstructor
public class MovimientoInsumoController {

    private final MovimientoInsumoService movimientoService;

    @GetMapping
    public ResponseEntity<List<MovimientoInsumoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(movimientoService.listarTodos());
    }

    @GetMapping("/insumo/{idInsumo}")
    public ResponseEntity<List<MovimientoInsumoResponseDTO>> listarPorInsumo(
            @PathVariable Integer idInsumo) {
        return ResponseEntity.ok(movimientoService.listarPorInsumo(idInsumo));
    }

    @PostMapping
    public ResponseEntity<MovimientoInsumoResponseDTO> registrar(
            @Valid @RequestBody MovimientoInsumoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(movimientoService.registrar(dto));
    }
}
