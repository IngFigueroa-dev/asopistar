package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * DTO para el endpoint PATCH /puntos-venta/{id}/estado
 */
@Data
public class PuntoVentaEstadoRequestDTO {

    @NotBlank(message = "El estado es obligatorio.")
    @Pattern(
        regexp = "ACTIVO|INACTIVO|SUSPENDIDO",
        message = "El estado debe ser ACTIVO, INACTIVO o SUSPENDIDO."
    )
    private String estado;
}
