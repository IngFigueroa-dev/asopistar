package com.config.spring.asopistar.asopistar_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class EnvioRequestDTO {

    @NotBlank(message = "La ciudad de destino es obligatoria")
    private String destinoCiudad;

    // CLIENTE o PUNTO_VENTA
    @NotBlank(message = "El tipo de destino es obligatorio")
    private String tipoDestino;

    private Integer idCliente;
    private Integer idPunto;

    private String observaciones;

    // IDs de los lotes del cuarto frío que van en este envío
    @NotEmpty(message = "Debe incluir al menos un lote")
    private List<Integer> idLotes;

    // ── Getters y Setters ─────────────────────────────────────────────────

    public String getDestinoCiudad() { return destinoCiudad; }
    public void setDestinoCiudad(String d) { this.destinoCiudad = d; }

    public String getTipoDestino() { return tipoDestino; }
    public void setTipoDestino(String t) { this.tipoDestino = t; }

    public Integer getIdCliente() { return idCliente; }
    public void setIdCliente(Integer i) { this.idCliente = i; }

    public Integer getIdPunto() { return idPunto; }
    public void setIdPunto(Integer i) { this.idPunto = i; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String o) { this.observaciones = o; }

    public List<Integer> getIdLotes() { return idLotes; }
    public void setIdLotes(List<Integer> l) { this.idLotes = l; }
}