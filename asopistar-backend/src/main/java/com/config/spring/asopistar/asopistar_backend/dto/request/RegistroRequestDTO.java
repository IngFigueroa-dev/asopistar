package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

/**
 * DTO para el registro público de un nuevo usuario.
 * Los campos de productor (fechaNacimiento, cantidadHijos, direccion)
 * son obligatorios solo cuando cargoSolicitado = "PRODUCTOR".
 * La validación condicional se hace en el servicio.
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistroRequestDTO {

    // ── Datos personales ─────────────────────────────────────────────────────
    @NotBlank(message = "El primer nombre es obligatorio")
    @Size(max = 15, message = "El primer nombre no puede superar 15 caracteres")
    private String nombre1;

    @Size(max = 15, message = "El segundo nombre no puede superar 15 caracteres")
    private String nombre2;

    @NotBlank(message = "El primer apellido es obligatorio")
    @Size(max = 15, message = "El primer apellido no puede superar 15 caracteres")
    private String apellido1;

    @Size(max = 15, message = "El segundo apellido no puede superar 15 caracteres")
    private String apellido2;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 20, message = "El documento no puede superar 20 caracteres")
    private String documento;

    @NotBlank(message = "El teléfono es obligatorio")
    @Size(max = 15, message = "El teléfono no puede superar 15 caracteres")
    private String telefono;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    @Size(max = 100, message = "El email no puede superar 100 caracteres")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener mínimo 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
        message = "La contraseña debe tener al menos una mayúscula, una minúscula y un número"
    )
    private String contrasena;

    @NotBlank(message = "Debes confirmar la contraseña")
    private String confirmarContrasena;

    /**
     * Cargo que el usuario selecciona en el dropdown del formulario.
     * Valores permitidos: PRODUCTOR, BIOLOGO, GERENTE_PLANTA, PERSONAL_CUARTO_FRIO,
     *                     CONTADORA, SECRETARIA, GERENTE_COMERCIAL, VENDEDOR_INSUMOS
     * El admin asigna el rol real al aprobar.
     */
    @NotBlank(message = "Debes seleccionar el cargo solicitado")
    private String cargoSolicitado;

    // ── Campos adicionales para PRODUCTOR ────────────────────────────────────
    private LocalDate fechaNacimiento;
    private Integer cantidadHijos;

    @Size(max = 100, message = "La dirección no puede superar 100 caracteres")
    private String direccion;
}
