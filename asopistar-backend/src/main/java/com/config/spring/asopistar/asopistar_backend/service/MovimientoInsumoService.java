package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.MovimientoInsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.MovimientoInsumoResponseDTO;
import java.util.List;

public interface MovimientoInsumoService {
    List<MovimientoInsumoResponseDTO> listarTodos();
    List<MovimientoInsumoResponseDTO> listarPorInsumo(Integer idInsumo);
    MovimientoInsumoResponseDTO       registrar(MovimientoInsumoRequestDTO dto);
}
