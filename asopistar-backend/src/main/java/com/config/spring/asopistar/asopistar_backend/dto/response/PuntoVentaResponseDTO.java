package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PuntoVentaResponseDTO {
 
    private Integer idPunto;
    private String nombre;
    private String ciudad;
    private String direccion;
    private Boolean activo;
}
