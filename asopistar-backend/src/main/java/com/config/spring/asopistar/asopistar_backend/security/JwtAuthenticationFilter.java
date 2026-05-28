package com.config.spring.asopistar.asopistar_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
 
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
 
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;
 
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
 
        // 1. Extraer el token del header Authorization
        String token = getTokenFromRequest(request);
 
        // 2. Validar el token
        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
 
            // 3. Extraer el email del token
            String email = jwtTokenProvider.getEmailFromToken(token);
 
            // 4. Cargar el usuario desde la base de datos
            UserDetails userDetails =
                userDetailsService.loadUserByUsername(email);
 
            // 5. Crear el objeto de autenticación
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );
            authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request));
 
            // 6. Registrar la autenticación en el contexto de Spring Security
            SecurityContextHolder.getContext()
                .setAuthentication(authentication);
        }
 
        // 7. Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }
 
    // Extrae el token del header: 'Authorization: Bearer eyJ...'
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken)
                && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);  // quita 'Bearer ' del inicio
        }
        return null;
    }
}

