package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.ClienteRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ClienteResponseDTO;

import java.util.List;
import java.util.Map;

public interface ClienteService {

    // ── CRUD principal ──────────────────────────────────────────
    ClienteResponseDTO crear(ClienteRequestDTO dto);
    ClienteResponseDTO obtenerPorId(Integer id);
    List<ClienteResponseDTO> listarTodos();
    ClienteResponseDTO actualizar(Integer id, ClienteRequestDTO dto);

    // ── Cambios de estado y clasificación ───────────────────────
    ClienteResponseDTO cambiarEstado(Integer id, String estado);
    ClienteResponseDTO cambiarClasificacion(Integer id, String clasificacion);

    // ── Búsqueda ────────────────────────────────────────────────
    List<ClienteResponseDTO> busquedaRapida(String q);
    List<ClienteResponseDTO> filtrar(String razonSocial, String nit, String ciudad,
                                     String tipoCliente, String estado, String clasificacion);

    // ── Solo activos (para selects en Logística, etc.) ──────────
    List<ClienteResponseDTO> listarActivos();

    // ── Reportes ────────────────────────────────────────────────
    Map<String, Object> resumenEstadistico();
}
