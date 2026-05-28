package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.DetalleEnvio;
import com.config.spring.asopistar.asopistar_backend.entity.DetalleEnvioId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface DetalleEnvioRepository
        extends JpaRepository<DetalleEnvio, DetalleEnvioId> {
 
    // Detalles de un envío específico
    List<DetalleEnvio> findByIdIdEnvio(Integer idEnvio);
 
    // Todos los envíos en que aparece un lote
    List<DetalleEnvio> findByLoteCuartoFrioIdLote(Integer idLote);
}
