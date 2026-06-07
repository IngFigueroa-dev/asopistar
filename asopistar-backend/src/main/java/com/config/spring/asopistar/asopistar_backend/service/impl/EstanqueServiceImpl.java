package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.EstanqueRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EstanqueResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Estanque;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.repository.EstanqueRepository;
import com.config.spring.asopistar.asopistar_backend.repository.ProductorRepository;
import com.config.spring.asopistar.asopistar_backend.service.EstanqueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class EstanqueServiceImpl implements EstanqueService {

    private final EstanqueRepository  estanqueRepository;
    private final ProductorRepository productorRepository;

    @Override
    public List<EstanqueResponseDTO> listarTodos() {
        return estanqueRepository.findAll().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<EstanqueResponseDTO> listarPorProductor(Integer idProductor) {
        return estanqueRepository.findByProductorIdProductor(idProductor)
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public EstanqueResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(estanqueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Estanque no encontrado con id: " + id)));
    }

    @Override @Transactional
    public EstanqueResponseDTO crear(EstanqueRequestDTO dto) {

        var productor = productorRepository.findById(dto.getIdProductor())
            .orElseThrow(() -> new ResourceNotFoundException("Productor no encontrado"));

        // ── Validar código único POR PRODUCTOR (no global) ───────────────────
        // Dos productores distintos SÍ pueden tener el mismo código (ej: EST-001).
        // Solo se impide que el MISMO productor repita un código.
        boolean codigoDuplicado = estanqueRepository
            .findByCodigoAndProductorIdProductor(dto.getCodigo(), dto.getIdProductor())
            .isPresent();

        if (codigoDuplicado)
            throw new BusinessException(
                "Ya tienes un estanque con el código '" + dto.getCodigo() +
                "'. Usa un código diferente para este estanque.");

        Estanque e = Estanque.builder()
            .codigo(dto.getCodigo())
            .nombre(dto.getNombre())
            .capacidad(dto.getCapacidad())
            .ubicacion(dto.getUbicacion())
            .estadoEstanque(dto.getEstadoEstanque())
            .productor(productor)
            .build();

        return toResponseDTO(estanqueRepository.save(e));
    }

    @Override @Transactional
    public EstanqueResponseDTO actualizar(Integer id, EstanqueRequestDTO dto) {
        Estanque e = estanqueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Estanque no encontrado con id: " + id));
        e.setNombre(dto.getNombre());
        e.setCapacidad(dto.getCapacidad());
        e.setUbicacion(dto.getUbicacion());
        e.setEstadoEstanque(dto.getEstadoEstanque());
        return toResponseDTO(estanqueRepository.save(e));
    }

    @Override
    public void eliminar(Integer id) {
        if (!estanqueRepository.existsById(id))
            throw new ResourceNotFoundException("Estanque no encontrado con id: " + id);
        estanqueRepository.deleteById(id);
    }

    private EstanqueResponseDTO toResponseDTO(Estanque e) {
        return EstanqueResponseDTO.builder()
            .idEstanque(e.getIdEstanque())
            .codigo(e.getCodigo())
            .nombre(e.getNombre())
            .capacidad(e.getCapacidad())
            .ubicacion(e.getUbicacion())
            .estadoEstanque(e.getEstadoEstanque())
            .idProductor(e.getProductor().getIdProductor())
            .nombreProductor(e.getProductor().getNombre1()
                + " " + e.getProductor().getApellido1())
            .build();
    }
}
