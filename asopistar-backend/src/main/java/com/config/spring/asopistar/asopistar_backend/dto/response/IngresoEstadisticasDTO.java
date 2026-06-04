package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class IngresoEstadisticasDTO {

    private BigDecimal totalFacturado;
    private BigDecimal totalRecaudado;
    private BigDecimal totalPendiente;

    private long cantidadPendientes;
    private long cantidadParciales;
    private long cantidadPagados;
    private long cantidadAnulados;

    /** Monto por tipo: { "VENTA_PESCADO": 15000000, "VENTA_ALEVINOS": 3000000, ... } */
    private Map<String, BigDecimal> porTipoIngreso;
}
