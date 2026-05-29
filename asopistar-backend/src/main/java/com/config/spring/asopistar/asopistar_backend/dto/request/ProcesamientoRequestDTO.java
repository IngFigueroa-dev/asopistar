package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class ProcesamientoRequestDTO {

    // No se necesita idLote porque el procesamiento se asocia a la recepción
    private Integer idRecepcion;

    @NotBlank(message = "El responsable es obligatorio")
    private String responsable;

    private String observaciones;

    public Integer getIdRecepcion() { return idRecepcion; }
    public void setIdRecepcion(Integer idRecepcion) { this.idRecepcion = idRecepcion; }

    public String getResponsable() { return responsable; }
    public void setResponsable(String responsable) { this.responsable = responsable; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
