package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.DetalleVentaInsumo;
import com.config.spring.asopistar.asopistar_backend.entity.DetalleVentaInsumoId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DetalleVentaInsumoRepository
        extends JpaRepository<DetalleVentaInsumo, DetalleVentaInsumoId> {

    List<DetalleVentaInsumo> findById_IdVentaInsumo(Integer idVentaInsumo);
}
