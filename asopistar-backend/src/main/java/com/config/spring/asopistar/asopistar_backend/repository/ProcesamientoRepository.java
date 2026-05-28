package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Procesamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface ProcesamientoRepository
        extends JpaRepository<Procesamiento, Integer> {
 
    // Todas las etapas de procesamiento de un lote
    List<Procesamiento> findByLoteCuartoFrioIdLoteOrderByFechaAsc(
        Integer idLote);
 
    // Registros de procesamiento por etapa
    List<Procesamiento> findByEtapa(String etapa);
}
