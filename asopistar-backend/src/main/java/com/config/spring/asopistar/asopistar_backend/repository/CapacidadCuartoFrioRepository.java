package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.CapacidadCuartoFrio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface CapacidadCuartoFrioRepository extends JpaRepository<CapacidadCuartoFrio, Integer> {

    // Siempre hay un solo registro — buscar el primero
    Optional<CapacidadCuartoFrio> findFirstByOrderByIdCapacidadAsc();

    // Capacidad máxima en kg para validaciones
    @Query("SELECT c.capacidadMaxKg FROM CapacidadCuartoFrio c ORDER BY c.idCapacidad ASC LIMIT 1")
    Optional<BigDecimal> findCapacidadMaxKg();
}
