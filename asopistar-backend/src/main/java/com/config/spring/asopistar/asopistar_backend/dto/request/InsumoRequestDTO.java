package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class InsumoRequestDTO {

    @Size(max = 15, message = "El código no puede superar 15 caracteres")
    private String codigo;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50, message = "El nombre no puede superar 50 caracteres")
    private String nombre;

    /**
     * Solo acepta: ALEVINO, CONCENTRADO, OTRO
     * unidad_medida se deriva automáticamente en el servicio.
     */
    @NotBlank(message = "El tipo es obligatorio")
    @Pattern(regexp = "ALEVINO|CONCENTRADO|OTRO",
             message = "Tipo debe ser ALEVINO, CONCENTRADO u OTRO")
    private String tipo;

    @Size(max = 100, message = "La descripción no puede superar 100 caracteres")
    private String descripcion;

    @NotNull(message = "El precio unitario es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precioUnitario;

    @NotNull(message = "El stock actual es obligatorio")
    @DecimalMin(value = "0.00", message = "El stock no puede ser negativo")
    private BigDecimal stockActual;

    @NotNull(message = "El stock mínimo es obligatorio")
    @DecimalMin(value = "0.01", message = "El stock mínimo debe ser mayor a 0")
    private BigDecimal stockMinimo;

    /** ACTIVO | INACTIVO — si no se envía, el servicio asigna ACTIVO */
    @Pattern(regexp = "ACTIVO|INACTIVO",
             message = "Estado debe ser ACTIVO o INACTIVO")
    private String estado;
}
