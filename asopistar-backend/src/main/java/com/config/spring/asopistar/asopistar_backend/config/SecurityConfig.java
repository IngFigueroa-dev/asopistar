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

                // ── Productores ───────────────────────────────────────────────
                // El PRODUCTOR puede leer datos de productores (para su propio perfil)
                .requestMatchers(HttpMethod.GET, "/productores/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, BIOLOGO,
                        GERENTE_COMERCIAL, CONTADORA, SECRETARIA, VENDEDOR_INSUMOS,
                        PRODUCTOR)
                .requestMatchers(HttpMethod.POST, "/productores/**")
                    .hasAnyAuthority(ADMIN, SECRETARIA)
                .requestMatchers(HttpMethod.PUT, "/productores/**")
                    .hasAnyAuthority(ADMIN, SECRETARIA)

                // ── Estanques — separado por método para dar acceso al PRODUCTOR ──
                // El PRODUCTOR puede ver y crear sus propios estanques,
                // pero NO puede editar ni eliminar (eso es del staff).
                .requestMatchers(HttpMethod.GET, "/estanques/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO, GERENTE_PLANTA, PRODUCTOR, SECRETARIA)
                .requestMatchers(HttpMethod.POST, "/estanques/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO, GERENTE_PLANTA, PRODUCTOR)
                .requestMatchers(HttpMethod.PUT, "/estanques/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO, GERENTE_PLANTA)
                .requestMatchers(HttpMethod.DELETE, "/estanques/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA)

                // ── Especies — separado por método para dar acceso al PRODUCTOR ──
                // El PRODUCTOR puede ver el catálogo y agregar nuevas especies.
                .requestMatchers(HttpMethod.GET, "/especies/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO, GERENTE_PLANTA, PRODUCTOR, SECRETARIA)
                .requestMatchers(HttpMethod.POST, "/especies/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO, GERENTE_PLANTA, PRODUCTOR)
                .requestMatchers(HttpMethod.PUT, "/especies/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO, GERENTE_PLANTA)
                .requestMatchers(HttpMethod.DELETE, "/especies/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA)

                // ── Seguimientos — el PRODUCTOR solo puede LEER ───────────────
                // El POST sigue restringido a BIOLOGO y ADMIN.
                .requestMatchers(HttpMethod.GET, "/seguimientos/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO, GERENTE_PLANTA, PRODUCTOR)
                .requestMatchers(HttpMethod.POST, "/seguimientos/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO)

                // ── Siembras — el PRODUCTOR puede leer y crear ────────────────
                .requestMatchers(HttpMethod.GET, "/siembras/**")
                    .hasAnyAuthority(ADMIN, BIOLOGO, GERENTE_PLANTA,
                        GERENTE_COMERCIAL, PRODUCTOR, SECRETARIA)
                .requestMatchers(HttpMethod.POST, "/siembras/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, PRODUCTOR)
                // PUT de siembras: solo staff (el productor no edita siembras manualmente)
                .requestMatchers(HttpMethod.PUT, "/siembras/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA)

                // ── Gerente de planta / Recepciones ──────────────────────────
                .requestMatchers(HttpMethod.GET, "/recepciones/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, CONTADORA, SECRETARIA, GERENTE_COMERCIAL)
                .requestMatchers(HttpMethod.POST, "/recepciones/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, SECRETARIA)

                // ── Turnos de pesca — PRODUCTOR puede leer y crear ───────────
                // El PRODUCTOR reserva su propio turno desde Produccion.jsx.
                .requestMatchers("/turnos-pesca/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, PRODUCTOR, SECRETARIA)

                // ── Procesamiento y cuarto frío ───────────────────────────────
                .requestMatchers("/procesamientos/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, CUARTO_FRIO)
                .requestMatchers("/lotes-cuarto-frio/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, CUARTO_FRIO, GERENTE_COMERCIAL, SECRETARIA)

                // ── Clientes y puntos de venta ────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/clientes/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL, GERENTE_PLANTA, CONTADORA, SECRETARIA)
                .requestMatchers(HttpMethod.POST, "/clientes/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL, SECRETARIA)
                .requestMatchers(HttpMethod.PUT, "/clientes/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL, SECRETARIA)
                .requestMatchers(HttpMethod.GET, "/puntos-venta/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL, GERENTE_PLANTA, SECRETARIA)
                .requestMatchers(HttpMethod.POST, "/puntos-venta/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL, SECRETARIA)
                .requestMatchers(HttpMethod.PUT, "/puntos-venta/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL, SECRETARIA)

                // ── Logística ─────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/envios/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL, GERENTE_PLANTA, SECRETARIA, CONTADORA)
                .requestMatchers("/envios/**")
                    .hasAnyAuthority(ADMIN, GERENTE_COMERCIAL, GERENTE_PLANTA, SECRETARIA)

                // ── Finanzas ──────────────────────────────────────────────────
                .requestMatchers("/pagos-productor/**")
                    .hasAnyAuthority(ADMIN, CONTADORA)
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

                // ── Capacidad cuarto frio ─────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/capacidad-cuarto-frio/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, CUARTO_FRIO, SECRETARIA)
                .requestMatchers(HttpMethod.PUT, "/capacidad-cuarto-frio/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA)

                // ── Configuracion de produccion ───────────────────────────────
                .requestMatchers(HttpMethod.GET, "/configuracion-produccion/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA, BIOLOGO)
                .requestMatchers(HttpMethod.POST, "/configuracion-produccion/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA)
                .requestMatchers(HttpMethod.PUT, "/configuracion-produccion/**")
                    .hasAnyAuthority(ADMIN, GERENTE_PLANTA)

                // ── Reportes ──────────────────────────────────────────────────
                .requestMatchers("/reportes/**")
                    .hasAnyAuthority(ADMIN, CONTADORA, GERENTE_COMERCIAL,
                        GERENTE_PLANTA, SECRETARIA, BIOLOGO)

                // ── Administración de solicitudes de acceso ───────────────────
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
