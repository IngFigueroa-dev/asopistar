package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EnvioResponseDTO;

import java.util.List;

public interface EnvioService {

    List<EnvioResponseDTO> listarTodos();

    EnvioResponseDTO buscarPorId(Integer id);

    // Crea envío desde Logística seleccionando lotes disponibles
    EnvioResponseDTO crear(EnvioRequestDTO dto);

    // Cambia estado: PREPARADO → EN_CAMINO → ENTREGADO
    EnvioResponseDTO cambiarEstado(Integer id, String nuevoEstado);
}