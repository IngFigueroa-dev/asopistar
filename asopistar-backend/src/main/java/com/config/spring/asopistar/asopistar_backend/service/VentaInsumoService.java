package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.VentaInsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.VentaInsumoResponseDTO;
import java.util.List;

public interface VentaInsumoService {
    List<VentaInsumoResponseDTO> listarTodas();
    List<VentaInsumoResponseDTO> listarPorProductor(Integer idProductor);
    VentaInsumoResponseDTO       buscarPorId(Integer id);
    VentaInsumoResponseDTO       registrar(VentaInsumoRequestDTO dto);
    VentaInsumoResponseDTO       marcarPagado(Integer id);
}
