package com.config.spring.asopistar.asopistar_backend.service;
 
import com.config.spring.asopistar.asopistar_backend.dto.request.SiembraRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.SiembraResponseDTO;
import java.util.List;
 
public interface SiembraService {
    List<SiembraResponseDTO> listarTodos();
    List<SiembraResponseDTO> listarActivas();
    List<SiembraResponseDTO> listarListasParaCosechar();
    SiembraResponseDTO buscarPorId(Integer id);
    SiembraResponseDTO crear(SiembraRequestDTO dto);
    SiembraResponseDTO actualizar(Integer id, SiembraRequestDTO dto);
}
