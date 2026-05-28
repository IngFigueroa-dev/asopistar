package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Envio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
 
@Repository
public interface EnvioRepository extends JpaRepository<Envio, Integer> {
 
    // Envíos por estado (PREPARADO, EN_CAMINO, ENTREGADO)
    List<Envio> findByEstado(String estado);
 
    // Envíos a un cliente específico
    List<Envio> findByClienteIdCliente(Integer idCliente);
 
    // Envíos a un punto de venta
    List<Envio> findByPuntoVentaIdPunto(Integer idPunto);
 
    // Envíos por ciudad destino
    List<Envio> findByDestinoCiudad(String ciudad);
 
    // Envíos en un rango de fechas
    List<Envio> findByFechaEnvioBetween(
        LocalDateTime inicio, LocalDateTime fin);
}
