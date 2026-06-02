package com.config.spring.asopistar.asopistar_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cliente", schema = "negocio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer idCliente;

    // ── Identificación empresarial ──────────────────────────────
    @Column(name = "tipo_documento", length = 20, nullable = false)
    private String tipoDocumento;           // NIT, CC, CE, PASAPORTE

    @Column(name = "numero_documento", length = 20, nullable = false, unique = true)
    private String numeroDocumento;

    @Column(name = "nit", length = 20, nullable = false, unique = true)
    private String nit;                     // NIT con dígito de verificación

    @Column(name = "razon_social", length = 100, nullable = false)
    private String razonSocial;

    // ── Clasificación ───────────────────────────────────────────
    @Column(name = "tipo_cliente", length = 30, nullable = false)
    private String tipoCliente;             // DISTRIBUIDOR, PUNTO_DE_VENTA, EMPRESA, COMERCIALIZADORA, OTRO

    @Column(name = "clasificacion_comercial", length = 20, nullable = false)
    private String clasificacionComercial;  // PREFERENCIAL, ACTIVO, INACTIVO, BLOQUEADO

    // ── Contacto principal ──────────────────────────────────────
    @Column(name = "nombre_contacto", length = 60, nullable = false)
    private String nombreContacto;

    @Column(name = "cargo_contacto", length = 50, nullable = false)
    private String cargoContacto;

    @Column(name = "telefono", length = 15, nullable = false)
    private String telefono;

    @Column(name = "telefono_secundario", length = 15)
    private String telefonoSecundario;

    @Column(name = "correo", length = 80, nullable = false, unique = true)
    private String correo;

    @Column(name = "correo_secundario", length = 80)
    private String correoSecundario;

    // ── Ubicación ───────────────────────────────────────────────
    @Column(name = "direccion", length = 120, nullable = false)
    private String direccion;

    @Column(name = "ciudad", length = 60, nullable = false)
    private String ciudad;

    @Column(name = "departamento", length = 60, nullable = false)
    private String departamento;

    // ── Información comercial ───────────────────────────────────
    @Column(name = "limite_credito", precision = 14, scale = 2, nullable = false)
    private BigDecimal limiteCredito;

    @Column(name = "observaciones", length = 300)
    private String observaciones;

    // ── Estado y auditoría ──────────────────────────────────────
    @Column(name = "estado", length = 20, nullable = false)
    private String estado;                  // ACTIVO, INACTIVO, BLOQUEADO

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estado == null)              this.estado = "ACTIVO";
        if (this.clasificacionComercial == null) this.clasificacionComercial = "ACTIVO";
        if (this.limiteCredito == null)       this.limiteCredito = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
