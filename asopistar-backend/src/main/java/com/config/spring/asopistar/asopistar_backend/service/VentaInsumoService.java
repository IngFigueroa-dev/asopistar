package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.VentaInsumoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.VentaInsumoResponseDTO;
import java.util.List;
 
public interface VentaInsumoService {
    List<VentaInsumoResponseDTO> listarTodos();
    List<VentaInsumoResponseDTO> listarPorProductor(Integer idProductor);
    List<VentaInsumoResponseDTO> listarPendientesPago();
    VentaInsumoResponseDTO buscarPorId(Integer id);
    VentaInsumoResponseDTO crear(VentaInsumoRequestDTO dto);
    VentaInsumoResponseDTO actualizarEstadoPago(Integer id, String estado);
}
