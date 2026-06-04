package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.PagoIngreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PagoIngresoRepository extends JpaRepository<PagoIngreso, Integer> {

    List<PagoIngreso> findByIngreso_IdIngresoOrderByFechaPagoDesc(Integer idIngreso);

    @Query("""
        SELECT COALESCE(SUM(p.valorPago), 0)
        FROM PagoIngreso p
        WHERE p.ingreso.idIngreso = :idIngreso
    """)
    BigDecimal sumValorPagadoPorIngreso(@Param("idIngreso") Integer idIngreso);
}
