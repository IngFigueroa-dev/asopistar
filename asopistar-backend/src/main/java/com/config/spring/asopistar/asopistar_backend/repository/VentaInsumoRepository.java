package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.VentaInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface VentaInsumoRepository extends JpaRepository<VentaInsumo, Integer> {

    List<VentaInsumo> findByProductorIdProductor(Integer idProductor);

    @Query("SELECT v FROM VentaInsumo v LEFT JOIN FETCH v.detalles d LEFT JOIN FETCH d.insumo")
    List<VentaInsumo> findAllWithDetalles();
}
