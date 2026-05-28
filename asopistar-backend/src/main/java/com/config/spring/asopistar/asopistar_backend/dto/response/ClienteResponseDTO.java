package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ClienteResponseDTO {
 
    private Integer idCliente;
    private String nombre1;
    private String nombre2;
    private String apellido1;
    private String apellido2;
    private String tipo;
    private String ciudad;
    private String telefono;
    private String email;
    private String direccion;
}
