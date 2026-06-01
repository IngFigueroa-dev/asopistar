package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "usuario", schema = "negocio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    // ── Datos personales ─────────────────────────────────────────────────────
    @Column(name = "nombre1", length = 15, nullable = false)
    private String nombre1;

    @Column(name = "nombre2", length = 15)
    private String nombre2;

    @Column(name = "apellido1", length = 15, nullable = false)
    private String apellido1;

    @Column(name = "apellido2", length = 15)
    private String apellido2;

    @Column(name = "documento", length = 20)
    private String documento;

    @Column(name = "telefono", length = 15)
    private String telefono;

    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;

    @Column(name = "contrasena", length = 255, nullable = false)
    private String contrasena;

    // ── Datos adicionales para productores ──────────────────────────────────
    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "cantidad_hijos")
    private Integer cantidadHijos;

    @Column(name = "direccion", length = 100)
    private String direccion;

    // ── Gestión de cuenta ────────────────────────────────────────────────────
    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;

    /**
     * Cargo que el usuario seleccionó al registrarse (texto libre del dropdown).
     * El administrador asigna el rol real al momento de aprobar.
     * Ejemplo: "Productor", "Biólogo", "Contadora".
     */
    @Column(name = "cargo_solicitado", length = 50)
    private String cargoSolicitado;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 30, nullable = false)
    @Builder.Default
    private EstadoUsuario estado = EstadoUsuario.PENDIENTE_VERIFICACION;

    // ── Verificación de correo ───────────────────────────────────────────────
    @Column(name = "token_verificacion", length = 255)
    private String tokenVerificacion;

    @Column(name = "fecha_expiracion_token")
    private LocalDateTime fechaExpiracionToken;

    // ── Aprobación ───────────────────────────────────────────────────────────
    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprobado_por")
    private Usuario aprobadoPor;

    @Column(name = "motivo_rechazo", length = 255)
    private String motivoRechazo;

    // ── Rol ──────────────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    // ── Spring Security ──────────────────────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.getNombre()));
    }

    @Override
    public String getPassword() {
        return contrasena;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // Bloqueado si está rechazado o inactivo
        return estado != EstadoUsuario.RECHAZADO
            && estado != EstadoUsuario.INACTIVO;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        // Solo puede iniciar sesión si está ACTIVO
        return EstadoUsuario.ACTIVO.equals(estado);
    }
}
