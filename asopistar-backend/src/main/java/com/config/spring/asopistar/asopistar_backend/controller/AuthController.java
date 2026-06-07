package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.RegistroRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.LoginResponseDTO;
import com.config.spring.asopistar.asopistar_backend.entity.Productor;
import com.config.spring.asopistar.asopistar_backend.entity.Usuario;
import com.config.spring.asopistar.asopistar_backend.repository.ProductorRepository;
import com.config.spring.asopistar.asopistar_backend.security.JwtTokenProvider;
import com.config.spring.asopistar.asopistar_backend.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider      jwtTokenProvider;
    private final UsuarioService        usuarioService;
    private final ProductorRepository   productorRepository;

    // ── POST /auth/login ─────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody Map<String, String> credenciales) {

        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                credenciales.get("email"),
                credenciales.get("contrasena")
            )
        );

        Usuario usuario = (Usuario) auth.getPrincipal();
        String token    = jwtTokenProvider.generateToken(usuario);

        // ── Obtener idProductor si el rol es ROLE_PRODUCTOR ──────────────────
        String rolActual    = usuario.getAuthorities().iterator().next().getAuthority();
        Integer idProductor = null;

        if ("ROLE_PRODUCTOR".equals(rolActual)) {
            idProductor = productorRepository
                .findByUsuarioIdUsuario(usuario.getIdUsuario())
                .map(Productor::getIdProductor)
                .orElse(null);
        }

        LoginResponseDTO response = LoginResponseDTO.builder()
            .token(token)
            .tipo("Bearer")
            .email(usuario.getEmail())
            .rol(rolActual)
            .nombre(usuario.getNombre1() + " " + usuario.getApellido1())
            .idUsuario(usuario.getIdUsuario())
            .idProductor(idProductor)
            .build();

        return ResponseEntity.ok(response);
    }

    // ── POST /auth/registro ──────────────────────────────────────────────────
    @PostMapping("/registro")
    public ResponseEntity<Map<String, String>> registro(
            @Valid @RequestBody RegistroRequestDTO dto) {

        usuarioService.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "mensaje", "Registro exitoso. Revisa tu correo para verificar tu cuenta."
        ));
    }

    // ── GET /auth/verificar-email?token=UUID ────────────────────────────────
    @GetMapping("/verificar-email")
    public ResponseEntity<Map<String, String>> verificarEmail(
            @RequestParam String token) {

        usuarioService.verificarEmail(token);
        return ResponseEntity.ok(Map.of(
            "mensaje", "Correo verificado exitosamente. Tu solicitud está en revisión."
        ));
    }

    // ── POST /auth/reenviar-verificacion ────────────────────────────────────
    @PostMapping("/reenviar-verificacion")
    public ResponseEntity<Map<String, String>> reenviarVerificacion(
            @RequestBody Map<String, String> body) {

        usuarioService.reenviarVerificacion(body.get("email"));
        return ResponseEntity.ok(Map.of(
            "mensaje", "Se envió un nuevo enlace de verificación a tu correo."
        ));
    }
}
