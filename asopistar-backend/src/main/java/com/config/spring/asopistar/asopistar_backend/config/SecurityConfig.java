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
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsServiceImpl  userDetailsService;

    // ── Constantes de rol ─────────────────────────────────────────────────────
    // Usuario.java construye la authority como: "ROLE_" + rol.getNombre()
    // La BD almacena los nombres SIN prefijo: ADMINISTRADOR_GENERAL, CONTADORA, etc.
    // Por tanto Spring Security recibe: ROLE_ADMINISTRADOR_GENERAL, ROLE_CONTADORA, etc.
    private static final String ADMIN             = "ROLE_ADMINISTRADOR_GENERAL";
    private static final String GERENTE_PLANTA    = "ROLE_GERENTE_PLANTA";
    private static final String GERENTE_COMERCIAL = "ROLE_GERENTE_COMERCIAL";
    private static final String CONTADORA         = "ROLE_CONTADORA";
    private static final String BIOLOGO           = "ROLE_BIOLOGO";
    private static final String SECRETARIA        = "ROLE_SECRETARIA";
    private static final String VENDEDOR_INSUMOS  = "ROLE_VENDEDOR_INSUMOS";
    private static final String PRODUCTOR         = "ROLE_PRODUCTOR";
    private static final String CUARTO_FRIO       = "ROLE_PERSONAL_CUARTO_FRIO";

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ── Infraestructura ───────────────────────────────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()

                // ── Públicos (sin token) ──────────────────────────────────────
                .requestMatchers(
                    "/auth/login",
                    "/auth/registro",
                    "/auth/verificar-email",
                    "/auth/reenviar-verificacion"
                ).permitAll()

                // ── Gestión de usuarios y roles ───────────────────────────────
                .requestMatchers("/roles/**").hasAuthority(ADMIN)
                .requestMatchers("/usuarios/me").authenticated()
                .requestMatchers("/usuarios/**").hasAuthority(ADMIN)

                // ── Productores y estanques ───────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/productores/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, BIOLOGO,
                        GERENTE_COMERCIAL, CONTADORA, SECRETARIA, VENDEDOR_INSUMOS)
                .requestMatchers(HttpMethod.POST, "/productores/**")
                    .hasAnyAuthority(ADMIN, SECRETARIA)
                .requestMatchers(HttpMethod.PUT, "/productores/**")
                    .hasAnyAuthority(ADMIN, SECRETARIA)
                .requestMatchers("/estanques/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO, GERENTE_PLANTA)
                .requestMatchers("/especies/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO, GERENTE_PLANTA)

                // ── Biólogo ───────────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/seguimientos/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO)
                .requestMatchers(HttpMethod.GET, "/siembras/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO, GERENTE_PLANTA, GERENTE_COMERCIAL)
                .requestMatchers(HttpMethod.POST, "/siembras/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA)

                // ── Gerente de planta ─────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/recepciones/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, CONTADORA, SECRETARIA)
                .requestMatchers(HttpMethod.POST, "/recepciones/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA)
                .requestMatchers("/turnos-pesca/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, PRODUCTOR)
                .requestMatchers("/procesamientos/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, CUARTO_FRIO)
                .requestMatchers("/lotes-cuarto-frio/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, CUARTO_FRIO)

                // ── Clientes y puntos de venta ────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/clientes/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL, GERENTE_PLANTA)
                .requestMatchers(HttpMethod.POST, "/clientes/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL)
                .requestMatchers(HttpMethod.PUT, "/clientes/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL)
                .requestMatchers(HttpMethod.GET, "/puntos-venta/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL, GERENTE_PLANTA)
                .requestMatchers(HttpMethod.POST, "/puntos-venta/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL)
                .requestMatchers(HttpMethod.PUT, "/puntos-venta/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL)

                // ── Logística ─────────────────────────────────────────────────
                .requestMatchers("/envios/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL, GERENTE_PLANTA, SECRETARIA)

                // ── Finanzas ──────────────────────────────────────────────────
                .requestMatchers("/pagos-productor/**")
                    .hasAnyAuthority(ADMIN, CONTADORA)

                // metodos-pago: usado en modales de Pagos e Ingresos
                // Se amplía a todos los roles que usan esos módulos
                .requestMatchers("/metodos-pago/**")
                    .hasAnyAuthority(ADMIN, CONTADORA, GERENTE_COMERCIAL,
                        GERENTE_PLANTA, SECRETARIA)

                .requestMatchers("/ingresos/**")
                    .hasAnyAuthority(ADMIN, CONTADORA, GERENTE_COMERCIAL)

                // ── Insumos ───────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/insumos/**")
                    .hasAnyAuthority(ADMIN, VENDEDOR_INSUMOS, CONTADORA,
                        GERENTE_PLANTA, PRODUCTOR)
                .requestMatchers(HttpMethod.POST, "/insumos/**")
                    .hasAnyAuthority(ADMIN, VENDEDOR_INSUMOS)
                .requestMatchers(HttpMethod.PUT, "/insumos/**")
                    .hasAnyAuthority(ADMIN, VENDEDOR_INSUMOS)
                .requestMatchers(HttpMethod.PATCH, "/insumos/**")
                    .hasAnyAuthority(ADMIN, VENDEDOR_INSUMOS)
                .requestMatchers(HttpMethod.GET, "/ventas-insumo/**")
                    .hasAnyAuthority(ADMIN, VENDEDOR_INSUMOS, CONTADORA, PRODUCTOR)
                .requestMatchers(HttpMethod.POST, "/ventas-insumo/**")
                    .hasAnyAuthority(ADMIN, VENDEDOR_INSUMOS)
                .requestMatchers(HttpMethod.PATCH, "/ventas-insumo/**")
                    .hasAnyAuthority(ADMIN, CONTADORA)
                .requestMatchers(HttpMethod.GET, "/movimientos-insumo/**")
                    .hasAnyAuthority(ADMIN, VENDEDOR_INSUMOS, CONTADORA)
                .requestMatchers(HttpMethod.POST, "/movimientos-insumo/**")
                    .hasAnyAuthority(ADMIN, VENDEDOR_INSUMOS)

                // ── Reportes ──────────────────────────────────────────────────
                .requestMatchers("/reportes/**")
                    .hasAnyAuthority(ADMIN, CONTADORA, GERENTE_COMERCIAL,
                        GERENTE_PLANTA, SECRETARIA, BIOLOGO)
                        
                // ── Administración de solicitudes de acceso ───────────────────────────
                .requestMatchers("/admin/solicitudes/**").hasAuthority(ADMIN)
                
                
                // ── Resto: cualquier usuario autenticado ──────────────────────
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
