package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.TurnoPescaRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.TurnoPescaResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.TurnoPescaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/turnos-pesca")
@RequiredArgsConstructor
public class TurnoPescaController {

    private final TurnoPescaService turnoPescaService;

    // GET /turnos-pesca
    @GetMapping
    public ResponseEntity<List<TurnoPescaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(turnoPescaService.listarTodos());
    }

    // GET /turnos-pesca/pendientes
    @GetMapping("/pendientes")
    public ResponseEntity<List<TurnoPescaResponseDTO>> listarPendientes() {
        return ResponseEntity.ok(turnoPescaService.listarPendientes());
    }

    // GET /turnos-pesca/emergencias
    @GetMapping("/emergencias")
    public ResponseEntity<List<TurnoPescaResponseDTO>> listarEmergencias() {
        return ResponseEntity.ok(turnoPescaService.listarEmergencias());
    }

    // GET /turnos-pesca/agenda?fecha=2025-05-01
    @GetMapping("/agenda")
    public ResponseEntity<List<TurnoPescaResponseDTO>> agendaDelDia(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fecha) {
        return ResponseEntity.ok(turnoPescaService.agendaDelDia(fecha));
    }

    // GET /turnos-pesca/ordenados
    @GetMapping("/ordenados")
    public ResponseEntity<List<TurnoPescaResponseDTO>> listarOrdenados() {
        return ResponseEntity.ok(turnoPescaService.listarOrdenadosPorPrioridad());
    }

    // ── NUEVO: GET /turnos-pesca/productor/{idProductor} ─────────────────────
    // Devuelve solo los turnos del productor indicado, ordenados por prioridad.
    // Usado por el frontend cuando el usuario tiene ROLE_PRODUCTOR.
    @GetMapping("/productor/{idProductor}")
    public ResponseEntity<List<TurnoPescaResponseDTO>> listarPorProductor(
            @PathVariable Integer idProductor) {
        return ResponseEntity.ok(turnoPescaService.listarPorProductor(idProductor));
    }

    // GET /turnos-pesca/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TurnoPescaResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(turnoPescaService.buscarPorId(id));
    }

    // POST /turnos-pesca
    @PostMapping
    public ResponseEntity<TurnoPescaResponseDTO> crear(
            @Valid @RequestBody TurnoPescaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(turnoPescaService.crear(dto));
    }

    // PATCH /turnos-pesca/{id}/estado?nuevoEstado=CONFIRMADO
    @PatchMapping("/{id}/estado")
    public ResponseEntity<TurnoPescaResponseDTO> cambiarEstado(
            @PathVariable Integer id,
            @RequestParam String nuevoEstado) {
        return ResponseEntity.ok(
            turnoPescaService.cambiarEstado(id, nuevoEstado));
    }
}
