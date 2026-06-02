package com.config.spring.asopistar.asopistar_backend.repository;

import com.config.spring.asopistar.asopistar_backend.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    // ── Validaciones de unicidad ────────────────────────────────

    boolean existsByNit(String nit);
    boolean existsByNumeroDocumento(String numeroDocumento);
    boolean existsByCorreo(String correo);

    boolean existsByNitAndIdClienteNot(String nit, Integer idCliente);
    boolean existsByNumeroDocumentoAndIdClienteNot(String numeroDocumento, Integer idCliente);
    boolean existsByCorreoAndIdClienteNot(String correo, Integer idCliente);

    // ── Búsqueda básica ─────────────────────────────────────────

    Optional<Cliente> findByCorreo(String correo);
    Optional<Cliente> findByNit(String nit);

    List<Cliente> findByEstado(String estado);
    List<Cliente> findByTipoCliente(String tipoCliente);
    List<Cliente> findByClasificacionComercial(String clasificacionComercial);
    List<Cliente> findByCiudadIgnoreCase(String ciudad);

    // ── Búsqueda rápida (barra de búsqueda) ────────────────────

    @Query("""
        SELECT c FROM Cliente c
        WHERE LOWER(c.razonSocial)    LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(c.nit)            LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(c.correo)         LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(c.telefono)       LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(c.nombreContacto) LIKE LOWER(CONCAT('%', :q, '%'))
        ORDER BY c.razonSocial
        """)
    List<Cliente> busquedaRapida(@Param("q") String q);

    // ── Filtros combinados ──────────────────────────────────────

    @Query("""
        SELECT c FROM Cliente c
        WHERE (:razonSocial IS NULL OR LOWER(c.razonSocial) LIKE LOWER(CONCAT('%', :razonSocial, '%')))
          AND (:nit IS NULL OR c.nit LIKE CONCAT('%', :nit, '%'))
          AND (:ciudad IS NULL OR LOWER(c.ciudad) = LOWER(:ciudad))
          AND (:tipoCliente IS NULL OR c.tipoCliente = :tipoCliente)
          AND (:estado IS NULL OR c.estado = :estado)
          AND (:clasificacion IS NULL OR c.clasificacionComercial = :clasificacion)
        ORDER BY c.razonSocial
        """)
    List<Cliente> filtrar(
            @Param("razonSocial")  String razonSocial,
            @Param("nit")          String nit,
            @Param("ciudad")       String ciudad,
            @Param("tipoCliente")  String tipoCliente,
            @Param("estado")       String estado,
            @Param("clasificacion") String clasificacion
    );

    // ── Conteos para reportes ───────────────────────────────────

    long countByEstado(String estado);
    long countByTipoCliente(String tipoCliente);
    long countByClasificacionComercial(String clasificacionComercial);

    @Query("SELECT c.ciudad, COUNT(c) FROM Cliente c GROUP BY c.ciudad ORDER BY COUNT(c) DESC")
    List<Object[]> contarPorCiudad();

    @Query("SELECT c.tipoCliente, COUNT(c) FROM Cliente c GROUP BY c.tipoCliente")
    List<Object[]> contarPorTipo();
}
