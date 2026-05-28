package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Especie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
 
@Repository
public interface EspecieRepository extends JpaRepository<Especie, Integer> {
 
    // Buscar especie por nombre (ej: 'Cachama')
    Optional<Especie> findByNombre(String nombre);
}
