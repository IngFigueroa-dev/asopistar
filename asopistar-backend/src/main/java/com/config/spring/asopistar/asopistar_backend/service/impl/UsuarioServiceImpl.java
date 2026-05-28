package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.UsuarioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.UsuarioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Rol;
import com.config.spring.asopistar.asopistar_backend.entity.Usuario;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.repository.RolRepository;
import com.config.spring.asopistar.asopistar_backend.repository.UsuarioRepository;
import com.config.spring.asopistar.asopistar_backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
 
@Service @RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {
 
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
 
    @Override
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public List<UsuarioResponseDTO> listarActivos() {
        return usuarioRepository.findByActivoTrue().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public UsuarioResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Usuario no encontrado con id: " + id)));
    }
 
    @Override
    @Transactional
    public UsuarioResponseDTO crear(UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail()))
            throw new BusinessException("Ya existe un usuario con ese email");
        Rol rol = rolRepository.findById(dto.getIdRol())
            .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
        Usuario usuario = Usuario.builder()
            .nombre1(dto.getNombre1())
            .nombre2(dto.getNombre2())
            .apellido1(dto.getApellido1())
            .apellido2(dto.getApellido2())
            .email(dto.getEmail())
            .contrasena(passwordEncoder.encode(dto.getContrasena()))
            .activo(true)
            .fechaCreacion(LocalDate.now())
            .rol(rol)
            .build();
        return toResponseDTO(usuarioRepository.save(usuario));
    }
 
    @Override
    @Transactional
    public UsuarioResponseDTO actualizar(Integer id, UsuarioRequestDTO dto) {
        Usuario u = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Usuario no encontrado con id: " + id));
        Rol rol = rolRepository.findById(dto.getIdRol())
            .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
        u.setNombre1(dto.getNombre1());
        u.setApellido1(dto.getApellido1());
        u.setEmail(dto.getEmail());
        if (dto.getContrasena() != null && !dto.getContrasena().isBlank())
            u.setContrasena(passwordEncoder.encode(dto.getContrasena()));
        u.setRol(rol);
        return toResponseDTO(usuarioRepository.save(u));
    }
 
    @Override
    @Transactional
    public void desactivar(Integer id) {
        Usuario u = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Usuario no encontrado con id: " + id));
        u.setActivo(false);
        usuarioRepository.save(u);
    }
 
    private UsuarioResponseDTO toResponseDTO(Usuario u) {
        return UsuarioResponseDTO.builder()
            .idUsuario(u.getIdUsuario())
            .nombre1(u.getNombre1())
            .nombre2(u.getNombre2())
            .apellido1(u.getApellido1())
            .apellido2(u.getApellido2())
            .email(u.getEmail())
            .activo(u.getActivo())
            .fechaCreacion(u.getFechaCreacion())
            .nombreRol(u.getRol().getNombre())
            .build();
    }
}
