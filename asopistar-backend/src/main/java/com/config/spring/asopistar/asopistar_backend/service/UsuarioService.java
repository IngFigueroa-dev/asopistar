package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.*;
import com.config.spring.asopistar.asopistar_backend.dto.response.UsuarioResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.EstadoUsuario;

import java.util.List;

public interface UsuarioService {

    // ── Consultas ────────────────────────────────────────────────────────────
    List<UsuarioResponseDTO> listarTodos();
    List<UsuarioResponseDTO> listarActivos();
    List<UsuarioResponseDTO> listarPorEstado(EstadoUsuario estado);
    UsuarioResponseDTO buscarPorId(Integer id);

    // ── CRUD administrativo (solo ADMIN) ────────────────────────────────────
    UsuarioResponseDTO crear(UsuarioRequestDTO dto);
    UsuarioResponseDTO actualizar(Integer id, UsuarioRequestDTO dto);
    void desactivar(Integer id);
    void activar(Integer id);
    void cambiarRol(Integer id, CambioRolRequestDTO dto);
    void restablecerContrasena(Integer id, CambioContrasenaRequestDTO dto);

    // ── Registro público (sin autenticación) ─────────────────────────────────
    void registrar(RegistroRequestDTO dto);

    // ── Verificación de correo (sin autenticación) ────────────────────────────
    void verificarEmail(String token);
    void reenviarVerificacion(String email);

    // ── Aprobación / rechazo (solo ADMIN) ────────────────────────────────────
    UsuarioResponseDTO aprobar(Integer id, AprobacionUsuarioRequestDTO dto, Integer idAdmin);
    UsuarioResponseDTO rechazar(Integer id, AprobacionUsuarioRequestDTO dto, Integer idAdmin);
}
