package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Ingreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
 
@Repository
public interface IngresoRepository extends JpaRepository<Ingreso, Integer> {
 
    // Ingresos por tipo (VENTA_PESCADO, VENTA_INSUMO, OTRO)
    List<Ingreso> findByTipoOrigen(String tipoOrigen);
 
    // Ingresos en un rango de fechas
    List<Ingreso> findByFechaBetween(
        LocalDateTime inicio, LocalDateTime fin);
 
    // Total de ingresos en un período (para balance financiero)
    @Query("SELECT SUM(i.monto) FROM Ingreso i " +
           "WHERE i.fecha BETWEEN :inicio AND :fin")
    BigDecimal sumTotalIngresosPorPeriodo(
        @org.springframework.data.repository.query.Param("inicio")
        LocalDateTime inicio,
        @org.springframework.data.repository.query.Param("fin")
        LocalDateTime fin);
 
    // Ingresos por tipo en un período
    List<Ingreso> findByTipoOrigenAndFechaBetween(
        String tipoOrigen, LocalDateTime inicio, LocalDateTime fin);
}
