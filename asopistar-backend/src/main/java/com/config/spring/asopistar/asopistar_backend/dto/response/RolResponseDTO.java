package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RolResponseDTO {
 
    private Integer idRol;
    private String nombre;
    private String descripcion;
}

