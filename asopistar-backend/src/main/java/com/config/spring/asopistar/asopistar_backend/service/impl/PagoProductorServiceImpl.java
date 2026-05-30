package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.PagoProductorRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoEstadisticasResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoProductorResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.MetodoPago;
import com.config.spring.asopistar.asopistar_backend.entity.PagoProductor;
import com.config.spring.asopistar.asopistar_backend.entity.Productor;
import com.config.spring.asopistar.asopistar_backend.entity.Recepcion;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.MetodoPagoRepository;
import com.config.spring.asopistar.asopistar_backend.repository.PagoProductorRepository;
import com.config.spring.asopistar.asopistar_backend.repository.ProductorRepository;
import com.config.spring.asopistar.asopistar_backend.repository.RecepcionRepository;
import com.config.spring.asopistar.asopistar_backend.service.PagoProductorService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PagoProductorServiceImpl implements PagoProductorService {

    private final PagoProductorRepository pagoRepo;
    private final ProductorRepository     productorRepo;
    private final RecepcionRepository     recepcionRepo;
    private final MetodoPagoRepository    metodoPagoRepo;

    public PagoProductorServiceImpl(PagoProductorRepository pagoRepo,
                                    ProductorRepository productorRepo,
                                    RecepcionRepository recepcionRepo,
                                    MetodoPagoRepository metodoPagoRepo) {
        this.pagoRepo       = pagoRepo;
        this.productorRepo  = productorRepo;
        this.recepcionRepo  = recepcionRepo;
        this.metodoPagoRepo = metodoPagoRepo;
    }

    // ─── Registrar nuevo pago ──────────────────────────────────────────────────

    @Override
    public PagoProductorResponseDTO registrarPago(PagoProductorRequestDTO request) {

        // 1. Verificar que la recepción no tenga ya un pago PAGADO
        if (pagoRepo.existsByRecepcion_IdRecepcionAndEstado(request.getIdRecepcion(), "PAGADO")) {
            throw new BusinessException(
                "La recepción #" + request.getIdRecepcion() + " ya tiene un pago registrado y completado.");
        }

        // 2. Verificar que no exista ya un pago PENDIENTE para la misma recepción
        pagoRepo.findByRecepcion_IdRecepcion(request.getIdRecepcion()).ifPresent(p -> {
            if ("PENDIENTE".equals(p.getEstado())) {
                throw new BusinessException(
                    "Ya existe un pago PENDIENTE para la recepción #" + request.getIdRecepcion()
                    + ". Use PATCH /pagos-productor/" + p.getIdPago() + "/marcar-pagado para completarlo.");
            }
        });

        // 3. Cargar entidades relacionadas
        Productor productor = productorRepo.findById(request.getIdProductor())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Productor no encontrado con ID: " + request.getIdProductor()));

        Recepcion recepcion = recepcionRepo.findById(request.getIdRecepcion())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recepción no encontrada con ID: " + request.getIdRecepcion()));

        MetodoPago metodoPago = metodoPagoRepo.findById(request.getIdMetodoPago())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Método de pago no encontrado con ID: " + request.getIdMetodoPago()));

        // 4. Validar que la recepción pertenezca al productor indicado
        if (!recepcion.getProductor().getIdProductor().equals(request.getIdProductor())) {
            throw new BusinessException(
                "La recepción #" + request.getIdRecepcion() +
                " no pertenece al productor #" + request.getIdProductor() + ".");
        }

        // 5. Calcular monto: kilosPagados × precioKg
        BigDecimal monto = request.getKilosPagados()
                .multiply(request.getPrecioKg())
                .setScale(2, RoundingMode.HALF_UP);

        // 6. Construir y persistir la entidad
        PagoProductor pago = new PagoProductor();
        pago.setFechaPago(request.getFechaPago() != null ? request.getFechaPago() : LocalDateTime.now());
        pago.setMonto(monto);
        pago.setPrecioKg(request.getPrecioKg());
        pago.setKilosPagados(request.getKilosPagados());
        pago.setEstado("PENDIENTE");
        pago.setProductor(productor);
        pago.setRecepcion(recepcion);
        pago.setMetodoPago(metodoPago);

        PagoProductor saved = pagoRepo.save(pago);
        return toResponse(saved);
    }

    // ─── Listar con filtros ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<PagoProductorResponseDTO> listarPagos(String estado, Integer idProductor) {
        return pagoRepo.findAllWithFilters(estado, idProductor)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagoProductorResponseDTO> listarPendientes() {
        return pagoRepo.findByEstado("PENDIENTE")
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── Obtener por ID ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagoProductorResponseDTO obtenerPorId(Integer id) {
        PagoProductor pago = pagoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado con ID: " + id));
        return toResponse(pago);
    }

    // ─── Marcar como pagado ────────────────────────────────────────────────────

    @Override
    public PagoProductorResponseDTO marcarComoPagado(Integer id) {
        PagoProductor pago = pagoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado con ID: " + id));

        if ("PAGADO".equals(pago.getEstado())) {
            throw new BusinessException("El pago #" + id + " ya está marcado como PAGADO.");
        }

        pago.setEstado("PAGADO");
        pago.setFechaPago(LocalDateTime.now()); // Se actualiza la fecha efectiva de pago
        return toResponse(pagoRepo.save(pago));
    }

    // ─── Estadísticas ──────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagoEstadisticasResponseDTO obtenerEstadisticas() {
        return new PagoEstadisticasResponseDTO(
                pagoRepo.sumTotalPagado(),
                pagoRepo.sumTotalPendiente(),
                pagoRepo.countPagados(),
                pagoRepo.countPendientes(),
                pagoRepo.avgMonto().setScale(2, RoundingMode.HALF_UP)
        );
    }

    // ─── Mapeo entidad → DTO ───────────────────────────────────────────────────

    private PagoProductorResponseDTO toResponse(PagoProductor p) {
        PagoProductorResponseDTO dto = new PagoProductorResponseDTO();
        dto.setIdPago(p.getIdPago());
        dto.setFechaPago(p.getFechaPago());
        dto.setMonto(p.getMonto());
        dto.setPrecioKg(p.getPrecioKg());
        dto.setKilosPagados(p.getKilosPagados());
        dto.setEstado(p.getEstado());

        // Datos del productor
        Productor prod = p.getProductor();
        dto.setIdProductor(prod.getIdProductor());
        dto.setNombreProductor(prod.getNombre1() + " " + prod.getApellido1());
        dto.setDocumentoProductor(prod.getDocumento());

        // Datos de la recepción
        Recepcion rec = p.getRecepcion();
        dto.setIdRecepcion(rec.getIdRecepcion());
        dto.setFechaRecepcion(rec.getFechaHora());
        dto.setKilosRecibidos(rec.getKilosRecibidos());

        // Método de pago
        MetodoPago mp = p.getMetodoPago();
        dto.setIdMetodoPago(mp.getIdMetodoPago());
        dto.setNombreMetodoPago(mp.getNombre());

        return dto;
    }
}
