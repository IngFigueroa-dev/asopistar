package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.VentaInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
 
@Repository
public interface VentaInsumoRepository
        extends JpaRepository<VentaInsumo, Integer> {
 
    // Ventas de insumos a un productor
    List<VentaInsumo> findByProductorIdProductor(Integer idProductor);
 
    // Ventas por estado de pago (PAGADO, PENDIENTE, CREDITO)
    List<VentaInsumo> findByEstadoPagado(String estadoPagado);
 
    // Ventas en un rango de fechas
    List<VentaInsumo> findByFechaBetween(
        LocalDateTime inicio, LocalDateTime fin);
 
    // Ventas pendientes de pago de un productor
    List<VentaInsumo> findByProductorIdProductorAndEstadoPagado(
        Integer idProductor, String estadoPagado);
}
