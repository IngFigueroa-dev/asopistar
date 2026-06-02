package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.InsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.InsumoResponseDTO;
import java.util.List;

public interface InsumoService {
    List<InsumoResponseDTO> listarTodos();
    List<InsumoResponseDTO> listarActivos();
    List<InsumoResponseDTO> listarConBajoStock();
    InsumoResponseDTO       buscarPorId(Integer id);
    InsumoResponseDTO       crear(InsumoRequestDTO dto);
    InsumoResponseDTO       actualizar(Integer id, InsumoRequestDTO dto);
    InsumoResponseDTO       desactivar(Integer id);
}
