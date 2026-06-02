package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de salida para Envío.
 * Amplía el DTO original con guía, transporte, fechas y trazabilidad.
 * Mantiene todos los campos originales para compatibilidad con el frontend existente.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvioResponseDTO {

    // ── Campos originales ────────────────────────────────────────────────────

    private Integer       idEnvio;
    private LocalDateTime fechaEnvio;
    private String        destinoCiudad;
    private String        tipoDestino;       // CLIENTE | PUNTO_VENTA
    private String        estado;            // PREPARADO | EN_CAMINO | ENTREGADO | CANCELADO
    private String        observaciones;

    // Destino
    private Integer       idCliente;
    private String        nombreCliente;
    private Integer       idPunto;
    private String        nombrePunto;

    // Totales calculados
    private BigDecimal    totalKilos;
    private Integer       totalLotes;

    // Detalle de lotes
    private List<DetalleLoteDTO> lotes;

    // ── Campos nuevos: identificación ────────────────────────────────────────

    /** Código de guía único. Formato: GUIA-YYYY-NNNNN */
    private String        codigoGuia;

    private LocalDateTime fechaPreparacion;
    private LocalDateTime fechaSalida;
    private LocalDate     fechaEntregaEstimada;
    private LocalDateTime fechaEntregaReal;

    // ── Campos nuevos: transporte ────────────────────────────────────────────

    private String        empresaTransportadora;
    private String        nombreConductor;
    private String        telefonoConductor;
    private String        placaVehiculo;
    private String        tipoVehiculo;

    // ── Campos nuevos: evidencia de entrega ──────────────────────────────────

    private String        observacionEntrega;
    private String        nombreReceptor;

    // ── Detalle de destino enriquecido ───────────────────────────────────────

    /** Info adicional del cliente si tipoDestino = CLIENTE */
    private ClienteInfoDTO clienteInfo;

    /** Info adicional del punto de venta si tipoDestino = PUNTO_VENTA */
    private PuntoVentaInfoDTO puntoVentaInfo;

    // ── Sub-DTOs ─────────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DetalleLoteDTO {
        private Integer    idDetalle;
        private Integer    idLote;
        private String     codigoLote;
        private BigDecimal kilos;
        private String     nombreProductor;
        private String     observaciones;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ClienteInfoDTO {
        private Integer idCliente;
        private String  razonSocial;
        private String  ciudad;
        private String  telefono;
        private String  email;
        private String  tipo;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PuntoVentaInfoDTO {
        private Integer idPunto;
        private String  nombre;
        private String  ciudad;
        private String  responsable;
        private String  telefono;
    }
}
