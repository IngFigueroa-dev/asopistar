package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.LoteDecisionRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.LoteCuartoFrioResponseDTO;

import java.util.List;

public interface LoteCuartoFrioService {

    // Lista todos los lotes
    List<LoteCuartoFrioResponseDTO> listarTodos();

    // Lista solo lotes disponibles (estado = true)
    List<LoteCuartoFrioResponseDTO> listarDisponibles();

    // Buscar por id
    LoteCuartoFrioResponseDTO buscarPorId(Integer id);

    // Decisión: ALMACENAR (queda en cuarto frío) o DESPACHAR (crea envío y marca despachado)
    LoteCuartoFrioResponseDTO procesarDecision(Integer idLote, LoteDecisionRequestDTO dto);
}
