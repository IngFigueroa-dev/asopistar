package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.Data;

import java.time.LocalDate;

/**
 * DTO para PATCH /envios/{id}/transporte
 * Permite registrar o actualizar la información del transportador
 * en un envío que ya fue creado.
 */
@Data
public class EnvioTransporteRequestDTO {

    private String    empresaTransportadora;
    private String    nombreConductor;
    private String    telefonoConductor;
    private String    placaVehiculo;
    private String    tipoVehiculo;
    private LocalDate fechaEntregaEstimada;
}
