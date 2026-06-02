package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface InsumoRepository extends JpaRepository<Insumo, Integer> {

    List<Insumo> findByEstado(String estado);

    boolean existsByCodigo(String codigo);

    /** Insumos donde stock_actual <= stock_minimo */
    @Query("SELECT i FROM Insumo i WHERE i.stockActual <= i.stockMinimo AND i.estado = 'ACTIVO'")
    List<Insumo> findBajoStock();
}
