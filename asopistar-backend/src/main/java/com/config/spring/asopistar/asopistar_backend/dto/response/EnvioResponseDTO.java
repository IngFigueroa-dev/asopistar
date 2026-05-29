package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EnvioResponseDTO {

    private Integer       idEnvio;
    private LocalDateTime fechaEnvio;
    private String        destinoCiudad;
    private String        tipoDestino;      // CLIENTE | PUNTO_VENTA
    private String        estado;           // PREPARADO | EN_CAMINO | ENTREGADO
    private String        observaciones;

    // Destino
    private Integer       idCliente;
    private String        nombreCliente;
    private Integer       idPunto;
    private String        nombrePunto;

    // Totales calculados
    private BigDecimal    totalKilos;
    private Integer       totalLotes;

    // Detalle de lotes incluidos
    private List<DetalleLoteDTO> lotes;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DetalleLoteDTO {
        private Integer    idDetalle;
        private Integer    idLote;
        private String     codigoLote;
        private BigDecimal kilos;
        private String     nombreProductor;
        private String     observaciones;
    }
}