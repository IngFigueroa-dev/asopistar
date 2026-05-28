package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
 
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SiembraResponseDTO {
 
    private Integer idSiembra;
    private LocalDate fechaSiembra;
    private Integer cantidadAlevinos;
    private BigDecimal promedioInicial;
    private String estado;
    private String observaciones;
    private Integer idEspecie;
    private String nombreEspecie;       
    private Integer idEstanque;
    private String codigoEstanque;      
    private String nombreProductor;    
}
