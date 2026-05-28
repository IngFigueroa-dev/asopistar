package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PagoProductorResponseDTO {
 
    private Integer idPago;
    private LocalDateTime fechaPago;
    private BigDecimal monto;
    private BigDecimal precioKg;
    private BigDecimal kilosPagados;
    private String estado;
    private Integer idProductor;
    private String nombreProductor;    // para la contadora
    private Integer idRecepcion;
    private String nombreMetodoPago;   // EFECTIVO, TRANSFERENCIA
}
