package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LoteCuartoFrioRequestDTO {
 
    @NotBlank(message = "El código del lote es obligatorio")
    @Size(max = 15)
    private String codigoLote;
 
    @NotNull(message = "La fecha de ingreso es obligatoria")
    private LocalDateTime fechaIngreso;
 
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal kilos;
 
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal espacioOcupado;
 
    private Boolean estado;   // true = disponible
 
    @NotNull(message = "La recepción es obligatoria")
    private Integer idRecepcion;
}

