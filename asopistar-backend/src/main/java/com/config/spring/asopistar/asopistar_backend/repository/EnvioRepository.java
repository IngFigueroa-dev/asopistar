package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Envio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnvioRepository extends JpaRepository<Envio, Integer> {

    // ── Consultas operativas (usadas por EnvioServiceImpl) ────────────────────

    /** Todos los envíos ordenados por fecha descendente. */
    List<Envio> findAllByOrderByFechaEnvioDesc();

    /** Buscar envío por código de guía único (GUIA-YYYY-NNNNN). */
    Optional<Envio> findByCodigoGuia(String codigoGuia);

    /** Búsqueda flexible por ciudad, guía o nombre de cliente/punto de venta. */
    @Query("""
        SELECT e FROM Envio e
        LEFT JOIN e.cliente c
        LEFT JOIN e.puntoVenta p
        WHERE LOWER(e.destinoCiudad) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(e.codigoGuia) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(c.razonSocial) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY e.fechaEnvio DESC
        """)
    List<Envio> buscar(@Param("query") String query);

    /** Últimos 10 envíos de un cliente específico. */
    List<Envio> findTop10ByClienteIdClienteOrderByFechaEnvioDesc(Integer idCliente);

    /** Últimos 10 envíos de un punto de venta específico. */
    List<Envio> findTop10ByPuntoVentaIdPuntoOrderByFechaEnvioDesc(Integer idPunto);

    // ── Queries para el Dashboard ─────────────────────────────────────────────

    /** Cuenta envíos por estado (PREPARADO, EN_CAMINO, ENTREGADO, CANCELADO). */
    @Query("SELECT COUNT(e) FROM Envio e WHERE e.estado = :estado")
    Long countByEstado(@Param("estado") String estado);

    /** Envíos entregados en el mes y año indicados. */
    @Query("""
        SELECT COUNT(e) FROM Envio e
        WHERE e.estado = 'ENTREGADO'
          AND MONTH(e.fechaEnvio) = :mes
          AND YEAR(e.fechaEnvio) = :anio
        """)
    Long countEntregadosMes(@Param("mes") int mes, @Param("anio") int anio);

    /** Total histórico de envíos. */
    @Query("SELECT COUNT(e) FROM Envio e")
    Long countTotal();
}
