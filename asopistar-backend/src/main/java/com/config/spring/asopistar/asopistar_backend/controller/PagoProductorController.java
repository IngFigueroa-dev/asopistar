package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.PagoProductorRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoEstadisticasResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PagoProductorResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.PagoProductorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el módulo de Pagos a Productores.
 *
 * Rutas disponibles:
 *   GET    /pagos-productor                        → Listar con filtros opcionales
 *   GET    /pagos-productor/pendientes              → Solo pagos PENDIENTE
 *   GET    /pagos-productor/estadisticas            → Estadísticas agregadas
 *   GET    /pagos-productor/{id}                   → Detalle de un pago
 *   POST   /pagos-productor                        → Registrar nuevo pago
 *   PATCH  /pagos-productor/{id}/marcar-pagado     → Marcar como PAGADO
 */
@RestController
@RequestMapping("/pagos-productor")
public class PagoProductorController {

    private final PagoProductorService service;

    public PagoProductorController(PagoProductorService service) {
        this.service = service;
    }

    /**
     * Lista todos los pagos con filtros opcionales por estado y/o productor.
     * Acceso: ADMIN, CONTADORA
     *
     * Ejemplos:
     *   GET /pagos-productor
     *   GET /pagos-productor?estado=PENDIENTE
     *   GET /pagos-productor?idProductor=3
     *   GET /pagos-productor?estado=PAGADO&idProductor=3
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADORA')")
    public ResponseEntity<List<PagoProductorResponseDTO>> listarPagos(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Integer idProductor) {
        return ResponseEntity.ok(service.listarPagos(estado, idProductor));
    }

    /**
     * Alias conveniente que devuelve solo pagos PENDIENTE.
     * Usado en el dashboard de la contadora.
     */
    @GetMapping("/pendientes")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADORA')")
    public ResponseEntity<List<PagoProductorResponseDTO>> listarPendientes() {
        return ResponseEntity.ok(service.listarPendientes());
    }

    /**
     * Estadísticas agregadas: totales pagados, pendientes, promedios.
     */
    @GetMapping("/estadisticas")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADORA')")
    public ResponseEntity<PagoEstadisticasResponseDTO> obtenerEstadisticas() {
        return ResponseEntity.ok(service.obtenerEstadisticas());
    }

    /**
     * Detalle de un pago específico.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADORA')")
    public ResponseEntity<PagoProductorResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    /**
     * Registra un nuevo pago (queda en estado PENDIENTE).
     * Calcula automáticamente: monto = kilosPagados × precioKg
     * Valida que la recepción no tenga ya un pago activo.
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADORA')")
    public ResponseEntity<PagoProductorResponseDTO> registrarPago(
            @Valid @RequestBody PagoProductorRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrarPago(request));
    }

    /**
     * Marca un pago existente como PAGADO y actualiza la fecha efectiva.
     * Lanza BusinessException si ya estaba PAGADO.
     */
    @PatchMapping("/{id}/marcar-pagado")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADORA')")
    public ResponseEntity<PagoProductorResponseDTO> marcarComoPagado(@PathVariable Integer id) {
        return ResponseEntity.ok(service.marcarComoPagado(id));
    }
}
