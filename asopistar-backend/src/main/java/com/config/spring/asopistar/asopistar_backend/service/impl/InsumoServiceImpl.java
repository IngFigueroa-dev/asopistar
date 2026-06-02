package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.InsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.InsumoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Insumo;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.InsumoRepository;
import com.config.spring.asopistar.asopistar_backend.service.InsumoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsumoServiceImpl implements InsumoService {

    private final InsumoRepository insumoRepository;

    @Override
    public List<InsumoResponseDTO> listarTodos() {
        return insumoRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<InsumoResponseDTO> listarActivos() {
        return insumoRepository.findByEstado("ACTIVO")
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<InsumoResponseDTO> listarConBajoStock() {
        return insumoRepository.findBajoStock()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public InsumoResponseDTO buscarPorId(Integer id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public InsumoResponseDTO crear(InsumoRequestDTO dto) {
        // Código único si se envía
        if (dto.getCodigo() != null && !dto.getCodigo().isBlank()) {
            if (insumoRepository.existsByCodigo(dto.getCodigo())) {
                throw new BusinessException("Ya existe un insumo con el código " + dto.getCodigo());
            }
        }

        Insumo insumo = Insumo.builder()
                .codigo(dto.getCodigo())
                .nombre(dto.getNombre())
                .tipo(dto.getTipo())
                .unidadMedida(derivarUnidadMedida(dto.getTipo()))
                .descripcion(dto.getDescripcion())
                .precioUnitario(dto.getPrecioUnitario())
                .stockActual(dto.getStockActual())
                .stockMinimo(dto.getStockMinimo())
                .estado(dto.getEstado() != null ? dto.getEstado() : "ACTIVO")
                .fechaCreacion(LocalDate.now())
                .build();

        return toResponse(insumoRepository.save(insumo));
    }

    @Override
    @Transactional
    public InsumoResponseDTO actualizar(Integer id, InsumoRequestDTO dto) {
        Insumo insumo = findOrThrow(id);

        // Validar unicidad de código si cambió
        if (dto.getCodigo() != null && !dto.getCodigo().isBlank()
                && !dto.getCodigo().equals(insumo.getCodigo())) {
            if (insumoRepository.existsByCodigo(dto.getCodigo())) {
                throw new BusinessException("Ya existe un insumo con el código " + dto.getCodigo());
            }
        }

        insumo.setCodigo(dto.getCodigo());
        insumo.setNombre(dto.getNombre());
        insumo.setTipo(dto.getTipo());
        insumo.setUnidadMedida(derivarUnidadMedida(dto.getTipo()));
        insumo.setDescripcion(dto.getDescripcion());
        insumo.setPrecioUnitario(dto.getPrecioUnitario());
        insumo.setStockActual(dto.getStockActual());
        insumo.setStockMinimo(dto.getStockMinimo());
        if (dto.getEstado() != null) insumo.setEstado(dto.getEstado());

        return toResponse(insumoRepository.save(insumo));
    }

    @Override
    @Transactional
    public InsumoResponseDTO desactivar(Integer id) {
        Insumo insumo = findOrThrow(id);
        insumo.setEstado("INACTIVO");
        return toResponse(insumoRepository.save(insumo));
    }

    // ── Helpers ────────────────────────────────────────────────

    private Insumo findOrThrow(Integer id) {
        return insumoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Insumo no encontrado con id: " + id));
    }

    /**
     * Deriva la unidad de medida desde el tipo.
     * ALEVINO  -> "unidad" (cantidad de peces)
     * CONCENTRADO -> "bulto"
     * OTRO        -> "unidad"
     */
    private String derivarUnidadMedida(String tipo) {
        if ("CONCENTRADO".equals(tipo)) return "bulto";
        return "unidad";
    }

    private InsumoResponseDTO toResponse(Insumo i) {
        return InsumoResponseDTO.builder()
                .idInsumo(i.getIdInsumo())
                .codigo(i.getCodigo())
                .nombre(i.getNombre())
                .tipo(i.getTipo())
                .unidadMedida(i.getUnidadMedida())
                .descripcion(i.getDescripcion())
                .precioUnitario(i.getPrecioUnitario())
                .stockActual(i.getStockActual())
                .stockMinimo(i.getStockMinimo())
                .estado(i.getEstado())
                .fechaCreacion(i.getFechaCreacion())
                .bajoStock(i.getStockActual().compareTo(i.getStockMinimo()) <= 0)
                .build();
    }
}
