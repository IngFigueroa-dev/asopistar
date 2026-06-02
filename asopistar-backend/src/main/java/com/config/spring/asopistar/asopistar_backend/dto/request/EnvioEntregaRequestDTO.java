package com.config.spring.asopistar.asopistar_backend.dto.request;

import lombok.Data;

/**
 * DTO para PATCH /envios/{id}/entrega
 * Registra la evidencia cuando un envío es marcado como ENTREGADO.
 * Arquitectura preparada para futuras extensiones (imagen, firma digital).
 */
@Data
public class EnvioEntregaRequestDTO {

    /** Nombre de quien recibió el pedido. */
    private String nombreReceptor;

    /** Observación del receptor o del repartidor al momento de la entrega. */
    private String observacionEntrega;

    // Preparado para futura implementación:
    // private String imagenEntregaBase64;
    // private String firmaDigitalBase64;
}
