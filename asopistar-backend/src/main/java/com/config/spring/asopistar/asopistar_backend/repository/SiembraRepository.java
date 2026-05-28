package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Siembra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface SiembraRepository extends JpaRepository<Siembra, Integer> {
 
    // Siembras por estado (EN_CURSO, COSECHADO, PERDIDO)
    List<Siembra> findByEstado(String estado);
 
    // Siembras de un estanque específico
    List<Siembra> findByEstanqueIdEstanque(Integer idEstanque);
 
    // Siembras activas de un productor (navegando relaciones)
    List<Siembra> findByEstanqueProductorIdProductorAndEstado(
        Integer idProductor, String estado);
 
    // Siembras aptas para cosecha: estado EN_CURSO y biólogo aprobó
    @Query("SELECT s FROM Siembra s " +
           "WHERE s.estado = 'EN_CURSO' " +
           "AND EXISTS (" +
           "  SELECT seg FROM SeguimientoSiembra seg " +
           "  WHERE seg.siembra = s AND seg.aptoCosecha = 'Y')")
    List<Siembra> findSiembrasListasParaCosechar();
}
