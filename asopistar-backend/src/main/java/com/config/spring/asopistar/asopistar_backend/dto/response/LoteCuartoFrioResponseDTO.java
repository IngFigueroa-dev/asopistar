package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LoteCuartoFrioResponseDTO {

    private Integer       idLote;
    private String        codigoLote;
    private LocalDateTime fechaIngreso;
    private BigDecimal    kilos;
    private Boolean       estado;          // true=disponible, false=despachado

    // Decisión tomada: PENDIENTE_DECISION, ALMACENADO, DESPACHADO
    private String        estadoDecision;

    // Recepción origen
    private Integer       idRecepcion;

    // Productor (lote → recepcion → productor)
    private String        nombreProductor;

    // Envío generado si se despachó de inmediato
    private Integer       idEnvio;
}
