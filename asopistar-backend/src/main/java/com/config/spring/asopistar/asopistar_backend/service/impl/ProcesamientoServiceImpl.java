package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.ProcesamientoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ProcesamientoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.LoteCuartoFrio;
import com.config.spring.asopistar.asopistar_backend.entity.Procesamiento;
import com.config.spring.asopistar.asopistar_backend.entity.Recepcion;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.LoteCuartoFrioRepository;
import com.config.spring.asopistar.asopistar_backend.repository.ProcesamientoRepository;
import com.config.spring.asopistar.asopistar_backend.service.ProcesamientoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProcesamientoServiceImpl implements ProcesamientoService {

    // 4 etapas — CONGELAMIENTO es la última.
    // Al completarla se crea el lote en el cuarto frío automáticamente.
    private static final List<String> ETAPAS = List.of(
            "PESAJE", "EVISCERADO", "LIMPIEZA", "CONGELAMIENTO"
    );

    private final ProcesamientoRepository procesamientoRepository;
    private final LoteCuartoFrioRepository loteCuartoFrioRepository;

    public ProcesamientoServiceImpl(
            ProcesamientoRepository procesamientoRepository,
            LoteCuartoFrioRepository loteCuartoFrioRepository) {
        this.procesamientoRepository = procesamientoRepository;
        this.loteCuartoFrioRepository = loteCuartoFrioRepository;
    }

    @Override
    public List<ProcesamientoResponseDTO> listarTodos() {
        return procesamientoRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProcesamientoResponseDTO> listarPorRecepcion(Integer idRecepcion) {
        return procesamientoRepository
                .findByRecepcionIdRecepcionOrderByFechaInicioAsc(idRecepcion)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProcesamientoResponseDTO buscarPorId(Integer id) {
        return mapToDTO(procesamientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Procesamiento no encontrado con id: " + id)));
    }

    @Override
    @Transactional
    public ProcesamientoResponseDTO avanzarEtapa(Integer idProcesamiento,
                                                  ProcesamientoRequestDTO dto) {

        Procesamiento actual = procesamientoRepository.findById(idProcesamiento)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Procesamiento no encontrado con id: " + idProcesamiento));

        if (!actual.getEstado().equals("EN_PROCESO")) {
            throw new BusinessException(
                    "Solo se puede avanzar una etapa EN_PROCESO. Estado actual: "
                    + actual.getEstado());
        }

        // Completar etapa actual
        actual.setEstado("COMPLETADO");
        actual.setFechaFin(LocalDateTime.now());
        actual.setResponsable(dto.getResponsable());
        actual.setObservaciones(dto.getObservaciones());
        procesamientoRepository.save(actual);

        int indexActual = ETAPAS.indexOf(actual.getEtapa());
        Recepcion recepcion = actual.getRecepcion();

        // ── CONGELAMIENTO completado → crear lote en cuarto frío ─────────────
        if (indexActual == ETAPAS.size() - 1) {
            long totalLotes = loteCuartoFrioRepository.count();
            String codigoLote = String.format("LOTE-%03d", totalLotes + 1);

            LoteCuartoFrio lote = new LoteCuartoFrio();
            lote.setCodigoLote(codigoLote);
            lote.setFechaIngreso(LocalDateTime.now());
            lote.setKilos(recepcion.getKilosRecibidos());
            lote.setEstado(true);                         // disponible por defecto
            lote.setEstadoDecision("PENDIENTE_DECISION"); // esperando decisión en Almacenamiento
            lote.setRecepcion(recepcion);
            loteCuartoFrioRepository.save(lote);

            return mapToDTO(actual);
        }

        // ── Etapa intermedia → crear la siguiente ────────────────────────────
        String siguienteEtapa = ETAPAS.get(indexActual + 1);

        Procesamiento siguiente = new Procesamiento();
        siguiente.setEtapa(siguienteEtapa);
        siguiente.setEstado("EN_PROCESO");
        siguiente.setFechaInicio(LocalDateTime.now());
        siguiente.setRecepcion(recepcion);

        return mapToDTO(procesamientoRepository.save(siguiente));
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private ProcesamientoResponseDTO mapToDTO(Procesamiento p) {
        Recepcion rec = p.getRecepcion();
        String nombreProductor = "";
        Double kilos = null;
        Integer idRecepcion = null;

        if (rec != null) {
            idRecepcion = rec.getIdRecepcion();
            kilos = rec.getKilosRecibidos() != null
                    ? rec.getKilosRecibidos().doubleValue() : null;
            if (rec.getProductor() != null) {
                var prod = rec.getProductor();
                nombreProductor = prod.getNombre1() + " " + prod.getApellido1();
            }
        }

        return ProcesamientoResponseDTO.builder()
                .idProcesamiento(p.getIdProcesamiento())
                .etapa(p.getEtapa())
                .estado(p.getEstado())
                .fechaInicio(p.getFechaInicio())
                .fechaFin(p.getFechaFin())
                .responsable(p.getResponsable())
                .observaciones(p.getObservaciones())
                .idRecepcion(idRecepcion)
                .kilosRecibidos(kilos)
                .nombreProductor(nombreProductor)
                .build();
    }
}