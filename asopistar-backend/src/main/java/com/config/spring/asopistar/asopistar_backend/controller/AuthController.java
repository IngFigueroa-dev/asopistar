package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
 
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
 
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
 
    // POST /auth/login
    // Body: { "email": "...", "contrasena": "..." }
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> credenciales) {
 
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                credenciales.get("email"),
                credenciales.get("contrasena")
            )
        );
 
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String token = jwtTokenProvider.generateToken(userDetails);
 
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("tipo", "Bearer");
        response.put("email", userDetails.getUsername());
        response.put("rol", userDetails.getAuthorities()
            .iterator().next().getAuthority());
 
        return ResponseEntity.ok(response);
    }
}
 
