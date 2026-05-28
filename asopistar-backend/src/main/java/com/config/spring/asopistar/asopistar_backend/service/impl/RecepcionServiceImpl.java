package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.RecepcionRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.RecepcionResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.LoteCuartoFrio;
import com.config.spring.asopistar.asopistar_backend.entity.Productor;
import com.config.spring.asopistar.asopistar_backend.entity.Recepcion;
import com.config.spring.asopistar.asopistar_backend.entity.TurnoPesca;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.LoteCuartoFrioRepository;
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
    private final LoteCuartoFrioRepository loteCuartoFrioRepository;

    public RecepcionServiceImpl(
            RecepcionRepository recepcionRepository,
            TurnoPescaRepository turnoPescaRepository,
            ProductorRepository productorRepository,
            LoteCuartoFrioRepository loteCuartoFrioRepository) {
        this.recepcionRepository = recepcionRepository;
        this.turnoPescaRepository = turnoPescaRepository;
        this.productorRepository = productorRepository;
        this.loteCuartoFrioRepository = loteCuartoFrioRepository;
    }

    // ── Implementación de RecepcionService ────────────────────────────────────

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

        // 1. Validar que el turno existe y está en estado válido
        TurnoPesca turno = turnoPescaRepository.findById(dto.getIdTurno())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Turno de pesca no encontrado con id: " + dto.getIdTurno()));

        if (!turno.getEstado().equals("PENDIENTE") && !turno.getEstado().equals("CONFIRMADO")) {
            throw new BusinessException(
                    "El turno debe estar en estado PENDIENTE o CONFIRMADO. " +
                    "Estado actual: " + turno.getEstado());
        }

        // 2. Validar que el productor existe
        Productor productor = productorRepository.findById(dto.getIdProductor())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Productor no encontrado con id: " + dto.getIdProductor()));

        // 3. Crear y guardar la recepción
        Recepcion recepcion = new Recepcion();
        recepcion.setFechaHora(dto.getFechaHora());
        recepcion.setKilosRecibidos(dto.getKilosRecibidos());
        recepcion.setObservaciones(dto.getObservaciones());
        recepcion.setProductor(productor);
        recepcion.setTurnoPesca(turno);

        Recepcion recepcionGuardada = recepcionRepository.save(recepcion);

        // 4. Marcar el turno como REALIZADO
        turno.setEstado("REALIZADO");
        turnoPescaRepository.save(turno);

        // 5. Crear automáticamente el lote en el cuarto frío
        long totalLotes = loteCuartoFrioRepository.count();
        String codigoLote = String.format("LOTE-%03d", totalLotes + 1);

        LoteCuartoFrio lote = new LoteCuartoFrio();
        lote.setCodigoLote(codigoLote);
        lote.setFechaIngreso(LocalDateTime.now());
        lote.setKilos(dto.getKilosRecibidos());
        lote.setEstado(true); // true = disponible
        lote.setRecepcion(recepcionGuardada);

        loteCuartoFrioRepository.save(lote);

        // 6. Retornar DTO de la recepción creada
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
