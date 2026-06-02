package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.DetalleVentaInsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.VentaInsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DetalleVentaInsumoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.VentaInsumoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.*;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.*;
import com.config.spring.asopistar.asopistar_backend.service.VentaInsumoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VentaInsumoServiceImpl implements VentaInsumoService {

    private final VentaInsumoRepository     ventaInsumoRepository;
    private final DetalleVentaInsumoRepository detalleRepo;
    private final InsumoRepository          insumoRepository;
    private final ProductorRepository       productorRepository;
    private final UsuarioRepository         usuarioRepository;
    private final MovimientoInsumoRepository movimientoRepo;

    @Override
    public List<VentaInsumoResponseDTO> listarTodas() {
        return ventaInsumoRepository.findAllWithDetalles()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<VentaInsumoResponseDTO> listarPorProductor(Integer idProductor) {
        return ventaInsumoRepository.findByProductorIdProductor(idProductor)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public VentaInsumoResponseDTO buscarPorId(Integer id) {
        return toResponse(findVentaOrThrow(id));
    }

    /**
     * Registra una venta completa:
     * 1. Valida stock de cada ítem
     * 2. Crea VentaInsumo
     * 3. Crea cada DetalleVentaInsumo
     * 4. Descuenta stock de cada insumo
     * 5. Registra movimiento SALIDA/VENTA por insumo
     */
    @Override
    @Transactional
    public VentaInsumoResponseDTO registrar(VentaInsumoRequestDTO dto) {
        Productor productor = productorRepository.findById(dto.getIdProductor())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Productor no encontrado: " + dto.getIdProductor()));

        // Validación de stock antes de persistir nada
        for (DetalleVentaInsumoRequestDTO item : dto.getItems()) {
            Insumo insumo = insumoRepository.findById(item.getIdInsumo())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Insumo no encontrado: " + item.getIdInsumo()));

            if (!"ACTIVO".equals(insumo.getEstado())) {
                throw new BusinessException(
                        "El insumo " + insumo.getNombre() + " no está activo.");
            }
            if (insumo.getStockActual().compareTo(BigDecimal.valueOf(item.getCantidad())) < 0) {
                throw new BusinessException(
                        "Stock insuficiente para " + insumo.getNombre()
                        + ". Disponible: " + insumo.getStockActual()
                        + " — Solicitado: " + item.getCantidad());
            }
        }

        // Crear cabecera de la venta (total se calcula acumulando detalles)
        VentaInsumo venta = VentaInsumo.builder()
                .fecha(LocalDateTime.now())
                .total(BigDecimal.ZERO)
                .estadoPagado(dto.getEstadoPagado())
                .productor(productor)
                .build();
        venta = ventaInsumoRepository.save(venta);

        BigDecimal totalVenta = BigDecimal.ZERO;
        List<DetalleVentaInsumo> detalles = new ArrayList<>();
        Usuario usuarioActual = getUsuarioAutenticado();

        int seq = 1;
        for (DetalleVentaInsumoRequestDTO item : dto.getItems()) {
            Insumo insumo = insumoRepository.findById(item.getIdInsumo()).get();

            BigDecimal subtotal = insumo.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(item.getCantidad()));
            totalVenta = totalVenta.add(subtotal);

            // Detalle con PK compuesta
            DetalleVentaInsumoId pk = new DetalleVentaInsumoId(seq++, venta.getIdVentaInsumo());
            DetalleVentaInsumo detalle = DetalleVentaInsumo.builder()
                    .id(pk)
                    .ventaInsumo(venta)
                    .insumo(insumo)
                    .cantidad(item.getCantidad())
                    .precioUnitario(insumo.getPrecioUnitario())
                    .subtotal(subtotal)
                    .build();
            detalles.add(detalleRepo.save(detalle));

            // Descontar stock y registrar movimiento
            BigDecimal stockAntes = insumo.getStockActual();
            insumo.setStockActual(stockAntes.subtract(BigDecimal.valueOf(item.getCantidad())));
            insumoRepository.save(insumo);

            MovimientoInsumo mov = MovimientoInsumo.builder()
                    .fecha(LocalDateTime.now())
                    .tipoMovimiento("SALIDA")
                    .motivo("VENTA")
                    .cantidad(BigDecimal.valueOf(item.getCantidad()))
                    .stockAntes(stockAntes)
                    .stockDespues(insumo.getStockActual())
                    .observacion("Venta #" + venta.getIdVentaInsumo()
                                 + " a productor: " + productor.getNombre1()
                                 + " " + productor.getApellido1())
                    .insumo(insumo)
                    .usuario(usuarioActual)
                    .ventaInsumo(venta)
                    .build();
            movimientoRepo.save(mov);
        }

        // Actualizar total en cabecera
        venta.setTotal(totalVenta);
        venta = ventaInsumoRepository.save(venta);

        VentaInsumo ventaFinal = venta;
        ventaFinal.setDetalles(detalles);
        return toResponse(ventaFinal);
    }

    @Override
    @Transactional
    public VentaInsumoResponseDTO marcarPagado(Integer id) {
        VentaInsumo venta = findVentaOrThrow(id);
        if ("PAGADO".equals(venta.getEstadoPagado())) {
            throw new BusinessException("La venta ya está marcada como pagada.");
        }
        venta.setEstadoPagado("PAGADO");
        return toResponse(ventaInsumoRepository.save(venta));
    }

    // ── Helpers ────────────────────────────────────────────────

    private VentaInsumo findVentaOrThrow(Integer id) {
        return ventaInsumoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Venta de insumo no encontrada: " + id));
    }

    private Usuario getUsuarioAutenticado() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario autenticado no encontrado: " + email));
    }

    private VentaInsumoResponseDTO toResponse(VentaInsumo v) {
        List<DetalleVentaInsumoResponseDTO> items = new ArrayList<>();
        if (v.getDetalles() != null) {
            items = v.getDetalles().stream().map(d ->
                DetalleVentaInsumoResponseDTO.builder()
                    .idDetalleVenta(d.getId().getIdDetalleVenta())
                    .idVentaInsumo(d.getId().getIdVentaInsumo())
                    .idInsumo(d.getInsumo().getIdInsumo())
                    .nombreInsumo(d.getInsumo().getNombre())
                    .tipo(d.getInsumo().getTipo())
                    .unidadMedida(d.getInsumo().getUnidadMedida())
                    .cantidad(d.getCantidad())
                    .precioUnitario(d.getPrecioUnitario())
                    .subtotal(d.getSubtotal())
                    .build()
            ).collect(Collectors.toList());
        }

        String nombreProductor = "";
        if (v.getProductor() != null) {
            nombreProductor = v.getProductor().getNombre1() + " "
                    + v.getProductor().getApellido1();
        }

        return VentaInsumoResponseDTO.builder()
                .idVentaInsumo(v.getIdVentaInsumo())
                .fecha(v.getFecha())
                .total(v.getTotal())
                .estadoPagado(v.getEstadoPagado())
                .idProductor(v.getProductor() != null ? v.getProductor().getIdProductor() : null)
                .nombreProductor(nombreProductor)
                .items(items)
                .build();
    }
}
