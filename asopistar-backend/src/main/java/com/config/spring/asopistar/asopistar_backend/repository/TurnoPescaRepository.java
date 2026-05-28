package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.TurnoPesca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
 
@Repository
public interface TurnoPescaRepository extends JpaRepository<TurnoPesca, Integer> {
 
    // Turnos por estado (PENDIENTE, CONFIRMADO, REALIZADO, CANCELADO)
    List<TurnoPesca> findByEstado(String estado);
 
    // Agenda del día: turnos de una fecha específica
    List<TurnoPesca> findByFechaProgramadaOrderByHoraProgramadaAsc(
        LocalDate fechaProgramada);
 
    // Turnos de un productor
    List<TurnoPesca> findByProductorIdProductor(Integer idProductor);
 
    // Turnos de emergencia pendientes
    List<TurnoPesca> findByTipoPrioridadAndEstado(
        String tipoPrioridad, String estado);
 
    // Turnos pendientes de una fecha (para no solapar horarios)
    List<TurnoPesca> findByFechaProgramadaAndEstado(
        LocalDate fecha, String estado);

    
    // Turnos ordenados por prioridad automática
    @Query("SELECT t FROM TurnoPesca t " +
        "WHERE t.estado IN ('PENDIENTE', 'CONFIRMADO') " +
        "ORDER BY " +
        "CASE t.tipoPrioridad WHEN 'EMERGENCIA' THEN 0 ELSE 1 END, " +
        "t.siembra.cantidadAlevinos ASC, " +
        "t.siembra.fechaSiembra ASC")
    List<TurnoPesca> findTurnosOrdenadosPorPrioridad();
}
