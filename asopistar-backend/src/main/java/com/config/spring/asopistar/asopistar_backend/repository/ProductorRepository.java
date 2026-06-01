package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Productor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface ProductorRepository extends JpaRepository<Productor, Integer> {
 
    // Buscar por cédula (evita duplicados al registrar)
    Optional<Productor> findByDocumento(String documento);
 
    // Verificar si el documento ya existe
    boolean existsByDocumento(String documento);
 
    // Solo productores activos en la asociación
    List<Productor> findByActivoTrue();
 
    // Productor asociado a un usuario del sistema
    Optional<Productor> findByUsuarioIdUsuario(Integer idUsuario);


    boolean existsByUsuarioIdUsuario(Integer idUsuario);
}

