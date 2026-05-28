package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EnvioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Envio;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.repository.EnvioRepository;
import com.config.spring.asopistar.asopistar_backend.repository.ClienteRepository;
import com.config.spring.asopistar.asopistar_backend.repository.PuntoVentaRepository;
import com.config.spring.asopistar.asopistar_backend.service.EnvioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
 
@Service @RequiredArgsConstructor
public class EnvioServiceImpl implements EnvioService {
 
    private final EnvioRepository envioRepository;
    private final ClienteRepository clienteRepository;
    private final PuntoVentaRepository puntoVentaRepository;
 
    @Override
    public List<EnvioResponseDTO> listarTodos() {
        return envioRepository.findAll().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public List<EnvioResponseDTO> listarEnCamino() {
        return envioRepository.findByEstado("EN_CAMINO").stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public EnvioResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(envioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Envío no encontrado con id: " + id)));
    }
 
    @Override @Transactional
    public EnvioResponseDTO crear(EnvioRequestDTO dto) {
        Envio.EnvioBuilder builder = Envio.builder()
            .fechaEnvio(dto.getFechaEnvio())
            .destinoCiudad(dto.getDestinoCiudad())
            .tipoDestino(dto.getTipoDestino())
            .estado("PREPARADO")
            .observaciones(dto.getObservaciones());
        if ("CLIENTE".equals(dto.getTipoDestino())) {
            if (dto.getIdCliente() == null)
                throw new BusinessException("Debe indicar el cliente para este envío");
            builder.cliente(clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado")));
        } else {
            if (dto.getIdPunto() == null)
                throw new BusinessException("Debe indicar el punto de venta");
            builder.puntoVenta(puntoVentaRepository.findById(dto.getIdPunto())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Punto de venta no encontrado")));
        }
        return toResponseDTO(envioRepository.save(builder.build()));
    }
 
    @Override @Transactional
    public EnvioResponseDTO cambiarEstado(Integer id, String nuevoEstado) {
        Envio e = envioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Envío no encontrado con id: " + id));
        e.setEstado(nuevoEstado);
        return toResponseDTO(envioRepository.save(e));
    }
 
    private EnvioResponseDTO toResponseDTO(Envio e) {
        String nombreDestino = e.getCliente() != null
            ? e.getCliente().getNombre1() + " " + e.getCliente().getApellido1()
            : (e.getPuntoVenta() != null ? e.getPuntoVenta().getNombre() : "-");
        return EnvioResponseDTO.builder()
            .idEnvio(e.getIdEnvio()).fechaEnvio(e.getFechaEnvio())
            .destinoCiudad(e.getDestinoCiudad()).tipoDestino(e.getTipoDestino())
            .estado(e.getEstado()).observaciones(e.getObservaciones())
            .idCliente(e.getCliente() != null ? e.getCliente().getIdCliente() : null)
            .idPunto(e.getPuntoVenta() != null ? e.getPuntoVenta().getIdPunto() : null)
            .nombreDestino(nombreDestino)
            .build();
    }
}
