package com.config.spring.asopistar.asopistar_backend.service;

 
import com.config.spring.asopistar.asopistar_backend.dto.request.EspecieRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EspecieResponseDTO;
import java.util.List;
 
public interface EspecieService {
    List<EspecieResponseDTO> listarTodos();
    EspecieResponseDTO buscarPorId(Integer id);
    EspecieResponseDTO crear(EspecieRequestDTO dto);
    EspecieResponseDTO actualizar(Integer id, EspecieRequestDTO dto);
    void eliminar(Integer id);
}
