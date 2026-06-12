package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.ConfiguracionProduccionRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ConfiguracionProduccionResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.ConfiguracionProduccion;
import com.config.spring.asopistar.asopistar_backend.entity.Especie;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.ConfiguracionProduccionRepository;
import com.config.spring.asopistar.asopistar_backend.repository.EspecieRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/configuracion-produccion")
@RequiredArgsConstructor
public class ConfiguracionProduccionController {

    private final ConfiguracionProduccionRepository configRepo;
    private final EspecieRepository                 especieRepo;

    // GET /configuracion-produccion
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_PLANTA','ROLE_BIOLOGO')")
    public ResponseEntity<List<ConfiguracionProduccionResponseDTO>> listar() {
        return ResponseEntity.ok(
                configRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    // GET /configuracion-produccion/especie/{idEspecie}
    @GetMapping("/especie/{idEspecie}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_PLANTA','ROLE_BIOLOGO')")
    public ResponseEntity<ConfiguracionProduccionResponseDTO> porEspecie(
            @PathVariable Integer idEspecie) {
        return ResponseEntity.ok(toDTO(
                configRepo.findByEspecieIdEspecie(idEspecie)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "No existe configuración para la especie: " + idEspecie))));
    }

    // POST /configuracion-produccion
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_PLANTA')")
    public ResponseEntity<ConfiguracionProduccionResponseDTO> crear(
            @Valid @RequestBody ConfiguracionProduccionRequestDTO dto,
            Authentication auth) {

        if (configRepo.findByEspecieIdEspecie(dto.getIdEspecie()).isPresent())
            throw new BusinessException("Ya existe configuración para esta especie. Use PUT para actualizar.");

        Especie especie = especieRepo.findById(dto.getIdEspecie())
                .orElseThrow(() -> new ResourceNotFoundException("Especie no encontrada"));

        ConfiguracionProduccion config = ConfiguracionProduccion.builder()
                .especie(especie)
                .cicloMeses(dto.getCicloMeses())
                .pesoCosechaKg(dto.getPesoCosechaKg())
                .activo(true)
                .observaciones(dto.getObservaciones())
                .fechaCreacion(LocalDateTime.now())
                .actualizadoPor(auth != null ? auth.getName() : "sistema")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(configRepo.save(config)));
    }

    // PUT /configuracion-produccion/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR_GENERAL','ROLE_GERENTE_PLANTA')")
    public ResponseEntity<ConfiguracionProduccionResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ConfiguracionProduccionRequestDTO dto,
            Authentication auth) {

        ConfiguracionProduccion config = configRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuración no encontrada"));

        config.setCicloMeses(dto.getCicloMeses());
        if (dto.getPesoCosechaKg() != null) config.setPesoCosechaKg(dto.getPesoCosechaKg());
        if (dto.getObservaciones() != null) config.setObservaciones(dto.getObservaciones());
        config.setFechaActualizacion(LocalDateTime.now());
        config.setActualizadoPor(auth != null ? auth.getName() : "sistema");

        return ResponseEntity.ok(toDTO(configRepo.save(config)));
    }

    private ConfiguracionProduccionResponseDTO toDTO(ConfiguracionProduccion c) {
        return ConfiguracionProduccionResponseDTO.builder()
                .idConfig(c.getIdConfig())
                .idEspecie(c.getEspecie().getIdEspecie())
                .nombreEspecie(c.getEspecie().getNombre())
                .cicloMeses(c.getCicloMeses())
                .pesoCosechaKg(c.getPesoCosechaKg())
                .activo(c.getActivo())
                .observaciones(c.getObservaciones())
                .fechaActualizacion(c.getFechaActualizacion())
                .actualizadoPor(c.getActualizadoPor())
                .build();
    }
}
