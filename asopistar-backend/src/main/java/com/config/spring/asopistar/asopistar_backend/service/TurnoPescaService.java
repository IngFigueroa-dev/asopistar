package com.config.spring.asopistar.asopistar_backend.service;

 
import com.config.spring.asopistar.asopistar_backend.dto.request.TurnoPescaRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.TurnoPescaResponseDTO;
import java.time.LocalDate;
import java.util.List;
 
public interface TurnoPescaService {
    List<TurnoPescaResponseDTO> listarTodos();
    List<TurnoPescaResponseDTO> listarPendientes();
    List<TurnoPescaResponseDTO> listarEmergencias();
    List<TurnoPescaResponseDTO> agendaDelDia(LocalDate fecha);
    TurnoPescaResponseDTO buscarPorId(Integer id);
    TurnoPescaResponseDTO crear(TurnoPescaRequestDTO dto);
    TurnoPescaResponseDTO cambiarEstado(Integer id, String nuevoEstado);
    List<TurnoPescaResponseDTO> listarOrdenadosPorPrioridad();
    List<TurnoPescaResponseDTO> listarPorProductor(Integer idProductor);
}
