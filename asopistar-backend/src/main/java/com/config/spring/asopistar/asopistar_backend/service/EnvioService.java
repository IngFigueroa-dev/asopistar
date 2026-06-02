package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioEntregaRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.EnvioTransporteRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.EnvioResponseDTO;

import java.util.List;

public interface EnvioService {

    // ── Operaciones originales (sin cambios de firma) ─────────────────────────

    List<EnvioResponseDTO> listarTodos();

    EnvioResponseDTO buscarPorId(Integer id);

    EnvioResponseDTO crear(EnvioRequestDTO dto);

    /** PREPARADO → EN_CAMINO → ENTREGADO | CANCELADO */
    EnvioResponseDTO cambiarEstado(Integer id, String nuevoEstado);

    // ── Operaciones nuevas ────────────────────────────────────────────────────

    /** Buscar por código de guía exacto. */
    EnvioResponseDTO buscarPorGuia(String codigoGuia);

    /** Búsqueda libre por texto (guía, ciudad, cliente, transportador…). */
    List<EnvioResponseDTO> buscar(String query);

    /**
     * Registrar o actualizar datos de transporte.
     * Se puede llamar desde el frontend al asignar conductor/vehículo.
     * También registra fecha_salida cuando el estado pasa a EN_CAMINO.
     */
    EnvioResponseDTO actualizarTransporte(Integer id, EnvioTransporteRequestDTO request);

    /**
     * Registrar evidencia de entrega (nombre receptor, observación).
     * Se llama al marcar un envío como ENTREGADO, opcionalmente.
     */
    EnvioResponseDTO registrarEntrega(Integer id, EnvioEntregaRequestDTO request);

    /** Historial de envíos de un cliente específico. */
    List<EnvioResponseDTO> historialCliente(Integer idCliente);

    /** Historial de envíos de un punto de venta específico. */
    List<EnvioResponseDTO> historialPuntoVenta(Integer idPunto);
}
