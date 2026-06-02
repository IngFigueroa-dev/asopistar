package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.MovimientoInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MovimientoInsumoRepository extends JpaRepository<MovimientoInsumo, Integer> {

    List<MovimientoInsumo> findAllByOrderByFechaDesc();

    List<MovimientoInsumo> findByInsumoIdInsumoOrderByFechaDesc(Integer idInsumo);
}
