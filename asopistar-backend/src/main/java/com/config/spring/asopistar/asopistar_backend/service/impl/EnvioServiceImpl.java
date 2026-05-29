package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EnvioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.*;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.*;
import com.config.spring.asopistar.asopistar_backend.service.EnvioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnvioServiceImpl implements EnvioService {

    private final EnvioRepository            envioRepository;
    private final DetalleEnvioLoteRepository detalleRepository;
    private final LoteCuartoFrioRepository   loteRepository;
    private final ClienteRepository          clienteRepository;
    private final PuntoVentaRepository       puntoVentaRepository;

    public EnvioServiceImpl(
            EnvioRepository envioRepository,
            DetalleEnvioLoteRepository detalleRepository,
            LoteCuartoFrioRepository loteRepository,
            ClienteRepository clienteRepository,
            PuntoVentaRepository puntoVentaRepository) {
        this.envioRepository     = envioRepository;
        this.detalleRepository   = detalleRepository;
        this.loteRepository      = loteRepository;
        this.clienteRepository   = clienteRepository;
        this.puntoVentaRepository = puntoVentaRepository;
    }

    @Override
    public List<EnvioResponseDTO> listarTodos() {
        return envioRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EnvioResponseDTO buscarPorId(Integer id) {
        return mapToDTO(envioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Envío no encontrado con id: " + id)));
    }

    @Override
    @Transactional
    public EnvioResponseDTO crear(EnvioRequestDTO dto) {

        if (dto.getIdLotes() == null || dto.getIdLotes().isEmpty()) {
            throw new BusinessException("Debe seleccionar al menos un lote");
        }

        // 1. Validar y cargar lotes — deben estar ALMACENADOS y disponibles
        List<LoteCuartoFrio> lotes = new ArrayList<>();
        for (Integer idLote : dto.getIdLotes()) {
            LoteCuartoFrio lote = loteRepository.findById(idLote)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Lote no encontrado con id: " + idLote));
            if (!"ALMACENADO".equals(lote.getEstadoDecision())) {
                throw new BusinessException(
                        "El lote " + lote.getCodigoLote() +
                        " no está disponible. Estado: " + lote.getEstadoDecision());
            }
            lotes.add(lote);
        }

        // 2. Crear el envío
        Envio envio = new Envio();
        envio.setFechaEnvio(LocalDateTime.now());
        envio.setDestinoCiudad(dto.getDestinoCiudad());
        envio.setTipoDestino(dto.getTipoDestino().toUpperCase());
        envio.setEstado("PREPARADO");
        envio.setObservaciones(dto.getObservaciones());

        if ("CLIENTE".equalsIgnoreCase(dto.getTipoDestino())) {
            if (dto.getIdCliente() == null)
                throw new BusinessException("Debe seleccionar un cliente");
            Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Cliente no encontrado: " + dto.getIdCliente()));
            envio.setCliente(cliente);

        } else if ("PUNTO_VENTA".equalsIgnoreCase(dto.getTipoDestino())) {
            if (dto.getIdPunto() == null)
                throw new BusinessException("Debe seleccionar un punto de venta");
            PuntoVenta punto = puntoVentaRepository.findById(dto.getIdPunto())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Punto de venta no encontrado: " + dto.getIdPunto()));
            envio.setPuntoVenta(punto);
        }

        Envio envioGuardado = envioRepository.save(envio);

        // 3. Crear detalles y marcar lotes como DESPACHADOS
        for (LoteCuartoFrio lote : lotes) {
            DetalleEnvioLote detalle = new DetalleEnvioLote();
            detalle.setEnvio(envioGuardado);
            detalle.setLote(lote);
            detalle.setKilos(lote.getKilos());
            detalleRepository.save(detalle);

            // Marcar lote despachado
            lote.setEstado(false);
            lote.setEstadoDecision("DESPACHADO");
            lote.setEnvio(envioGuardado);
            loteRepository.save(lote);
        }

        return mapToDTO(envioGuardado);
    }

    @Override
    @Transactional
    public EnvioResponseDTO cambiarEstado(Integer id, String nuevoEstado) {
        List<String> estadosValidos = List.of("PREPARADO", "EN_CAMINO", "ENTREGADO");
        if (!estadosValidos.contains(nuevoEstado.toUpperCase())) {
            throw new BusinessException(
                    "Estado inválido. Use: PREPARADO, EN_CAMINO o ENTREGADO");
        }

        Envio envio = envioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Envío no encontrado con id: " + id));

        envio.setEstado(nuevoEstado.toUpperCase());
        return mapToDTO(envioRepository.save(envio));
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private EnvioResponseDTO mapToDTO(Envio e) {
        List<DetalleEnvioLote> detalles = detalleRepository.findByEnvioIdEnvio(e.getIdEnvio());

        BigDecimal totalKilos = detalles.stream()
                .map(DetalleEnvioLote::getKilos)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<EnvioResponseDTO.DetalleLoteDTO> detalleDTOs = detalles.stream()
                .map(d -> {
                    LoteCuartoFrio lote = d.getLote();
                    String nombreProductor = "";
                    if (lote.getRecepcion() != null && lote.getRecepcion().getProductor() != null) {
                        var p = lote.getRecepcion().getProductor();
                        nombreProductor = p.getNombre1() + " " + p.getApellido1();
                    }
                    return EnvioResponseDTO.DetalleLoteDTO.builder()
                            .idDetalle(d.getIdDetalle())
                            .idLote(lote.getIdLote())
                            .codigoLote(lote.getCodigoLote())
                            .kilos(d.getKilos())
                            .nombreProductor(nombreProductor)
                            .observaciones(d.getObservaciones())
                            .build();
                })
                .collect(Collectors.toList());

        return EnvioResponseDTO.builder()
                .idEnvio(e.getIdEnvio())
                .fechaEnvio(e.getFechaEnvio())
                .destinoCiudad(e.getDestinoCiudad())
                .tipoDestino(e.getTipoDestino())
                .estado(e.getEstado())
                .observaciones(e.getObservaciones())
                .idCliente(e.getCliente() != null ? e.getCliente().getIdCliente() : null)
                .nombreCliente(e.getCliente() != null
                        ? e.getCliente().getNombre1() + " " + e.getCliente().getApellido1() : null)
                .idPunto(e.getPuntoVenta() != null ? e.getPuntoVenta().getIdPunto() : null)
                .nombrePunto(e.getPuntoVenta() != null ? e.getPuntoVenta().getNombre() : null)
                .totalKilos(totalKilos)
                .totalLotes(detalles.size())
                .lotes(detalleDTOs)
                .build();
    }
}