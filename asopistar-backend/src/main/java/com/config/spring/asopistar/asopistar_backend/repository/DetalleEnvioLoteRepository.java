package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.DetalleEnvioLote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DetalleEnvioLoteRepository extends JpaRepository<DetalleEnvioLote, Integer> {

    // ── Consultas operativas existentes (sin modificar) ───────────────────────

    List<DetalleEnvioLote> findByEnvioIdEnvio(Integer idEnvio);

    boolean existsByLoteIdLote(Integer idLote);

    // ── Query para el Dashboard ───────────────────────────────────────────────

    /**
     * Suma de kilos despachados en envíos ENTREGADOS durante el mes y año indicados.
     * Usa el campo kilos propio de DetalleEnvioLote (no el del lote).
     * COALESCE evita null si no hay envíos entregados en el período.
     */
    @Query("""
        SELECT COALESCE(SUM(d.kilos), 0) FROM DetalleEnvioLote d
        WHERE d.envio.estado = 'ENTREGADO'
          AND MONTH(d.envio.fechaEnvio) = :mes
          AND YEAR(d.envio.fechaEnvio) = :anio
        """)
    BigDecimal sumKilosDespachadosMes(@Param("mes") int mes, @Param("anio") int anio);
}
