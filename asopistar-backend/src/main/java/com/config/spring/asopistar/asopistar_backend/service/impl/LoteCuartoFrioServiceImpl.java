package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.response.LoteCuartoFrioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.LoteCuartoFrio;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.LoteCuartoFrioRepository;
import com.config.spring.asopistar.asopistar_backend.service.LoteCuartoFrioService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoteCuartoFrioServiceImpl implements LoteCuartoFrioService {

    private final LoteCuartoFrioRepository loteCuartoFrioRepository;

    public LoteCuartoFrioServiceImpl(LoteCuartoFrioRepository loteCuartoFrioRepository) {
        this.loteCuartoFrioRepository = loteCuartoFrioRepository;
    }

    @Override
    public List<LoteCuartoFrioResponseDTO> listarLotes() {
        return loteCuartoFrioRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LoteCuartoFrioResponseDTO obtenerPorId(Integer id) {
        LoteCuartoFrio lote = loteCuartoFrioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Lote no encontrado con id: " + id));
        return mapToDTO(lote);
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private LoteCuartoFrioResponseDTO mapToDTO(LoteCuartoFrio lote) {
        // Navegar lote → recepcion → productor para obtener el nombre
        String nombreProductor = "";
        if (lote.getRecepcion() != null && lote.getRecepcion().getProductor() != null) {
            var p = lote.getRecepcion().getProductor();
            nombreProductor = p.getNombre1() + " " + p.getApellido1();
        }

        return LoteCuartoFrioResponseDTO.builder()
                .idLote(lote.getIdLote())
                .codigoLote(lote.getCodigoLote())
                .fechaIngreso(lote.getFechaIngreso())
                .kilos(lote.getKilos())
                .estado(lote.getEstado())
                .idRecepcion(lote.getRecepcion() != null ? lote.getRecepcion().getIdRecepcion() : null)
                .nombreProductor(nombreProductor)
                .build();
    }
}
