package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.response.ReporteEnvioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ReporteLoteResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ReportePagoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ReporteProduccionResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ReporteRecepcionResponseDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ReporteTurnoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Envio;
import com.config.spring.asopistar.asopistar_backend.entity.LoteCuartoFrio;
import com.config.spring.asopistar.asopistar_backend.entity.PagoProductor;
import com.config.spring.asopistar.asopistar_backend.entity.Recepcion;
import com.config.spring.asopistar.asopistar_backend.entity.SeguimientoSiembra;
import com.config.spring.asopistar.asopistar_backend.entity.Siembra;
import com.config.spring.asopistar.asopistar_backend.entity.TurnoPesca;
import com.config.spring.asopistar.asopistar_backend.repository.EnvioRepository;
import com.config.spring.asopistar.asopistar_backend.repository.LoteCuartoFrioRepository;
import com.config.spring.asopistar.asopistar_backend.repository.PagoProductorRepository;
import com.config.spring.asopistar.asopistar_backend.repository.RecepcionRepository;
import com.config.spring.asopistar.asopistar_backend.repository.SeguimientoSiembraRepository;
import com.config.spring.asopistar.asopistar_backend.repository.SiembraRepository;
import com.config.spring.asopistar.asopistar_backend.repository.TurnoPescaRepository;
import com.config.spring.asopistar.asopistar_backend.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReporteServiceImpl implements ReporteService {

    @Autowired
    private RecepcionRepository recepcionRepository;

    @Autowired
    private SiembraRepository siembraRepository;

    @Autowired
    private LoteCuartoFrioRepository loteCuartoFrioRepository;

    @Autowired
    private EnvioRepository envioRepository;

    @Autowired
    private PagoProductorRepository pagoProductorRepository;

    @Autowired
    private TurnoPescaRepository turnoPescaRepository;

    @Autowired
    private SeguimientoSiembraRepository seguimientoSiembraRepository;

    // ─── RECEPCIONES ────────────────────────────────────────────────────────────

    @Override
    public List<ReporteRecepcionResponseDTO> getReporteRecepciones(LocalDate fechaInicio,
                                                            LocalDate fechaFin,
                                                            String nombreProductor) {
        LocalDateTime inicio = fechaInicio != null
                ? fechaInicio.atStartOfDay()
                : LocalDate.of(2000, 1, 1).atStartOfDay();
        LocalDateTime fin = fechaFin != null
                ? fechaFin.atTime(LocalTime.MAX)
                : LocalDateTime.now();

        List<Recepcion> todas = recepcionRepository.findAll();
        List<ReporteRecepcionResponseDTO> resultado = new ArrayList<>();

        for (Recepcion r : todas) {
            // Filtro de fechas
            if (r.getFechaHora().isBefore(inicio) || r.getFechaHora().isAfter(fin)) continue;

            // Filtro productor
            String nombreProd = buildNombreProductor(
                    r.getProductor().getNombre1(),
                    r.getProductor().getNombre2(),
                    r.getProductor().getApellido1(),
                    r.getProductor().getApellido2()
            );
            if (nombreProductor != null && !nombreProductor.isBlank()) {
                if (!nombreProd.toLowerCase().contains(nombreProductor.toLowerCase())) continue;
            }

            // El lote se busca desde el propio repositorio porque la relación es
            // inversa: LoteCuartoFrio -> Recepcion (no al revés en la entidad)
            String codigoLote = "Sin lote";
            List<LoteCuartoFrio> lotes = loteCuartoFrioRepository
                    .findByRecepcionIdRecepcion(r.getIdRecepcion());
            if (!lotes.isEmpty()) {
                codigoLote = lotes.get(0).getCodigoLote();
            }

            // El nombre del método en tu entidad puede ser getTurnoPesca()
            // Ajusta aquí si el getter se llama diferente
            String estadoTurno = "—";
            if (r.getTurnoPesca() != null) {
                estadoTurno = r.getTurnoPesca().getEstado();
            }

            ReporteRecepcionResponseDTO dto = new ReporteRecepcionResponseDTO(
                    r.getIdRecepcion(),
                    r.getFechaHora(),
                    nombreProd,
                    r.getProductor().getDocumento(),
                    r.getKilosRecibidos(),
                    r.getObservaciones(),
                    estadoTurno,
                    codigoLote
            );
            resultado.add(dto);
        }

        return resultado;
    }

    // ─── PRODUCCIÓN ─────────────────────────────────────────────────────────────

    @Override
    public List<ReporteProduccionResponseDTO> getReporteProduccion(LocalDate fechaInicio,
                                                            LocalDate fechaFin,
                                                            String estado,
                                                            String nombreEspecie) {
        LocalDate inicio = fechaInicio != null ? fechaInicio : LocalDate.of(2000, 1, 1);
        LocalDate fin    = fechaFin    != null ? fechaFin    : LocalDate.now();

        List<Siembra> todas = siembraRepository.findAll();
        List<ReporteProduccionResponseDTO> resultado = new ArrayList<>();

        for (Siembra s : todas) {
            // Filtro fechas
            if (s.getFechaSiembra().isBefore(inicio) || s.getFechaSiembra().isAfter(fin)) continue;
            // Filtro estado
            if (estado != null && !estado.isBlank() && !s.getEstado().equals(estado)) continue;
            // Filtro especie
            if (nombreEspecie != null && !nombreEspecie.isBlank()) {
                if (!s.getEspecie().getNombre().toLowerCase().contains(nombreEspecie.toLowerCase())) continue;
            }

            String nombreProd = s.getEstanque().getProductor().getNombre1()
                    + " " + s.getEstanque().getProductor().getApellido1();

            List<SeguimientoSiembra> seguimientos =
                    seguimientoSiembraRepository.findBySiembra_IdSiembra(s.getIdSiembra());

            int totalSeguimientos = seguimientos.size();

            BigDecimal ultimoPeso = null;
            String aptoCosecha = "N";
            if (!seguimientos.isEmpty()) {
                SeguimientoSiembra ultimo = seguimientos.get(seguimientos.size() - 1);
                ultimoPeso  = ultimo.getPesoPromedio();
                aptoCosecha = String.valueOf(ultimo.getAptoCosecha());
            }

            ReporteProduccionResponseDTO dto = new ReporteProduccionResponseDTO(
                    s.getIdSiembra(),
                    s.getFechaSiembra(),
                    s.getEspecie().getNombre(),
                    s.getEstanque().getNombre(),
                    s.getEstanque().getCodigo(),
                    nombreProd,
                    s.getCantidadAlevinos(),
                    s.getPromedioInicial(),
                    s.getEstado(),
                    s.getObservaciones(),
                    totalSeguimientos,
                    ultimoPeso,
                    aptoCosecha
            );
            resultado.add(dto);
        }

        return resultado;
    }

    // ─── LOTES CUARTO FRÍO ───────────────────────────────────────────────────────

    @Override
    public List<ReporteLoteResponseDTO> getReporteLotes(LocalDate fechaInicio,
                                                 LocalDate fechaFin,
                                                 String estado) {
        LocalDateTime inicio = fechaInicio != null
                ? fechaInicio.atStartOfDay()
                : LocalDate.of(2000, 1, 1).atStartOfDay();
        LocalDateTime fin = fechaFin != null
                ? fechaFin.atTime(LocalTime.MAX)
                : LocalDateTime.now();

        List<LoteCuartoFrio> todos = loteCuartoFrioRepository.findAll();
        List<ReporteLoteResponseDTO> resultado = new ArrayList<>();

        for (LoteCuartoFrio l : todos) {
            // Filtro fechas
            if (l.getFechaIngreso().isBefore(inicio) || l.getFechaIngreso().isAfter(fin)) continue;
            // Filtro estado
            if (estado != null && !estado.isBlank()) {
                boolean disponible = Boolean.TRUE.equals(l.getEstado());
                boolean buscaDisponible = "DISPONIBLE".equals(estado);
                if (disponible != buscaDisponible) continue;
            }

            String nombreProd = l.getRecepcion().getProductor().getNombre1()
                    + " " + l.getRecepcion().getProductor().getApellido1();

            ReporteLoteResponseDTO dto = new ReporteLoteResponseDTO(
                    l.getIdLote(),
                    l.getCodigoLote(),
                    l.getFechaIngreso(),
                    l.getKilos(),
                    l.getEstado(),
                    nombreProd,
                    l.getRecepcion().getKilosRecibidos()
            );
            resultado.add(dto);
        }

        return resultado;
    }

    // ─── ENVÍOS ─────────────────────────────────────────────────────────────────

    @Override
    public List<ReporteEnvioResponseDTO> getReporteEnvios(LocalDate fechaInicio,
                                                   LocalDate fechaFin,
                                                   String estado,
                                                   String tipoDestino) {
        LocalDateTime inicio = fechaInicio != null
                ? fechaInicio.atStartOfDay()
                : LocalDate.of(2000, 1, 1).atStartOfDay();
        LocalDateTime fin = fechaFin != null
                ? fechaFin.atTime(LocalTime.MAX)
                : LocalDateTime.now();

        List<Envio> todos = envioRepository.findAll();
        List<ReporteEnvioResponseDTO> resultado = new ArrayList<>();

        for (Envio e : todos) {
            // Filtro fechas
            if (e.getFechaEnvio().isBefore(inicio) || e.getFechaEnvio().isAfter(fin)) continue;
            // Filtro estado
            if (estado != null && !estado.isBlank() && !e.getEstado().equals(estado)) continue;
            // Filtro tipo destino
            if (tipoDestino != null && !tipoDestino.isBlank()
                    && !e.getTipoDestino().equals(tipoDestino)) continue;

            String nombreCliente = null;
            if (e.getCliente() != null) {
                nombreCliente = e.getCliente().getNombre1() + " " + e.getCliente().getApellido1();
            }

            String nombrePunto = null;
            if (e.getPuntoVenta() != null) {
                nombrePunto = e.getPuntoVenta().getNombre();
            }

            ReporteEnvioResponseDTO dto = new ReporteEnvioResponseDTO(
                    e.getIdEnvio(),
                    e.getFechaEnvio(),
                    e.getDestinoCiudad(),
                    e.getTipoDestino(),
                    e.getEstado(),
                    e.getObservaciones(),
                    nombreCliente,
                    nombrePunto
            );
            resultado.add(dto);
        }

        return resultado;
    }

    // ─── PAGOS ──────────────────────────────────────────────────────────────────

    @Override
    public List<ReportePagoResponseDTO> getReportePagos(LocalDate fechaInicio,
                                                 LocalDate fechaFin,
                                                 String estado,
                                                 String nombreProductor) {
        LocalDateTime inicio = fechaInicio != null
                ? fechaInicio.atStartOfDay()
                : LocalDate.of(2000, 1, 1).atStartOfDay();
        LocalDateTime fin = fechaFin != null
                ? fechaFin.atTime(LocalTime.MAX)
                : LocalDateTime.now();

        List<PagoProductor> todos = pagoProductorRepository.findAll();
        List<ReportePagoResponseDTO> resultado = new ArrayList<>();

        for (PagoProductor p : todos) {
            // Filtro fechas
            if (p.getFechaPago().isBefore(inicio) || p.getFechaPago().isAfter(fin)) continue;
            // Filtro estado
            if (estado != null && !estado.isBlank() && !p.getEstado().equals(estado)) continue;
            // Filtro productor
            String nombreProd = buildNombreProductor(
                    p.getProductor().getNombre1(),
                    p.getProductor().getNombre2(),
                    p.getProductor().getApellido1(),
                    null
            );
            if (nombreProductor != null && !nombreProductor.isBlank()) {
                if (!nombreProd.toLowerCase().contains(nombreProductor.toLowerCase())) continue;
            }

            String metodo = p.getMetodoPago() != null ? p.getMetodoPago().getNombre() : "—";

            ReportePagoResponseDTO dto = new ReportePagoResponseDTO(
                    p.getIdPago(),
                    p.getFechaPago(),
                    nombreProd,
                    p.getProductor().getDocumento(),
                    p.getMonto(),
                    p.getPrecioKg(),
                    p.getKilosPagados(),
                    p.getEstado(),
                    metodo
            );
            resultado.add(dto);
        }

        return resultado;
    }

    // ─── TURNOS ─────────────────────────────────────────────────────────────────

    @Override
    public List<ReporteTurnoResponseDTO> getReporteTurnos(LocalDate fechaInicio,
                                                   LocalDate fechaFin,
                                                   String estado,
                                                   String tipoPrioridad) {
        LocalDate inicio = fechaInicio != null ? fechaInicio : LocalDate.of(2000, 1, 1);
        LocalDate fin    = fechaFin    != null ? fechaFin    : LocalDate.now();

        List<TurnoPesca> todos = turnoPescaRepository.findAll();
        List<ReporteTurnoResponseDTO> resultado = new ArrayList<>();

        for (TurnoPesca t : todos) {
            // Filtro fechas
            if (t.getFechaProgramada().isBefore(inicio) || t.getFechaProgramada().isAfter(fin)) continue;
            // Filtro estado
            if (estado != null && !estado.isBlank() && !t.getEstado().equals(estado)) continue;
            // Filtro prioridad
            if (tipoPrioridad != null && !tipoPrioridad.isBlank()
                    && !tipoPrioridad.equals(t.getTipoPrioridad())) continue;

            String nombreProd = t.getProductor().getNombre1()
                    + " " + t.getProductor().getApellido1();
            String nombreEstanque = t.getSiembra().getEstanque().getNombre();
            String codigoEstanque = t.getSiembra().getEstanque().getCodigo();

            ReporteTurnoResponseDTO dto = new ReporteTurnoResponseDTO(
                    t.getIdTurno(),
                    t.getFechaProgramada(),
                    t.getHoraProgramada(),
                    t.getTipoPrioridad(),
                    t.getMotivoEmergencia(),
                    t.getEstado(),
                    nombreProd,
                    t.getProductor().getDocumento(),
                    nombreEstanque,
                    codigoEstanque,
                    t.getSiembra().getCantidadAlevinos()
            );
            resultado.add(dto);
        }

        return resultado;
    }

    // ─── UTILIDADES ─────────────────────────────────────────────────────────────

    private String buildNombreProductor(String nombre1, String nombre2,
                                         String apellido1, String apellido2) {
        StringBuilder sb = new StringBuilder();
        sb.append(nombre1);
        if (nombre2 != null && !nombre2.isBlank()) sb.append(" ").append(nombre2);
        sb.append(" ").append(apellido1);
        if (apellido2 != null && !apellido2.isBlank()) sb.append(" ").append(apellido2);
        return sb.toString().trim();
    }
}
