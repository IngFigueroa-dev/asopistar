package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.IngresoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.PagoIngresoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.IngresoEstadisticasDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.IngresoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoIngresoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.*;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.*;
import com.config.spring.asopistar.asopistar_backend.service.IngresoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class IngresoServiceImpl implements IngresoService {

    private final IngresoRepository       ingresoRepo;
    private final PagoIngresoRepository   pagoIngresoRepo;
    private final ClienteRepository       clienteRepo;
    private final EnvioRepository         envioRepo;
    private final VentaInsumoRepository   ventaInsumoRepo;
    private final MetodoPagoRepository    metodoPagoRepo;

    public IngresoServiceImpl(IngresoRepository ingresoRepo,
                              PagoIngresoRepository pagoIngresoRepo,
                              ClienteRepository clienteRepo,
                              EnvioRepository envioRepo,
                              VentaInsumoRepository ventaInsumoRepo,
                              MetodoPagoRepository metodoPagoRepo) {
        this.ingresoRepo     = ingresoRepo;
        this.pagoIngresoRepo = pagoIngresoRepo;
        this.clienteRepo     = clienteRepo;
        this.envioRepo       = envioRepo;
        this.ventaInsumoRepo = ventaInsumoRepo;
        this.metodoPagoRepo  = metodoPagoRepo;
    }

    // ── Crear ingreso ─────────────────────────────────────────────────────────

    @Override
    public IngresoResponseDTO crear(IngresoRequestDTO req) {

        LocalDateTime fecha = req.getFecha() != null ? req.getFecha() : LocalDateTime.now();

        // ✅ FIX: generar el número ANTES del INSERT usando el total actual + 1
        //    Así numero_ingreso nunca llega null a la BD.
        long totalExistentes = ingresoRepo.count();
        int anio = fecha.getYear();
        String numeroIngreso = String.format("ING-%d-%04d", anio, totalExistentes + 1);

        Ingreso ingreso = new Ingreso();
        ingreso.setNumeroIngreso(numeroIngreso);          // ← asignado ANTES de save()
        ingreso.setFecha(fecha);
        ingreso.setConcepto(req.getConcepto());
        ingreso.setTipoIngreso(req.getTipoIngreso());
        ingreso.setTipoOrigen(req.getTipoIngreso());      // compatibilidad campo original
        ingreso.setMonto(req.getValorTotal());             // compatibilidad campo original
        ingreso.setValorTotal(req.getValorTotal());
        ingreso.setValorPagado(BigDecimal.ZERO);
        ingreso.setSaldoPendiente(req.getValorTotal());
        ingreso.setEstadoPago("PENDIENTE");
        ingreso.setReferencia(req.getReferencia());

        // Resolver relaciones opcionales
        if (req.getIdCliente() != null) {
            Cliente c = clienteRepo.findById(req.getIdCliente())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Cliente no encontrado: " + req.getIdCliente()));
            ingreso.setCliente(c);
        }

        if (req.getIdEnvio() != null) {
            Envio e = envioRepo.findById(req.getIdEnvio())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Envío no encontrado: " + req.getIdEnvio()));
            ingreso.setEnvio(e);
        }

        if (req.getIdVentaInsumo() != null) {
            VentaInsumo v = ventaInsumoRepo.findById(req.getIdVentaInsumo())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Venta de insumo no encontrada: " + req.getIdVentaInsumo()));
            ingreso.setVentaInsumo(v);
        }

        // Un único INSERT con todos los campos ya completos
        Ingreso saved = ingresoRepo.save(ingreso);

        return toResponse(saved, List.of());
    }

    // ── Obtener por ID ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public IngresoResponseDTO obtenerPorId(Integer id) {
        Ingreso i = ingresoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingreso no encontrado: " + id));
        List<PagoIngresoResponseDTO> pagos = pagoIngresoRepo
                .findByIngreso_IdIngresoOrderByFechaPagoDesc(id)
                .stream().map(this::toPagoResponse).collect(Collectors.toList());
        return toResponse(i, pagos);
    }

    // ── Listar todos ──────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<IngresoResponseDTO> listarTodos() {
        return ingresoRepo.findAllByOrderByFechaDesc()
                .stream().map(i -> toResponse(i, List.of())).collect(Collectors.toList());
    }

    // ── Filtrar ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<IngresoResponseDTO> filtrar(String estado, String tipo, Integer idCliente,
                                            LocalDateTime desde, LocalDateTime hasta) {
        return ingresoRepo.filtrar(estado, tipo, idCliente, desde, hasta)
                .stream().map(i -> toResponse(i, List.of())).collect(Collectors.toList());
    }

    // ── Anular ────────────────────────────────────────────────────────────────

    @Override
    public IngresoResponseDTO anular(Integer id) {
        Ingreso i = ingresoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingreso no encontrado: " + id));
        if ("ANULADO".equals(i.getEstadoPago())) {
            throw new BusinessException("El ingreso #" + i.getNumeroIngreso() + " ya está anulado.");
        }
        i.setEstadoPago("ANULADO");
        return toResponse(ingresoRepo.save(i), List.of());
    }

    // ── Registrar abono ───────────────────────────────────────────────────────

    @Override
    public PagoIngresoResponseDTO registrarAbono(Integer idIngreso,
                                                  PagoIngresoRequestDTO req,
                                                  String emailUsuario) {
        Ingreso ingreso = ingresoRepo.findById(idIngreso)
                .orElseThrow(() -> new ResourceNotFoundException("Ingreso no encontrado: " + idIngreso));

        if ("ANULADO".equals(ingreso.getEstadoPago())) {
            throw new BusinessException("No se puede abonar a un ingreso anulado.");
        }
        if ("PAGADO".equals(ingreso.getEstadoPago())) {
            throw new BusinessException("El ingreso ya está completamente pagado.");
        }
        if (req.getValorPago().compareTo(ingreso.getSaldoPendiente()) > 0) {
            throw new BusinessException(
                    "El abono ($" + req.getValorPago() + ") supera el saldo pendiente ($"
                    + ingreso.getSaldoPendiente() + ").");
        }

        MetodoPago metodo = metodoPagoRepo.findById(req.getIdMetodoPago())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Método de pago no encontrado: " + req.getIdMetodoPago()));

        PagoIngreso pago = PagoIngreso.builder()
                .ingreso(ingreso)
                .valorPago(req.getValorPago())
                .metodoPago(metodo)
                .referencia(req.getReferencia())
                .observaciones(req.getObservaciones())
                .registradoPor(emailUsuario)
                .build();
        pagoIngresoRepo.save(pago);

        // Recalcular saldos
        BigDecimal nuevoValorPagado = ingreso.getValorPagado().add(req.getValorPago());
        BigDecimal nuevoSaldo       = ingreso.getValorTotal().subtract(nuevoValorPagado);
        ingreso.setValorPagado(nuevoValorPagado);
        ingreso.setSaldoPendiente(nuevoSaldo.max(BigDecimal.ZERO));
        ingreso.setEstadoPago(nuevoSaldo.compareTo(BigDecimal.ZERO) <= 0 ? "PAGADO" : "PARCIAL");
        ingresoRepo.save(ingreso);

        return toPagoResponse(pago);
    }

    // ── Listar pagos ──────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<PagoIngresoResponseDTO> listarPagos(Integer idIngreso) {
        if (!ingresoRepo.existsById(idIngreso)) {
            throw new ResourceNotFoundException("Ingreso no encontrado: " + idIngreso);
        }
        return pagoIngresoRepo.findByIngreso_IdIngresoOrderByFechaPagoDesc(idIngreso)
                .stream().map(this::toPagoResponse).collect(Collectors.toList());
    }

    // ── Estadísticas ──────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public IngresoEstadisticasDTO estadisticas() {
        Map<String, BigDecimal> porTipo = new HashMap<>();
        ingresoRepo.sumPorTipoIngreso().forEach(row -> {
            String tipo = row[0] != null ? row[0].toString() : "SIN_TIPO";
            BigDecimal suma = (BigDecimal) row[1];
            porTipo.put(tipo, suma);
        });

        return IngresoEstadisticasDTO.builder()
                .totalFacturado(ingresoRepo.sumValorTotal())
                .totalRecaudado(ingresoRepo.sumValorPagado())
                .totalPendiente(ingresoRepo.sumSaldoPendiente())
                .cantidadPendientes(ingresoRepo.countByEstado("PENDIENTE"))
                .cantidadParciales(ingresoRepo.countByEstado("PARCIAL"))
                .cantidadPagados(ingresoRepo.countByEstado("PAGADO"))
                .cantidadAnulados(ingresoRepo.countByEstado("ANULADO"))
                .porTipoIngreso(porTipo)
                .build();
    }

    // ── Helpers privados ──────────────────────────────────────────────────────

    private IngresoResponseDTO toResponse(Ingreso i, List<PagoIngresoResponseDTO> pagos) {
        IngresoResponseDTO dto = new IngresoResponseDTO();
        dto.setIdIngreso(i.getIdIngreso());
        dto.setNumeroIngreso(i.getNumeroIngreso());
        dto.setFecha(i.getFecha());
        dto.setConcepto(i.getConcepto());
        dto.setTipoIngreso(i.getTipoIngreso());
        dto.setTipoOrigen(i.getTipoOrigen());
        dto.setReferencia(i.getReferencia());
        dto.setValorTotal(i.getValorTotal());
        dto.setValorPagado(i.getValorPagado() != null ? i.getValorPagado() : BigDecimal.ZERO);
        dto.setSaldoPendiente(i.getSaldoPendiente() != null ? i.getSaldoPendiente() : i.getValorTotal());
        dto.setEstadoPago(i.getEstadoPago());
        dto.setFechaCreacion(i.getFechaCreacion());
        dto.setFechaActualizacion(i.getFechaActualizacion());

        if (i.getValorTotal() != null && i.getValorTotal().compareTo(BigDecimal.ZERO) > 0
                && i.getValorPagado() != null) {
            int pct = i.getValorPagado()
                       .multiply(BigDecimal.valueOf(100))
                       .divide(i.getValorTotal(), 0, RoundingMode.HALF_UP)
                       .intValue();
            dto.setPorcentajePagado(Math.min(pct, 100));
        } else {
            dto.setPorcentajePagado(0);
        }

        if (i.getCliente() != null) {
            Cliente c = i.getCliente();
            dto.setIdCliente(c.getIdCliente());
            dto.setRazonSocial(c.getRazonSocial());
            dto.setNit(c.getNit());
            dto.setTipoCliente(c.getTipoCliente());
            dto.setCiudadCliente(c.getCiudad());
        }

        if (i.getEnvio() != null)       dto.setIdEnvio(i.getEnvio().getIdEnvio());
        if (i.getVentaInsumo() != null) dto.setIdVentaInsumo(i.getVentaInsumo().getIdVentaInsumo());

        dto.setPagos(pagos);
        return dto;
    }

    private PagoIngresoResponseDTO toPagoResponse(PagoIngreso p) {
        PagoIngresoResponseDTO dto = new PagoIngresoResponseDTO();
        dto.setIdPagoIngreso(p.getIdPagoIngreso());
        dto.setIdIngreso(p.getIngreso().getIdIngreso());
        dto.setFechaPago(p.getFechaPago());
        dto.setValorPago(p.getValorPago());
        dto.setReferencia(p.getReferencia());
        dto.setObservaciones(p.getObservaciones());
        dto.setRegistradoPor(p.getRegistradoPor());
        if (p.getMetodoPago() != null) {
            dto.setIdMetodoPago(p.getMetodoPago().getIdMetodoPago());
            dto.setNombreMetodoPago(p.getMetodoPago().getNombre());
        }
        return dto;
    }
}
