package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Recepcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecepcionRepository extends JpaRepository<Recepcion, Integer> {

    // ── Filtro simple por productor (usado por el modal de pagos) ─────────────
    List<Recepcion> findByProductor_IdProductorOrderByFechaHoraDesc(Integer idProductor);

    // ── Recepciones SIN pago PAGADO para un productor ─────────────────────────
    // Permite crear un nuevo pago solo sobre recepciones que lo necesitan.
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

    // ── Todas las recepciones ordenadas por fecha desc ────────────────────────
    List<Recepcion> findAllByOrderByFechaHoraDesc();
}
