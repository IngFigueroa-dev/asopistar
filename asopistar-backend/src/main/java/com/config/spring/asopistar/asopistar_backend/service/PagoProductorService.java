package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.PagoProductorRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoEstadisticasResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoProductorResponseDTO;

import java.util.List;

public interface PagoProductorService {

    /** Registra un nuevo pago asociado a una recepción */
    PagoProductorResponseDTO registrarPago(PagoProductorRequestDTO request);

    /** Lista todos los pagos con filtros opcionales */
    List<PagoProductorResponseDTO> listarPagos(String estado, Integer idProductor);

    /** Lista todos los pagos con estado PENDIENTE */
    List<PagoProductorResponseDTO> listarPendientes();

    /** Obtiene un pago por ID */
    PagoProductorResponseDTO obtenerPorId(Integer id);

    /** Marca un pago como PAGADO */
    PagoProductorResponseDTO marcarComoPagado(Integer id);

    /** Estadísticas agregadas para el dashboard */
    PagoEstadisticasResponseDTO obtenerEstadisticas();
}
