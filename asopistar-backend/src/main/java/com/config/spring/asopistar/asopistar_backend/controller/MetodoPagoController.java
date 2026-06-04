package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.entity.MetodoPago;
import com.config.spring.asopistar.asopistar_backend.repository.MetodoPagoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/metodos-pago")
public class MetodoPagoController {

    private final MetodoPagoRepository repo;

    public MetodoPagoController(MetodoPagoRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority(" +
        "'ROLE_ADMINISTRADOR_GENERAL'," +
        "'ROLE_CONTADORA'," +
        "'ROLE_GERENTE_COMERCIAL'," +
        "'ROLE_GERENTE_PLANTA'," +
        "'ROLE_SECRETARIA')")
    public ResponseEntity<List<MetodoPago>> listarActivos() {
        return ResponseEntity.ok(repo.findByEstado("ACTIVO"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority(" +
        "'ROLE_ADMINISTRADOR_GENERAL'," +
        "'ROLE_CONTADORA'," +
        "'ROLE_GERENTE_COMERCIAL'," +
        "'ROLE_GERENTE_PLANTA'," +
        "'ROLE_SECRETARIA')")
    public ResponseEntity<MetodoPago> obtenerPorId(@PathVariable Integer id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
