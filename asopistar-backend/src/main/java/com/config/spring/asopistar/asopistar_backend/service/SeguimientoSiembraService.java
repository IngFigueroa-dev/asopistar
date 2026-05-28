package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.SeguimientoSiembraRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.SeguimientoSiembraResponseDTO;
import java.util.List;
 
public interface SeguimientoSiembraService {
    List<SeguimientoSiembraResponseDTO> listarPorSiembra(Integer idSiembra);
    SeguimientoSiembraResponseDTO buscarPorId(Integer id);
    SeguimientoSiembraResponseDTO crear(SeguimientoSiembraRequestDTO dto);
    SeguimientoSiembraResponseDTO ultimoSeguimiento(Integer idSiembra);
}
