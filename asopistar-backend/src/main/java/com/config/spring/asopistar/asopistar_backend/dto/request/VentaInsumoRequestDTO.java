package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class VentaInsumoRequestDTO {

    @NotNull(message = "El productor es obligatorio")
    private Integer idProductor;

    /**
     * PAGADO | PENDIENTE | CREDITO
     * El frontend siempre envía PENDIENTE; la contadora actualiza.
     */
    @NotBlank(message = "El estado de pago es obligatorio")
    @Pattern(regexp = "PAGADO|PENDIENTE|CREDITO",
             message = "Estado debe ser PAGADO, PENDIENTE o CREDITO")
    private String estadoPagado;

    @NotEmpty(message = "La venta debe tener al menos un ítem")
    @Valid
    private List<DetalleVentaInsumoRequestDTO> items;
}
