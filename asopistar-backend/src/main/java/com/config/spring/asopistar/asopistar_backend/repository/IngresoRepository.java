package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Ingreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IngresoRepository extends JpaRepository<Ingreso, Integer> {

    // ── Consultas operativas ──────────────────────────────────────────────────

    List<Ingreso> findAllByOrderByFechaDesc();

    List<Ingreso> findByTipoOrigen(String tipoOrigen);

    /**
     * Filtro flexible usado por IngresoServiceImpl.filtrar().
     * Todos los parámetros son opcionales (null = sin filtro).
     */
    @Query(value = """
        SELECT * FROM negocio.ingreso i
        WHERE (:estado IS NULL OR i.estado_pago = :estado)
        AND (:tipo IS NULL OR i.tipo_ingreso = :tipo)
        AND (:idCliente IS NULL OR i.id_cliente = :idCliente)
        AND (CAST(:desde AS timestamp) IS NULL OR i.fecha >= CAST(:desde AS timestamp))
        AND (CAST(:hasta AS timestamp) IS NULL OR i.fecha <= CAST(:hasta AS timestamp))
        ORDER BY i.fecha DESC
        """, nativeQuery = true)
    List<Ingreso> filtrar(
            @Param("estado")    String estado,
            @Param("tipo")      String tipo,
            @Param("idCliente") Integer idCliente,
            @Param("desde")     LocalDateTime desde,
            @Param("hasta")     LocalDateTime hasta
    );  

    // ── Estadísticas usadas por IngresoServiceImpl.estadisticas() ─────────────

    /** Suma total de valor_total (todos los ingresos no anulados). */
    @Query("SELECT COALESCE(SUM(i.valorTotal), 0) FROM Ingreso i WHERE i.estadoPago <> 'ANULADO'")
    BigDecimal sumValorTotal();

    /** Suma total de valor_pagado (lo que ya se cobró). */
    @Query("SELECT COALESCE(SUM(i.valorPagado), 0) FROM Ingreso i WHERE i.estadoPago <> 'ANULADO'")
    BigDecimal sumValorPagado();

    /** Suma total de saldo_pendiente (cartera por cobrar). */
    @Query("SELECT COALESCE(SUM(i.saldoPendiente), 0) FROM Ingreso i WHERE i.estadoPago IN ('PENDIENTE', 'PARCIAL')")
    BigDecimal sumSaldoPendiente();

    /** Cuenta ingresos por estado_pago (PENDIENTE, PARCIAL, PAGADO, ANULADO). */
    @Query("SELECT COUNT(i) FROM Ingreso i WHERE i.estadoPago = :estado")
    Long countByEstado(@Param("estado") String estado);

    /**
     * Suma de valor_total agrupada por tipo_ingreso.
     * Retorna Object[] donde [0] = tipoIngreso (String) y [1] = suma (BigDecimal).
     * Excluye ingresos ANULADOS.
     */
    @Query("""
        SELECT i.tipoIngreso, COALESCE(SUM(i.valorTotal), 0)
        FROM Ingreso i
        WHERE i.estadoPago <> 'ANULADO'
        GROUP BY i.tipoIngreso
        """)
    List<Object[]> sumPorTipoIngreso();

    // ── Queries para el Dashboard ─────────────────────────────────────────────

    /** Suma de valor_total de ingresos en el mes y año actuales (excluye ANULADOS). */
    @Query("""
        SELECT COALESCE(SUM(i.valorTotal), 0) FROM Ingreso i
        WHERE i.estadoPago <> 'ANULADO'
          AND MONTH(i.fecha) = :mes
          AND YEAR(i.fecha) = :anio
        """)
    BigDecimal sumIngresosMes(@Param("mes") int mes, @Param("anio") int anio);

    /** Suma histórica total de valor_total (excluye ANULADOS). */
    @Query("SELECT COALESCE(SUM(i.valorTotal), 0) FROM Ingreso i WHERE i.estadoPago <> 'ANULADO'")
    BigDecimal sumIngresosTotal();

    /** Suma de saldo_pendiente — cartera por cobrar activa. */
    @Query("""
        SELECT COALESCE(SUM(i.saldoPendiente), 0) FROM Ingreso i
        WHERE i.estadoPago IN ('PENDIENTE', 'PARCIAL')
        """)
    BigDecimal sumCarteraPendiente();

    /** Cantidad de ingresos con saldo pendiente. */
    @Query("SELECT COUNT(i) FROM Ingreso i WHERE i.estadoPago IN ('PENDIENTE', 'PARCIAL')")
    Long countIngresosConSaldo();

    /** Suma de ingresos del mes con tipo = VENTA_PESCADO. */
    @Query("""
        SELECT COALESCE(SUM(i.valorTotal), 0) FROM Ingreso i
        WHERE i.tipoIngreso = 'VENTA_PESCADO'
          AND i.estadoPago <> 'ANULADO'
          AND MONTH(i.fecha) = :mes
          AND YEAR(i.fecha) = :anio
        """)
    BigDecimal sumIngresosPescadoMes(@Param("mes") int mes, @Param("anio") int anio);

    /** Suma de ingresos del mes con tipo = VENTA_ALEVINOS o VENTA_CONCENTRADO. */
    @Query("""
        SELECT COALESCE(SUM(i.valorTotal), 0) FROM Ingreso i
        WHERE i.tipoIngreso IN ('VENTA_ALEVINOS', 'VENTA_CONCENTRADO')
          AND i.estadoPago <> 'ANULADO'
          AND MONTH(i.fecha) = :mes
          AND YEAR(i.fecha) = :anio
        """)
    BigDecimal sumIngresosInsumosMes(@Param("mes") int mes, @Param("anio") int anio);
}
