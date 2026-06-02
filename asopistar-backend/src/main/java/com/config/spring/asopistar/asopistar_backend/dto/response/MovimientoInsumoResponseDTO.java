package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MovimientoInsumoResponseDTO {
    private Integer       idMovimiento;
    private LocalDateTime fecha;
    private String        tipoMovimiento;
    private String        motivo;
    private BigDecimal    cantidad;
    private BigDecimal    stockAntes;
    private BigDecimal    stockDespues;
    private String        observacion;
    private Integer       idInsumo;
    private String        nombreInsumo;
    private String        tipoInsumo;
    private Integer       idUsuario;
    private String        nombreUsuario;
    private Integer       idVentaInsumo;  // null si no viene de venta
}
