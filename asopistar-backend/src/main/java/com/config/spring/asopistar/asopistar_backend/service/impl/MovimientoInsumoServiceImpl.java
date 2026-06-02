package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.MovimientoInsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.MovimientoInsumoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Insumo;
import com.config.spring.asopistar.asopistar_backend.entity.MovimientoInsumo;
import com.config.spring.asopistar.asopistar_backend.entity.Usuario;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.*;
import com.config.spring.asopistar.asopistar_backend.service.MovimientoInsumoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovimientoInsumoServiceImpl implements MovimientoInsumoService {

    private final MovimientoInsumoRepository movimientoRepo;
    private final InsumoRepository           insumoRepository;
    private final UsuarioRepository          usuarioRepository;

    @Override
    public List<MovimientoInsumoResponseDTO> listarTodos() {
        return movimientoRepo.findAllByOrderByFechaDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<MovimientoInsumoResponseDTO> listarPorInsumo(Integer idInsumo) {
        return movimientoRepo.findByInsumoIdInsumoOrderByFechaDesc(idInsumo)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Registra un movimiento manual (entradas, ajustes, pérdidas, daños).
     * Las salidas por VENTA son registradas automáticamente por VentaInsumoService.
     */
    @Override
    @Transactional
    public MovimientoInsumoResponseDTO registrar(MovimientoInsumoRequestDTO dto) {
        Insumo insumo = insumoRepository.findById(dto.getIdInsumo())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Insumo no encontrado: " + dto.getIdInsumo()));

        if (!"ACTIVO".equals(insumo.getEstado())) {
            throw new BusinessException("No se pueden registrar movimientos en insumos inactivos.");
        }

        BigDecimal stockAntes = insumo.getStockActual();
        BigDecimal cantidad    = dto.getCantidad();
        BigDecimal stockDespues;

        switch (dto.getTipoMovimiento()) {
            case "ENTRADA":
                stockDespues = stockAntes.add(cantidad);
                break;
            case "SALIDA":
                if (stockAntes.compareTo(cantidad) < 0) {
                    throw new BusinessException(
                            "Stock insuficiente. Disponible: " + stockAntes
                            + " — Solicitado: " + cantidad);
                }
                stockDespues = stockAntes.subtract(cantidad);
                break;
            case "AJUSTE":
                // El ajuste puede subir o bajar; cantidad es el nuevo stock absoluto
                stockDespues = cantidad;
                cantidad = stockDespues.subtract(stockAntes).abs();
                break;
            default:
                throw new BusinessException("Tipo de movimiento no reconocido.");
        }

        insumo.setStockActual(stockDespues);
        insumoRepository.save(insumo);

        Usuario usuario = getUsuarioAutenticado();

        MovimientoInsumo mov = MovimientoInsumo.builder()
                .fecha(LocalDateTime.now())
                .tipoMovimiento(dto.getTipoMovimiento())
                .motivo(dto.getMotivo())
                .cantidad(cantidad)
                .stockAntes(stockAntes)
                .stockDespues(stockDespues)
                .observacion(dto.getObservacion())
                .insumo(insumo)
                .usuario(usuario)
                .build();

        return toResponse(movimientoRepo.save(mov));
    }

    // ── Helpers ────────────────────────────────────────────────

    private Usuario getUsuarioAutenticado() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario autenticado no encontrado: " + email));
    }

    private MovimientoInsumoResponseDTO toResponse(MovimientoInsumo m) {
        return MovimientoInsumoResponseDTO.builder()
                .idMovimiento(m.getIdMovimiento())
                .fecha(m.getFecha())
                .tipoMovimiento(m.getTipoMovimiento())
                .motivo(m.getMotivo())
                .cantidad(m.getCantidad())
                .stockAntes(m.getStockAntes())
                .stockDespues(m.getStockDespues())
                .observacion(m.getObservacion())
                .idInsumo(m.getInsumo().getIdInsumo())
                .nombreInsumo(m.getInsumo().getNombre())
                .tipoInsumo(m.getInsumo().getTipo())
                .idUsuario(m.getUsuario().getIdUsuario())
                .nombreUsuario(m.getUsuario().getNombre1() + " " + m.getUsuario().getApellido1())
                .idVentaInsumo(m.getVentaInsumo() != null ? m.getVentaInsumo().getIdVentaInsumo() : null)
                .build();
    }
}
