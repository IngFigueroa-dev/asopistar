package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.ProcesamientoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ProcesamientoResponseDTO;

import java.util.List;

public interface ProcesamientoService {

    List<ProcesamientoResponseDTO> listarTodos();

    List<ProcesamientoResponseDTO> listarPorRecepcion(Integer idRecepcion);

    ProcesamientoResponseDTO avanzarEtapa(Integer idProcesamiento, ProcesamientoRequestDTO dto);

    ProcesamientoResponseDTO buscarPorId(Integer id);
}
