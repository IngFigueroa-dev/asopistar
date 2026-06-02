package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.PuntoVentaEstadoRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.PuntoVentaRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.PuntoVentaResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.PuntoVenta;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.PuntoVentaRepository;
import com.config.spring.asopistar.asopistar_backend.service.PuntoVentaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PuntoVentaServiceImpl implements PuntoVentaService {

    private final PuntoVentaRepository repo;

    // ── Consultas ────────────────────────────────────────────────────────────

    @Override
    public List<PuntoVentaResponseDTO> listarTodos() {
        return repo.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<PuntoVentaResponseDTO> listarActivos() {
        return repo.findByEstado("ACTIVO").stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public PuntoVentaResponseDTO obtenerPorId(Integer id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    public List<PuntoVentaResponseDTO> buscar(String query) {
        if (query == null || query.isBlank()) {
            return listarTodos();
        }
        return repo.buscar(query.trim()).stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Mutaciones ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PuntoVentaResponseDTO crear(PuntoVentaRequestDTO request) {
        // Validar unicidad de código
        if (repo.existsByCodigo(request.getCodigo())) {
            throw new BusinessException(
                "Ya existe un punto de venta con el código '" + request.getCodigo() + "'.");
        }

        PuntoVenta nuevo = PuntoVenta.builder()
                .codigo(request.getCodigo().toUpperCase())
                .nombre(request.getNombre())
                .tipo(request.getTipo())
                .direccion(request.getDireccion())
                .ciudad(request.getCiudad())
                .departamento(request.getDepartamento())
                .responsable(request.getResponsable())
                .cargoResponsable(request.getCargoResponsable())
                .telefono(request.getTelefono())
                .correo(request.getCorreo())
                .fechaApertura(request.getFechaApertura())
                .observaciones(request.getObservaciones())
                .estado("ACTIVO")
                .activo(true)
                .build();

        PuntoVenta guardado = repo.save(nuevo);
        log.info("Punto de venta creado: {} ({})", guardado.getNombre(), guardado.getCodigo());
        return toResponse(guardado);
    }

    @Override
    @Transactional
    public PuntoVentaResponseDTO actualizar(Integer id, PuntoVentaRequestDTO request) {
        PuntoVenta punto = findOrThrow(id);

        // Validar unicidad de código excluyendo el propio registro
        if (repo.existsByCodigoAndIdPuntoNot(request.getCodigo(), id)) {
            throw new BusinessException(
                "Ya existe otro punto de venta con el código '" + request.getCodigo() + "'.");
        }

        punto.setCodigo(request.getCodigo().toUpperCase());
        punto.setNombre(request.getNombre());
        punto.setTipo(request.getTipo());
        punto.setDireccion(request.getDireccion());
        punto.setCiudad(request.getCiudad());
        punto.setDepartamento(request.getDepartamento());
        punto.setResponsable(request.getResponsable());
        punto.setCargoResponsable(request.getCargoResponsable());
        punto.setTelefono(request.getTelefono());
        punto.setCorreo(request.getCorreo());
        punto.setFechaApertura(request.getFechaApertura());
        punto.setObservaciones(request.getObservaciones());

        log.info("Punto de venta actualizado: {} ({})", punto.getNombre(), punto.getCodigo());
        return toResponse(repo.save(punto));
    }

    @Override
    @Transactional
    public PuntoVentaResponseDTO cambiarEstado(Integer id, PuntoVentaEstadoRequestDTO request) {
        PuntoVenta punto = findOrThrow(id);
        String estadoAnterior = punto.getEstado();
        punto.setEstado(request.getEstado());
        // @PreUpdate sincroniza el campo activo automáticamente

        log.info("Estado de punto de venta '{}' cambiado: {} → {}",
                punto.getNombre(), estadoAnterior, request.getEstado());
        return toResponse(repo.save(punto));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private PuntoVenta findOrThrow(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Punto de venta no encontrado con ID: " + id));
    }

    private PuntoVentaResponseDTO toResponse(PuntoVenta p) {
        return PuntoVentaResponseDTO.builder()
                .idPunto(p.getIdPunto())
                .codigo(p.getCodigo())
                .nombre(p.getNombre())
                .tipo(p.getTipo())
                .direccion(p.getDireccion())
                .ciudad(p.getCiudad())
                .departamento(p.getDepartamento())
                .responsable(p.getResponsable())
                .cargoResponsable(p.getCargoResponsable())
                .telefono(p.getTelefono())
                .correo(p.getCorreo())
                .fechaApertura(p.getFechaApertura())
                .observaciones(p.getObservaciones())
                .estado(p.getEstado())
                .activo(p.getActivo())
                .fechaCreacion(p.getFechaCreacion())
                .build();
    }
}
