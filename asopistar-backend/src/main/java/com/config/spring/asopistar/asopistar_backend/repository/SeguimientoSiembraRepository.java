package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.SeguimientoSiembra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface SeguimientoSiembraRepository
        extends JpaRepository<SeguimientoSiembra, Integer> {
 
    // Todos los seguimientos de una siembra ordenados por fecha
    List<SeguimientoSiembra> findBySiembraIdSiembraOrderByFechaVisitaDesc(
        Integer idSiembra);
 
    // El seguimiento más reciente de una siembra
    Optional<SeguimientoSiembra> findTopBySiembraIdSiembraOrderByFechaVisitaDesc(
        Integer idSiembra);
 
    // Seguimientos que el biólogo marcó como aptos para cosecha
    List<SeguimientoSiembra> findByAptoCosecha(Character aptoCosecha);


    // Necesario para ReporteServiceImpl — devuelve los seguimientos de una siembra
    List<SeguimientoSiembra> findBySiembra_IdSiembra(Integer idSiembra);
}
