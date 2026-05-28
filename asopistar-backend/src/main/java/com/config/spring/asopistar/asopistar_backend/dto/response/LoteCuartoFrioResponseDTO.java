package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LoteCuartoFrioResponseDTO {

    private Integer idLote;
    private String codigoLote;
    private LocalDateTime fechaIngreso;
    private BigDecimal kilos;
    private Boolean estado;
    private Integer idRecepcion;
    private String nombreProductor;   // productor de origen (lote → recepcion → productor)
}
