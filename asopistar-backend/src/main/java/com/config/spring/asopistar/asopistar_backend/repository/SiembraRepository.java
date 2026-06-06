package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Siembra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiembraRepository extends JpaRepository<Siembra, Integer> {

    // ── Consultas existentes (sin modificar) ──────────────────────────────────

    List<Siembra> findByEstado(String estado);

    List<Siembra> findByEstanqueIdEstanque(Integer idEstanque);

    List<Siembra> findByEstanqueProductorIdProductorAndEstado(
            Integer idProductor, String estado);

    @Query("SELECT s FROM Siembra s " +
           "WHERE s.estado = 'EN_CURSO' " +
           "AND EXISTS (" +
           "  SELECT seg FROM SeguimientoSiembra seg " +
           "  WHERE seg.siembra = s AND seg.aptoCosecha = 'Y')")
    List<Siembra> findSiembrasListasParaCosechar();

    // ── Nuevas queries para el Dashboard (solo lectura) ───────────────────────

    /** Total de siembras con estado EN_CURSO. */
    @Query("SELECT COUNT(s) FROM Siembra s WHERE s.estado = 'EN_CURSO'")
    Long countSiembrasActivas();

    /** Total histórico de siembras. */
    @Query("SELECT COUNT(s) FROM Siembra s")
    Long countTotalSiembras();

    /**
     * Siembras EN_CURSO que tienen al menos un seguimiento con apto_cosecha = 'Y'.
     * Son las que están listas para que se les asigne un turno de pesca.
     */
    @Query("""
        SELECT COUNT(s) FROM Siembra s
        WHERE s.estado = 'EN_CURSO'
          AND EXISTS (
              SELECT seg FROM SeguimientoSiembra seg
              WHERE seg.siembra = s AND seg.aptoCosecha = 'Y'
          )
        """)
    Long countSiembrasListasParaCosechar();

    /**
     * Suma de alevinos de siembras actualmente EN_CURSO.
     * Representa el volumen productivo actual en los estanques.
     */
    @Query("SELECT COALESCE(SUM(s.cantidadAlevinos), 0) FROM Siembra s WHERE s.estado = 'EN_CURSO'")
    Long sumAlevinosActivos();

    /**
     * Siembras EN_CURSO que NO tienen ningún seguimiento registrado.
     * Indica que el biólogo aún no ha visitado esos estanques.
     */
    @Query("""
        SELECT COUNT(s) FROM Siembra s
        WHERE s.estado = 'EN_CURSO'
          AND NOT EXISTS (
              SELECT seg FROM SeguimientoSiembra seg
              WHERE seg.siembra = s
          )
        """)
    Long countSiembrasSinSeguimiento();
}
