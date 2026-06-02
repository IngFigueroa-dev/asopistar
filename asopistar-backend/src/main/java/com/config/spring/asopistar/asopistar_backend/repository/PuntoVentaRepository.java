package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.PuntoVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PuntoVentaRepository extends JpaRepository<PuntoVenta, Integer> {

    /** Todos los puntos activos (para Logística y selectores). */
    List<PuntoVenta> findByEstado(String estado);

    /** Verificar código único antes de crear. */
    boolean existsByCodigo(String codigo);

    /** Verificar código único excluyendo el propio registro al editar. */
    boolean existsByCodigoAndIdPuntoNot(String codigo, Integer idPunto);

    /** Búsqueda por nombre o ciudad (case-insensitive). */
    @Query("""
        SELECT p FROM PuntoVenta p
        WHERE LOWER(p.nombre)   LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.ciudad)   LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.codigo)   LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.responsable) LIKE LOWER(CONCAT('%', :q, '%'))
        ORDER BY p.nombre
        """)
    List<PuntoVenta> buscar(@Param("q") String query);

    /** Conteo por tipo para reportes. */
    long countByTipo(String tipo);

    /** Conteo por estado para reportes. */
    long countByEstado(String estado);

    /** Buscar por código exacto. */
    Optional<PuntoVenta> findByCodigo(String codigo);
}
