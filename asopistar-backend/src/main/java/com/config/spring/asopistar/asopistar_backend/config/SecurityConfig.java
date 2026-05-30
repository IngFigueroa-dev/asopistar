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
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsServiceImpl userDetailsService;

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

                // ── Público ──────────────────────────────────────────────────
                .requestMatchers("/auth/**").permitAll()

                // ── ADMIN ────────────────────────────────────────────────────
                .requestMatchers("/roles/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/usuarios/**").hasAuthority("ROLE_ADMIN")

                // ── PRODUCTORES Y ESTANQUES ──────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/productores/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_PLANTA",
                        "ROLE_BIOLOGO", "ROLE_GERENTE_COMERCIAL", "ROLE_CONTADORA")
                .requestMatchers(HttpMethod.POST, "/productores/**")
                    .hasAnyAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/productores/**")
                    .hasAnyAuthority("ROLE_ADMIN")
                .requestMatchers("/estanques/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_BIOLOGO", "ROLE_GERENTE_PLANTA")
                .requestMatchers("/especies/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_BIOLOGO", "ROLE_GERENTE_PLANTA")

                // ── BIÓLOGO ──────────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/seguimientos/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_BIOLOGO")
                .requestMatchers(HttpMethod.GET, "/siembras/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_BIOLOGO",
                        "ROLE_GERENTE_PLANTA", "ROLE_GERENTE_COMERCIAL")

                // ── GERENTE_PLANTA ───────────────────────────────────────────
                // Recepciones: también lectura para CONTADORA (modal de pagos)
                .requestMatchers(HttpMethod.GET, "/recepciones/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_PLANTA", "ROLE_CONTADORA")
                .requestMatchers(HttpMethod.POST, "/recepciones/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_PLANTA")
                .requestMatchers("/turnos-pesca/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_PLANTA")
                .requestMatchers("/procesamientos/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_PLANTA")
                .requestMatchers("/lotes-cuarto-frio/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_PLANTA")

                // ── CLIENTES Y PUNTOS DE VENTA ───────────────────────────────
                .requestMatchers(HttpMethod.GET, "/clientes/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_COMERCIAL",
                        "ROLE_GERENTE_PLANTA")
                .requestMatchers(HttpMethod.GET, "/puntos-venta/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_COMERCIAL",
                        "ROLE_GERENTE_PLANTA")
                .requestMatchers(HttpMethod.POST, "/clientes/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_COMERCIAL")
                .requestMatchers(HttpMethod.PUT, "/clientes/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_COMERCIAL")
                .requestMatchers(HttpMethod.POST, "/puntos-venta/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_COMERCIAL")
                .requestMatchers(HttpMethod.PUT, "/puntos-venta/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_COMERCIAL")

                // ── ENVÍOS (Logística) ───────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/envios/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_COMERCIAL",
                        "ROLE_GERENTE_PLANTA")
                .requestMatchers(HttpMethod.POST, "/envios/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_COMERCIAL",
                        "ROLE_GERENTE_PLANTA")
                .requestMatchers(HttpMethod.PATCH, "/envios/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE_COMERCIAL",
                        "ROLE_GERENTE_PLANTA")

                // ── CONTADORA ────────────────────────────────────────────────
                .requestMatchers("/pagos-productor/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_CONTADORA")
                .requestMatchers("/metodos-pago/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_CONTADORA")
                .requestMatchers("/ingresos/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_CONTADORA")

                // ── ENCARGADO_INSUMOS ────────────────────────────────────────
                .requestMatchers("/insumos/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_ENCARGADO_INSUMOS")
                .requestMatchers("/ventas-insumo/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_ENCARGADO_INSUMOS")

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
