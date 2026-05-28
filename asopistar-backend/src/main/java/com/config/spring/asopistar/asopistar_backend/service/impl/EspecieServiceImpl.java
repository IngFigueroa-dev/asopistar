package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.EspecieRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EspecieResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Especie;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.EspecieRepository;
import com.config.spring.asopistar.asopistar_backend.service.EspecieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
 
@Service @RequiredArgsConstructor
public class EspecieServiceImpl implements EspecieService {
 
    private final EspecieRepository especieRepository;
 
    @Override
    public List<EspecieResponseDTO> listarTodos() {
        return especieRepository.findAll().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public EspecieResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(especieRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Especie no encontrada con id: " + id)));
    }
 
    @Override
    public EspecieResponseDTO crear(EspecieRequestDTO dto) {
        Especie e = Especie.builder()
            .nombre(dto.getNombre())
            .descripcion(dto.getDescripcion())
            .build();
        return toResponseDTO(especieRepository.save(e));
    }
 
    @Override
    public EspecieResponseDTO actualizar(Integer id, EspecieRequestDTO dto) {
        Especie e = especieRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Especie no encontrada con id: " + id));
        e.setNombre(dto.getNombre());
        e.setDescripcion(dto.getDescripcion());
        return toResponseDTO(especieRepository.save(e));
    }
 
    @Override
    public void eliminar(Integer id) {
        if (!especieRepository.existsById(id))
            throw new ResourceNotFoundException("Especie no encontrada con id: " + id);
        especieRepository.deleteById(id);
    }
 
    private EspecieResponseDTO toResponseDTO(Especie e) {
        return EspecieResponseDTO.builder()
            .idEspecie(e.getIdEspecie())
            .nombre(e.getNombre())
            .descripcion(e.getDescripcion())
            .build();
    }
}
