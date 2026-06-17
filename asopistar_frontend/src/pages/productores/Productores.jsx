// src/pages/productores/Productores.jsx
// ─────────────────────────────────────────────────────────────────────────────
// REDISEÑO v2 — Módulo Productores moderno ASOPISTAR 2026
// Coherente con Dashboard rediseñado: fondo claro, cards blancas,
// paleta teal/cyan, inline styles, mismos tokens visuales.
// Lógica de negocio, hooks, endpoints, estados, DTOs: SIN TOCAR.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import {
  UserPlus, Search, Phone, MapPin, IdCard,
  Users, X, ChevronRight, ChevronLeft,
  AlertCircle, RefreshCw, Calendar,
} from 'lucide-react'
import api from '../../services/api'

// ─── Paleta — mismos tokens que el Dashboard ─────────────────────────────────
const C = {
  teal:   '#14B8A6',
  cyan:   '#06B6D4',
  violet: '#8B5CF6',
  green:  '#10B981',
  amber:  '#F59E0B',
  red:    '#EF4444',
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Sk({ h = 16, w = '100%', r = 8 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r,
      background: '#F1F5F9',
      animation: 'pr-pulse 1.4s ease-in-out infinite',
    }} />
  )
}

// ─── Card skeleton (estado carga) ─────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: '1px solid #F1F5F9', padding: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F1F5F9', animation: 'pr-pulse 1.4s ease-in-out infinite', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Sk h={14} w="60%" />
          <Sk h={10} w="35%" />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Sk h={11} />
        <Sk h={11} w="75%" />
        <Sk h={11} w="85%" />
      </div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F8FAFC' }}>
        <Sk h={10} w="50%" />
      </div>
    </div>
  )
}

// ─── Avatar con gradiente ─────────────────────────────────────────────────────
function Avatar({ nombre, size = 44 }) {
  const letra = nombre?.charAt(0).toUpperCase() || '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 800, color: '#fff',
      boxShadow: '0 3px 10px rgba(20,184,166,0.25)',
    }}>
      {letra}
    </div>
  )
}

// ─── Badge activo / inactivo ──────────────────────────────────────────────────
function Badge({ activo }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: activo ? '#F0FDF4' : '#FEF2F2',
      border: `1px solid ${activo ? '#BBF7D0' : '#FECACA'}`,
      borderRadius: 999, padding: '3px 9px',
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: activo ? C.green : C.red,
        animation: activo ? 'pr-pulse 2s ease-in-out infinite' : 'none',
      }} />
      <span style={{
        fontSize: 11, fontWeight: 700,
        color: activo ? '#166534' : '#991B1B',
      }}>
        {activo ? 'Activo' : 'Inactivo'}
      </span>
    </div>
  )
}

// ─── Chip de filtro ───────────────────────────────────────────────────────────
function Chip({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 999, border: 'none',
        cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500,
        background: active ? C.teal : '#fff',
        color: active ? '#fff' : '#64748B',
        boxShadow: active ? '0 2px 8px rgba(20,184,166,0.25)' : 'none',
        border: active ? 'none' : '1px solid #E2E8F0',
        transition: 'all 0.15s',
      }}
    >
      {label}
      {count != null && (
        <span style={{
          fontSize: 11, fontWeight: 700, minWidth: 18, height: 18,
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: active ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
          color: active ? '#fff' : '#64748B',
        }}>
          {count}
        </span>
      )}
    </button>
  )
}

