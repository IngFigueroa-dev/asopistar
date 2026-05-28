package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
 
@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
 
    // Buscar rol por nombre (ej: 'ADMIN', 'BIOLOGO')
    Optional<Rol> findByNombre(String nombre);
 
    // Verificar si ya existe un rol con ese nombre
    boolean existsByNombre(String nombre);
}
