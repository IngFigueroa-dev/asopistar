package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteResponseDTO {

    private Integer idCliente;

    // ── Identificación ──────────────────────────────────────────
    private String tipoDocumento;
    private String numeroDocumento;
    private String nit;
    private String razonSocial;

    // ── Clasificación ───────────────────────────────────────────
    private String tipoCliente;
    private String clasificacionComercial;

    // ── Contacto ────────────────────────────────────────────────
    private String nombreContacto;
    private String cargoContacto;
    private String telefono;
    private String telefonoSecundario;
    private String correo;
    private String correoSecundario;

    // ── Ubicación ───────────────────────────────────────────────
    private String direccion;
    private String ciudad;
    private String departamento;

    // ── Comercial ───────────────────────────────────────────────
    private BigDecimal limiteCredito;
    private String observaciones;

    // ── Estado ──────────────────────────────────────────────────
    private String estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
