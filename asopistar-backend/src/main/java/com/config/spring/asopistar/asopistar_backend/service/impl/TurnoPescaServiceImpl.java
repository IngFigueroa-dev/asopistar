package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.TurnoPescaRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.TurnoPescaResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.TurnoPesca;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.repository.TurnoPescaRepository;
import com.config.spring.asopistar.asopistar_backend.repository.SiembraRepository;
import com.config.spring.asopistar.asopistar_backend.repository.ProductorRepository;
import com.config.spring.asopistar.asopistar_backend.repository.SeguimientoSiembraRepository;
import com.config.spring.asopistar.asopistar_backend.service.TurnoPescaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
 
@Service @RequiredArgsConstructor
public class TurnoPescaServiceImpl implements TurnoPescaService {
 
    private final TurnoPescaRepository turnoPescaRepository;
    private final SiembraRepository siembraRepository;
    private final ProductorRepository productorRepository;
    private final SeguimientoSiembraRepository seguimientoRepository;
 
    @Override
    public List<TurnoPescaResponseDTO> listarTodos() {
        return turnoPescaRepository.findAll().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public List<TurnoPescaResponseDTO> listarPendientes() {
        return turnoPescaRepository.findByEstado("PENDIENTE").stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public List<TurnoPescaResponseDTO> listarEmergencias() {
        return turnoPescaRepository
            .findByTipoPrioridadAndEstado("EMERGENCIA", "PENDIENTE")
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public List<TurnoPescaResponseDTO> agendaDelDia(LocalDate fecha) {
        return turnoPescaRepository
            .findByFechaProgramadaOrderByHoraProgramadaAsc(fecha)
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public TurnoPescaResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(turnoPescaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Turno no encontrado con id: " + id)));
    }
 
    @Override @Transactional
    public TurnoPescaResponseDTO crear(TurnoPescaRequestDTO dto) {
        var siembra = siembraRepository.findById(dto.getIdSiembra())
            .orElseThrow(() -> new ResourceNotFoundException("Siembra no encontrada"));
        // Regla 1: la siembra debe estar EN_CURSO
        if (!siembra.getEstado().equals("EN_CURSO"))
            throw new BusinessException(
                "Solo se puede asignar turno a siembras EN_CURSO");
        // Regla 2: el biólogo debe haber aprobado la cosecha
        boolean aprobada = seguimientoRepository
            .findBySiembraIdSiembraOrderByFechaVisitaDesc(dto.getIdSiembra())
            .stream().anyMatch(s -> s.getAptoCosecha() == 'Y');
        if (!aprobada)
            throw new BusinessException(
                "El biólogo aún no ha aprobado esta siembra para cosecha");
        // Regla 3: no debe existir ya un turno PENDIENTE para esta siembra
        boolean tieneTurnoPendiente = turnoPescaRepository
            .findByFechaProgramadaAndEstado(dto.getFechaProgramada(), "PENDIENTE")
            .stream().anyMatch(t ->
                t.getSiembra().getIdSiembra().equals(dto.getIdSiembra()));
        if (tieneTurnoPendiente)
            throw new BusinessException(
                "Esta siembra ya tiene un turno PENDIENTE asignado");
        var productor = productorRepository.findById(dto.getIdProductor())
            .orElseThrow(() -> new ResourceNotFoundException("Productor no encontrado"));
        TurnoPesca turno = TurnoPesca.builder()
            .fechaProgramada(dto.getFechaProgramada())
            .horaProgramada(dto.getHoraProgramada())
            .tipoPrioridad(dto.getTipoPrioridad())
            .motivoEmergencia(dto.getMotivoEmergencia())
            .estado("PENDIENTE")
            .siembra(siembra).productor(productor)
            .build();
        return toResponseDTO(turnoPescaRepository.save(turno));
    }
 
    @Override @Transactional
    public TurnoPescaResponseDTO cambiarEstado(Integer id, String nuevoEstado) {
        TurnoPesca t = turnoPescaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Turno no encontrado con id: " + id));
        t.setEstado(nuevoEstado);
        return toResponseDTO(turnoPescaRepository.save(t));
    }
 
    private TurnoPescaResponseDTO toResponseDTO(TurnoPesca t) {
        return TurnoPescaResponseDTO.builder()
            .idTurno(t.getIdTurno())
            .fechaProgramada(t.getFechaProgramada())
            .horaProgramada(t.getHoraProgramada())
            .tipoPrioridad(t.getTipoPrioridad())
            .motivoEmergencia(t.getMotivoEmergencia())
            .estado(t.getEstado())
            .idSiembra(t.getSiembra().getIdSiembra())
            .fechaSiembra(t.getSiembra().getFechaSiembra())
            .idProductor(t.getProductor().getIdProductor())
            .nombreProductor(t.getProductor().getNombre1()
                + " " + t.getProductor().getApellido1())
            .codigoEstanque(t.getSiembra().getEstanque().getCodigo())
            .build();
    }



    //Turnos ordenados por prioridad
    @Override
    public List<TurnoPescaResponseDTO> listarOrdenadosPorPrioridad() {
        return turnoPescaRepository.findTurnosOrdenadosPorPrioridad()
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }
}
