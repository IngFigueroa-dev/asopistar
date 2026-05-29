package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.DetalleEnvioLote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleEnvioLoteRepository extends JpaRepository<DetalleEnvioLote, Integer> {

    List<DetalleEnvioLote> findByEnvioIdEnvio(Integer idEnvio);

    boolean existsByLoteIdLote(Integer idLote);
}