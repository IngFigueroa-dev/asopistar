package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class IngresoResponseDTO {

    private Integer       idIngreso;
    private String        numeroIngreso;
    private LocalDateTime fecha;
    private String        concepto;
    private String        tipoIngreso;
    private String        tipoOrigen;       // campo original conservado
    private String        referencia;

    // ── Financiero ────────────────────────────────────────────────────────────
    private BigDecimal    valorTotal;
    private BigDecimal    valorPagado;
    private BigDecimal    saldoPendiente;
    private String        estadoPago;       // PENDIENTE | PARCIAL | PAGADO | ANULADO
    private Integer       porcentajePagado; // 0-100

    // ── Cliente ───────────────────────────────────────────────────────────────
    private Integer       idCliente;
    private String        razonSocial;
    private String        nit;
    private String        tipoCliente;
    private String        ciudadCliente;

    // ── Operación asociada ────────────────────────────────────────────────────
    private Integer       idEnvio;
    private Integer       idVentaInsumo;

    // ── Historial de pagos ────────────────────────────────────────────────────
    private List<PagoIngresoResponseDTO> pagos;

    // ── Auditoría ─────────────────────────────────────────────────────────────
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
