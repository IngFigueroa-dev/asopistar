package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.UsuarioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.UsuarioResponseDTO;
import java.util.List;
 
public interface UsuarioService {
    List<UsuarioResponseDTO> listarTodos();
    List<UsuarioResponseDTO> listarActivos();
    UsuarioResponseDTO buscarPorId(Integer id);
    UsuarioResponseDTO crear(UsuarioRequestDTO dto);
    UsuarioResponseDTO actualizar(Integer id, UsuarioRequestDTO dto);
    void desactivar(Integer id);
}
