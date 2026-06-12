package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.CapacidadCuartoFrioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.CapacidadCuartoFrioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.CapacidadCuartoFrio;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.CapacidadCuartoFrioRepository;
import com.config.spring.asopistar.asopistar_backend.repository.LoteCuartoFrioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/capacidad-cuarto-frio")
@RequiredArgsConstructor
public class CapacidadCuartoFrioController {

    private final CapacidadCuartoFrioRepository capacidadRepo;
    private final LoteCuartoFrioRepository      loteRepo;

    // GET /capacidad-cuarto-frio  — consultar capacidad actual
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_PLANTA','ROLE_PERSONAL_CUARTO_FRIO')")
    public ResponseEntity<CapacidadCuartoFrioResponseDTO> obtener() {
        return ResponseEntity.ok(buildDTO());
    }

    // PUT /capacidad-cuarto-frio  — actualizar capacidad máxima
    @PutMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_PLANTA')")
    public ResponseEntity<CapacidadCuartoFrioResponseDTO> actualizar(
            @Valid @RequestBody CapacidadCuartoFrioRequestDTO dto,
            Authentication auth) {

        CapacidadCuartoFrio cap = capacidadRepo.findFirstByOrderByIdCapacidadAsc()
                .orElseThrow(() -> new ResourceNotFoundException("No existe configuración de capacidad"));

        cap.setCapacidadMaxKg(dto.getCapacidadMaxKg());
        if (dto.getDescripcion() != null) cap.setDescripcion(dto.getDescripcion());
        cap.setFechaActualizacion(LocalDateTime.now());
        cap.setActualizadoPor(auth != null ? auth.getName() : "sistema");
        capacidadRepo.save(cap);

        return ResponseEntity.ok(buildDTO());
    }

    // ── Mapper interno ────────────────────────────────────────────────────────
    private CapacidadCuartoFrioResponseDTO buildDTO() {
        CapacidadCuartoFrio cap = capacidadRepo.findFirstByOrderByIdCapacidadAsc()
                .orElseThrow(() -> new ResourceNotFoundException("No existe configuración de capacidad"));

        BigDecimal kilosActuales = loteRepo.sumKilosDisponibles();
        if (kilosActuales == null) kilosActuales = BigDecimal.ZERO;

        BigDecimal kilosDisponibles = cap.getCapacidadMaxKg().subtract(kilosActuales);
        if (kilosDisponibles.compareTo(BigDecimal.ZERO) < 0) kilosDisponibles = BigDecimal.ZERO;

        int pct = cap.getCapacidadMaxKg().compareTo(BigDecimal.ZERO) > 0
                ? kilosActuales.multiply(BigDecimal.valueOf(100))
                        .divide(cap.getCapacidadMaxKg(), 0, RoundingMode.HALF_UP)
                        .intValue()
                : 0;

        return CapacidadCuartoFrioResponseDTO.builder()
                .idCapacidad(cap.getIdCapacidad())
                .capacidadMaxKg(cap.getCapacidadMaxKg())
                .kilosActuales(kilosActuales)
                .kilosDisponibles(kilosDisponibles)
                .porcentajeOcupacion(Math.min(pct, 100))
                .descripcion(cap.getDescripcion())
                .fechaActualizacion(cap.getFechaActualizacion())
                .actualizadoPor(cap.getActualizadoPor())
                .build();
    }
}
