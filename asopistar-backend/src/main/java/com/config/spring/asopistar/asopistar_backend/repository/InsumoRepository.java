package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
 
@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Integer> {
 
    // Insumos por tipo (ALEVINO, CONCENTRADO)
    List<Insumo> findByTipo(String tipo);
 
    // Insumos con stock por debajo del mínimo (alerta de reabastecimiento)
    List<Insumo> findByStockActualLessThan(BigDecimal stockMinimo);
 
    // Insumos con bajo stock usando sus propios campos
    @Query("SELECT i FROM Insumo i WHERE i.stockActual <= i.stockMinimo")
    List<Insumo> findInsumosConBajoStock();
}
