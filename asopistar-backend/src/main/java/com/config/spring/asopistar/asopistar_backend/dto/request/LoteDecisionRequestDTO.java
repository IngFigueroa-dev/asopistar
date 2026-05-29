package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class LoteDecisionRequestDTO {

    // "ALMACENAR" o "DESPACHAR"
    @NotBlank(message = "La decisión es obligatoria: ALMACENAR o DESPACHAR")
    private String decision;

    // Solo requerido si decision = DESPACHAR
    // "CLIENTE" o "PUNTO_VENTA"
    private String tipoDestino;

    private Integer idCliente;      // si tipoDestino = CLIENTE
    private Integer idPunto;        // si tipoDestino = PUNTO_VENTA
    private String  destinoCiudad;
    private String  observaciones;

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getTipoDestino() { return tipoDestino; }
    public void setTipoDestino(String tipoDestino) { this.tipoDestino = tipoDestino; }

    public Integer getIdCliente() { return idCliente; }
    public void setIdCliente(Integer idCliente) { this.idCliente = idCliente; }

    public Integer getIdPunto() { return idPunto; }
    public void setIdPunto(Integer idPunto) { this.idPunto = idPunto; }

    public String getDestinoCiudad() { return destinoCiudad; }
    public void setDestinoCiudad(String destinoCiudad) { this.destinoCiudad = destinoCiudad; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
