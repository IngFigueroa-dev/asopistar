package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EnvioResponseDTO;
import java.util.List;
 
public interface EnvioService {
    List<EnvioResponseDTO> listarTodos();
    List<EnvioResponseDTO> listarEnCamino();
    EnvioResponseDTO buscarPorId(Integer id);
    EnvioResponseDTO crear(EnvioRequestDTO dto);
    EnvioResponseDTO cambiarEstado(Integer id, String nuevoEstado);
}
