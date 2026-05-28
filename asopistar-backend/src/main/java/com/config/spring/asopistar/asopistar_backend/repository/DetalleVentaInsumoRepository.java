package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.DetalleVentaInsumo;
import com.config.spring.asopistar.asopistar_backend.entity.DetalleVentaInsumoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface DetalleVentaInsumoRepository
        extends JpaRepository<DetalleVentaInsumo, DetalleVentaInsumoId> {
 
    // Detalles de una venta específica
    List<DetalleVentaInsumo> findByIdIdVentaInsumo(Integer idVentaInsumo);
 
    // Cuántas veces se ha vendido un insumo
    List<DetalleVentaInsumo> findByInsumoIdInsumo(Integer idInsumo);
}
