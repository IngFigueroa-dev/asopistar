package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MetodoPagoResponseDTO {
 
    private Integer idMetodoPago;
    private String nombre;
    private String descripcion;
    private String estado;
}
