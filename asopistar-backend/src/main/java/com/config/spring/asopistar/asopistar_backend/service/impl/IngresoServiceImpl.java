package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.IngresoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.IngresoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Ingreso;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.IngresoRepository;
import com.config.spring.asopistar.asopistar_backend.repository.EnvioRepository;
import com.config.spring.asopistar.asopistar_backend.repository.VentaInsumoRepository;
import com.config.spring.asopistar.asopistar_backend.service.IngresoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
 
@Service @RequiredArgsConstructor
public class IngresoServiceImpl implements IngresoService {
 
    private final IngresoRepository ingresoRepository;
    private final EnvioRepository envioRepository;
    private final VentaInsumoRepository ventaInsumoRepository;
 
    @Override
    public List<IngresoResponseDTO> listarTodos() {
        return ingresoRepository.findAll().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public List<IngresoResponseDTO> listarPorPeriodo(
            LocalDateTime inicio, LocalDateTime fin) {
        return ingresoRepository.findByFechaBetween(inicio, fin)
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public IngresoResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(ingresoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Ingreso no encontrado con id: " + id)));
    }
 
    @Override @Transactional
    public IngresoResponseDTO crear(IngresoRequestDTO dto) {
        Ingreso.IngresoBuilder builder = Ingreso.builder()
            .fecha(dto.getFecha()).concepto(dto.getConcepto())
            .monto(dto.getMonto()).tipoOrigen(dto.getTipoOrigen());
        if (dto.getIdEnvio() != null)
            builder.envio(envioRepository.findById(dto.getIdEnvio())
                .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado")));
        if (dto.getIdVentaInsumo() != null)
            builder.ventaInsumo(ventaInsumoRepository.findById(dto.getIdVentaInsumo())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Venta de insumo no encontrada")));
        return toResponseDTO(ingresoRepository.save(builder.build()));
    }
 
    @Override
    public BigDecimal totalIngresosPorPeriodo(
            LocalDateTime inicio, LocalDateTime fin) {
        BigDecimal total = ingresoRepository
            .sumTotalIngresosPorPeriodo(inicio, fin);
        return total != null ? total : BigDecimal.ZERO;
    }
 
    private IngresoResponseDTO toResponseDTO(Ingreso i) {
        return IngresoResponseDTO.builder()
            .idIngreso(i.getIdIngreso()).fecha(i.getFecha())
            .concepto(i.getConcepto()).monto(i.getMonto())
            .tipoOrigen(i.getTipoOrigen())
            .idEnvio(i.getEnvio() != null ? i.getEnvio().getIdEnvio() : null)
            .idVentaInsumo(i.getVentaInsumo() != null
                ? i.getVentaInsumo().getIdVentaInsumo() : null)
            .build();
    }
}
