package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleVentaInsumoRequestDTO {

    @NotNull(message = "El insumo es obligatorio")
    private Integer idInsumo;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    // precioUnitario viene del insumo; el frontend puede confirmarlo
    // pero el servicio siempre lo toma del registro del insumo para evitar
    // manipulaciones. Se ignora si se envía.
}