// ─── Card de productor ────────────────────────────────────────────────────────
function ProductorCard({ p }) {
  const nombre = `${p.nombre1}${p.nombre2 ? ' ' + p.nombre2 : ''} ${p.apellido1}${p.apellido2 ? ' ' + p.apellido2 : ''}`

  return (
    <div
      style={{
        background: '#fff', borderRadius: 14,
        border: '1px solid #F1F5F9', padding: '20px',
        transition: 'all 0.2s ease',
        cursor: 'default', position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'
        e.currentTarget.style.borderColor = C.teal + '40'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = '#F1F5F9'
      }}
    >
      {/* Borde superior de color */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${C.teal}, ${C.cyan})`,
      }} />

      {/* Header: avatar + nombre + badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, marginTop: 4 }}>
        <Avatar nombre={p.nombre1} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: '#0F172A',
            margin: '0 0 5px', lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {nombre}
          </h3>
          <Badge activo={p.activo} />
        </div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IdCard size={13} color={C.teal} />
          </div>
          <span style={{ fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.documento}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Phone size={13} color='#3B82F6' />
          </div>
          <span style={{ fontSize: 12, color: '#64748B' }}>{p.telefono}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            <MapPin size={13} color={C.amber} />
          </div>
          <span style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {p.direccion}
          </span>
        </div>
      </div>

      {/* Footer con fecha */}
      {p.fechaIngreso && (
        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: '1px solid #F8FAFC',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Calendar size={11} color='#CBD5E1' />
          <span style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 500 }}>
            Ingreso: {new Date(p.fechaIngreso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────
function EstadoVacio({ busqueda, onAgregar }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 18, marginBottom: 16,
        background: 'linear-gradient(135deg, #F0FDFA, #EFF6FF)',
        border: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M2 12C2 12 7 4 14 4C18 4 22 8 22 12C22 16 18 20 14 20C7 20 2 12 2 12Z" fill="#14B8A6" opacity="0.2"/>
          <path d="M2 12C2 12 7 4 14 4C18 4 22 8 22 12" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M2 12C2 12 7 20 14 20C18 20 22 16 22 12" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="17" cy="9" r="1.5" fill="#14B8A6"/>
        </svg>
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
        {busqueda ? 'Sin resultados' : 'Sin productores registrados'}
      </p>
      <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 20px', maxWidth: 280 }}>
        {busqueda
          ? `No encontramos productores que coincidan con "${busqueda}"`
          : 'Agrega el primer productor piscícola de ASOPISTAR'}
      </p>
      {!busqueda && (
        <button
          onClick={onAgregar}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`,
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 20px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(20,184,166,0.3)',
          }}
        >
          <UserPlus size={15} />
          Agregar primer productor
        </button>
      )}
    </div>
  )
}

