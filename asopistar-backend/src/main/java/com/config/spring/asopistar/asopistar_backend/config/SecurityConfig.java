package com.config.spring.asopistar.asopistar_backend.config;

import com.config.spring.asopistar.asopistar_backend.security.JwtAuthenticationFilter;
import com.config.spring.asopistar.asopistar_backend.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // Habilita @PreAuthorize en los controladores
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsServiceImpl  userDetailsService;

    // Constante para el rol admin (evita strings dispersos)
    private static final String ADMIN = "ROLE_ADMINISTRADOR_GENERAL";

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ── Infraestructura ──────────────────────────────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()

                // ── Públicos (sin token) ──────────────────────────────────────
                .requestMatchers(
                    "/auth/login",
                    "/auth/registro",
                    "/auth/verificar-email",
                    "/auth/reenviar-verificacion"
                ).permitAll()

                // ── Gestión de usuarios y roles (solo ADMIN) ─────────────────
                .requestMatchers("/roles/**").hasAuthority(ADMIN)
                .requestMatchers("/usuarios/**").hasAuthority(ADMIN)

                // ── Perfil propio (cualquier usuario autenticado) ─────────────
                // El endpoint /usuarios/me tiene su propio @PreAuthorize
                // pero necesita estar autenticado mínimo
                .requestMatchers("/usuarios/me").authenticated()

                // ── PRODUCTORES Y ESTANQUES ──────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/productores/**")
                    .hasAnyAuthority(ADMIN,
                        "ROLE_GERENTE_PLANTA", "ROLE_BIOLOGO",
                        "ROLE_GERENTE_COMERCIAL", "ROLE_CONTADORA",
                        "ROLE_SECRETARIA", "ROLE_VENDEDOR_INSUMOS")
                .requestMatchers(HttpMethod.POST, "/productores/**")
                    .hasAnyAuthority(ADMIN, "ROLE_SECRETARIA")
                .requestMatchers(HttpMethod.PUT, "/productores/**")
                    .hasAnyAuthority(ADMIN, "ROLE_SECRETARIA")
                .requestMatchers("/estanques/**")
                    .hasAnyAuthority(ADMIN, "ROLE_BIOLOGO", "ROLE_GERENTE_PLANTA")
                .requestMatchers("/especies/**")
                    .hasAnyAuthority(ADMIN, "ROLE_BIOLOGO", "ROLE_GERENTE_PLANTA")

                // ── BIÓLOGO ──────────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/seguimientos/**")
                    .hasAnyAuthority(ADMIN, "ROLE_BIOLOGO")
                .requestMatchers(HttpMethod.GET, "/siembras/**")
                    .hasAnyAuthority(ADMIN, "ROLE_BIOLOGO",
                        "ROLE_GERENTE_PLANTA", "ROLE_GERENTE_COMERCIAL")
                .requestMatchers(HttpMethod.POST, "/siembras/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_PLANTA")

                // ── GERENTE_PLANTA ───────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/recepciones/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_PLANTA", "ROLE_CONTADORA",
                        "ROLE_SECRETARIA")
                .requestMatchers(HttpMethod.POST, "/recepciones/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_PLANTA")
                .requestMatchers("/turnos-pesca/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_PLANTA", "ROLE_PRODUCTOR")
                .requestMatchers("/procesamientos/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_PLANTA", "ROLE_PERSONAL_CUARTO_FRIO")
                .requestMatchers("/lotes-cuarto-frio/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_PLANTA", "ROLE_PERSONAL_CUARTO_FRIO")

                // ── CLIENTES Y PUNTOS DE VENTA ───────────────────────────────
                .requestMatchers(HttpMethod.GET, "/clientes/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_COMERCIAL", "ROLE_GERENTE_PLANTA")
                .requestMatchers(HttpMethod.POST, "/clientes/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_COMERCIAL")
                .requestMatchers(HttpMethod.PUT, "/clientes/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_COMERCIAL")
                .requestMatchers(HttpMethod.GET, "/puntos-venta/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_COMERCIAL", "ROLE_GERENTE_PLANTA")
                .requestMatchers(HttpMethod.POST, "/puntos-venta/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_COMERCIAL")
                .requestMatchers(HttpMethod.PUT, "/puntos-venta/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_COMERCIAL")

                // ── ENVÍOS (Logística) ───────────────────────────────────────
                .requestMatchers("/envios/**")
                    .hasAnyAuthority(ADMIN, "ROLE_GERENTE_COMERCIAL", "ROLE_GERENTE_PLANTA",
                        "ROLE_SECRETARIA")

                // ── FINANZAS ─────────────────────────────────────────────────
                .requestMatchers("/pagos-productor/**")
                    .hasAnyAuthority(ADMIN, "ROLE_CONTADORA")
                .requestMatchers("/metodos-pago/**")
                    .hasAnyAuthority(ADMIN, "ROLE_CONTADORA")
                .requestMatchers("/ingresos/**")
                    .hasAnyAuthority(ADMIN, "ROLE_CONTADORA", "ROLE_GERENTE_COMERCIAL")

                // ── INSUMOS ──────────────────────────────────────────────────
                .requestMatchers("/insumos/**")
                    .hasAnyAuthority(ADMIN, "ROLE_VENDEDOR_INSUMOS")
                .requestMatchers("/ventas-insumo/**")
                    .hasAnyAuthority(ADMIN, "ROLE_VENDEDOR_INSUMOS", "ROLE_PRODUCTOR")

                // ── REPORTES ─────────────────────────────────────────────────
                // El acceso fino por rol se controla con @PreAuthorize en el controlador
                .requestMatchers("/reportes/**")
                    .hasAnyAuthority(ADMIN, "ROLE_CONTADORA",
                        "ROLE_GERENTE_COMERCIAL", "ROLE_GERENTE_PLANTA",
                        "ROLE_SECRETARIA", "ROLE_BIOLOGO")

                // ── Resto: cualquier usuario autenticado ─────────────────────
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
