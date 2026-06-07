package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de salida para Siembra.
 * Incluye idProductor para que el frontend pueda filtrar las siembras propias
 * cuando el usuario tiene ROLE_PRODUCTOR.
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SiembraResponseDTO {

    private Integer    idSiembra;
    private LocalDate  fechaSiembra;
    private Integer    cantidadAlevinos;
    private BigDecimal promedioInicial;
    private String     estado;           // EN_CURSO | COSECHADO | PERDIDO
    private String     observaciones;

    // Especie
    private Integer    idEspecie;
    private String     nombreEspecie;

    // Estanque
    private Integer    idEstanque;
    private String     codigoEstanque;

    // Productor (derivado del estanque)
    private Integer    idProductor;      // ← NUEVO: necesario para filtrar en frontend
    private String     nombreProductor;
}
