package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.RecepcionRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.RecepcionResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Procesamiento;
import com.config.spring.asopistar.asopistar_backend.entity.Productor;
import com.config.spring.asopistar.asopistar_backend.entity.Recepcion;
import com.config.spring.asopistar.asopistar_backend.entity.TurnoPesca;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.ProcesamientoRepository;
import com.config.spring.asopistar.asopistar_backend.repository.ProductorRepository;
import com.config.spring.asopistar.asopistar_backend.repository.RecepcionRepository;
import com.config.spring.asopistar.asopistar_backend.repository.TurnoPescaRepository;
import com.config.spring.asopistar.asopistar_backend.service.RecepcionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecepcionServiceImpl implements RecepcionService {

    private final RecepcionRepository recepcionRepository;
    private final TurnoPescaRepository turnoPescaRepository;
    private final ProductorRepository productorRepository;
    private final ProcesamientoRepository procesamientoRepository;

    public RecepcionServiceImpl(
            RecepcionRepository recepcionRepository,
            TurnoPescaRepository turnoPescaRepository,
            ProductorRepository productorRepository,
            ProcesamientoRepository procesamientoRepository) {
        this.recepcionRepository = recepcionRepository;
        this.turnoPescaRepository = turnoPescaRepository;
        this.productorRepository = productorRepository;
        this.procesamientoRepository = procesamientoRepository;
    }

    @Override
    public List<RecepcionResponseDTO> listarTodos() {
        return recepcionRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RecepcionResponseDTO> listarPorProductor(Integer idProductor) {
        return recepcionRepository.findAll().stream()
                .filter(r -> r.getProductor().getIdProductor().equals(idProductor))
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RecepcionResponseDTO buscarPorId(Integer id) {
        Recepcion recepcion = recepcionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recepción no encontrada con id: " + id));
        return mapToResponseDTO(recepcion);
    }

    @Override
    @Transactional
    public RecepcionResponseDTO crear(RecepcionRequestDTO dto) {

        // 1. Validar turno
        TurnoPesca turno = turnoPescaRepository.findById(dto.getIdTurno())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Turno de pesca no encontrado con id: " + dto.getIdTurno()));

        if (!turno.getEstado().equals("PENDIENTE") && !turno.getEstado().equals("CONFIRMADO")) {
            throw new BusinessException(
                    "El turno debe estar en estado PENDIENTE o CONFIRMADO. Estado actual: "
                    + turno.getEstado());
        }

        // 2. Validar productor
        Productor productor = productorRepository.findById(dto.getIdProductor())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Productor no encontrado con id: " + dto.getIdProductor()));

        // 3. Guardar recepción
        Recepcion recepcion = new Recepcion();
        recepcion.setFechaHora(dto.getFechaHora());
        recepcion.setKilosRecibidos(dto.getKilosRecibidos());
        recepcion.setObservaciones(dto.getObservaciones());
        recepcion.setProductor(productor);
        recepcion.setTurnoPesca(turno);
        Recepcion recepcionGuardada = recepcionRepository.save(recepcion);

        // 4. Marcar turno como REALIZADO
        turno.setEstado("REALIZADO");
        turnoPescaRepository.save(turno);

        // 5. Crear primera etapa de procesamiento: PESAJE
        //    El lote se crea al completar la etapa DISTRIBUCION (última etapa)
        Procesamiento pesaje = new Procesamiento();
        pesaje.setEtapa("PESAJE");
        pesaje.setEstado("EN_PROCESO");
        pesaje.setFechaInicio(LocalDateTime.now());
        pesaje.setRecepcion(recepcionGuardada);   // <-- relación con recepción, no con lote
        procesamientoRepository.save(pesaje);

        return mapToResponseDTO(recepcionGuardada);
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private RecepcionResponseDTO mapToResponseDTO(Recepcion r) {
        Productor p = r.getProductor();
        RecepcionResponseDTO dto = new RecepcionResponseDTO();
        dto.setIdRecepcion(r.getIdRecepcion());
        dto.setFechaHora(r.getFechaHora());
        dto.setKilosRecibidos(r.getKilosRecibidos());
        dto.setObservaciones(r.getObservaciones());
        dto.setIdProductor(p.getIdProductor());
        dto.setNombreProductor(p.getNombre1() + " " + p.getApellido1());
        dto.setIdTurno(r.getTurnoPesca().getIdTurno());
        return dto;
    }
}
