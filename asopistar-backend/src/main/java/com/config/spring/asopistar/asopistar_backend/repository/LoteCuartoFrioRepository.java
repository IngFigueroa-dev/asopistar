package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.LoteCuartoFrio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface LoteCuartoFrioRepository
        extends JpaRepository<LoteCuartoFrio, Integer> {
 
    // Lotes disponibles en el cuarto frío
    List<LoteCuartoFrio> findByEstadoTrue();
 
    // Buscar lote por código
    Optional<LoteCuartoFrio> findByCodigoLote(String codigoLote);
 
    // Lotes de una recepción específica
    List<LoteCuartoFrio> findByRecepcionIdRecepcion(Integer idRecepcion);
 
    // Total de kilos disponibles en el cuarto frío
    @Query("SELECT SUM(l.kilos) FROM LoteCuartoFrio l WHERE l.estado = true")
    BigDecimal sumKilosDisponibles();
 
}
