package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteRequestDTO {

    // ── Identificación empresarial ──────────────────────────────
    @NotBlank(message = "El tipo de documento es obligatorio")
    @Pattern(regexp = "NIT|CC|CE|PASAPORTE", message = "Tipo de documento inválido")
    private String tipoDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 20, message = "El número de documento no puede superar 20 caracteres")
    private String numeroDocumento;

    @NotBlank(message = "El NIT es obligatorio")
    @Size(max = 20, message = "El NIT no puede superar 20 caracteres")
    private String nit;

    @NotBlank(message = "La razón social es obligatoria")
    @Size(max = 100, message = "La razón social no puede superar 100 caracteres")
    private String razonSocial;

    // ── Clasificación ───────────────────────────────────────────
    @NotBlank(message = "El tipo de cliente es obligatorio")
    @Pattern(regexp = "DISTRIBUIDOR|PUNTO_DE_VENTA|EMPRESA|COMERCIALIZADORA|OTRO",
             message = "Tipo de cliente inválido")
    private String tipoCliente;

    @Pattern(regexp = "PREFERENCIAL|ACTIVO|INACTIVO|BLOQUEADO",
             message = "Clasificación comercial inválida")
    private String clasificacionComercial;

    // ── Contacto principal ──────────────────────────────────────
    @NotBlank(message = "El nombre del contacto es obligatorio")
    @Size(max = 60, message = "El nombre del contacto no puede superar 60 caracteres")
    private String nombreContacto;

    @NotBlank(message = "El cargo del contacto es obligatorio")
    @Size(max = 50, message = "El cargo no puede superar 50 caracteres")
    private String cargoContacto;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^[0-9+\\-\\s]{7,15}$", message = "Teléfono inválido")
    private String telefono;

    @Pattern(regexp = "^[0-9+\\-\\s]{7,15}$", message = "Teléfono secundario inválido")
    private String telefonoSecundario;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Correo electrónico inválido")
    @Size(max = 80)
    private String correo;

    @Email(message = "Correo secundario inválido")
    @Size(max = 80)
    private String correoSecundario;

    // ── Ubicación ───────────────────────────────────────────────
    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 120)
    private String direccion;

    @NotBlank(message = "La ciudad es obligatoria")
    @Size(max = 60)
    private String ciudad;

    @NotBlank(message = "El departamento es obligatorio")
    @Size(max = 60)
    private String departamento;

    // ── Información comercial ───────────────────────────────────
    @DecimalMin(value = "0.0", message = "El límite de crédito no puede ser negativo")
    private BigDecimal limiteCredito;

    @Size(max = 300)
    private String observaciones;
}