// ─── Input con label flotante ─────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', letterSpacing: '0.02em' }}>
        {label}{required && <span style={{ color: C.teal, marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1.5px solid #E2E8F0', borderRadius: 9,
  fontSize: 13, color: '#0F172A', background: '#FAFAFA',
  outline: 'none', transition: 'all 0.15s', boxSizing: 'border-box',
}

// ─── MODAL — formulario wizard 2 pasos ───────────────────────────────────────
function ModalProductor({ onClose, onSubmit, error, form, setForm }) {
  const [paso, setPaso] = useState(1)

  const irPaso2 = (e) => {
    e.preventDefault()
    if (!form.nombre1 || !form.apellido1 || !form.documento || !form.telefono) return
    setPaso(2)
  }

  const handleFocus = (e) => {
    e.target.style.borderColor = C.teal
    e.target.style.background = '#fff'
    e.target.style.boxShadow = `0 0 0 3px rgba(20,184,166,0.12)`
  }
  const handleBlur = (e) => {
    e.target.style.borderColor = '#E2E8F0'
    e.target.style.background = '#FAFAFA'
    e.target.style.boxShadow = 'none'
  }

  return (
    // Overlay
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(15,23,42,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20,
          width: '100%', maxWidth: 540,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          animation: 'pr-modal-in 0.22s ease',
        }}
      >
        {/* Header del modal */}
        <div style={{
          padding: '22px 24px 18px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
          borderRadius: '20px 20px 0 0',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(6,182,212,0.12))',
            border: '1px solid rgba(20,184,166,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <UserPlus size={20} color={C.teal} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Nuevo Productor
            </h2>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>
              Completa la información del productor piscícola
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0',
              background: 'transparent', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#94A3B8',
              flexShrink: 0, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = '#FECACA' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = '#E2E8F0' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Indicador de pasos */}
        <div style={{ padding: '16px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          {[1, 2].map((n) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: n === 1 ? 1 : 'auto' }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, transition: 'all 0.2s',
                background: paso >= n ? C.teal : '#F1F5F9',
                color: paso >= n ? '#fff' : '#94A3B8',
              }}>
                {n}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: paso >= n ? '#0F172A' : '#94A3B8', whiteSpace: 'nowrap' }}>
                {n === 1 ? 'Información personal' : 'Vinculación'}
              </span>
              {n === 1 && (
                <div style={{ flex: 1, height: 2, borderRadius: 2, background: paso >= 2 ? C.teal : '#F1F5F9', transition: 'background 0.3s', marginLeft: 4 }} />
              )}
            </div>
          ))}
        </div>

        {/* ── PASO 1 ── */}
        {paso === 1 && (
          <form onSubmit={irPaso2} style={{ padding: '20px 24px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: 14 }}>
              <Field label="Primer nombre" required>
                <input
                  required value={form.nombre1}
                  onChange={e => setForm({ ...form, nombre1: e.target.value })}
                  placeholder="Ej: Carlos"
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </Field>
              <Field label="Segundo nombre">
                <input
                  value={form.nombre2}
                  onChange={e => setForm({ ...form, nombre2: e.target.value })}
                  placeholder="Opcional"
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: 14 }}>
              <Field label="Primer apellido" required>
                <input
                  required value={form.apellido1}
                  onChange={e => setForm({ ...form, apellido1: e.target.value })}
                  placeholder="Ej: Pérez"
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </Field>
              <Field label="Segundo apellido">
                <input
                  value={form.apellido2}
                  onChange={e => setForm({ ...form, apellido2: e.target.value })}
                  placeholder="Opcional"
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: 14 }}>
              <Field label="Número de documento" required>
                <input
                  required value={form.documento}
                  onChange={e => setForm({ ...form, documento: e.target.value })}
                  placeholder="Cédula o NIT"
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </Field>
              <Field label="Teléfono" required>
                <input
                  required value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  placeholder="+57 300 000 0000"
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Fecha de nacimiento" required>
                <input
                  type="date" required value={form.fechaNacimiento}
                  onChange={e => setForm({ ...form, fechaNacimiento: e.target.value })}
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </Field>
              <Field label="Cantidad de hijos">
                <input
                  type="number" min="0" value={form.cantidadHijos}
                  onChange={e => setForm({ ...form, cantidadHijos: e.target.value })}
                  placeholder="0"
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </Field>
            </div>

            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`,
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '10px 22px', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(20,184,166,0.3)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(20,184,166,0.4)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(20,184,166,0.3)'}
              >
                Siguiente
                <ChevronRight size={15} />
              </button>
            </div>
          </form>
        )}

        {/* ── PASO 2 ── */}
        {paso === 2 && (
          <form onSubmit={onSubmit} style={{ padding: '20px 24px 24px' }}>
            {/* Resumen del paso 1 */}
            <div style={{
              background: 'linear-gradient(135deg, #F0FDFA, #EFF6FF)',
              border: '1px solid #E2E8F0', borderRadius: 12,
              padding: '14px 16px', marginBottom: 18,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <Avatar nombre={form.nombre1} size={40} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>
                  {form.nombre1} {form.nombre2} {form.apellido1} {form.apellido2}
                </p>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                  Doc: {form.documento} · Tel: {form.telefono}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <Field label="Dirección" required>
                <input
                  required value={form.direccion}
                  onChange={e => setForm({ ...form, direccion: e.target.value })}
                  placeholder="Vereda, municipio, departamento"
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </Field>
            </div>
            <div style={{ marginBottom: 14 }}>
              <Field label="Fecha de ingreso a ASOPISTAR" required>
                <input
                  type="date" required value={form.fechaIngreso}
                  onChange={e => setForm({ ...form, fechaIngreso: e.target.value })}
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </Field>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 10, padding: '10px 14px', marginBottom: 14,
              }}>
                <AlertCircle size={15} color={C.red} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#991B1B' }}>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setPaso(1)}
                style={{
                  flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  background: '#fff', color: '#475569',
                  border: '1.5px solid #E2E8F0', borderRadius: 10,
                  padding: '10px 16px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E2E8F0' }}
              >
                <ChevronLeft size={15} />
                Atrás
              </button>
              <button
                type="submit"
                style={{
                  flex: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`,
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '10px 22px', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(20,184,166,0.3)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(20,184,166,0.4)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(20,184,166,0.3)'}
              >
                <UserPlus size={15} />
                Guardar Productor
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
function Productores() {
  // ── Lógica de negocio SIN TOCAR ──────────────────────────────────────────
  const [productores, setProductores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre1: '', nombre2: '', apellido1: '', apellido2: '',
    documento: '', telefono: '', direccion: '',
    fechaIngreso: '', fechaNacimiento: '', cantidadHijos: '',
    idUsuario: 1
  })

  useEffect(() => {
    cargarProductores()
  }, [])

  const cargarProductores = async () => {
    try {
      setLoading(true)
      const res = await api.get('/productores')
      setProductores(res.data)
    } catch (err) {
      setError('Error al cargar productores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/productores', {
        ...form,
        cantidadHijos: parseInt(form.cantidadHijos) || 0,
        idUsuario: parseInt(form.idUsuario)
      })
      setMostrarModal(false)
      setForm({
        nombre1: '', nombre2: '', apellido1: '', apellido2: '',
        documento: '', telefono: '', direccion: '',
        fechaIngreso: '', fechaNacimiento: '', cantidadHijos: '',
        idUsuario: 1
      })
      cargarProductores()
    } catch (err) {
      setError('Error al crear productor')
    }
  }

  // ── Filtro extra de estado (visual) + búsqueda existente ─────────────────
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const productoresFiltrados = productores.filter(p => {
    const coincideBusqueda =
      `${p.nombre1} ${p.apellido1}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.documento?.includes(busqueda)
    const coincideEstado =
      filtroEstado === 'todos' ||
      (filtroEstado === 'activos' && p.activo) ||
      (filtroEstado === 'inactivos' && !p.activo)
    return coincideBusqueda && coincideEstado
  })

  const activos   = productores.filter(p => p.activo).length
  const inactivos = productores.filter(p => !p.activo).length

  const abrirModal = () => {
    setError('')
    setMostrarModal(true)
  }
  const cerrarModal = () => {
    setMostrarModal(false)
    setError('')
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── HERO HEADER ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDFA 0%, #F8FAFC 50%, #EFF6FF 100%)',
        border: '1px solid #E2E8F0', borderRadius: 18,
        padding: '22px 26px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decoración sutil — mismo estilo que Dashboard Hero */}
        <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(20,184,166,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 80, width: 90, height: 90, borderRadius: '50%', background: 'rgba(59,130,246,0.04)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          {/* Izquierda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 13, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(6,182,212,0.12))',
              border: '1px solid rgba(20,184,166,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={22} color={C.teal} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
                Productores
              </h1>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                {loading ? 'Cargando...' : `${productores.length} productores registrados · ${activos} activos`}
              </p>
            </div>
          </div>

          {/* Botón agregar */}
          <button
            onClick={abrirModal}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`,
              color: '#fff', border: 'none', borderRadius: 11,
              padding: '10px 18px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(20,184,166,0.3)',
              transition: 'all 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,184,166,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(20,184,166,0.3)'; e.currentTarget.style.transform = 'none' }}
          >
            <UserPlus size={16} />
            Nuevo Productor
          </button>
        </div>
      </div>

      {/* ── BUSCADOR + FILTROS ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        flexWrap: 'wrap', marginBottom: 20,
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              border: '1.5px solid #E2E8F0', borderRadius: 10,
              fontSize: 13, color: '#0F172A', background: '#fff',
              outline: 'none', transition: 'all 0.15s', boxSizing: 'border-box',
            }}
            onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.1)' }}
            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Chips de filtro */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
          <Chip label="Todos"    count={productores.length} active={filtroEstado === 'todos'}    onClick={() => setFiltroEstado('todos')} />
          <Chip label="Activos"  count={activos}            active={filtroEstado === 'activos'}  onClick={() => setFiltroEstado('activos')} />
          <Chip label="Inactivos" count={inactivos}         active={filtroEstado === 'inactivos'} onClick={() => setFiltroEstado('inactivos')} />
        </div>
      </div>

      {/* ── ERROR de carga ───────────────────────────────────────────────────── */}
      {error && !mostrarModal && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#FEF2F2', border: '1px solid #FECACA',
          borderRadius: 12, padding: '12px 16px', marginBottom: 16,
          flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} color={C.red} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#991B1B', fontWeight: 500 }}>{error}</span>
          </div>
          <button
            onClick={() => { setError(''); cargarProductores() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#fff', border: '1px solid #FECACA',
              borderRadius: 7, padding: '5px 12px', fontSize: 12,
              fontWeight: 600, color: C.red, cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} />
            Reintentar
          </button>
        </div>
      )}

      {/* ── CONTENIDO ────────────────────────────────────────────────────────── */}
      {loading ? (
        // Skeleton loaders
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : productoresFiltrados.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9' }}>
          <EstadoVacio busqueda={busqueda} onAgregar={abrirModal} />
        </div>
      ) : (
        <>
          {/* Contador de resultados */}
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 12px', fontWeight: 500 }}>
            Mostrando {productoresFiltrados.length} de {productores.length} productores
          </p>
          {/* Grid responsive */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {productoresFiltrados.map(p => (
              <ProductorCard key={p.idProductor} p={p} />
            ))}
          </div>
        </>
      )}

      {/* ── MODAL ────────────────────────────────────────────────────────────── */}
      {mostrarModal && (
        <ModalProductor
          onClose={cerrarModal}
          onSubmit={handleSubmit}
          error={error}
          form={form}
          setForm={setForm}
        />
      )}

      {/* ── Estilos de animación ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes pr-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes pr-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ── Responsive ─────────────────────────────────────────── */

        /* Tablet (≤ 768px): 2 columnas y ajustes */
        @media (max-width: 768px) {
          .pr-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* Móvil (≤ 480px): 1 columna, header apilado, modal ocupa todo */
        @media (max-width: 480px) {
          .pr-grid { grid-template-columns: 1fr !important; }
          .pr-hero-inner { flex-direction: column !important; align-items: flex-start !important; }
          .pr-modal { max-width: 100% !important; border-radius: 16px 16px 0 0 !important; }
          .pr-modal-overlay { align-items: flex-end !important; padding: 0 !important; }
          .pr-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default Productores
