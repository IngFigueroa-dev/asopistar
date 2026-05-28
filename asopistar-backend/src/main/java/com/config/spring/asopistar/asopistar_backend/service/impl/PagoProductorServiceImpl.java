package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.PagoProductorRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoProductorResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.PagoProductor;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.PagoProductorRepository;
import com.config.spring.asopistar.asopistar_backend.repository.RecepcionRepository;
import com.config.spring.asopistar.asopistar_backend.repository.ProductorRepository;
import com.config.spring.asopistar.asopistar_backend.repository.MetodoPagoRepository;
import com.config.spring.asopistar.asopistar_backend.service.PagoProductorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
 
@Service @RequiredArgsConstructor
public class PagoProductorServiceImpl implements PagoProductorService {
 
    private final PagoProductorRepository pagoRepository;
    private final RecepcionRepository recepcionRepository;
    private final ProductorRepository productorRepository;
    private final MetodoPagoRepository metodoPagoRepository;
 
    @Override
    public List<PagoProductorResponseDTO> listarTodos() {
        return pagoRepository.findAll().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public List<PagoProductorResponseDTO> listarPendientes() {
        return pagoRepository.findByEstado("PENDIENTE").stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public List<PagoProductorResponseDTO> listarPorProductor(Integer idProductor) {
        return pagoRepository
            .findByProductorIdProductorOrderByFechaPagoDesc(idProductor)
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public PagoProductorResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(pagoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pago no encontrado con id: " + id)));
    }
 
    @Override @Transactional
    public PagoProductorResponseDTO crear(PagoProductorRequestDTO dto) {
        var recepcion = recepcionRepository.findById(dto.getIdRecepcion())
            .orElseThrow(() -> new ResourceNotFoundException("Recepción no encontrada"));
        var productor = productorRepository.findById(dto.getIdProductor())
            .orElseThrow(() -> new ResourceNotFoundException("Productor no encontrado"));
        var metodo = metodoPagoRepository.findById(dto.getIdMetodoPago())
            .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado"));
        // Calcular monto automáticamente
        var monto = dto.getKilosPagados().multiply(dto.getPrecioKg());
        PagoProductor pago = PagoProductor.builder()
            .fechaPago(dto.getFechaPago()).monto(monto)
            .precioKg(dto.getPrecioKg()).kilosPagados(dto.getKilosPagados())
            .estado("PENDIENTE")
            .productor(productor).recepcion(recepcion).metodoPago(metodo)
            .build();
        return toResponseDTO(pagoRepository.save(pago));
    }
 
    @Override @Transactional
    public PagoProductorResponseDTO marcarComoPagado(Integer id) {
        PagoProductor p = pagoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pago no encontrado con id: " + id));
        p.setEstado("PAGADO");
        return toResponseDTO(pagoRepository.save(p));
    }
 
    private PagoProductorResponseDTO toResponseDTO(PagoProductor p) {
        return PagoProductorResponseDTO.builder()
            .idPago(p.getIdPago()).fechaPago(p.getFechaPago())
            .monto(p.getMonto()).precioKg(p.getPrecioKg())
            .kilosPagados(p.getKilosPagados()).estado(p.getEstado())
            .idProductor(p.getProductor().getIdProductor())
            .nombreProductor(p.getProductor().getNombre1()
                + " " + p.getProductor().getApellido1())
            .idRecepcion(p.getRecepcion().getIdRecepcion())
            .nombreMetodoPago(p.getMetodoPago().getNombre())
            .build();
    }
}
