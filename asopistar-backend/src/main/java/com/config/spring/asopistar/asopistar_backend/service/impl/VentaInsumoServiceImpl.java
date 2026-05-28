package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.VentaInsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.VentaInsumoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.VentaInsumo;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.VentaInsumoRepository;
import com.config.spring.asopistar.asopistar_backend.repository.ProductorRepository;
import com.config.spring.asopistar.asopistar_backend.service.VentaInsumoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
 
@Service @RequiredArgsConstructor
public class VentaInsumoServiceImpl implements VentaInsumoService {
 
    private final VentaInsumoRepository ventaInsumoRepository;
    private final ProductorRepository productorRepository;
 
    @Override
    public List<VentaInsumoResponseDTO> listarTodos() {
        return ventaInsumoRepository.findAll().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public List<VentaInsumoResponseDTO> listarPorProductor(Integer idProductor) {
        return ventaInsumoRepository.findByProductorIdProductor(idProductor)
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public List<VentaInsumoResponseDTO> listarPendientesPago() {
        return ventaInsumoRepository.findByEstadoPagado("PENDIENTE")
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public VentaInsumoResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(ventaInsumoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Venta de insumo no encontrada con id: " + id)));
    }
 
    @Override @Transactional
    public VentaInsumoResponseDTO crear(VentaInsumoRequestDTO dto) {
        var productor = productorRepository.findById(dto.getIdProductor())
            .orElseThrow(() -> new ResourceNotFoundException("Productor no encontrado"));
        VentaInsumo v = VentaInsumo.builder()
            .fecha(dto.getFecha()).total(dto.getTotal())
            .estadoPagado(dto.getEstadoPagado()).productor(productor)
            .build();
        return toResponseDTO(ventaInsumoRepository.save(v));
    }
 
    @Override @Transactional
    public VentaInsumoResponseDTO actualizarEstadoPago(Integer id, String estado) {
        VentaInsumo v = ventaInsumoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Venta de insumo no encontrada con id: " + id));
        v.setEstadoPagado(estado);
        return toResponseDTO(ventaInsumoRepository.save(v));
    }
 
    private VentaInsumoResponseDTO toResponseDTO(VentaInsumo v) {
        return VentaInsumoResponseDTO.builder()
            .idVentaInsumo(v.getIdVentaInsumo())
            .fecha(v.getFecha()).total(v.getTotal())
            .estadoPagado(v.getEstadoPagado())
            .idProductor(v.getProductor().getIdProductor())
            .nombreProductor(v.getProductor().getNombre1()
                + " " + v.getProductor().getApellido1())
            .build();
    }
}
