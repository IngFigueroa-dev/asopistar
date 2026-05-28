package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
 
    // Buscar clientes por ciudad (Cúcuta, Bucaramanga, Ocaña, etc.)
    List<Cliente> findByCiudad(String ciudad);
 
    // Buscar clientes por tipo (MAYORISTA, MINORISTA, RESTAURANTE)
    List<Cliente> findByTipo(String tipo);
 
    // Buscar cliente por email
    Optional<Cliente> findByEmail(String email);
}
