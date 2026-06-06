package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Estanque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface EstanqueRepository extends JpaRepository<Estanque, Integer> {
 
    // Todos los estanques de un productor
    List<Estanque> findByProductorIdProductor(Integer idProductor);
 
    // Buscar por código único (ej: 'EST-001')
    Optional<Estanque> findByCodigo(String codigo);
 
    // Estanques por estado
    List<Estanque> findByEstadoEstanque(String estadoEstanque);
 
    // Estanques activos de un productor
    List<Estanque> findByProductorIdProductorAndEstadoEstanque(
        Integer idProductor, String estadoEstanque);




    // -------------------- Dashboard ----------------------------
    // Estanques por estado
    @Query("SELECT COUNT(e) FROM Estanque e WHERE e.estadoEstanque = :estado")
    Long countByEstadoEstanque(@Param("estado") String estado);
}
