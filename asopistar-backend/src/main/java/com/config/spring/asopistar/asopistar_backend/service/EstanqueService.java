package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.EstanqueRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EstanqueResponseDTO;
import java.util.List;
 
public interface EstanqueService {
    List<EstanqueResponseDTO> listarTodos();
    List<EstanqueResponseDTO> listarPorProductor(Integer idProductor);
    EstanqueResponseDTO buscarPorId(Integer id);
    EstanqueResponseDTO crear(EstanqueRequestDTO dto);
    EstanqueResponseDTO actualizar(Integer id, EstanqueRequestDTO dto);
    void eliminar(Integer id);
}
