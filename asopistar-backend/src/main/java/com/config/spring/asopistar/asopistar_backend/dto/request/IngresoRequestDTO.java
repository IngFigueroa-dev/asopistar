package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class IngresoRequestDTO {

    @NotNull(message = "La fecha es obligatoria")
    private LocalDateTime fecha;

    @NotBlank(message = "El concepto es obligatorio")
    @Size(max = 100, message = "El concepto no puede superar 100 caracteres")
    private String concepto;

    /**
     * Tipo de ingreso del catálogo.
     * Valores: VENTA_PESCADO | VENTA_ALEVINOS | VENTA_CONCENTRADO | OTRO
     */
    @NotBlank(message = "El tipo de ingreso es obligatorio")
    private String tipoIngreso;

    @NotNull(message = "El valor total es obligatorio")
    @DecimalMin(value = "0.01", message = "El valor total debe ser mayor a 0")
    private BigDecimal valorTotal;

    /** Referencia externa (número de factura, orden, etc.) */
    @Size(max = 60)
    private String referencia;

    // ── Relaciones opcionales ─────────────────────────────────────────────────

    /** Cliente asociado (puede ser null). */
    private Integer idCliente;

    /** Envío relacionado (para VENTA_PESCADO). */
    private Integer idEnvio;

    /** Venta de insumo relacionada (para VENTA_ALEVINOS / VENTA_CONCENTRADO). */
    private Integer idVentaInsumo;

    @Size(max = 100)
    private String observaciones;
}
