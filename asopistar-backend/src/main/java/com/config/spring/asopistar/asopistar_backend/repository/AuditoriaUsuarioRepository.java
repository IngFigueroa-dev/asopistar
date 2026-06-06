package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.AuditoriaUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditoriaUsuarioRepository extends JpaRepository<AuditoriaUsuario, Integer> {

    /** Historial completo de un usuario, ordenado del más reciente al más antiguo */
    List<AuditoriaUsuario> findByUsuario_IdUsuarioOrderByFechaDesc(Integer idUsuario);
}
