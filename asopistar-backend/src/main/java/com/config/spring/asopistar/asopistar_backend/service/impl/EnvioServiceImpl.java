package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioEntregaRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioTransporteRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EnvioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.*;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.*;
import com.config.spring.asopistar.asopistar_backend.service.EnvioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class EnvioServiceImpl implements EnvioService {

    private final EnvioRepository            envioRepository;
    private final DetalleEnvioLoteRepository detalleRepository;
    private final LoteCuartoFrioRepository   loteRepository;
    private final ClienteRepository          clienteRepository;
    private final PuntoVentaRepository       puntoVentaRepository;

    // ── ESTADOS VÁLIDOS ───────────────────────────────────────────────────────

    private static final List<String> ESTADOS_VALIDOS =
            List.of("PREPARADO", "EN_CAMINO", "ENTREGADO", "CANCELADO");

    // ── CONSULTAS ORIGINALES (sin cambios de comportamiento) ──────────────────

    @Override
    public List<EnvioResponseDTO> listarTodos() {
        return envioRepository.findAllByOrderByFechaEnvioDesc()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public EnvioResponseDTO buscarPorId(Integer id) {
        return mapToDTO(findOrThrow(id));
    }

    @Override
    public EnvioResponseDTO buscarPorGuia(String codigoGuia) {
        return mapToDTO(
            envioRepository.findByCodigoGuia(codigoGuia)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Envío no encontrado con guía: " + codigoGuia))
        );
    }

    @Override
    public List<EnvioResponseDTO> buscar(String query) {
        if (query == null || query.isBlank()) return listarTodos();
        return envioRepository.buscar(query.trim())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<EnvioResponseDTO> historialCliente(Integer idCliente) {
        return envioRepository
                .findTop10ByClienteIdClienteOrderByFechaEnvioDesc(idCliente)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<EnvioResponseDTO> historialPuntoVenta(Integer idPunto) {
        return envioRepository
                .findTop10ByPuntoVentaIdPuntoOrderByFechaEnvioDesc(idPunto)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // ── CREAR ENVÍO (lógica original intacta + nuevos campos opcionales) ──────

    @Override
    @Transactional
    public EnvioResponseDTO crear(EnvioRequestDTO dto) {

        if (dto.getIdLotes() == null || dto.getIdLotes().isEmpty()) {
            throw new BusinessException("Debe seleccionar al menos un lote.");
        }

        // 1. Validar y cargar lotes — deben estar ALMACENADOS
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

        // 2. Construir entidad
        Envio envio = new Envio();
        envio.setFechaEnvio(LocalDateTime.now());
        envio.setFechaPreparacion(LocalDateTime.now());
        envio.setDestinoCiudad(dto.getDestinoCiudad());
        envio.setTipoDestino(dto.getTipoDestino().toUpperCase());
        envio.setEstado("PREPARADO");
        envio.setObservaciones(dto.getObservaciones());

        // Campos de transporte opcionales al crear
        envio.setEmpresaTransportadora(dto.getEmpresaTransportadora());
        envio.setNombreConductor(dto.getNombreConductor());
        envio.setTelefonoConductor(dto.getTelefonoConductor());
        envio.setPlacaVehiculo(dto.getPlacaVehiculo());
        envio.setTipoVehiculo(dto.getTipoVehiculo());
        envio.setFechaEntregaEstimada(dto.getFechaEntregaEstimada());

        // 3. Asignar destino
        if ("CLIENTE".equalsIgnoreCase(dto.getTipoDestino())) {
            if (dto.getIdCliente() == null)
                throw new BusinessException("Debe seleccionar un cliente.");
            Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Cliente no encontrado: " + dto.getIdCliente()));
            if (!"ACTIVO".equals(cliente.getEstado()))
                throw new BusinessException("El cliente " + cliente.getRazonSocial()
                        + " no está activo. Estado: " + cliente.getEstado());
            envio.setCliente(cliente);

        } else if ("PUNTO_VENTA".equalsIgnoreCase(dto.getTipoDestino())) {
            if (dto.getIdPunto() == null)
                throw new BusinessException("Debe seleccionar un punto de venta.");
            PuntoVenta punto = puntoVentaRepository.findById(dto.getIdPunto())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Punto de venta no encontrado: " + dto.getIdPunto()));
            envio.setPuntoVenta(punto);
        } else {
            throw new BusinessException("Tipo de destino inválido. Use CLIENTE o PUNTO_VENTA.");
        }

        // 4. Guardar para obtener el ID y generar la guía
        Envio envioGuardado = envioRepository.save(envio);
        envioGuardado.setCodigoGuia(generarCodigoGuia(envioGuardado.getIdEnvio()));
        envioGuardado = envioRepository.save(envioGuardado);

        // 5. Crear detalles y marcar lotes como DESPACHADOS
        for (LoteCuartoFrio lote : lotes) {
            DetalleEnvioLote detalle = new DetalleEnvioLote();
            detalle.setEnvio(envioGuardado);
            detalle.setLote(lote);
            detalle.setKilos(lote.getKilos());
            detalleRepository.save(detalle);

            lote.setEstado(false);
            lote.setEstadoDecision("DESPACHADO");
            lote.setEnvio(envioGuardado);
            loteRepository.save(lote);
        }

        log.info("Envío creado: {} — {} lotes — {}",
                envioGuardado.getCodigoGuia(), lotes.size(), envioGuardado.getDestinoCiudad());
        return mapToDTO(envioGuardado);
    }

    // ── CAMBIAR ESTADO ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public EnvioResponseDTO cambiarEstado(Integer id, String nuevoEstado) {
        if (!ESTADOS_VALIDOS.contains(nuevoEstado.toUpperCase())) {
            throw new BusinessException(
                    "Estado inválido. Use: PREPARADO, EN_CAMINO, ENTREGADO o CANCELADO.");
        }

        Envio envio = findOrThrow(id);
        String estadoActual = envio.getEstado();

        // Validar transiciones permitidas
        if ("ENTREGADO".equals(estadoActual) || "CANCELADO".equals(estadoActual)) {
            throw new BusinessException(
                    "El envío ya está " + estadoActual + " y no puede cambiar de estado.");
        }
        if ("CANCELADO".equalsIgnoreCase(nuevoEstado) && "ENTREGADO".equals(estadoActual)) {
            throw new BusinessException("No se puede cancelar un envío ya entregado.");
        }

        envio.setEstado(nuevoEstado.toUpperCase());

        // Registrar fechas automáticamente según el estado
        if ("EN_CAMINO".equalsIgnoreCase(nuevoEstado) && envio.getFechaSalida() == null) {
            envio.setFechaSalida(LocalDateTime.now());
        }
        if ("ENTREGADO".equalsIgnoreCase(nuevoEstado) && envio.getFechaEntregaReal() == null) {
            envio.setFechaEntregaReal(LocalDateTime.now());
        }

        log.info("Envío {} cambió estado: {} → {}", envio.getCodigoGuia(), estadoActual, nuevoEstado);
        return mapToDTO(envioRepository.save(envio));
    }

    // ── ACTUALIZAR TRANSPORTE ─────────────────────────────────────────────────

    @Override
    @Transactional
    public EnvioResponseDTO actualizarTransporte(Integer id, EnvioTransporteRequestDTO request) {
        Envio envio = findOrThrow(id);

        if ("ENTREGADO".equals(envio.getEstado()) || "CANCELADO".equals(envio.getEstado())) {
            throw new BusinessException(
                    "No se puede actualizar el transporte de un envío " + envio.getEstado() + ".");
        }

        if (request.getEmpresaTransportadora() != null)
            envio.setEmpresaTransportadora(request.getEmpresaTransportadora());
        if (request.getNombreConductor() != null)
            envio.setNombreConductor(request.getNombreConductor());
        if (request.getTelefonoConductor() != null)
            envio.setTelefonoConductor(request.getTelefonoConductor());
        if (request.getPlacaVehiculo() != null)
            envio.setPlacaVehiculo(request.getPlacaVehiculo());
        if (request.getTipoVehiculo() != null)
            envio.setTipoVehiculo(request.getTipoVehiculo());
        if (request.getFechaEntregaEstimada() != null)
            envio.setFechaEntregaEstimada(request.getFechaEntregaEstimada());

        log.info("Transporte actualizado para envío: {}", envio.getCodigoGuia());
        return mapToDTO(envioRepository.save(envio));
    }

    // ── REGISTRAR EVIDENCIA DE ENTREGA ────────────────────────────────────────

    @Override
    @Transactional
    public EnvioResponseDTO registrarEntrega(Integer id, EnvioEntregaRequestDTO request) {
        Envio envio = findOrThrow(id);

        if (!"ENTREGADO".equals(envio.getEstado())) {
            throw new BusinessException(
                    "Solo se puede registrar evidencia de entrega en envíos con estado ENTREGADO.");
        }

        if (request.getNombreReceptor() != null)
            envio.setNombreReceptor(request.getNombreReceptor());
        if (request.getObservacionEntrega() != null)
            envio.setObservacionEntrega(request.getObservacionEntrega());

        log.info("Evidencia de entrega registrada para envío: {}", envio.getCodigoGuia());
        return mapToDTO(envioRepository.save(envio));
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private Envio findOrThrow(Integer id) {
        return envioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Envío no encontrado con id: " + id));
    }

    /**
     * Genera un código de guía único con el formato GUIA-YYYY-NNNNN.
     * Ejemplo: GUIA-2026-00042
     */
    private String generarCodigoGuia(Integer idEnvio) {
        String anio = String.valueOf(Year.now().getValue());
        String correlativo = String.format("%05d", idEnvio);
        return "GUIA-" + anio + "-" + correlativo;
    }

    // ── MAPPER ────────────────────────────────────────────────────────────────

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

        // Info enriquecida del destino
        EnvioResponseDTO.ClienteInfoDTO clienteInfo = null;
        String nombreCliente = null;
        if (e.getCliente() != null) {
            nombreCliente = e.getCliente().getRazonSocial();
            clienteInfo = EnvioResponseDTO.ClienteInfoDTO.builder()
                    .idCliente(e.getCliente().getIdCliente())
                    .razonSocial(e.getCliente().getRazonSocial())
                    .ciudad(e.getCliente().getCiudad())
                    .telefono(e.getCliente().getTelefono())
                    .email(e.getCliente().getCorreo())
                    .tipo(e.getCliente().getTipoCliente())
                    .build();
        }

        EnvioResponseDTO.PuntoVentaInfoDTO puntoInfo = null;
        if (e.getPuntoVenta() != null) {
            puntoInfo = EnvioResponseDTO.PuntoVentaInfoDTO.builder()
                    .idPunto(e.getPuntoVenta().getIdPunto())
                    .nombre(e.getPuntoVenta().getNombre())
                    .ciudad(e.getPuntoVenta().getCiudad())
                    .responsable(e.getPuntoVenta().getResponsable())
                    .telefono(e.getPuntoVenta().getTelefono())
                    .build();
        }

        return EnvioResponseDTO.builder()
                // Campos originales
                .idEnvio(e.getIdEnvio())
                .fechaEnvio(e.getFechaEnvio())
                .destinoCiudad(e.getDestinoCiudad())
                .tipoDestino(e.getTipoDestino())
                .estado(e.getEstado())
                .observaciones(e.getObservaciones())
                .idCliente(e.getCliente()    != null ? e.getCliente().getIdCliente()       : null)
                .nombreCliente(nombreCliente)
                .idPunto(e.getPuntoVenta()   != null ? e.getPuntoVenta().getIdPunto()      : null)
                .nombrePunto(e.getPuntoVenta() != null ? e.getPuntoVenta().getNombre()     : null)
                .totalKilos(totalKilos)
                .totalLotes(detalles.size())
                .lotes(detalleDTOs)
                // Campos nuevos
                .codigoGuia(e.getCodigoGuia())
                .fechaPreparacion(e.getFechaPreparacion())
                .fechaSalida(e.getFechaSalida())
                .fechaEntregaEstimada(e.getFechaEntregaEstimada())
                .fechaEntregaReal(e.getFechaEntregaReal())
                .empresaTransportadora(e.getEmpresaTransportadora())
                .nombreConductor(e.getNombreConductor())
                .telefonoConductor(e.getTelefonoConductor())
                .placaVehiculo(e.getPlacaVehiculo())
                .tipoVehiculo(e.getTipoVehiculo())
                .observacionEntrega(e.getObservacionEntrega())
                .nombreReceptor(e.getNombreReceptor())
                .clienteInfo(clienteInfo)
                .puntoVentaInfo(puntoInfo)
                .build();
    }
}
