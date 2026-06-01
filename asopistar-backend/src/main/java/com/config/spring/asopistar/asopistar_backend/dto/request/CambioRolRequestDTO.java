package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CambioRolRequestDTO {

    @NotNull(message = "El id del nuevo rol es obligatorio")
    private Integer idRol;
}
