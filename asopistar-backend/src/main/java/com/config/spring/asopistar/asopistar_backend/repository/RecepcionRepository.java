package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Recepcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RecepcionRepository extends JpaRepository<Recepcion, Integer> {

    // ── Consultas existentes (sin modificar) ──────────────────────────────────

    List<Recepcion> findByProductor_IdProductorOrderByFechaHoraDesc(Integer idProductor);

    @Query("""
        SELECT r FROM Recepcion r
        WHERE r.productor.idProductor = :idProductor
          AND NOT EXISTS (
              SELECT p FROM PagoProductor p
              WHERE p.recepcion = r
                AND p.estado = 'PAGADO'
          )
        ORDER BY r.fechaHora DESC
        """)
    List<Recepcion> findSinPagoPorProductor(@Param("idProductor") Integer idProductor);

    List<Recepcion> findAllByOrderByFechaHoraDesc();

    // ── Nuevas queries para el Dashboard (solo lectura) ───────────────────────

    /**
     * Cantidad de recepciones registradas en el mes y año actuales.
     * Usa MONTH() y YEAR() de JPQL para compatibilidad con PostgreSQL via Hibernate.
     */
    @Query("""
        SELECT COUNT(r) FROM Recepcion r
        WHERE MONTH(r.fechaHora) = :mes AND YEAR(r.fechaHora) = :anio
        """)
    Long countRecepcionesMes(@Param("mes") int mes, @Param("anio") int anio);

    /** Total histórico de recepciones. */
    @Query("SELECT COUNT(r) FROM Recepcion r")
    Long countRecepcionesTotal();

    /**
     * Suma de kilos recibidos en el mes y año actuales.
     * COALESCE evita null si no hay recepciones en el mes.
     */
    @Query("""
        SELECT COALESCE(SUM(r.kilosRecibidos), 0) FROM Recepcion r
        WHERE MONTH(r.fechaHora) = :mes AND YEAR(r.fechaHora) = :anio
        """)
    BigDecimal sumKilosRecibidosMes(@Param("mes") int mes, @Param("anio") int anio);

    /** Suma histórica total de kilos recibidos. */
    @Query("SELECT COALESCE(SUM(r.kilosRecibidos), 0) FROM Recepcion r")
    BigDecimal sumKilosRecibidosTotal();
}
