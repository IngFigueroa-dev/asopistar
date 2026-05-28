package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EnvioResponseDTO {
 
    private Integer idEnvio;
    private LocalDateTime fechaEnvio;
    private String destinoCiudad;
    private String tipoDestino;
    private String estado;
    private String observaciones;
    private Integer idCliente;
    private Integer idPunto;
    // Nombre del destino: cliente o punto de venta según tipoDestino
    private String nombreDestino;
}
