package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.DetalleEnvio;
import com.config.spring.asopistar.asopistar_backend.entity.DetalleEnvioId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
 
@Repository
public interface DetalleEnvioRepository
        extends JpaRepository<DetalleEnvio, DetalleEnvioId> {
 
    // Detalles de un envío específico
    List<DetalleEnvio> findByIdIdEnvio(Integer idEnvio);
 
    // Todos los envíos en que aparece un lote
    List<DetalleEnvio> findByLoteCuartoFrioIdLote(Integer idLote);


    //-------------------- Dashboard ------------------------------------
    @Query("""
        SELECT COALESCE(SUM(d.kilos), 0) FROM DetalleEnvioLote d
        WHERE d.envio.estado = 'ENTREGADO'
        AND MONTH(d.envio.fechaEnvio) = :mes
        AND YEAR(d.envio.fechaEnvio) = :anio
        """)
    BigDecimal sumKilosDespachadosMes(@Param("mes") int mes, @Param("anio") int anio);
}
