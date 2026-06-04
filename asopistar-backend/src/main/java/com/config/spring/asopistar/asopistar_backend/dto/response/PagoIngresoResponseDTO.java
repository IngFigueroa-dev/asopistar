package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PagoIngresoResponseDTO {

    private Integer       idPagoIngreso;
    private Integer       idIngreso;
    private LocalDateTime fechaPago;
    private BigDecimal    valorPago;
    private Integer       idMetodoPago;
    private String        nombreMetodoPago;
    private String        referencia;
    private String        observaciones;
    private String        registradoPor;
}
