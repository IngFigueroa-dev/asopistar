package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EstanqueResponseDTO {
 
    private Integer idEstanque;
    private String codigo;
    private String nombre;
    private BigDecimal capacidad;
    private String ubicacion;
    private String estadoEstanque;
    private Integer idProductor;
    private String nombreProductor;   // nombre1 + apellido1 del Productor
}
