package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EnvioRequestDTO {
 
    @NotNull(message = "La fecha de envío es obligatoria")
    private LocalDateTime fechaEnvio;
 
    @NotBlank(message = "La ciudad destino es obligatoria")
    @Size(max = 30)
    private String destinoCiudad;
 
    @NotBlank(message = "El tipo de destino es obligatorio")
    private String tipoDestino;   // CLIENTE, PUNTO_VENTA
 
    @NotBlank(message = "El estado es obligatorio")
    private String estado;   // PREPARADO, EN_CAMINO, ENTREGADO
 
    @Size(max = 100)
    private String observaciones;
 
    // Solo uno de los dos tendrá valor según tipoDestino
    private Integer idCliente;
    private Integer idPunto;
}
