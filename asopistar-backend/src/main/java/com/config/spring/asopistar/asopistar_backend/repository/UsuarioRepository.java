package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.EstadoUsuario;
import com.config.spring.asopistar.asopistar_backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    boolean existsByEmail(String email);

    boolean existsByDocumento(String documento);

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByTokenVerificacion(String token);

    List<Usuario> findByActivoTrue();

    List<Usuario> findByEstado(EstadoUsuario estado);

    // Para el módulo de solicitudes: pendientes de aprobación
    List<Usuario> findByEstadoOrderByFechaCreacionAsc(EstadoUsuario estado);
}
