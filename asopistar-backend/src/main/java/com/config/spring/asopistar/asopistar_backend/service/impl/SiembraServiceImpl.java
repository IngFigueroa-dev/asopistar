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
 
    private final SiembraRepository siembraRepository;
    private final EstanqueRepository estanqueRepository;
    private final EspecieRepository especieRepository;
 
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
        if (!estanque.getEstadoEstanque().equals("ACTIVO"))
            throw new BusinessException(
                "El estanque no está ACTIVO. Estado actual: "
                + estanque.getEstadoEstanque());
        var especie = especieRepository.findById(dto.getIdEspecie())
            .orElseThrow(() -> new ResourceNotFoundException("Especie no encontrada"));
        Siembra s = Siembra.builder()
            .fechaSiembra(dto.getFechaSiembra())
            .cantidadAlevinos(dto.getCantidadAlevinos())
            .promedioInicial(dto.getPromedioInicial())
            .estado("EN_CURSO")
            .observaciones(dto.getObservaciones())
            .estanque(estanque).especie(especie)
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
            .nombreProductor(s.getEstanque().getProductor().getNombre1()
                + " " + s.getEstanque().getProductor().getApellido1())
            .build();
    }
}
