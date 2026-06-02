package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Envio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnvioRepository extends JpaRepository<Envio, Integer> {

    // ── Consultas originales (sin cambios) ────────────────────────────────────

    List<Envio> findByEstado(String estado);

    List<Envio> findByClienteIdCliente(Integer idCliente);

    List<Envio> findByPuntoVentaIdPunto(Integer idPunto);

    List<Envio> findByDestinoCiudad(String ciudad);

    List<Envio> findByFechaEnvioBetween(LocalDateTime inicio, LocalDateTime fin);

    // ── Nuevas consultas ──────────────────────────────────────────────────────

    /** Verificar unicidad del código de guía. */
    boolean existsByCodigoGuia(String codigoGuia);

    /** Buscar por código de guía exacto. */
    Optional<Envio> findByCodigoGuia(String codigoGuia);

    /** Último ID registrado para generar el correlativo de guía. */
    @Query("SELECT COALESCE(MAX(e.idEnvio), 0) FROM Envio e")
    Integer findMaxId();

    /**
     * Búsqueda libre — guía, ciudad, cliente, punto de venta, conductor.
     */
    @Query("""
        SELECT e FROM Envio e
        LEFT JOIN e.cliente c
        LEFT JOIN e.puntoVenta p
        WHERE LOWER(COALESCE(e.codigoGuia,       '')) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(COALESCE(e.destinoCiudad,    '')) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(COALESCE(c.razonSocial,      '')) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(COALESCE(p.nombre,           '')) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(COALESCE(e.nombreConductor,  '')) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(COALESCE(e.empresaTransportadora,'')) LIKE LOWER(CONCAT('%',:q,'%'))
        ORDER BY e.fechaEnvio DESC
        """)
    List<Envio> buscar(@Param("q") String query);

    /** Todos los envíos ordenados por fecha descendente. */
    List<Envio> findAllByOrderByFechaEnvioDesc();

    /** Envíos por estado ordenados por fecha. */
    List<Envio> findByEstadoOrderByFechaEnvioDesc(String estado);

    /** Contar envíos por estado (para dashboard). */
    long countByEstado(String estado);

    /** Envíos recientes para historial rápido de cliente. */
    List<Envio> findTop10ByClienteIdClienteOrderByFechaEnvioDesc(Integer idCliente);

    /** Envíos recientes para historial rápido de punto de venta. */
    List<Envio> findTop10ByPuntoVentaIdPuntoOrderByFechaEnvioDesc(Integer idPunto);
}
