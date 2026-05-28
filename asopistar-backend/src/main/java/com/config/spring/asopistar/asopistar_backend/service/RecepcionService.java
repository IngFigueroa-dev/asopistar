package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.RecepcionRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.RecepcionResponseDTO;
import java.util.List;
 
public interface RecepcionService {
    List<RecepcionResponseDTO> listarTodos();
    List<RecepcionResponseDTO> listarPorProductor(Integer idProductor);
    RecepcionResponseDTO buscarPorId(Integer id);
    RecepcionResponseDTO crear(RecepcionRequestDTO dto);
}
