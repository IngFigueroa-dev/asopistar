package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.ClienteRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ClienteResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Cliente;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.ClienteRepository;
import com.config.spring.asopistar.asopistar_backend.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;

    // ── CRUD ────────────────────────────────────────────────────

    @Override
    @Transactional
    public ClienteResponseDTO crear(ClienteRequestDTO dto) {
        validarUnicidadCreacion(dto);

        Cliente cliente = Cliente.builder()
                .tipoDocumento(dto.getTipoDocumento())
                .numeroDocumento(dto.getNumeroDocumento().trim())
                .nit(dto.getNit().trim())
                .razonSocial(dto.getRazonSocial().trim())
                .tipoCliente(dto.getTipoCliente())
                .clasificacionComercial(
                        dto.getClasificacionComercial() != null
                                ? dto.getClasificacionComercial()
                                : "ACTIVO")
                .nombreContacto(dto.getNombreContacto().trim())
                .cargoContacto(dto.getCargoContacto().trim())
                .telefono(dto.getTelefono().trim())
                .telefonoSecundario(dto.getTelefonoSecundario())
                .correo(dto.getCorreo().trim().toLowerCase())
                .correoSecundario(dto.getCorreoSecundario() != null
                        ? dto.getCorreoSecundario().trim().toLowerCase()
                        : null)
                .direccion(dto.getDireccion().trim())
                .ciudad(dto.getCiudad().trim())
                .departamento(dto.getDepartamento().trim())
                .limiteCredito(dto.getLimiteCredito() != null
                        ? dto.getLimiteCredito()
                        : BigDecimal.ZERO)
                .observaciones(dto.getObservaciones())
                .estado("ACTIVO")
                .build();

        return toResponse(clienteRepository.save(cliente));
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO obtenerPorId(Integer id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listarTodos() {
        return clienteRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Cliente::getRazonSocial))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClienteResponseDTO actualizar(Integer id, ClienteRequestDTO dto) {
        Cliente cliente = findOrThrow(id);
        validarUnicidadActualizacion(dto, id);

        cliente.setTipoDocumento(dto.getTipoDocumento());
        cliente.setNumeroDocumento(dto.getNumeroDocumento().trim());
        cliente.setNit(dto.getNit().trim());
        cliente.setRazonSocial(dto.getRazonSocial().trim());
        cliente.setTipoCliente(dto.getTipoCliente());

        if (dto.getClasificacionComercial() != null) {
            cliente.setClasificacionComercial(dto.getClasificacionComercial());
        }

        cliente.setNombreContacto(dto.getNombreContacto().trim());
        cliente.setCargoContacto(dto.getCargoContacto().trim());
        cliente.setTelefono(dto.getTelefono().trim());
        cliente.setTelefonoSecundario(dto.getTelefonoSecundario());
        cliente.setCorreo(dto.getCorreo().trim().toLowerCase());
        cliente.setCorreoSecundario(dto.getCorreoSecundario() != null
                ? dto.getCorreoSecundario().trim().toLowerCase()
                : null);
        cliente.setDireccion(dto.getDireccion().trim());
        cliente.setCiudad(dto.getCiudad().trim());
        cliente.setDepartamento(dto.getDepartamento().trim());

        if (dto.getLimiteCredito() != null) {
            cliente.setLimiteCredito(dto.getLimiteCredito());
        }
        cliente.setObservaciones(dto.getObservaciones());

        return toResponse(clienteRepository.save(cliente));
    }

    // ── Estado y clasificación ──────────────────────────────────

    @Override
    @Transactional
    public ClienteResponseDTO cambiarEstado(Integer id, String estado) {
        validarEstado(estado);
        Cliente cliente = findOrThrow(id);
        cliente.setEstado(estado);
        return toResponse(clienteRepository.save(cliente));
    }

    @Override
    @Transactional
    public ClienteResponseDTO cambiarClasificacion(Integer id, String clasificacion) {
        validarClasificacion(clasificacion);
        Cliente cliente = findOrThrow(id);
        cliente.setClasificacionComercial(clasificacion);
        return toResponse(clienteRepository.save(cliente));
    }

    // ── Búsqueda ────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> busquedaRapida(String q) {
        if (q == null || q.isBlank()) return listarTodos();
        return clienteRepository.busquedaRapida(q.trim())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> filtrar(String razonSocial, String nit, String ciudad,
                                             String tipoCliente, String estado, String clasificacion) {
        return clienteRepository.filtrar(
                        blankToNull(razonSocial), blankToNull(nit), blankToNull(ciudad),
                        blankToNull(tipoCliente), blankToNull(estado), blankToNull(clasificacion))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listarActivos() {
        return clienteRepository.findByEstado("ACTIVO")
                .stream()
                .sorted(Comparator.comparing(Cliente::getRazonSocial))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Reportes ────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> resumenEstadistico() {
        Map<String, Object> resumen = new LinkedHashMap<>();

        resumen.put("totalClientes",     clienteRepository.count());
        resumen.put("activos",           clienteRepository.countByEstado("ACTIVO"));
        resumen.put("inactivos",         clienteRepository.countByEstado("INACTIVO"));
        resumen.put("bloqueados",        clienteRepository.countByEstado("BLOQUEADO"));
        resumen.put("preferenciales",    clienteRepository.countByClasificacionComercial("PREFERENCIAL"));

        // Conteo por tipo
        Map<String, Long> porTipo = new LinkedHashMap<>();
        clienteRepository.contarPorTipo()
                .forEach(row -> porTipo.put((String) row[0], (Long) row[1]));
        resumen.put("porTipoCliente", porTipo);

        // Conteo por ciudad
        Map<String, Long> porCiudad = new LinkedHashMap<>();
        clienteRepository.contarPorCiudad()
                .forEach(row -> porCiudad.put((String) row[0], (Long) row[1]));
        resumen.put("porCiudad", porCiudad);

        return resumen;
    }

    // ── Helpers privados ────────────────────────────────────────

    private Cliente findOrThrow(Integer id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cliente no encontrado con id: " + id));
    }

    private void validarUnicidadCreacion(ClienteRequestDTO dto) {
        if (clienteRepository.existsByNit(dto.getNit()))
            throw new BusinessException("Ya existe un cliente con el NIT: " + dto.getNit());
        if (clienteRepository.existsByNumeroDocumento(dto.getNumeroDocumento()))
            throw new BusinessException("Ya existe un cliente con el documento: " + dto.getNumeroDocumento());
        if (clienteRepository.existsByCorreo(dto.getCorreo().toLowerCase()))
            throw new BusinessException("Ya existe un cliente con el correo: " + dto.getCorreo());
    }

    private void validarUnicidadActualizacion(ClienteRequestDTO dto, Integer id) {
        if (clienteRepository.existsByNitAndIdClienteNot(dto.getNit(), id))
            throw new BusinessException("Ya existe un cliente con el NIT: " + dto.getNit());
        if (clienteRepository.existsByNumeroDocumentoAndIdClienteNot(dto.getNumeroDocumento(), id))
            throw new BusinessException("Ya existe un cliente con el documento: " + dto.getNumeroDocumento());
        if (clienteRepository.existsByCorreoAndIdClienteNot(dto.getCorreo().toLowerCase(), id))
            throw new BusinessException("Ya existe un cliente con el correo: " + dto.getCorreo());
    }

    private void validarEstado(String estado) {
        if (!List.of("ACTIVO", "INACTIVO", "BLOQUEADO").contains(estado))
            throw new BusinessException("Estado inválido: " + estado);
    }

    private void validarClasificacion(String clasificacion) {
        if (!List.of("PREFERENCIAL", "ACTIVO", "INACTIVO", "BLOQUEADO").contains(clasificacion))
            throw new BusinessException("Clasificación inválida: " + clasificacion);
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private ClienteResponseDTO toResponse(Cliente c) {
        return ClienteResponseDTO.builder()
                .idCliente(c.getIdCliente())
                .tipoDocumento(c.getTipoDocumento())
                .numeroDocumento(c.getNumeroDocumento())
                .nit(c.getNit())
                .razonSocial(c.getRazonSocial())
                .tipoCliente(c.getTipoCliente())
                .clasificacionComercial(c.getClasificacionComercial())
                .nombreContacto(c.getNombreContacto())
                .cargoContacto(c.getCargoContacto())
                .telefono(c.getTelefono())
                .telefonoSecundario(c.getTelefonoSecundario())
                .correo(c.getCorreo())
                .correoSecundario(c.getCorreoSecundario())
                .direccion(c.getDireccion())
                .ciudad(c.getCiudad())
                .departamento(c.getDepartamento())
                .limiteCredito(c.getLimiteCredito())
                .observaciones(c.getObservaciones())
                .estado(c.getEstado())
                .fechaCreacion(c.getFechaCreacion())
                .fechaActualizacion(c.getFechaActualizacion())
                .build();
    }
}
