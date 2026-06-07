package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.SiembraRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.SiembraResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Siembra;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.repository.SiembraRepository;
import com.config.spring.asopistar.asopistar_backend.repository.EstanqueRepository;
import com.config.spring.asopistar.asopistar_backend.repository.EspecieRepository;
import com.config.spring.asopistar.asopistar_backend.service.SiembraService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class SiembraServiceImpl implements SiembraService {

    private final SiembraRepository  siembraRepository;
    private final EstanqueRepository  estanqueRepository;
    private final EspecieRepository   especieRepository;

    @Override
    public List<SiembraResponseDTO> listarTodos() {
        return siembraRepository.findAll().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<SiembraResponseDTO> listarActivas() {
        return siembraRepository.findByEstado("EN_CURSO").stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<SiembraResponseDTO> listarListasParaCosechar() {
        return siembraRepository.findSiembrasListasParaCosechar().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public SiembraResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(siembraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Siembra no encontrada con id: " + id)));
    }

    @Override @Transactional
    public SiembraResponseDTO crear(SiembraRequestDTO dto) {

        var estanque = estanqueRepository.findById(dto.getIdEstanque())
            .orElseThrow(() -> new ResourceNotFoundException("Estanque no encontrado"));

        // ── Validación 1: el estanque debe estar ACTIVO ──────────────────────
        if (!estanque.getEstadoEstanque().equals("ACTIVO"))
            throw new BusinessException(
                "El estanque no está ACTIVO. Estado actual: "
                + estanque.getEstadoEstanque());

        // ── Validación 2: el estanque no debe tener una siembra EN_CURSO ────
        boolean estanqueOcupado = siembraRepository
            .findByEstado("EN_CURSO")
            .stream()
            .anyMatch(s -> s.getEstanque().getIdEstanque().equals(dto.getIdEstanque()));

        if (estanqueOcupado)
            throw new BusinessException(
                "Este estanque ya tiene una siembra activa EN_CURSO. " +
                "Espera a que se complete la cosecha para sembrar de nuevo.");

        // ── Validación 3: cantidad de alevinos no puede superar la capacidad ─
        // El campo 'capacidad' del estanque representa la cantidad máxima de
        // peces que puede albergar (no metros cúbicos).
        if (dto.getCantidadAlevinos() > estanque.getCapacidad().intValue())
            throw new BusinessException(
                "La cantidad de alevinos (" + dto.getCantidadAlevinos() + ") supera " +
                "la capacidad máxima del estanque (" +
                estanque.getCapacidad().intValue() + " peces). " +
                "Reduce la cantidad o elige un estanque con mayor capacidad.");

        var especie = especieRepository.findById(dto.getIdEspecie())
            .orElseThrow(() -> new ResourceNotFoundException("Especie no encontrada"));

        Siembra s = Siembra.builder()
            .fechaSiembra(dto.getFechaSiembra())
            .cantidadAlevinos(dto.getCantidadAlevinos())
            .promedioInicial(dto.getPromedioInicial())
            .estado("EN_CURSO")
            .observaciones(dto.getObservaciones())
            .estanque(estanque)
            .especie(especie)
            .build();

        return toResponseDTO(siembraRepository.save(s));
    }

    @Override @Transactional
    public SiembraResponseDTO actualizar(Integer id, SiembraRequestDTO dto) {
        Siembra s = siembraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Siembra no encontrada con id: " + id));
        s.setEstado(dto.getEstado());
        s.setObservaciones(dto.getObservaciones());
        return toResponseDTO(siembraRepository.save(s));
    }

    // ── Mapper interno ────────────────────────────────────────────────────────
    private SiembraResponseDTO toResponseDTO(Siembra s) {
        return SiembraResponseDTO.builder()
            .idSiembra(s.getIdSiembra())
            .fechaSiembra(s.getFechaSiembra())
            .cantidadAlevinos(s.getCantidadAlevinos())
            .promedioInicial(s.getPromedioInicial())
            .estado(s.getEstado())
            .observaciones(s.getObservaciones())
            .idEspecie(s.getEspecie().getIdEspecie())
            .nombreEspecie(s.getEspecie().getNombre())
            .idEstanque(s.getEstanque().getIdEstanque())
            .codigoEstanque(s.getEstanque().getCodigo())
            .idProductor(s.getEstanque().getProductor().getIdProductor())
            .nombreProductor(s.getEstanque().getProductor().getNombre1()
                + " " + s.getEstanque().getProductor().getApellido1())
            .build();
    }
}
