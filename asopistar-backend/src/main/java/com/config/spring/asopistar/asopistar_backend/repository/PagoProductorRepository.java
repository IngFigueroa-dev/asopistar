package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.PagoProductor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PagoProductorRepository extends JpaRepository<PagoProductor, Integer> {

    // ── Consultas existentes (sin modificar) ──────────────────────────────────

    List<PagoProductor> findByEstado(String estado);

    List<PagoProductor> findByProductor_IdProductor(Integer idProductor);

    List<PagoProductor> findByProductor_IdProductorAndEstado(Integer idProductor, String estado);

    boolean existsByRecepcion_IdRecepcionAndEstado(Integer idRecepcion, String estado);

    Optional<PagoProductor> findByRecepcion_IdRecepcion(Integer idRecepcion);

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM PagoProductor p WHERE p.estado = 'PAGADO'")
    BigDecimal sumTotalPagado();

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM PagoProductor p WHERE p.estado = 'PENDIENTE'")
    BigDecimal sumTotalPendiente();

    @Query("SELECT COUNT(p) FROM PagoProductor p WHERE p.estado = 'PAGADO'")
    Long countPagados();

    @Query("SELECT COUNT(p) FROM PagoProductor p WHERE p.estado = 'PENDIENTE'")
    Long countPendientes();

    @Query("SELECT COALESCE(AVG(p.monto), 0) FROM PagoProductor p")
    BigDecimal avgMonto();

    @Query("SELECT p FROM PagoProductor p " +
           "JOIN FETCH p.productor pr " +
           "JOIN FETCH p.recepcion r " +
           "JOIN FETCH p.metodoPago m " +
           "WHERE (:estado IS NULL OR p.estado = :estado) " +
           "AND (:idProductor IS NULL OR pr.idProductor = :idProductor) " +
           "ORDER BY p.fechaPago DESC")
    List<PagoProductor> findAllWithFilters(
            @Param("estado") String estado,
            @Param("idProductor") Integer idProductor);

    // ── Nuevas queries para el Dashboard (solo lectura) ───────────────────────

    /**
     * Suma de pagos completados (estado = PAGADO) en el mes y año actuales.
     * COALESCE evita null si no hay pagos en el período.
     */
    @Query("""
        SELECT COALESCE(SUM(p.monto), 0) FROM PagoProductor p
        WHERE p.estado = 'PAGADO'
          AND MONTH(p.fechaPago) = :mes
          AND YEAR(p.fechaPago) = :anio
        """)
    BigDecimal sumPagadosMes(@Param("mes") int mes, @Param("anio") int anio);
}
