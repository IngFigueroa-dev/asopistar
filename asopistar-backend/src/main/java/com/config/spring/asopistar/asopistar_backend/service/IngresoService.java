package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.IngresoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.IngresoResponseDTO;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
 
public interface IngresoService {
    List<IngresoResponseDTO> listarTodos();
    List<IngresoResponseDTO> listarPorPeriodo(
        LocalDateTime inicio, LocalDateTime fin);
    IngresoResponseDTO buscarPorId(Integer id);
    IngresoResponseDTO crear(IngresoRequestDTO dto);
    BigDecimal totalIngresosPorPeriodo(
        LocalDateTime inicio, LocalDateTime fin);
}
