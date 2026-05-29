package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.LoteDecisionRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.LoteCuartoFrioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.*;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.*;
import com.config.spring.asopistar.asopistar_backend.service.LoteCuartoFrioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoteCuartoFrioServiceImpl implements LoteCuartoFrioService {

    private final LoteCuartoFrioRepository loteCuartoFrioRepository;
    private final EnvioRepository          envioRepository;
    private final ClienteRepository        clienteRepository;
    private final PuntoVentaRepository     puntoVentaRepository;

    public LoteCuartoFrioServiceImpl(
            LoteCuartoFrioRepository loteCuartoFrioRepository,
            EnvioRepository envioRepository,
            ClienteRepository clienteRepository,
            PuntoVentaRepository puntoVentaRepository) {
        this.loteCuartoFrioRepository = loteCuartoFrioRepository;
        this.envioRepository          = envioRepository;
        this.clienteRepository        = clienteRepository;
        this.puntoVentaRepository     = puntoVentaRepository;
    }

    @Override
    public List<LoteCuartoFrioResponseDTO> listarTodos() {
        return loteCuartoFrioRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LoteCuartoFrioResponseDTO> listarDisponibles() {
        return loteCuartoFrioRepository.findByEstadoTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LoteCuartoFrioResponseDTO buscarPorId(Integer id) {
        return mapToDTO(loteCuartoFrioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Lote no encontrado con id: " + id)));
    }

    @Override
    @Transactional
    public LoteCuartoFrioResponseDTO procesarDecision(Integer idLote,
                                                       LoteDecisionRequestDTO dto) {

        LoteCuartoFrio lote = loteCuartoFrioRepository.findById(idLote)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Lote no encontrado con id: " + idLote));

        if (!"PENDIENTE_DECISION".equals(lote.getEstadoDecision())) {
            throw new BusinessException(
                    "Este lote ya tiene una decisión tomada: " + lote.getEstadoDecision());
        }

        if ("ALMACENAR".equalsIgnoreCase(dto.getDecision())) {
            // ── Almacenar en cuarto frío ─────────────────────────────────────
            lote.setEstado(true);                    // disponible
            lote.setEstadoDecision("ALMACENADO");
            loteCuartoFrioRepository.save(lote);

        } else if ("DESPACHAR".equalsIgnoreCase(dto.getDecision())) {
            // ── Despachar de inmediato ───────────────────────────────────────
            if (dto.getTipoDestino() == null || dto.getTipoDestino().isBlank()) {
                throw new BusinessException("Debe indicar el tipo de destino: CLIENTE o PUNTO_VENTA");
            }
            if (dto.getDestinoCiudad() == null || dto.getDestinoCiudad().isBlank()) {
                throw new BusinessException("Debe indicar la ciudad de destino");
            }

            // Crear envío en módulo de Logística
            Envio envio = new Envio();
            envio.setFechaEnvio(LocalDateTime.now());
            envio.setDestinoCiudad(dto.getDestinoCiudad());
            envio.setTipoDestino(dto.getTipoDestino().toUpperCase());
            envio.setEstado("EN_CAMINO");
            envio.setObservaciones(dto.getObservaciones());

            if ("CLIENTE".equalsIgnoreCase(dto.getTipoDestino())) {
                if (dto.getIdCliente() == null) {
                    throw new BusinessException("Debe seleccionar un cliente");
                }
                Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Cliente no encontrado con id: " + dto.getIdCliente()));
                envio.setCliente(cliente);

            } else if ("PUNTO_VENTA".equalsIgnoreCase(dto.getTipoDestino())) {
                if (dto.getIdPunto() == null) {
                    throw new BusinessException("Debe seleccionar un punto de venta");
                }
                PuntoVenta punto = puntoVentaRepository.findById(dto.getIdPunto())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Punto de venta no encontrado con id: " + dto.getIdPunto()));
                envio.setPuntoVenta(punto);
            } else {
                throw new BusinessException("Tipo de destino inválido. Use CLIENTE o PUNTO_VENTA");
            }

            Envio envioGuardado = envioRepository.save(envio);

            // Marcar lote como despachado
            lote.setEstado(false);                   // despachado
            lote.setEstadoDecision("DESPACHADO");
            lote.setEnvio(envioGuardado);
            loteCuartoFrioRepository.save(lote);

        } else {
            throw new BusinessException("Decisión inválida. Use ALMACENAR o DESPACHAR");
        }

        return mapToDTO(lote);
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private LoteCuartoFrioResponseDTO mapToDTO(LoteCuartoFrio lote) {
        String nombreProductor = "";
        Integer idRecepcion    = null;

        if (lote.getRecepcion() != null) {
            idRecepcion = lote.getRecepcion().getIdRecepcion();
            if (lote.getRecepcion().getProductor() != null) {
                var p = lote.getRecepcion().getProductor();
                nombreProductor = p.getNombre1() + " " + p.getApellido1();
            }
        }

        return LoteCuartoFrioResponseDTO.builder()
                .idLote(lote.getIdLote())
                .codigoLote(lote.getCodigoLote())
                .fechaIngreso(lote.getFechaIngreso())
                .kilos(lote.getKilos())
                .estado(lote.getEstado())
                .estadoDecision(lote.getEstadoDecision())
                .idRecepcion(idRecepcion)
                .nombreProductor(nombreProductor)
                .idEnvio(lote.getEnvio() != null ? lote.getEnvio().getIdEnvio() : null)
                .build();
    }
}