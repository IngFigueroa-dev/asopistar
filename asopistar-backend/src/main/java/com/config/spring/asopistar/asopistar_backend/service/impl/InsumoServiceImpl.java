package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.InsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.InsumoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Insumo;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.InsumoRepository;
import com.config.spring.asopistar.asopistar_backend.service.InsumoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
 
@Service @RequiredArgsConstructor
public class InsumoServiceImpl implements InsumoService {
 
    private final InsumoRepository insumoRepository;
 
    @Override
    public List<InsumoResponseDTO> listarTodos() {
        return insumoRepository.findAll().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public List<InsumoResponseDTO> listarConBajoStock() {
        return insumoRepository.findInsumosConBajoStock().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public InsumoResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(insumoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Insumo no encontrado con id: " + id)));
    }
 
    @Override @Transactional
    public InsumoResponseDTO crear(InsumoRequestDTO dto) {
        Insumo i = Insumo.builder()
            .nombre(dto.getNombre()).tipo(dto.getTipo())
            .unidadMedida(dto.getUnidadMedida())
            .precioUnitario(dto.getPrecioUnitario())
            .stockActual(dto.getStockActual())
            .stockMinimo(dto.getStockMinimo())
            .build();
        return toResponseDTO(insumoRepository.save(i));
    }
 
    @Override @Transactional
    public InsumoResponseDTO actualizar(Integer id, InsumoRequestDTO dto) {
        Insumo i = insumoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Insumo no encontrado con id: " + id));
        i.setNombre(dto.getNombre()); i.setPrecioUnitario(dto.getPrecioUnitario());
        i.setStockActual(dto.getStockActual());
        i.setStockMinimo(dto.getStockMinimo());
        return toResponseDTO(insumoRepository.save(i));
    }
 
    private InsumoResponseDTO toResponseDTO(Insumo i) {
        return InsumoResponseDTO.builder()
            .idInsumo(i.getIdInsumo()).nombre(i.getNombre())
            .tipo(i.getTipo()).unidadMedida(i.getUnidadMedida())
            .precioUnitario(i.getPrecioUnitario())
            .stockActual(i.getStockActual()).stockMinimo(i.getStockMinimo())
            // bajoStock: true si stockActual <= stockMinimo
            .bajoStock(i.getStockActual().compareTo(i.getStockMinimo()) <= 0)
            .build();
    }
}
