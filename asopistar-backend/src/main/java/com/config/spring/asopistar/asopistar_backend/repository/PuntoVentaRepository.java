package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.PuntoVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface PuntoVentaRepository extends JpaRepository<PuntoVenta, Integer> {
 
    // Solo puntos de venta activos
    List<PuntoVenta> findByActivoTrue();
 
    // Puntos de venta por ciudad
    List<PuntoVenta> findByCiudad(String ciudad);
}

