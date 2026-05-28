package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.response.LoteCuartoFrioResponseDTO;

import java.util.List;

public interface LoteCuartoFrioService {

    List<LoteCuartoFrioResponseDTO> listarLotes();

    LoteCuartoFrioResponseDTO obtenerPorId(Integer id);
}

