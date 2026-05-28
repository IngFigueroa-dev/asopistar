package com.config.spring.asopistar.asopistar_backend.controller;

 
import com.config.spring.asopistar.asopistar_backend.dto.request.IngresoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.IngresoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.IngresoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
 
@RestController
@RequestMapping("/ingresos")
@RequiredArgsConstructor
public class IngresoController {
 
    private final IngresoService ingresoService;
 
    // GET /ingresos
    @GetMapping
    public ResponseEntity<List<IngresoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(ingresoService.listarTodos());
    }
 
    // GET /ingresos/periodo?inicio=2025-01-01T00:00:00&fin=2025-01-31T23:59:59
    @GetMapping("/periodo")
    public ResponseEntity<List<IngresoResponseDTO>> listarPorPeriodo(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime inicio,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime fin) {
        return ResponseEntity.ok(ingresoService.listarPorPeriodo(inicio, fin));
    }
 
    // GET /ingresos/total-periodo?inicio=...&fin=...
    @GetMapping("/total-periodo")
    public ResponseEntity<BigDecimal> totalPorPeriodo(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime inicio,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime fin) {
        return ResponseEntity.ok(
            ingresoService.totalIngresosPorPeriodo(inicio, fin));
    }
 
    // GET /ingresos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<IngresoResponseDTO> buscarPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ingresoService.buscarPorId(id));
    }
 
    // POST /ingresos
    @PostMapping
    public ResponseEntity<IngresoResponseDTO> crear(
            @Valid @RequestBody IngresoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ingresoService.crear(dto));
    }
}
