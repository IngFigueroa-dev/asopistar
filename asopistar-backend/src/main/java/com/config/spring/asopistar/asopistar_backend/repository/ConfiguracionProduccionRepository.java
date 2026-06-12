package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.ConfiguracionProduccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConfiguracionProduccionRepository
        extends JpaRepository<ConfiguracionProduccion, Integer> {

    Optional<ConfiguracionProduccion> findByEspecieIdEspecie(Integer idEspecie);

    List<ConfiguracionProduccion> findByActivoTrue();
}
