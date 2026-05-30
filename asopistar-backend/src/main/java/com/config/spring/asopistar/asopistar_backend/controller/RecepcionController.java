package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.RecepcionRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.RecepcionResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.RecepcionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recepciones")
public class RecepcionController {

    private final RecepcionService service;

    public RecepcionController(RecepcionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<RecepcionResponseDTO>> listar(
            @RequestParam(required = false) Integer idProductor) {
        if (idProductor != null) {
            return ResponseEntity.ok(service.listarPorProductor(idProductor));
        }
        return ResponseEntity.ok(service.listarTodas());
    }

    // FIX: ahora pasa por el service → mapea a DTO → sin lazy loading
    @GetMapping("/sin-pago")
    public ResponseEntity<List<RecepcionResponseDTO>> sinPago(
            @RequestParam Integer idProductor) {
        return ResponseEntity.ok(service.listarSinPagoPorProductor(idProductor));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecepcionResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<RecepcionResponseDTO> registrar(
            @Valid @RequestBody RecepcionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(request));
    }
}
