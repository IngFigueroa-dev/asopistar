package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.response.SolicitudAccesoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.*;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.*;
import com.config.spring.asopistar.asopistar_backend.service.EmailService;
import com.config.spring.asopistar.asopistar_backend.service.SolicitudAccesoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SolicitudAccesoServiceImpl implements SolicitudAccesoService {

    private final UsuarioRepository          usuarioRepository;
    private final RolRepository              rolRepository;
    private final AuditoriaUsuarioRepository auditoriaRepository;
    private final EmailService               emailService;  // ← nombre real del bean

    // ── Listar por estado ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudAccesoResponseDTO> listarPorEstado(String estado) {
        List<Usuario> usuarios = (estado == null || estado.isBlank())
            ? usuarioRepository.findAll()
            : usuarioRepository.findByEstadoOrderByFechaCreacionAsc(
                EstadoUsuario.valueOf(estado));  // ← método correcto del repositorio

        return usuarios.stream().map(this::toDTO).toList();
    }

    // ── Reenvío administrativo ───────────────────────────────────────────────

    @Override
    @Transactional
    public void reenviarCorreoAdmin(Integer idUsuario, Integer idAdmin) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        Usuario admin = usuarioRepository.findById(idAdmin)
            .orElseThrow(() -> new ResourceNotFoundException("Administrador no encontrado."));

        if (usuario.getEstado() != EstadoUsuario.PENDIENTE_VERIFICACION
                && usuario.getEstado() != EstadoUsuario.ERROR_ENVIO_CORREO) {
            throw new BusinessException(
                "Solo se puede reenviar el correo a usuarios pendientes de verificación.");
        }

        String nuevoToken = UUID.randomUUID().toString();
        usuario.setTokenVerificacion(nuevoToken);
        usuario.setFechaExpiracionToken(LocalDateTime.now().plusHours(24));
        usuario.setCantidadReenvios(
            usuario.getCantidadReenvios() == null ? 1 : usuario.getCantidadReenvios() + 1);
        usuario.setUltimoReenvio(LocalDateTime.now());
        usuario.setErrorEnvioCorreo(null);
        usuario.setEstado(EstadoUsuario.PENDIENTE_VERIFICACION);
        usuarioRepository.save(usuario);

        try {
            emailService.enviarVerificacionEmail(
                usuario.getEmail(),
                usuario.getNombre1() + " " + usuario.getApellido1(),
                nuevoToken
            );
            registrarAuditoria(usuario, "CORREO_REENVIADO", admin,
                "Reenvío administrativo. Intento #" + usuario.getCantidadReenvios());
        } catch (Exception e) {
            log.error("Error al reenviar correo al usuario {}: {}", usuario.getEmail(), e.getMessage());
            usuario.setEstado(EstadoUsuario.ERROR_ENVIO_CORREO);
            usuario.setErrorEnvioCorreo(e.getMessage());
            usuarioRepository.save(usuario);
            registrarAuditoria(usuario, "ERROR_ENVIO_CORREO", admin,
                "Fallo en reenvío administrativo: " + e.getMessage());
            throw new BusinessException(
                "El correo no pudo enviarse: " + e.getMessage() +
                ". La solicitud quedó marcada como ERROR_ENVIO_CORREO.");
        }
    }

    // ── Aprobación manual ────────────────────────────────────────────────────

    @Override
    @Transactional
    public SolicitudAccesoResponseDTO aprobarManual(
            Integer idUsuario, Integer idRolAsignado,
            Integer idAdmin,   String  observaciones) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        Usuario admin = usuarioRepository.findById(idAdmin)
            .orElseThrow(() -> new ResourceNotFoundException("Administrador no encontrado."));

        Rol rol = rolRepository.findById(idRolAsignado)
            .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado."));

        if (usuario.getEstado() == EstadoUsuario.ACTIVO) {
            throw new BusinessException("El usuario ya está activo.");
        }
        if (usuario.getEstado() == EstadoUsuario.RECHAZADO
                || usuario.getEstado() == EstadoUsuario.INACTIVO) {
            throw new BusinessException("No se puede activar un usuario rechazado o inactivo.");
        }

        usuario.setEstado(EstadoUsuario.ACTIVO);
        usuario.setActivo(true);
        usuario.setRol(rol);
        usuario.setAprobadoPor(admin);
        usuario.setFechaAprobacion(LocalDateTime.now());
        usuario.setTokenVerificacion(null);
        usuario.setFechaExpiracionToken(null);
        usuario.setErrorEnvioCorreo(null);
        usuarioRepository.save(usuario);

        registrarAuditoria(usuario, "APROBACION_MANUAL", admin,
            observaciones != null ? observaciones
                : "Aprobación manual sin verificación de correo.");

        // Notificar al usuario — fallo silencioso, ya está activo
        try {
            emailService.enviarAprobacion(
                usuario.getEmail(),
                usuario.getNombre1() + " " + usuario.getApellido1(),
                rol.getNombre()
            );
        } catch (Exception e) {
            log.warn("No se pudo notificar aprobación al usuario {}: {}",
                usuario.getEmail(), e.getMessage());
        }

        return toDTO(usuario);
    }

    // ── Auditoría ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void registrarAuditoria(Usuario usuario, String accion,
                                    Usuario admin, String observaciones) {
        AuditoriaUsuario evento = AuditoriaUsuario.builder()
            .usuario(usuario)
            .accion(accion)
            .admin(admin)
            .observaciones(observaciones)
            .build();
        auditoriaRepository.save(evento);
    }

    // ── Mapper ───────────────────────────────────────────────────────────────

    private SolicitudAccesoResponseDTO toDTO(Usuario u) {
        return SolicitudAccesoResponseDTO.builder()
            .idUsuario(u.getIdUsuario())
            .nombre1(u.getNombre1())
            .nombre2(u.getNombre2())
            .apellido1(u.getApellido1())
            .apellido2(u.getApellido2())
            .documento(u.getDocumento())
            .telefono(u.getTelefono())
            .email(u.getEmail())
            .direccion(u.getDireccion())
            .fechaNacimiento(u.getFechaNacimiento())
            .cantidadHijos(u.getCantidadHijos())
            .cargoSolicitado(u.getCargoSolicitado())
            .estado(u.getEstado().name())
            .fechaCreacion(u.getFechaCreacion())
            .fechaAprobacion(u.getFechaAprobacion())
            .motivoRechazo(u.getMotivoRechazo())
            .cantidadReenvios(u.getCantidadReenvios())
            .ultimoReenvio(u.getUltimoReenvio())
            .errorEnvioCorreo(u.getErrorEnvioCorreo())
            .rolId(u.getRol() != null ? u.getRol().getIdRol() : null)
            .rolNombre(u.getRol() != null ? u.getRol().getNombre() : null)
            .build();
    }
}
