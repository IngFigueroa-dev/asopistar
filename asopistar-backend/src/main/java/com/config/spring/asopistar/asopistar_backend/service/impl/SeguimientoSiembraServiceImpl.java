package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.SeguimientoSiembraRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.SeguimientoSiembraResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.SeguimientoSiembra;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.repository.SeguimientoSiembraRepository;
import com.config.spring.asopistar.asopistar_backend.repository.SiembraRepository;
import com.config.spring.asopistar.asopistar_backend.service.SeguimientoSiembraService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
 
@Service @RequiredArgsConstructor
public class SeguimientoSiembraServiceImpl implements SeguimientoSiembraService {
 
    private final SeguimientoSiembraRepository seguimientoRepository;
    private final SiembraRepository siembraRepository;
 
    @Override
    public List<SeguimientoSiembraResponseDTO> listarPorSiembra(Integer idSiembra) {
        return seguimientoRepository
            .findBySiembraIdSiembraOrderByFechaVisitaDesc(idSiembra)
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public SeguimientoSiembraResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(seguimientoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Seguimiento no encontrado con id: " + id)));
    }
 
    @Override @Transactional
    public SeguimientoSiembraResponseDTO crear(SeguimientoSiembraRequestDTO dto) {
        var siembra = siembraRepository.findById(dto.getIdSiembra())
            .orElseThrow(() -> new ResourceNotFoundException("Siembra no encontrada"));
        if (!siembra.getEstado().equals("EN_CURSO"))
            throw new BusinessException(
                "Solo se pueden registrar seguimientos a siembras EN_CURSO");
        SeguimientoSiembra seg = SeguimientoSiembra.builder()
            .fechaVisita(dto.getFechaVisita())
            .pesoPromedio(dto.getPesoPromedio())
            .cantidadEstimada(dto.getCantidadEstimada())
            .condicionAgua(dto.getCondicionAgua())
            .estadoSalud(dto.getEstadoSalud())
            .observaciones(dto.getObservaciones())
            .aptoCosecha(dto.getAptoCosecha())
            .siembra(siembra)
            .build();
        return toResponseDTO(seguimientoRepository.save(seg));
    }
 
    @Override
    public SeguimientoSiembraResponseDTO ultimoSeguimiento(Integer idSiembra) {
        return toResponseDTO(seguimientoRepository
            .findTopBySiembraIdSiembraOrderByFechaVisitaDesc(idSiembra)
            .orElseThrow(() -> new ResourceNotFoundException(
                "No hay seguimientos para esta siembra")));
    }
 
    private SeguimientoSiembraResponseDTO toResponseDTO(SeguimientoSiembra s) {
        return SeguimientoSiembraResponseDTO.builder()
            .idSeguimiento(s.getIdSeguimiento())
            .fechaVisita(s.getFechaVisita())
            .pesoPromedio(s.getPesoPromedio())
            .cantidadEstimada(s.getCantidadEstimada())
            .condicionAgua(s.getCondicionAgua())
            .estadoSalud(s.getEstadoSalud())
            .observaciones(s.getObservaciones())
            .aptoCosecha(s.getAptoCosecha())
            .idSiembra(s.getSiembra().getIdSiembra())
            .estadoSiembra(s.getSiembra().getEstado())
            .nombreEspecie(s.getSiembra().getEspecie().getNombre())
            .build();
    }
}
