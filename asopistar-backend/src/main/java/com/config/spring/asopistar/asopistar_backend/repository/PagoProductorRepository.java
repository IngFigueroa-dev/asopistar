package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.PagoProductor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
 
@Repository
public interface PagoProductorRepository
        extends JpaRepository<PagoProductor, Integer> {
 
    // Pagos por estado (PENDIENTE, PAGADO)
    List<PagoProductor> findByEstado(String estado);
 
    // Historial de pagos de un productor
    List<PagoProductor> findByProductorIdProductorOrderByFechaPagoDesc(
        Integer idProductor);
 
    // Pagos pendientes de un productor
    List<PagoProductor> findByProductorIdProductorAndEstado(
        Integer idProductor, String estado);
 
    // Total pagado a un productor
    @Query("SELECT SUM(p.monto) FROM PagoProductor p " +
           "WHERE p.productor.idProductor = :idProductor " +
           "AND p.estado = 'PAGADO'")
    BigDecimal sumTotalPagadoAProductor(
        @org.springframework.data.repository.query.Param("idProductor")
        Integer idProductor);
 
    // Pagos en un rango de fechas
    List<PagoProductor> findByFechaPagoBetween(
        LocalDateTime inicio, LocalDateTime fin);
}
