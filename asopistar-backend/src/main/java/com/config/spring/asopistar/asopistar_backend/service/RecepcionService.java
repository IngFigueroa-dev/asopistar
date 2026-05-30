package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.RecepcionRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.RecepcionResponseDTO;

import java.util.List;

public interface RecepcionService {

    RecepcionResponseDTO registrar(RecepcionRequestDTO request);

    List<RecepcionResponseDTO> listarTodas();

    List<RecepcionResponseDTO> listarPorProductor(Integer idProductor);

    // NUEVO: recepciones sin pago PAGADO, ya mapeadas a DTO
    List<RecepcionResponseDTO> listarSinPagoPorProductor(Integer idProductor);

    RecepcionResponseDTO obtenerPorId(Integer id);
}
