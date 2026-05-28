package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EspecieResponseDTO {
 
    private Integer idEspecie;
    private String nombre;
    private String descripcion;
}
