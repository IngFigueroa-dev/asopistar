package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.time.LocalDateTime;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProcesamientoResponseDTO {
 
    private Integer idProcesamiento;
    private String etapa;
    private LocalDateTime fecha;
    private String responsable;
    private String observaciones;
    private Integer idLote;
    private String codigoLote;   // código del lote para contexto
}

