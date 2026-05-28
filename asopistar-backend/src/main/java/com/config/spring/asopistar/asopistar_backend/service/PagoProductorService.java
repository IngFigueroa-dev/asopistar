package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.PagoProductorRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoProductorResponseDTO;
import java.util.List;
 
public interface PagoProductorService {
    List<PagoProductorResponseDTO> listarTodos();
    List<PagoProductorResponseDTO> listarPendientes();
    List<PagoProductorResponseDTO> listarPorProductor(Integer idProductor);
    PagoProductorResponseDTO buscarPorId(Integer id);
    PagoProductorResponseDTO crear(PagoProductorRequestDTO dto);
    PagoProductorResponseDTO marcarComoPagado(Integer id);
}
