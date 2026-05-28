package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
 
    // CRÍTICO para Spring Security: carga el usuario por email en el login
    Optional<Usuario> findByEmail(String email);
 
    // Verificar si el email ya está registrado antes de crear un usuario
    boolean existsByEmail(String email);
 
    // Listar solo usuarios activos
    List<Usuario> findByActivoTrue();
 
    // Usuarios por rol (ej: todos los biólogos)
    List<Usuario> findByRolNombre(String nombreRol);
}
