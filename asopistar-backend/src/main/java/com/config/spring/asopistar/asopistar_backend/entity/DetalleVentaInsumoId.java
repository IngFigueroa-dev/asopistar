package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;
 
@Embeddable
@Data @NoArgsConstructor @AllArgsConstructor
public class DetalleVentaInsumoId implements Serializable {
 
    @Column(name = "id_detalle_venta")
    private Integer idDetalleVenta;
 
    @Column(name = "id_venta_insumo")
    private Integer idVentaInsumo;
}
