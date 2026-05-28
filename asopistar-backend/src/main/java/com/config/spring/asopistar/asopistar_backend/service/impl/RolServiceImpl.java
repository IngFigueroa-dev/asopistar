package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.RolRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.RolResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Rol;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.repository.RolRepository;
import com.config.spring.asopistar.asopistar_backend.service.RolService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
public class RolServiceImpl implements RolService {
 
    private final RolRepository rolRepository;
 
    @Override
    public List<RolResponseDTO> listarTodos() {
        return rolRepository.findAll().stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }
 
    @Override
    public RolResponseDTO buscarPorId(Integer id) {
        Rol rol = rolRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Rol no encontrado con id: " + id));
        return toResponseDTO(rol);
    }
 
    @Override
    public RolResponseDTO crear(RolRequestDTO dto) {
        if (rolRepository.existsByNombre(dto.getNombre()))
            throw new BusinessException("Ya existe un rol con ese nombre");
        Rol rol = Rol.builder()
            .nombre(dto.getNombre())
            .descripcion(dto.getDescripcion())
            .build();
        return toResponseDTO(rolRepository.save(rol));
    }
 
    @Override
    public RolResponseDTO actualizar(Integer id, RolRequestDTO dto) {
        Rol rol = rolRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Rol no encontrado con id: " + id));
        rol.setNombre(dto.getNombre());
        rol.setDescripcion(dto.getDescripcion());
        return toResponseDTO(rolRepository.save(rol));
    }
 
    @Override
    public void eliminar(Integer id) {
        if (!rolRepository.existsById(id))
            throw new ResourceNotFoundException("Rol no encontrado con id: " + id);
        rolRepository.deleteById(id);
    }
 
    private RolResponseDTO toResponseDTO(Rol r) {
        return RolResponseDTO.builder()
            .idRol(r.getIdRol())
            .nombre(r.getNombre())
            .descripcion(r.getDescripcion())
            .build();
    }
}
