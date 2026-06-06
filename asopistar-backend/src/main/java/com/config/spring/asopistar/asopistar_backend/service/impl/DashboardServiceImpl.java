package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.response.AlertaDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardComercialDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardFinanzasDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardPlantaDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.DashboardProduccionDTO;
import com.config.spring.asopistar.asopistar_backend.repository.EnvioRepository;
import com.config.spring.asopistar.asopistar_backend.repository.IngresoRepository;
import com.config.spring.asopistar.asopistar_backend.repository.LoteCuartoFrioRepository;
import com.config.spring.asopistar.asopistar_backend.repository.PagoProductorRepository;
import com.config.spring.asopistar.asopistar_backend.repository.ProductorRepository;
import com.config.spring.asopistar.asopistar_backend.repository.RecepcionRepository;
import com.config.spring.asopistar.asopistar_backend.repository.SiembraRepository;
import com.config.spring.asopistar.asopistar_backend.repository.SeguimientoSiembraRepository;
import com.config.spring.asopistar.asopistar_backend.repository.TurnoPescaRepository;
import com.config.spring.asopistar.asopistar_backend.repository.EstanqueRepository;
import com.config.spring.asopistar.asopistar_backend.repository.ClienteRepository;
import com.config.spring.asopistar.asopistar_backend.repository.DetalleEnvioLoteRepository;
import com.config.spring.asopistar.asopistar_backend.repository.PuntoVentaRepository;
import com.config.spring.asopistar.asopistar_backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final SiembraRepository           siembraRepo;
    private final SeguimientoSiembraRepository seguimientoRepo;
    private final TurnoPescaRepository         turnoRepo;
    private final ProductorRepository          productorRepo;
    private final EstanqueRepository           estanqueRepo;
    private final RecepcionRepository          recepcionRepo;
    private final LoteCuartoFrioRepository     loteRepo;
    private final EnvioRepository              envioRepo;
    private final ClienteRepository            clienteRepo;
    private final PuntoVentaRepository         puntoVentaRepo;
    private final PagoProductorRepository      pagoRepo;
    private final IngresoRepository            ingresoRepo;
    private final DetalleEnvioLoteRepository detalleEnvioLoteRepo;

    // ── Helpers de fecha ──────────────────────────────────────────────────────

    private int mesActual() {
        return LocalDate.now().getMonthValue();
    }

    private int anioActual() {
        return LocalDate.now().getYear();
    }

    // ── Producción ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public DashboardProduccionDTO obtenerProduccion() {

        BigDecimal pesoPromedio = seguimientoRepo.findPesoPromedioUltimoSeguimiento();

        return DashboardProduccionDTO.builder()
                // Siembras
                .siembrasActivas(siembraRepo.countSiembrasActivas())
                .totalSiembras(siembraRepo.countTotalSiembras())
                .siembrasListasParaCosechar(siembraRepo.countSiembrasListasParaCosechar())
                .alevinosTotalesActivos(siembraRepo.sumAlevinosActivos())
                // Seguimientos
                .siembrasSinSeguimiento(siembraRepo.countSiembrasSinSeguimiento())
                .pesoPromedioUltimoSeguimiento(
                        pesoPromedio != null ? pesoPromedio : BigDecimal.ZERO)
                // Turnos
                .turnosPendientes(turnoRepo.countByEstadoIn(
                        List.of("PENDIENTE", "CONFIRMADO")))
                .turnosEmergencia(turnoRepo.countEmergenciasPendientes())
                .turnosRealizados(turnoRepo.countByEstado("REALIZADO"))
                // Productores y estanques
                .productoresActivos(productorRepo.countByActivoTrue())
                .estanquesActivos(estanqueRepo.countByEstadoEstanque("ACTIVO"))
                .build();
    }

    // ── Planta ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public DashboardPlantaDTO obtenerPlanta() {
        int mes  = mesActual();
        int anio = anioActual();

        return DashboardPlantaDTO.builder()
                // Recepciones
                .recepcionesMes(recepcionRepo.countRecepcionesMes(mes, anio))
                .recepcionesTotal(recepcionRepo.countRecepcionesTotal())
                .kilosRecibidosMes(recepcionRepo.sumKilosRecibidosMes(mes, anio))
                .kilosRecibidosTotal(recepcionRepo.sumKilosRecibidosTotal())
                // Cuarto frío
                .lotesDisponibles(loteRepo.countByEstadoTrue())
                .lotesDespachados(loteRepo.countByEstadoFalse())
                .kilosEnFrio(loteRepo.sumKilosDisponibles())
                // Procesamiento
                .lotesPendientesDecision(loteRepo.countByEstadoDecision("PENDIENTE_DECISION"))
                .build();
    }

    // ── Comercial ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public DashboardComercialDTO obtenerComercial() {
        int mes  = mesActual();
        int anio = anioActual();

        return DashboardComercialDTO.builder()
                // Envíos
                .enviosPreparados(envioRepo.countByEstado("PREPARADO"))
                .enviosEnCamino(envioRepo.countByEstado("EN_CAMINO"))
                .enviosEntregadosMes(envioRepo.countEntregadosMes(mes, anio))
                .enviosTotal(envioRepo.countTotal())
                // Kilos despachados: se calculan desde lotes despachados del mes
                // Este campo se completará cuando exista DetalleEnvioRepository con la query correspondiente.
                // Por ahora se retorna 0 para no bloquear el despliegue.
                .kilosDespachadosMes(detalleEnvioLoteRepo.sumKilosDespachadosMes(mes, anio))
                // Clientes y puntos
                .clientesTotal(clienteRepo.count())
                .puntosVentaActivos(puntoVentaRepo.countByActivoTrue())
                .build();
    }

    // ── Finanzas ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public DashboardFinanzasDTO obtenerFinanzas() {
        int mes  = mesActual();
        int anio = anioActual();

        return DashboardFinanzasDTO.builder()
                // Pagos a productores
                .totalPagado(pagoRepo.sumTotalPagado())
                .totalPendiente(pagoRepo.sumTotalPendiente())
                .cantidadPagados(pagoRepo.countPagados())
                .cantidadPendientes(pagoRepo.countPendientes())
                .pagadosMes(pagoRepo.sumPagadosMes(mes, anio))
                // Ingresos de ASOPISTAR
                .ingresosMes(ingresoRepo.sumIngresosMes(mes, anio))
                .ingresosTotal(ingresoRepo.sumIngresosTotal())
                .carteraPendiente(ingresoRepo.sumCarteraPendiente())
                .ingresosConSaldo(ingresoRepo.countIngresosConSaldo())
                .ingresosPescadoMes(ingresoRepo.sumIngresosPescadoMes(mes, anio))
                .ingresosInsumosMes(ingresoRepo.sumIngresosInsumosMes(mes, anio))
                .build();
    }

    // ── Alertas ───────────────────────────────────────────────────────────────

    /**
     * Genera alertas operativas evaluando condiciones de negocio en tiempo real.
     * Solo se incluye una alerta si la condición se cumple — si todo está bien,
     * la lista retorna vacía (el frontend muestra "Sin alertas pendientes").
     *
     * Umbrales configurados:
     * - Siembras sin seguimiento: cualquier cantidad genera alerta ALTA
     * - Turnos de emergencia pendientes: cualquier cantidad genera alerta ALTA
     * - Pagos pendientes: cualquier cantidad genera alerta MEDIA
     * - Lotes pendientes de decisión: cualquier cantidad genera alerta MEDIA
     * - Envíos preparados sin despachar: > 0 genera alerta BAJA
     * - Cartera pendiente: > 0 genera alerta MEDIA
     */
    @Override
    @Transactional(readOnly = true)
    public List<AlertaDTO> obtenerAlertas() {
        List<AlertaDTO> alertas = new ArrayList<>();

        // ── ALTA: biólogo sin visitar estanques activos ───────────────────────
        long sinSeguimiento = siembraRepo.countSiembrasSinSeguimiento();
        if (sinSeguimiento > 0) {
            alertas.add(AlertaDTO.builder()
                    .prioridad("ALTA")
                    .modulo("PRODUCCION")
                    .titulo("Siembras sin seguimiento")
                    .descripcion(sinSeguimiento + " siembra(s) activa(s) aún no han sido visitadas por el biólogo.")
                    .build());
        }

        // ── ALTA: turnos de emergencia pendientes ─────────────────────────────
        long emergencias = turnoRepo.countEmergenciasPendientes();
        if (emergencias > 0) {
            alertas.add(AlertaDTO.builder()
                    .prioridad("ALTA")
                    .modulo("PRODUCCION")
                    .titulo("Turnos de emergencia activos")
                    .descripcion(emergencias + " turno(s) de EMERGENCIA están pendientes o confirmados.")
                    .build());
        }

        // ── MEDIA: pagos a productores sin completar ──────────────────────────
        long pagosPendientes = pagoRepo.countPendientes();
        if (pagosPendientes > 0) {
            alertas.add(AlertaDTO.builder()
                    .prioridad("MEDIA")
                    .modulo("FINANZAS")
                    .titulo("Pagos pendientes a productores")
                    .descripcion(pagosPendientes + " pago(s) a productores aún no han sido completados.")
                    .build());
        }

        // ── MEDIA: lotes en cuarto frío sin decisión ──────────────────────────
        long lotesSinDecision = loteRepo.countByEstadoDecision("PENDIENTE_DECISION");
        if (lotesSinDecision > 0) {
            alertas.add(AlertaDTO.builder()
                    .prioridad("MEDIA")
                    .modulo("PLANTA")
                    .titulo("Lotes pendientes de decisión")
                    .descripcion(lotesSinDecision + " lote(s) en cuarto frío esperan asignación de destino.")
                    .build());
        }

        // ── BAJA: envíos preparados listos para despachar ─────────────────────
        long enviosPreparados = envioRepo.countByEstado("PREPARADO");
        if (enviosPreparados > 0) {
            alertas.add(AlertaDTO.builder()
                    .prioridad("BAJA")
                    .modulo("COMERCIAL")
                    .titulo("Envíos listos para despachar")
                    .descripcion(enviosPreparados + " envío(s) están preparados y esperan ser despachados.")
                    .build());
        }

        // ── MEDIA: cartera pendiente de cobro ─────────────────────────────────
        BigDecimal cartera = ingresoRepo.sumCarteraPendiente();
        if (cartera != null && cartera.compareTo(BigDecimal.ZERO) > 0) {
            alertas.add(AlertaDTO.builder()
                    .prioridad("MEDIA")
                    .modulo("FINANZAS")
                    .titulo("Cartera pendiente de cobro")
                    .descripcion("Hay $" + String.format("%,.0f", cartera) + " en ingresos sin cobrar completamente.")
                    .build());
        }

        return alertas;
    }
}
