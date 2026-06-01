package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.*;
import com.config.spring.asopistar.asopistar_backend.dto.response.UsuarioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.EstadoUsuario;
import com.config.spring.asopistar.asopistar_backend.entity.Usuario;
import com.config.spring.asopistar.asopistar_backend.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // ── Listar ───────────────────────────────────────────────────────────────

    // GET /usuarios
    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    // GET /usuarios/activos
    @GetMapping("/activos")
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarActivos() {
        return ResponseEntity.ok(usuarioService.listarActivos());
    }

    // GET /usuarios/pendientes
    // Solicitudes en estado PENDIENTE_APROBACION para el módulo de solicitudes
    @GetMapping("/pendientes")
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarPendientes() {
        return ResponseEntity.ok(
            usuarioService.listarPorEstado(EstadoUsuario.PENDIENTE_APROBACION)
        );
    }

    // GET /usuarios/por-estado?estado=RECHAZADO
    @GetMapping("/por-estado")
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarPorEstado(
            @RequestParam EstadoUsuario estado) {
        return ResponseEntity.ok(usuarioService.listarPorEstado(estado));
    }

    // GET /usuarios/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    // POST /usuarios (creación manual por el admin)
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<UsuarioResponseDTO> crear(
            @Valid @RequestBody UsuarioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(usuarioService.crear(dto));
    }

    // PUT /usuarios/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<UsuarioResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody UsuarioRequestDTO dto) {
        return ResponseEntity.ok(usuarioService.actualizar(id, dto));
    }

    // PATCH /usuarios/{id}/desactivar
    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        usuarioService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /usuarios/{id}/activar
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<Void> activar(@PathVariable Integer id) {
        usuarioService.activar(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /usuarios/{id}/cambiar-rol
    @PatchMapping("/{id}/cambiar-rol")
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<Void> cambiarRol(
            @PathVariable Integer id,
            @Valid @RequestBody CambioRolRequestDTO dto) {
        usuarioService.cambiarRol(id, dto);
        return ResponseEntity.noContent().build();
    }

    // PATCH /usuarios/{id}/restablecer-contrasena
    @PatchMapping("/{id}/restablecer-contrasena")
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<Void> restablecerContrasena(
            @PathVariable Integer id,
            @Valid @RequestBody CambioContrasenaRequestDTO dto) {
        usuarioService.restablecerContrasena(id, dto);
        return ResponseEntity.noContent().build();
    }

    // ── Aprobación / rechazo ─────────────────────────────────────────────────

    // PATCH /usuarios/{id}/aprobar
    @PatchMapping("/{id}/aprobar")
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<UsuarioResponseDTO> aprobar(
            @PathVariable Integer id,
            @RequestBody AprobacionUsuarioRequestDTO dto,
            @AuthenticationPrincipal Usuario adminActual) {
        return ResponseEntity.ok(
            usuarioService.aprobar(id, dto, adminActual.getIdUsuario())
        );
    }

    // PATCH /usuarios/{id}/rechazar
    @PatchMapping("/{id}/rechazar")
    @PreAuthorize("hasRole('ADMINISTRADOR_GENERAL')")
    public ResponseEntity<UsuarioResponseDTO> rechazar(
            @PathVariable Integer id,
            @RequestBody AprobacionUsuarioRequestDTO dto,
            @AuthenticationPrincipal Usuario adminActual) {
        return ResponseEntity.ok(
            usuarioService.rechazar(id, dto, adminActual.getIdUsuario())
        );
    }

    // ── Perfil propio ────────────────────────────────────────────────────────
    // GET /usuarios/me — cualquier usuario autenticado puede ver su propio perfil
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> miPerfil(
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(usuarioService.buscarPorId(usuario.getIdUsuario()));
    }
}
