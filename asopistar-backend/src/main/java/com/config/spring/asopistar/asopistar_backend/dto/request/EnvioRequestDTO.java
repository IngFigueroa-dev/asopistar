package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO de entrada para crear un envío.
 * Los campos de transporte son opcionales al crear; se pueden completar después.
 * Mantiene compatibilidad con el frontend existente (los campos nuevos son opcionales).
 */
@Data
public class EnvioRequestDTO {

    // ── Campos originales (obligatorios) ─────────────────────────────────────

    @NotBlank(message = "La ciudad de destino es obligatoria.")
    private String destinoCiudad;

    /** CLIENTE | PUNTO_VENTA */
    @NotBlank(message = "El tipo de destino es obligatorio.")
    private String tipoDestino;

    private Integer idCliente;
    private Integer idPunto;

    private String observaciones;

    @NotEmpty(message = "Debe incluir al menos un lote.")
    private List<Integer> idLotes;

    // ── Campos nuevos: transporte (opcionales al crear) ───────────────────────

    private String   empresaTransportadora;
    private String   nombreConductor;
    private String   telefonoConductor;
    private String   placaVehiculo;
    private String   tipoVehiculo;

    /** Fecha estimada de entrega al destino. */
    private LocalDate fechaEntregaEstimada;
}
