package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;
 
@Embeddable
@Data @NoArgsConstructor @AllArgsConstructor
public class DetalleEnvioId implements Serializable {
 
    @Column(name = "id_detalle_envio")
    private Integer idDetalleEnvio;
 
    @Column(name = "id_envio")
    private Integer idEnvio;
}

