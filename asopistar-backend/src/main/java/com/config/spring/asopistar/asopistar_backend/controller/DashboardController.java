package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.response.AlertaDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardComercialDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardFinanzasDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardPlantaDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardProduccionDTO;
import com.config.spring.asopistar.asopistar_backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controlador REST del Dashboard Analítico de ASOPISTAR.
 *
 * Cada endpoint está protegido con @PreAuthorize a nivel de método.
 * Esto garantiza que aunque el frontend cambie el rol en localStorage,
 * el backend rechaza con 403 cualquier acceso no autorizado.
 *
 * Base URL: /api/dashboard
 *
 * Roles del sistema (según SecurityConfig):
 *   ROLE_ADMINISTRADOR_GENERAL
 *   ROLE_GERENTE_PLANTA
 *   ROLE_GERENTE_COMERCIAL
 *   ROLE_CONTADORA
 *   ROLE_BIOLOGO
 *   ROLE_SECRETARIA
 *   ROLE_VENDEDOR_INSUMOS
 *   ROLE_PRODUCTOR
 *   ROLE_PERSONAL_CUARTO_FRIO
 */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/dashboard/produccion
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * KPIs de producción: siembras activas, listas para cosechar, seguimientos,
     * turnos pendientes y de emergencia, productores y estanques activos.
     *
     * Acceso: roles que gestionan o supervisan el ciclo productivo.
     */
    @GetMapping("/produccion")
    @PreAuthorize("""
        hasAnyAuthority(
          'ROLE_ADMINISTRADOR_GENERAL',
          'ROLE_GERENTE_PLANTA',
          'ROLE_BIOLOGO',
          'ROLE_SECRETARIA'
        )
        """)
    public ResponseEntity<DashboardProduccionDTO> produccion() {
        return ResponseEntity.ok(dashboardService.obtenerProduccion());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/dashboard/planta
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * KPIs de planta: recepciones del mes, kilos recibidos, inventario
     * en cuarto frío y lotes pendientes de decisión.
     *
     * Acceso: roles operativos de la planta de procesamiento.
     */
    @GetMapping("/planta")
    @PreAuthorize("""
        hasAnyAuthority(
          'ROLE_ADMINISTRADOR_GENERAL',
          'ROLE_GERENTE_PLANTA',
          'ROLE_PERSONAL_CUARTO_FRIO'
        )
        """)
    public ResponseEntity<DashboardPlantaDTO> planta() {
        return ResponseEntity.ok(dashboardService.obtenerPlanta());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/dashboard/comercial
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * KPIs comerciales: envíos por estado, total de clientes
     * y puntos de venta activos.
     *
     * Acceso: roles del área comercial y secretaría.
     */
    @GetMapping("/comercial")
    @PreAuthorize("""
        hasAnyAuthority(
          'ROLE_ADMINISTRADOR_GENERAL',
          'ROLE_GERENTE_COMERCIAL',
          'ROLE_SECRETARIA'
        )
        """)
    public ResponseEntity<DashboardComercialDTO> comercial() {
        return ResponseEntity.ok(dashboardService.obtenerComercial());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/dashboard/finanzas
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * KPIs financieros: pagos a productores (pagados, pendientes, del mes)
     * e ingresos de ASOPISTAR (mes, total, cartera pendiente).
     *
     * Acceso restringido: solo roles financieros.
     * Un productor que modifique su localStorage nunca accederá a este endpoint.
     */
    @GetMapping("/finanzas")
    @PreAuthorize("""
        hasAnyAuthority(
          'ROLE_ADMINISTRADOR_GENERAL',
          'ROLE_CONTADORA'
        )
        """)
    public ResponseEntity<DashboardFinanzasDTO> finanzas() {
        return ResponseEntity.ok(dashboardService.obtenerFinanzas());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/dashboard/alertas
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Lista consolidada de alertas operativas con prioridad (ALTA, MEDIA, BAJA).
     * Si no hay condiciones que generen alertas, retorna lista vacía — nunca null.
     *
     * Acceso: todos los roles operativos (cada rol verá las alertas relevantes
     * desde el frontend, el backend retorna todas y el frontend filtra por módulo).
     */
    @GetMapping("/alertas")
    @PreAuthorize("""
        hasAnyAuthority(
          'ROLE_ADMINISTRADOR_GENERAL',
          'ROLE_GERENTE_PLANTA',
          'ROLE_GERENTE_COMERCIAL',
          'ROLE_CONTADORA',
          'ROLE_BIOLOGO',
          'ROLE_SECRETARIA'
        )
        """)
    public ResponseEntity<List<AlertaDTO>> alertas() {
        return ResponseEntity.ok(dashboardService.obtenerAlertas());
    }
}
