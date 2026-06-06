package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.response.SolicitudAccesoResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Usuario;
import com.config.spring.asopistar.asopistar_backend.service.SolicitudAccesoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoints administrativos para gestión de solicitudes de acceso.
 * Base: /api/admin/solicitudes
 *
 * Todos requieren ROLE_ADMINISTRADOR_GENERAL (configurado en SecurityConfig).
 */
@RestController
@RequestMapping("/admin/solicitudes")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR_GENERAL')")
public class SolicitudAccesoController {

    private final SolicitudAccesoService solicitudService;

    // ── GET /admin/solicitudes?estado=PENDIENTE_VERIFICACION ─────────────────
    @GetMapping
    public ResponseEntity<List<SolicitudAccesoResponseDTO>> listar(
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(solicitudService.listarPorEstado(estado));
    }

    // ── POST /admin/solicitudes/{id}/reenviar-correo ─────────────────────────
    @PostMapping("/{id}/reenviar-correo")
    public ResponseEntity<Map<String, String>> reenviarCorreo(
            @PathVariable Integer id,
            @AuthenticationPrincipal Usuario admin) {

        solicitudService.reenviarCorreoAdmin(id, admin.getIdUsuario());
        return ResponseEntity.ok(Map.of(
            "mensaje", "Correo de verificación reenviado correctamente."
        ));
    }

    // ── PATCH /admin/solicitudes/{id}/aprobar-manual ─────────────────────────
    @PatchMapping("/{id}/aprobar-manual")
    public ResponseEntity<SolicitudAccesoResponseDTO> aprobarManual(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Usuario admin) {

        Integer idRol = body.get("idRolAsignado") != null
            ? Integer.valueOf(body.get("idRolAsignado").toString())
            : null;
        String observaciones = (String) body.get("observaciones");

        SolicitudAccesoResponseDTO resultado =
            solicitudService.aprobarManual(id, idRol, admin.getIdUsuario(), observaciones);

        return ResponseEntity.ok(resultado);
    }
}
