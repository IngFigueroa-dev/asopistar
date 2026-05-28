package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
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

    @Column(name = "nombre1", length = 15, nullable = false)
    private String nombre1;

    @Column(name = "nombre2", length = 15)
    private String nombre2;

    @Column(name = "apellido1", length = 15, nullable = false)
    private String apellido1;

    @Column(name = "apellido2", length = 15)
    private String apellido2;

    @Column(name = "email", length = 30, nullable = false, unique = true)
    private String email;

    @Column(name = "contrasena", length = 255, nullable = false)
    private String contrasena;

    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

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
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(activo);
    }
}