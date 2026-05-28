package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.ProductorRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ProductorResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EstanqueResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Productor;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.repository.ProductorRepository;
import com.config.spring.asopistar.asopistar_backend.repository.UsuarioRepository;
import com.config.spring.asopistar.asopistar_backend.repository.EstanqueRepository;
import com.config.spring.asopistar.asopistar_backend.service.ProductorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
 
@Service @RequiredArgsConstructor
public class ProductorServiceImpl implements ProductorService {
 
    private final ProductorRepository productorRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstanqueRepository estanqueRepository;
 
    @Override
    public List<ProductorResponseDTO> listarTodos() {
        return productorRepository.findAll().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public List<ProductorResponseDTO> listarActivos() {
        return productorRepository.findByActivoTrue().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public ProductorResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(productorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Productor no encontrado con id: " + id)));
    }
 
    @Override @Transactional
    public ProductorResponseDTO crear(ProductorRequestDTO dto) {
        if (productorRepository.existsByDocumento(dto.getDocumento()))
            throw new BusinessException(
                "Ya existe un productor con el documento: " + dto.getDocumento());
        var usuario = usuarioRepository.findById(dto.getIdUsuario())
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Productor p = Productor.builder()
            .nombre1(dto.getNombre1()).nombre2(dto.getNombre2())
            .apellido1(dto.getApellido1()).apellido2(dto.getApellido2())
            .documento(dto.getDocumento()).telefono(dto.getTelefono())
            .fechaIngreso(dto.getFechaIngreso())
            .fechaNacimiento(dto.getFechaNacimiento())
            .cantidadHijos(dto.getCantidadHijos())
            .direccion(dto.getDireccion())
            .activo(true).usuario(usuario)
            .build();
        return toResponseDTO(productorRepository.save(p));
    }
 
    @Override @Transactional
    public ProductorResponseDTO actualizar(Integer id, ProductorRequestDTO dto) {
        Productor p = productorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Productor no encontrado con id: " + id));
        p.setNombre1(dto.getNombre1()); p.setApellido1(dto.getApellido1());
        p.setTelefono(dto.getTelefono()); p.setDireccion(dto.getDireccion());
        p.setCantidadHijos(dto.getCantidadHijos());
        return toResponseDTO(productorRepository.save(p));
    }
 
    @Override @Transactional
    public void desactivar(Integer id) {
        Productor p = productorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Productor no encontrado con id: " + id));
        p.setActivo(false);
        productorRepository.save(p);
    }
 
    @Override
    public List<EstanqueResponseDTO> obtenerEstanques(Integer idProductor) {
        if (!productorRepository.existsById(idProductor))
            throw new ResourceNotFoundException(
                "Productor no encontrado con id: " + idProductor);
        return estanqueRepository.findByProductorIdProductor(idProductor)
            .stream().map(e -> EstanqueResponseDTO.builder()
                .idEstanque(e.getIdEstanque()).codigo(e.getCodigo())
                .nombre(e.getNombre()).estadoEstanque(e.getEstadoEstanque())
                .build())
            .collect(Collectors.toList());
    }
 
    private ProductorResponseDTO toResponseDTO(Productor p) {
        return ProductorResponseDTO.builder()
            .idProductor(p.getIdProductor())
            .nombre1(p.getNombre1()).nombre2(p.getNombre2())
            .apellido1(p.getApellido1()).apellido2(p.getApellido2())
            .documento(p.getDocumento()).telefono(p.getTelefono())
            .fechaIngreso(p.getFechaIngreso())
            .fechaNacimiento(p.getFechaNacimiento())
            .cantidadHijos(p.getCantidadHijos())
            .activo(p.getActivo()).direccion(p.getDireccion())
            .nombreUsuario(p.getUsuario().getNombre1()
                + " " + p.getUsuario().getApellido1())
            .build();
    }
}
