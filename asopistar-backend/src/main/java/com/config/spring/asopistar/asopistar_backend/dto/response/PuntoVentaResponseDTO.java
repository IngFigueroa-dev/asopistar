package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de salida para Punto de Venta.
 * No expone datos sensibles ni referencias circulares.
 */
@Data
@Builder
public class PuntoVentaResponseDTO {

    private Integer       idPunto;
    private String        codigo;
    private String        nombre;
    private String        tipo;

    // Ubicación
    private String        direccion;
    private String        ciudad;
    private String        departamento;

    // Contacto
    private String        responsable;
    private String        cargoResponsable;
    private String        telefono;
    private String        correo;

    // Operativo
    private LocalDate     fechaApertura;
    private String        observaciones;
    private String        estado;
    private Boolean       activo;
    private LocalDateTime fechaCreacion;
}
