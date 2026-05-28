package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.RolRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.RolResponseDTO;
import java.util.List;
 
public interface RolService {
    List<RolResponseDTO> listarTodos();
    RolResponseDTO buscarPorId(Integer id);
    RolResponseDTO crear(RolRequestDTO dto);
    RolResponseDTO actualizar(Integer id, RolRequestDTO dto);
    void eliminar(Integer id);
}
