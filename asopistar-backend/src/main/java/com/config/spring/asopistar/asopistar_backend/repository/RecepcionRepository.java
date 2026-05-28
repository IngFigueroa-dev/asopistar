package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Recepcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface RecepcionRepository extends JpaRepository<Recepcion, Integer> {
 
    // Recepciones de un productor
    List<Recepcion> findByProductorIdProductor(Integer idProductor);
 
    // Recepción asociada a un turno (relación 1:1)
    Optional<Recepcion> findByTurnoPescaIdTurno(Integer idTurno);
 
    // Recepciones en un rango de fechas (reportes)
    List<Recepcion> findByFechaHoraBetween(
        LocalDateTime inicio, LocalDateTime fin);
 
    // Recepciones de hoy
    List<Recepcion> findByFechaHoraBetweenOrderByFechaHoraAsc(
        LocalDateTime inicioDia, LocalDateTime finDia);
}

