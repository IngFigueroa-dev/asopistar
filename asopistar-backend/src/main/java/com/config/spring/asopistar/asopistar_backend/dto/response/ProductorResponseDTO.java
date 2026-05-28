package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.time.LocalDate;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductorResponseDTO {
 
    private Integer idProductor;
    private String nombre1;
    private String nombre2;
    private String apellido1;
    private String apellido2;
    private String documento;
    private String telefono;
    private LocalDate fechaIngreso;
    private LocalDate fechaNacimiento;
    private Integer cantidadHijos;
    private Boolean activo;
    private String direccion;
    private String nombreUsuario;   // nombre1 + apellido1 del Usuario asociado
}
