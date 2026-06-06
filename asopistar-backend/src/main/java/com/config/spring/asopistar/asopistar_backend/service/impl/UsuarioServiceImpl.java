package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.*;
import com.config.spring.asopistar.asopistar_backend.dto.response.UsuarioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.*;
import com.config.spring.asopistar.asopistar_backend.exception.BusinessException;
import com.config.spring.asopistar.asopistar_backend.exception.ResourceNotFoundException;
import com.config.spring.asopistar.asopistar_backend.repository.*;
import com.config.spring.asopistar.asopistar_backend.service.EmailService;
import com.config.spring.asopistar.asopistar_backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository           usuarioRepository;
    private final RolRepository               rolRepository;
    private final ProductorRepository         productorRepository;
    private final HistorialSolicitudRepository historialRepository;
    private final PasswordEncoder             passwordEncoder;
    private final EmailService                emailService;

    // ── Consultas ────────────────────────────────────────────────────────────

    @Override
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<UsuarioResponseDTO> listarActivos() {
        return usuarioRepository.findByActivoTrue().stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<UsuarioResponseDTO> listarPorEstado(EstadoUsuario estado) {
        return usuarioRepository.findByEstadoOrderByFechaCreacionAsc(estado).stream()
            .map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public UsuarioResponseDTO buscarPorId(Integer id) {
        return toResponseDTO(findUsuarioOrThrow(id));
    }

    // ── CRUD administrativo ──────────────────────────────────────────────────

    @Override
    @Transactional
    public UsuarioResponseDTO crear(UsuarioRequestDTO dto) {
        validarEmailUnico(dto.getEmail(), null);
        Rol rol = findRolOrThrow(dto.getIdRol());
        Usuario usuario = Usuario.builder()
            .nombre1(dto.getNombre1())
            .nombre2(dto.getNombre2())
            .apellido1(dto.getApellido1())
            .apellido2(dto.getApellido2())
            .email(dto.getEmail())
            .contrasena(passwordEncoder.encode(dto.getContrasena()))
            .activo(true)
            .estado(EstadoUsuario.ACTIVO)
            .fechaCreacion(LocalDate.now())
            .rol(rol)
            .build();
        return toResponseDTO(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public UsuarioResponseDTO actualizar(Integer id, UsuarioRequestDTO dto) {
        Usuario u = findUsuarioOrThrow(id);
        validarEmailUnico(dto.getEmail(), id);
        Rol rol = findRolOrThrow(dto.getIdRol());
        u.setNombre1(dto.getNombre1());
        u.setNombre2(dto.getNombre2());
        u.setApellido1(dto.getApellido1());
        u.setApellido2(dto.getApellido2());
        u.setEmail(dto.getEmail());
        u.setRol(rol);
        if (dto.getContrasena() != null && !dto.getContrasena().isBlank()) {
            u.setContrasena(passwordEncoder.encode(dto.getContrasena()));
        }
        return toResponseDTO(usuarioRepository.save(u));
    }

    @Override
    @Transactional
    public void desactivar(Integer id) {
        Usuario u = findUsuarioOrThrow(id);
        u.setActivo(false);
        u.setEstado(EstadoUsuario.INACTIVO);
        usuarioRepository.save(u);
    }

    @Override
    @Transactional
    public void activar(Integer id) {
        Usuario u = findUsuarioOrThrow(id);
        u.setActivo(true);
        u.setEstado(EstadoUsuario.ACTIVO);
        usuarioRepository.save(u);
    }

    @Override
    @Transactional
    public void cambiarRol(Integer id, CambioRolRequestDTO dto) {
        Usuario u = findUsuarioOrThrow(id);
        Rol rol = findRolOrThrow(dto.getIdRol());
        u.setRol(rol);
        usuarioRepository.save(u);
    }

    @Override
    @Transactional
    public void restablecerContrasena(Integer id, CambioContrasenaRequestDTO dto) {
        Usuario u = findUsuarioOrThrow(id);
        u.setContrasena(passwordEncoder.encode(dto.getNuevaContrasena()));
        usuarioRepository.save(u);
        emailService.enviarContrasenaRestablecida(u.getEmail(),
            u.getNombre1() + " " + u.getApellido1());
    }

    // ── Registro público ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public void registrar(RegistroRequestDTO dto) {
        // Validaciones de unicidad
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Ya existe una cuenta registrada con ese correo electrónico.");
        }
        if (usuarioRepository.existsByDocumento(dto.getDocumento())) {
            throw new BusinessException("Ya existe una cuenta registrada con ese número de documento.");
        }

        // Validar contraseñas coincidan
        if (!dto.getContrasena().equals(dto.getConfirmarContrasena())) {
            throw new BusinessException("Las contraseñas no coinciden.");
        }

        // Validaciones adicionales para PRODUCTOR
        if ("PRODUCTOR".equalsIgnoreCase(dto.getCargoSolicitado())) {
            if (dto.getFechaNacimiento() == null) {
                throw new BusinessException("La fecha de nacimiento es obligatoria para productores.");
            }
            if (dto.getDireccion() == null || dto.getDireccion().isBlank()) {
                throw new BusinessException("La dirección es obligatoria para productores.");
            }
        }

        // Rol provisional: siempre PRODUCTOR hasta que el admin apruebe y asigne el real.
        Rol rolProvisional = rolRepository.findByNombre("PRODUCTOR")
            .orElseThrow(() -> new ResourceNotFoundException("Rol PRODUCTOR no encontrado en BD."));

        // Generar token de verificación (UUID, expira en 24h)
        String token = UUID.randomUUID().toString();

        Usuario usuario = Usuario.builder()
            .nombre1(dto.getNombre1())
            .nombre2(dto.getNombre2())
            .apellido1(dto.getApellido1())
            .apellido2(dto.getApellido2())
            .documento(dto.getDocumento())
            .telefono(dto.getTelefono())
            .email(dto.getEmail())
            .contrasena(passwordEncoder.encode(dto.getContrasena()))
            .cargoSolicitado(dto.getCargoSolicitado())
            .fechaNacimiento(dto.getFechaNacimiento())
            .cantidadHijos(dto.getCantidadHijos())
            .direccion(dto.getDireccion())
            .activo(false)
            .estado(EstadoUsuario.PENDIENTE_VERIFICACION)
            .fechaCreacion(LocalDate.now())
            .tokenVerificacion(token)
            .fechaExpiracionToken(LocalDateTime.now().plusHours(24))
            .cantidadReenvios(0)  // ← inicializar contador
            .rol(rolProvisional)
            .build();

        usuarioRepository.save(usuario);

        // Guardar en historial
        historialRepository.save(HistorialSolicitud.builder()
            .usuario(usuario)
            .accion("REGISTRO")
            .observacion("Registro público desde formulario. Cargo solicitado: " + dto.getCargoSolicitado())
            .build());

        // ── CAMBIO 1: Enviar correo con try-catch para capturar fallos SMTP ──
        // Si el correo falla, el usuario NO queda bloqueado:
        // su estado cambia a ERROR_ENVIO_CORREO y el admin puede intervenir.
        try {
            emailService.enviarVerificacionEmail(
                dto.getEmail(),
                dto.getNombre1() + " " + dto.getApellido1(),
                token
            );
            // El estado ya es PENDIENTE_VERIFICACION desde el builder — no se cambia
            historialRepository.save(HistorialSolicitud.builder()
                .usuario(usuario)
                .accion("CORREO_ENVIADO")
                .observacion("Correo de verificación enviado correctamente al registrarse.")
                .build());
            log.info("Correo de verificación enviado a: {}", dto.getEmail());
        } catch (Exception e) {
            log.error("Error SMTP al enviar verificación a {}: {}", dto.getEmail(), e.getMessage());
            // Marcar el estado para que el admin pueda identificar la solicitud
            usuario.setEstado(EstadoUsuario.ERROR_ENVIO_CORREO);
            usuario.setErrorEnvioCorreo(e.getMessage());
            usuarioRepository.save(usuario);
            historialRepository.save(HistorialSolicitud.builder()
                .usuario(usuario)
                .accion("ERROR_ENVIO_CORREO")
                .observacion("Fallo SMTP al registrarse: " + e.getMessage())
                .build());
            // No relanzar la excepción: el usuario quedó guardado y puede
            // pedir el reenvío o el admin puede intervenir desde el panel.
            log.warn("El usuario {} quedó en estado ERROR_ENVIO_CORREO.", dto.getEmail());
        }

        log.info("Nuevo usuario registrado: {} — Cargo: {}", dto.getEmail(), dto.getCargoSolicitado());
    }

    // ── Verificación de correo ────────────────────────────────────────────────

    @Override
    @Transactional
    public void verificarEmail(String token) {
        Usuario u = usuarioRepository.findByTokenVerificacion(token)
            .orElseThrow(() -> new BusinessException("El enlace de verificación no es válido o ya fue usado."));

        if (u.getFechaExpiracionToken() == null
                || LocalDateTime.now().isAfter(u.getFechaExpiracionToken())) {
            throw new BusinessException(
                "El enlace de verificación ha expirado. Solicita un nuevo enlace.");
        }

        if (u.getEstado() != EstadoUsuario.PENDIENTE_VERIFICACION) {
            throw new BusinessException("Este correo ya fue verificado anteriormente.");
        }

        u.setEstado(EstadoUsuario.PENDIENTE_APROBACION);
        u.setTokenVerificacion(null);
        u.setFechaExpiracionToken(null);
        u.setErrorEnvioCorreo(null); // limpiar error previo si lo había
        usuarioRepository.save(u);

        historialRepository.save(HistorialSolicitud.builder()
            .usuario(u)
            .accion("EMAIL_VERIFICADO")
            .observacion("Correo verificado. En espera de aprobación del administrador.")
            .build());

        log.info("Email verificado para usuario: {}", u.getEmail());
    }

    @Override
    @Transactional
    public void reenviarVerificacion(String email) {
        Usuario u = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("No existe una cuenta con ese correo."));

        // ── CAMBIO 2: Aceptar también usuarios en ERROR_ENVIO_CORREO ──
        // Antes solo aceptaba PENDIENTE_VERIFICACION; ahora también acepta
        // ERROR_ENVIO_CORREO para que el usuario no quede bloqueado.
        if (u.getEstado() != EstadoUsuario.PENDIENTE_VERIFICACION
                && u.getEstado() != EstadoUsuario.ERROR_ENVIO_CORREO) {
            throw new BusinessException("Tu cuenta no está pendiente de verificación.");
        }

        // Generar nuevo token e invalidar el anterior
        String nuevoToken = UUID.randomUUID().toString();
        u.setTokenVerificacion(nuevoToken);
        u.setFechaExpiracionToken(LocalDateTime.now().plusHours(24));
        u.setCantidadReenvios(u.getCantidadReenvios() == null ? 1 : u.getCantidadReenvios() + 1);
        u.setUltimoReenvio(LocalDateTime.now());
        u.setErrorEnvioCorreo(null); // limpiar error anterior antes de intentar
        u.setEstado(EstadoUsuario.PENDIENTE_VERIFICACION); // restaurar estado si era ERROR
        usuarioRepository.save(u);

        // Intentar envío con manejo de error
        try {
            emailService.reenviarVerificacion(
                u.getEmail(),
                u.getNombre1() + " " + u.getApellido1(),
                nuevoToken
            );
            historialRepository.save(HistorialSolicitud.builder()
                .usuario(u)
                .accion("REENVIO_VERIFICACION")
                .observacion("Reenvío #" + u.getCantidadReenvios() + " solicitado por el usuario.")
                .build());
            log.info("Reenvío de verificación exitoso para: {} (intento #{})",
                u.getEmail(), u.getCantidadReenvios());
        } catch (Exception e) {
            log.error("Error SMTP en reenvío para {}: {}", u.getEmail(), e.getMessage());
            u.setEstado(EstadoUsuario.ERROR_ENVIO_CORREO);
            u.setErrorEnvioCorreo(e.getMessage());
            usuarioRepository.save(u);
            historialRepository.save(HistorialSolicitud.builder()
                .usuario(u)
                .accion("ERROR_ENVIO_CORREO")
                .observacion("Fallo SMTP en reenvío #" + u.getCantidadReenvios() + ": " + e.getMessage())
                .build());
            throw new BusinessException(
                "No se pudo enviar el correo. Contacta al administrador del sistema.");
        }
    }

    // ── Aprobación / rechazo ─────────────────────────────────────────────────

    @Override
    @Transactional
    public UsuarioResponseDTO aprobar(Integer id, AprobacionUsuarioRequestDTO dto, Integer idAdmin) {
        Usuario u = findUsuarioOrThrow(id);

        if (u.getEstado() != EstadoUsuario.PENDIENTE_APROBACION) {
            throw new BusinessException("Solo se pueden aprobar usuarios en estado PENDIENTE_APROBACION.");
        }
        if (dto.getIdRolAsignado() == null) {
            throw new BusinessException("Debes asignar un rol al aprobar el usuario.");
        }

        Rol rolReal = findRolOrThrow(dto.getIdRolAsignado());
        Usuario admin = findUsuarioOrThrow(idAdmin);

        u.setRol(rolReal);
        u.setEstado(EstadoUsuario.ACTIVO);
        u.setActivo(true);
        u.setFechaAprobacion(LocalDateTime.now());
        u.setAprobadoPor(admin);
        usuarioRepository.save(u);

        if ("PRODUCTOR".equalsIgnoreCase(u.getCargoSolicitado())) {
            crearProductorDesdeUsuario(u);
        }

        historialRepository.save(HistorialSolicitud.builder()
            .usuario(u)
            .accion("APROBADO")
            .realizadoPor(admin)
            .observacion("Rol asignado: " + rolReal.getNombre())
            .build());

        emailService.enviarAprobacion(
            u.getEmail(),
            u.getNombre1() + " " + u.getApellido1(),
            rolReal.getNombre()
        );

        log.info("Usuario {} aprobado por admin {}. Rol: {}", u.getEmail(), admin.getEmail(), rolReal.getNombre());
        return toResponseDTO(u);
    }

    @Override
    @Transactional
    public UsuarioResponseDTO rechazar(Integer id, AprobacionUsuarioRequestDTO dto, Integer idAdmin) {
        Usuario u = findUsuarioOrThrow(id);

        if (u.getEstado() != EstadoUsuario.PENDIENTE_APROBACION
                && u.getEstado() != EstadoUsuario.PENDIENTE_VERIFICACION) {
            throw new BusinessException("Solo se pueden rechazar usuarios pendientes.");
        }

        Usuario admin = findUsuarioOrThrow(idAdmin);

        u.setEstado(EstadoUsuario.RECHAZADO);
        u.setActivo(false);
        u.setMotivoRechazo(dto.getMotivoRechazo());
        usuarioRepository.save(u);

        historialRepository.save(HistorialSolicitud.builder()
            .usuario(u)
            .accion("RECHAZADO")
            .realizadoPor(admin)
            .observacion(dto.getMotivoRechazo())
            .build());

        emailService.enviarRechazo(
            u.getEmail(),
            u.getNombre1() + " " + u.getApellido1(),
            dto.getMotivoRechazo()
        );

        log.info("Usuario {} rechazado por admin {}", u.getEmail(), admin.getEmail());
        return toResponseDTO(u);
    }

    // ── Creación automática de Productor al aprobar ───────────────────────────

    private void crearProductorDesdeUsuario(Usuario u) {
        if (productorRepository.existsByUsuarioIdUsuario(u.getIdUsuario())) {
            log.warn("El usuario {} ya tiene un productor asociado. Se omite la creación.", u.getEmail());
            return;
        }

        Productor productor = Productor.builder()
            .nombre1(u.getNombre1())
            .nombre2(u.getNombre2())
            .apellido1(u.getApellido1())
            .apellido2(u.getApellido2())
            .documento(u.getDocumento())
            .telefono(u.getTelefono())
            .fechaIngreso(LocalDate.now())
            .fechaNacimiento(u.getFechaNacimiento() != null ? u.getFechaNacimiento() : LocalDate.now())
            .cantidadHijos(u.getCantidadHijos() != null ? u.getCantidadHijos() : 0)
            .activo(true)
            .direccion(u.getDireccion() != null ? u.getDireccion() : "")
            .usuario(u)
            .build();

        productorRepository.save(productor);
        log.info("Productor creado automáticamente para usuario: {}", u.getEmail());
    }

    // ── Helpers privados ─────────────────────────────────────────────────────

    private Usuario findUsuarioOrThrow(Integer id) {
        return usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
    }

    private Rol findRolOrThrow(Integer idRol) {
        return rolRepository.findById(idRol)
            .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id: " + idRol));
    }

    private void validarEmailUnico(String email, Integer idExcluir) {
        usuarioRepository.findByEmail(email).ifPresent(u -> {
            if (!u.getIdUsuario().equals(idExcluir)) {
                throw new BusinessException("Ya existe un usuario con ese email.");
            }
        });
    }

    // ── Mapper a DTO ─────────────────────────────────────────────────────────

    private UsuarioResponseDTO toResponseDTO(Usuario u) {
        String aprobadoPorNombre = null;
        if (u.getAprobadoPor() != null) {
            aprobadoPorNombre = u.getAprobadoPor().getNombre1()
                + " " + u.getAprobadoPor().getApellido1();
        }
        return UsuarioResponseDTO.builder()
            .idUsuario(u.getIdUsuario())
            .nombre1(u.getNombre1())
            .nombre2(u.getNombre2())
            .apellido1(u.getApellido1())
            .apellido2(u.getApellido2())
            .documento(u.getDocumento())
            .telefono(u.getTelefono())
            .email(u.getEmail())
            .cargoSolicitado(u.getCargoSolicitado())
            .estado(u.getEstado())
            .activo(u.getActivo())
            .fechaCreacion(u.getFechaCreacion())
            .fechaAprobacion(u.getFechaAprobacion())
            .motivoRechazo(u.getMotivoRechazo())
            .nombreRol(u.getRol() != null ? u.getRol().getNombre() : null)
            .nombreAprobadoPor(aprobadoPorNombre)
            .fechaNacimiento(u.getFechaNacimiento())
            .cantidadHijos(u.getCantidadHijos())
            .direccion(u.getDireccion())
            .build();
    }
}
