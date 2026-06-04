package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Ingreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IngresoRepository extends JpaRepository<Ingreso, Integer> {

    // ── Listados ──────────────────────────────────────────────────────────────

    List<Ingreso> findAllByOrderByFechaDesc();

    List<Ingreso> findByEstadoPagoOrderByFechaDesc(String estadoPago);

    List<Ingreso> findByTipoIngresoOrderByFechaDesc(String tipoIngreso);

    List<Ingreso> findByCliente_IdClienteOrderByFechaDesc(Integer idCliente);

    // ── Filtrado combinado ────────────────────────────────────────────────────

    @Query("""
        SELECT i FROM Ingreso i
        WHERE (:estado   IS NULL OR i.estadoPago  = :estado)
          AND (:tipo     IS NULL OR i.tipoIngreso = :tipo)
          AND (:idCliente IS NULL OR i.cliente.idCliente = :idCliente)
          AND (:desde    IS NULL OR i.fecha >= :desde)
          AND (:hasta    IS NULL OR i.fecha <= :hasta)
        ORDER BY i.fecha DESC
    """)
    List<Ingreso> filtrar(
            @Param("estado")    String estado,
            @Param("tipo")      String tipo,
            @Param("idCliente") Integer idCliente,
            @Param("desde")     LocalDateTime desde,
            @Param("hasta")     LocalDateTime hasta
    );

    // ── Estadísticas ──────────────────────────────────────────────────────────

    @Query("""
        SELECT COALESCE(SUM(i.valorTotal), 0)
        FROM Ingreso i
        WHERE i.estadoPago <> 'ANULADO'
    """)
    java.math.BigDecimal sumValorTotal();

    @Query("""
        SELECT COALESCE(SUM(i.valorPagado), 0)
        FROM Ingreso i
        WHERE i.estadoPago <> 'ANULADO'
    """)
    java.math.BigDecimal sumValorPagado();

    @Query("""
        SELECT COALESCE(SUM(i.saldoPendiente), 0)
        FROM Ingreso i
        WHERE i.estadoPago IN ('PENDIENTE', 'PARCIAL')
    """)
    java.math.BigDecimal sumSaldoPendiente();

    @Query("""
        SELECT COUNT(i) FROM Ingreso i
        WHERE i.estadoPago = :estado
    """)
    long countByEstado(@Param("estado") String estado);

    // ── Reportes por tipo ─────────────────────────────────────────────────────

    @Query("""
        SELECT i.tipoIngreso, COALESCE(SUM(i.valorTotal), 0)
        FROM Ingreso i
        WHERE i.estadoPago <> 'ANULADO'
        GROUP BY i.tipoIngreso
    """)
    List<Object[]> sumPorTipoIngreso();

    // ── Número de ingreso ─────────────────────────────────────────────────────

    Optional<Ingreso> findByNumeroIngreso(String numeroIngreso);

    @Query("SELECT MAX(i.idIngreso) FROM Ingreso i WHERE YEAR(i.fechaCreacion) = :anio")
    Optional<Integer> maxIdEnAnio(@Param("anio") int anio);

    // ── Cartera por cliente ───────────────────────────────────────────────────

    @Query("""
        SELECT i.cliente.idCliente,
               COALESCE(SUM(i.valorTotal), 0),
               COALESCE(SUM(i.valorPagado), 0),
               COALESCE(SUM(i.saldoPendiente), 0)
        FROM Ingreso i
        WHERE i.cliente IS NOT NULL
          AND i.estadoPago <> 'ANULADO'
        GROUP BY i.cliente.idCliente
    """)
    List<Object[]> resumenCarteraPorCliente();
}
