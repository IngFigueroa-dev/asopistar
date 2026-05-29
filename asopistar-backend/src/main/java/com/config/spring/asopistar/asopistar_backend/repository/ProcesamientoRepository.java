package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Procesamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcesamientoRepository extends JpaRepository<Procesamiento, Integer> {

    // Todas las etapas de una recepción, ordenadas cronológicamente
    List<Procesamiento> findByRecepcionIdRecepcionOrderByFechaInicioAsc(Integer idRecepcion);

    // Etapa activa (EN_PROCESO) de una recepción
    Optional<Procesamiento> findByRecepcionIdRecepcionAndEstado(Integer idRecepcion, String estado);

    // Todos por estado
    List<Procesamiento> findByEstado(String estado);
}
