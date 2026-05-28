package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductorRequestDTO {
 
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 15)
    private String nombre1;
 
    @Size(max = 15)
    private String nombre2;
 
    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 20)
    private String apellido1;
 
    @Size(max = 20)
    private String apellido2;
 
    @NotBlank(message = "El documento es obligatorio")
    @Size(max = 15)
    private String documento;
 
    @NotBlank(message = "El teléfono es obligatorio")
    @Size(max = 15)
    private String telefono;
 
    @NotNull(message = "La fecha de ingreso es obligatoria")
    private LocalDate fechaIngreso;
 
    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNacimiento;
 
    @Min(value = 0, message = "La cantidad de hijos no puede ser negativa")
    private Integer cantidadHijos;
 
    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 40)
    private String direccion;
 
    @NotNull(message = "El usuario es obligatorio")
    private Integer idUsuario;
}
