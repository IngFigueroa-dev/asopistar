package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.ProductorRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ProductorResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EstanqueResponseDTO;
import java.util.List;
 
public interface ProductorService {
    List<ProductorResponseDTO> listarTodos();
    List<ProductorResponseDTO> listarActivos();
    ProductorResponseDTO buscarPorId(Integer id);
    ProductorResponseDTO crear(ProductorRequestDTO dto);
    ProductorResponseDTO actualizar(Integer id, ProductorRequestDTO dto);
    void desactivar(Integer id);
    List<EstanqueResponseDTO> obtenerEstanques(Integer idProductor);
}

