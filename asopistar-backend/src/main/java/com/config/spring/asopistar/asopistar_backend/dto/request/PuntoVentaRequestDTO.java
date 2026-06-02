package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO de entrada para crear o actualizar un Punto de Venta.
 */
@Data
public class PuntoVentaRequestDTO {

    // ── Identificación ──────────────────────────────────────────────────────

    @NotBlank(message = "El código es obligatorio.")
    @Size(max = 15, message = "El código no puede superar 15 caracteres.")
    private String codigo;

    @NotBlank(message = "El nombre es obligatorio.")
    @Size(max = 40, message = "El nombre no puede superar 40 caracteres.")
    private String nombre;

    /**
     * Valores válidos: PROPIO, ALIADO, TEMPORAL
     */
    @NotBlank(message = "El tipo de punto de venta es obligatorio.")
    @Pattern(
        regexp = "PROPIO|ALIADO|TEMPORAL",
        message = "El tipo debe ser PROPIO, ALIADO o TEMPORAL."
    )
    private String tipo;

    // ── Ubicación ───────────────────────────────────────────────────────────

    @NotBlank(message = "La dirección es obligatoria.")
    @Size(max = 50, message = "La dirección no puede superar 50 caracteres.")
    private String direccion;

    @NotBlank(message = "La ciudad es obligatoria.")
    @Size(max = 30, message = "La ciudad no puede superar 30 caracteres.")
    private String ciudad;

    @Size(max = 40, message = "El departamento no puede superar 40 caracteres.")
    private String departamento;

    // ── Contacto ────────────────────────────────────────────────────────────

    @Size(max = 60, message = "El nombre del responsable no puede superar 60 caracteres.")
    private String responsable;

    @Size(max = 50, message = "El cargo no puede superar 50 caracteres.")
    private String cargoResponsable;

    @Size(max = 15, message = "El teléfono no puede superar 15 caracteres.")
    private String telefono;

    @Email(message = "El correo no tiene un formato válido.")
    @Size(max = 60, message = "El correo no puede superar 60 caracteres.")
    private String correo;

    // ── Operativo ───────────────────────────────────────────────────────────

    private LocalDate fechaApertura;

    @Size(max = 200, message = "Las observaciones no pueden superar 200 caracteres.")
    private String observaciones;
}
