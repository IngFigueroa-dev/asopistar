package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.IngresoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.PagoIngresoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.IngresoEstadisticasDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.IngresoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoIngresoResponseDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface IngresoService {

    IngresoResponseDTO crear(IngresoRequestDTO request);

    IngresoResponseDTO obtenerPorId(Integer id);

    List<IngresoResponseDTO> listarTodos();

    List<IngresoResponseDTO> filtrar(String estado, String tipo, Integer idCliente,
                                     LocalDateTime desde, LocalDateTime hasta);

    IngresoResponseDTO anular(Integer id);

    // ── Pagos / abonos ────────────────────────────────────────────────────────

    PagoIngresoResponseDTO registrarAbono(Integer idIngreso, PagoIngresoRequestDTO request,
                                          String emailUsuario);

    List<PagoIngresoResponseDTO> listarPagos(Integer idIngreso);

    // ── Estadísticas ──────────────────────────────────────────────────────────

    IngresoEstadisticasDTO estadisticas();
}
