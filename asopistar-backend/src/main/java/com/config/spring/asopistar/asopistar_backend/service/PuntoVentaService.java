package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.PuntoVentaEstadoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.PuntoVentaRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PuntoVentaResponseDTO;


import java.util.List;

public interface PuntoVentaService {

    /** Listar todos los puntos de venta. */
    List<PuntoVentaResponseDTO> listarTodos();

    /** Listar solo los puntos con estado ACTIVO. */
    List<PuntoVentaResponseDTO> listarActivos();

    /** Obtener un punto de venta por ID. */
    PuntoVentaResponseDTO obtenerPorId(Integer id);

    /** Crear un nuevo punto de venta. */
    PuntoVentaResponseDTO crear(PuntoVentaRequestDTO request);

    /** Actualizar información de un punto de venta existente. */
    PuntoVentaResponseDTO actualizar(Integer id, PuntoVentaRequestDTO request);

    /** Cambiar el estado (ACTIVO / INACTIVO / SUSPENDIDO). */
    PuntoVentaResponseDTO cambiarEstado(Integer id, PuntoVentaEstadoRequestDTO request);

    /** Búsqueda por texto libre. */
    List<PuntoVentaResponseDTO> buscar(String query);
}
