package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Integer> {
 
    // Solo métodos de pago activos
    List<MetodoPago> findByEstado(String estado);
}
