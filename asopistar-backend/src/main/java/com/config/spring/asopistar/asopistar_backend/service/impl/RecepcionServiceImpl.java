package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.RecepcionRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.RecepcionResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Procesamiento;
import com.config.spring.asopistar.asopistar_backend.entity.Productor;
import com.config.spring.asopistar.asopistar_backend.entity.Recepcion;
import com.config.spring.asopistar.asopistar_backend.entity.TurnoPesca;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.CapacidadCuartoFrioRepository;
import com.config.spring.asopistar.asopistar_backend.repository.LoteCuartoFrioRepository;
import com.config.spring.asopistar.asopistar_backend.repository.ProcesamientoRepository;
import com.config.spring.asopistar.asopistar_backend.repository.ProductorRepository;
import com.config.spring.asopistar.asopistar_backend.repository.RecepcionRepository;
import com.config.spring.asopistar.asopistar_backend.repository.TurnoPescaRepository;
import com.config.spring.asopistar.asopistar_backend.service.RecepcionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecepcionServiceImpl implements RecepcionService {

    private final RecepcionRepository          recepcionRepo;
    private final ProductorRepository          productorRepo;
    private final TurnoPescaRepository         turnoRepo;
    private final ProcesamientoRepository      procesamientoRepo;
    private final CapacidadCuartoFrioRepository capacidadRepo;
    private final LoteCuartoFrioRepository      loteRepo;

    public RecepcionServiceImpl(RecepcionRepository recepcionRepo,
                                ProductorRepository productorRepo,
                                TurnoPescaRepository turnoRepo,
                                ProcesamientoRepository procesamientoRepo,
                                CapacidadCuartoFrioRepository capacidadRepo,
                                LoteCuartoFrioRepository loteRepo) {
        this.recepcionRepo      = recepcionRepo;
        this.productorRepo      = productorRepo;
        this.turnoRepo          = turnoRepo;
        this.procesamientoRepo  = procesamientoRepo;
        this.capacidadRepo      = capacidadRepo;
        this.loteRepo           = loteRepo;
    }

    // ── Registrar nueva recepción ─────────────────────────────────────────────
    @Override
    public RecepcionResponseDTO registrar(RecepcionRequestDTO request) {

        Productor productor = productorRepo.findById(request.getIdProductor())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Productor no encontrado: " + request.getIdProductor()));

        TurnoPesca turno = turnoRepo.findById(request.getIdTurno())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Turno no encontrado: " + request.getIdTurno()));

        if (!"CONFIRMADO".equals(turno.getEstado()) && !"PENDIENTE".equals(turno.getEstado())) {
            throw new BusinessException(
                    "El turno #" + request.getIdTurno() + " no está en estado válido para recepción.");
        }

        // ── Validar capacidad del cuarto frío ────────────────────────────────
        capacidadRepo.findCapacidadMaxKg().ifPresent(capacidadMax -> {
            java.math.BigDecimal kilosActuales = loteRepo.sumKilosDisponibles();
            if (kilosActuales == null) kilosActuales = java.math.BigDecimal.ZERO;
            java.math.BigDecimal kilosTras = kilosActuales.add(request.getKilosRecibidos());
            if (kilosTras.compareTo(capacidadMax) > 0) {
                java.math.BigDecimal disponibles = capacidadMax.subtract(kilosActuales);
                throw new BusinessException(
                    "El cuarto frío no tiene capacidad suficiente. " +
                    "Capacidad máxima: " + capacidadMax.toPlainString() + " kg. " +
                    "Actualmente almacenado: " + kilosActuales.toPlainString() + " kg. " +
                    "Espacio disponible: " + disponibles.toPlainString() + " kg. " +
                    "Kilos a recibir: " + request.getKilosRecibidos().toPlainString() + " kg.");
            }
        });

        Recepcion recepcion = new Recepcion();
        recepcion.setFechaHora(LocalDateTime.now());
        recepcion.setKilosRecibidos(request.getKilosRecibidos());
        recepcion.setObservaciones(request.getObservaciones());
        recepcion.setProductor(productor);
        recepcion.setTurnoPesca(turno);

        Recepcion saved = recepcionRepo.save(recepcion);

        // Marcar el turno como REALIZADO
        turno.setEstado("REALIZADO");
        turnoRepo.save(turno);

        // Crear la primera etapa de procesamiento (PESAJE, EN_PROCESO).
        // El lote en cuarto frío se crea automáticamente cuando el
        // procesamiento completa la etapa CONGELAMIENTO.
        Procesamiento pesaje = new Procesamiento();
        pesaje.setEtapa("PESAJE");
        pesaje.setEstado("EN_PROCESO");
        pesaje.setFechaInicio(LocalDateTime.now());
        pesaje.setRecepcion(saved);
        procesamientoRepo.save(pesaje);

        return toResponse(saved);
    }

    // ── Listar todas ──────────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<RecepcionResponseDTO> listarTodas() {
        return recepcionRepo.findAllByOrderByFechaHoraDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Listar por productor ──────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<RecepcionResponseDTO> listarPorProductor(Integer idProductor) {
        return recepcionRepo
                .findByProductor_IdProductorOrderByFechaHoraDesc(idProductor)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Listar sin pago PAGADO por productor ──────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<RecepcionResponseDTO> listarSinPagoPorProductor(Integer idProductor) {
        return recepcionRepo
                .findSinPagoPorProductor(idProductor)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Obtener por ID ────────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public RecepcionResponseDTO obtenerPorId(Integer id) {
        Recepcion r = recepcionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recepción no encontrada: " + id));
        return toResponse(r);
    }

    // ── Mapeo entidad → DTO ───────────────────────────────────────────────────
    private RecepcionResponseDTO toResponse(Recepcion r) {
        RecepcionResponseDTO dto = new RecepcionResponseDTO();
        dto.setIdRecepcion(r.getIdRecepcion());
        dto.setFechaHora(r.getFechaHora());
        dto.setKilosRecibidos(r.getKilosRecibidos());
        dto.setObservaciones(r.getObservaciones());

        if (r.getProductor() != null) {
            dto.setIdProductor(r.getProductor().getIdProductor());
            dto.setNombreProductor(
                r.getProductor().getNombre1() + " " + r.getProductor().getApellido1());
        }

        if (r.getTurnoPesca() != null) {
            dto.setIdTurno(r.getTurnoPesca().getIdTurno());
        }

        return dto;
    }
}
