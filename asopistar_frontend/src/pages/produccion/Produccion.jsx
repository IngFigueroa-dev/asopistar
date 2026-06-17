// src/pages/produccion/Produccion.jsx
// ─────────────────────────────────────────────────────────────────────────────
// REDISEÑO v2 — Módulo Producción moderno ASOPISTAR 2026
// Coherente con Dashboard + Productores: tokens idénticos, inline styles,
// paleta teal/cyan, hero claro, cards con borde top, skeletons, modales blur.
// Lógica de negocio, hooks, endpoints, estados, DTOs: SIN TOCAR.
// Dos vistas intactas: ProduccionGeneral + ProduccionBiologo
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Fish, ChevronDown, ChevronUp, ClipboardList,
  Waves, Leaf, CheckCircle2, Clock, Search, RefreshCw,
  User, Activity, AlertTriangle, Calendar, Droplets,
  Heart, Lock, X, AlertCircle, Layers,
} from 'lucide-react'
import api from '../../services/api'

// ─── Paleta — tokens idénticos al Dashboard y Productores ────────────────────
const C = {
  teal:   '#14B8A6',
  cyan:   '#06B6D4',
  green:  '#10B981',
  amber:  '#F59E0B',
  red:    '#EF4444',
  violet: '#8B5CF6',
  blue:   '#3B82F6',
}

// ─── Constantes de lógica SIN TOCAR ──────────────────────────────────────────
const ESTADOS = {
  EN_CURSO:  { label: 'En Curso',  color: C.teal,  bg: '#F0FDFA', border: '#99F6E4', text: '#0F766E' },
  COSECHADO: { label: 'Cosechado', color: C.green, bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' },
  PERDIDO:   { label: 'Perdido',   color: C.red,   bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
}

const FORM_SIEMBRA_INICIAL = {
  fechaSiembra: '', cantidadAlevinos: '', promedioInicial: '',
  observaciones: '', idEspecie: '', idEstanque: '', estado: 'EN_CURSO',
}
const FORM_SEGUIMIENTO_INICIAL = {
  fechaVisita: '', pesoPromedio: '', cantidadEstimada: '',
  condicionAgua: 'BUENA', estadoSalud: 'SALUDABLE',
  observaciones: '', aptoCosecha: 'N',
}
const FORM_ESTANQUE_INICIAL = {
  codigo: '', nombre: '', capacidad: '', ubicacion: '', estadoEstanque: 'ACTIVO',
}
const FORM_ESPECIE_INICIAL  = { nombre: '', descripcion: '' }
const FORM_TURNO_INICIAL    = {
  fechaProgramada: '', horaProgramada: '',
  tipoPrioridad: 'NORMAL', motivoEmergencia: '',
}

// ─── Helpers de lógica SIN TOCAR ─────────────────────────────────────────────
const nombreCompleto = (p) =>
  [p.nombre1, p.nombre2, p.apellido1, p.apellido2].filter(Boolean).join(' ')

const formatFecha = (f) => {
  if (!f) return '—'
  const [y, m, d] = f.toString().split('-')
  return `${d}/${m}/${y}`
}

const diasDesde = (fecha) => {
  if (!fecha) return null
  return Math.floor((new Date() - new Date(fecha)) / 86400000)
}

const estaAprobada = (segs) =>
  segs && segs.length > 0 && segs[0]?.aptoCosecha === 'Y'

const estadoSanitarioProductor = (siembras, seguimientosPorSiembra) => {
  const activas = siembras.filter(s => s.estado === 'EN_CURSO')
  if (activas.length === 0) return 'SIN_ACTIVAS'
  let critico = false, requiere = false
  for (const s of activas) {
    const segs = seguimientosPorSiembra[s.idSiembra]
    if (!segs || segs.length === 0) { requiere = true; continue }
    const u = segs[0]
    if (u.estadoSalud === 'CRITICO' || u.condicionAgua === 'MALA') { critico = true; break }
    if (u.estadoSalud === 'CON_SIGNOS_ENFERMEDAD' || u.condicionAgua === 'REGULAR') requiere = true
    if (diasDesde(u.fechaVisita) > 15) requiere = true
  }
  if (critico) return 'CRITICO'
  if (requiere) return 'REQUIERE'
  return 'SALUDABLE'
}

const SAN_CONFIG = {
  SALUDABLE:   { label: 'Saludable',            color: C.green, bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' },
  REQUIERE:    { label: 'Requiere seguimiento',  color: C.amber, bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  CRITICO:     { label: 'Crítico',              color: C.red,   bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  SIN_ACTIVAS: { label: 'Sin siembras activas', color: '#94A3B8', bg: '#F8FAFC', border: '#E2E8F0', text: '#475569' },
}

const AGUA_CONFIG = {
  BUENA:   { label: 'Buena',   color: C.green },
  REGULAR: { label: 'Regular', color: C.amber },
  MALA:    { label: 'Mala',    color: C.red   },
}
const SALUD_CONFIG = {
  SALUDABLE:             { label: 'Saludable',               color: C.green },
  CON_SIGNOS_ENFERMEDAD: { label: 'Con signos de enfermedad', color: C.amber },
  CRITICO:               { label: 'Crítico',                 color: C.red   },
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTES VISUALES COMPARTIDOS
// ════════════════════════════════════════════════════════════════════════════

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Sk({ h = 16, w = '100%', r = 8 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r,
      background: '#F1F5F9',
      animation: 'pc-pulse 1.4s ease-in-out infinite',
    }} />
  )
}

// ─── Badge de estado de siembra ───────────────────────────────────────────────
function BadgeEstado({ estado }) {
  const cfg = ESTADOS[estado]
  if (!cfg) return null
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 999, padding: '3px 10px',
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color,
        animation: estado === 'EN_CURSO' ? 'pc-pulse 2s ease-in-out infinite' : 'none' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: cfg.text }}>{cfg.label}</span>
    </div>
  )
}

// ─── Chip de filtro ───────────────────────────────────────────────────────────
function Chip({ label, active, count, color, onClick }) {
  const ac = color || C.teal
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
      fontSize: 13, fontWeight: active ? 700 : 500,
      background: active ? ac : '#fff',
      color: active ? '#fff' : '#64748B',
      border: active ? 'none' : '1px solid #E2E8F0',
      boxShadow: active ? `0 2px 8px ${ac}40` : 'none',
      transition: 'all 0.15s',
    }}>
      {label}
      {count != null && (
        <span style={{
          fontSize: 11, fontWeight: 700, minWidth: 18, height: 18,
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: active ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
          color: active ? '#fff' : '#64748B',
        }}>{count}</span>
      )}
    </button>
  )
}

// ─── Input field con label ─────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
        {label}{required && <span style={{ color: C.teal, marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const iS = { // inputStyle base
  width: '100%', padding: '9px 12px',
  border: '1.5px solid #E2E8F0', borderRadius: 9,
  fontSize: 13, color: '#0F172A', background: '#FAFAFA',
  outline: 'none', transition: 'all 0.15s', boxSizing: 'border-box',
}
const iFocus = (e) => {
  e.target.style.borderColor = C.teal
  e.target.style.background = '#fff'
  e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)'
}
const iBlur = (e) => {
  e.target.style.borderColor = '#E2E8F0'
  e.target.style.background = '#FAFAFA'
  e.target.style.boxShadow = 'none'
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ onClose, title, subtitle, icon: Icon, iconColor = C.teal, iconBg, maxWidth = 540, children }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(15,23,42,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 20,
        width: '100%', maxWidth,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        animation: 'pc-modal-in 0.22s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '22px 24px 18px', borderBottom: '1px solid #F1F5F9',
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
          borderRadius: '20px 20px 0 0',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: iconBg || `rgba(20,184,166,0.12)`,
            border: `1px solid ${iconColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {Icon && <Icon size={20} color={iconColor} />}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>{title}</h2>
            {subtitle && <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0',
            background: 'transparent', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#94A3B8', flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = '#FECACA' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = '#E2E8F0' }}
          >
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── Error modal banner ────────────────────────────────────────────────────────
function ErrorBanner({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#FEF2F2', border: '1px solid #FECACA',
      borderRadius: 10, padding: '10px 14px', marginBottom: 14,
    }}>
      <AlertCircle size={15} color={C.red} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: '#991B1B' }}>{msg}</span>
    </div>
  )
}

// ─── Botones del footer de formulario ─────────────────────────────────────────
function BtnCancelar({ onClick, label = 'Cancelar' }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, padding: '10px 16px', borderRadius: 10,
      border: '1.5px solid #E2E8F0', background: '#fff',
      fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer',
      transition: 'all 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E2E8F0' }}
    >{label}</button>
  )
}

function BtnPrimario({ label, color = C.teal, color2 = C.cyan, icon: Icon, disabled }) {
  return (
    <button type="submit" disabled={disabled} style={{
      flex: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      background: disabled ? '#E2E8F0' : `linear-gradient(135deg, ${color}, ${color2})`,
      color: disabled ? '#94A3B8' : '#fff', border: 'none', borderRadius: 10,
      padding: '10px 22px', fontSize: 13, fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: disabled ? 'none' : `0 4px 14px ${color}40`,
      transition: 'all 0.15s',
    }}>
      {Icon && <Icon size={15} />}
      {label}
    </button>
  )
}

// ─── Toggle Apto / No apto ─────────────────────────────────────────────────────
function ToggleApto({ value, onChange, infoText }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #F0FDFA, #EFF6FF)',
      border: '1px solid #E2E8F0', borderRadius: 14, padding: 16,
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
        ¿Los peces están listos para cosechar?
      </p>
      {infoText && <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 12px' }}>{infoText}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={() => onChange('Y')} style={{
          flex: 1, padding: '11px 8px', borderRadius: 10, cursor: 'pointer',
          fontSize: 13, fontWeight: 700, border: '2px solid',
          borderColor: value === 'Y' ? C.green : '#E2E8F0',
          background: value === 'Y' ? C.green : '#fff',
          color: value === 'Y' ? '#fff' : '#64748B',
          transition: 'all 0.2s', boxShadow: value === 'Y' ? `0 4px 14px ${C.green}40` : 'none',
        }}>
          ✓ Sí, aptos para cosecha
        </button>
        <button type="button" onClick={() => onChange('N')} style={{
          flex: 1, padding: '11px 8px', borderRadius: 10, cursor: 'pointer',
          fontSize: 13, fontWeight: 700, border: '2px solid',
          borderColor: value === 'N' ? C.amber : '#E2E8F0',
          background: value === 'N' ? C.amber : '#fff',
          color: value === 'N' ? '#fff' : '#64748B',
          transition: 'all 0.2s',
        }}>
          ✗ Todavía no
        </button>
      </div>
      {value === 'Y' && (
        <p style={{ fontSize: 11, color: '#166534', marginTop: 8, fontWeight: 500 }}>
          ✓ Al guardar, el productor podrá reservar un turno de pesca.
        </p>
      )}
    </div>
  )
}

// ─── Selector de condición agua ────────────────────────────────────────────────
function SelectorAgua({ value, onChange }) {
  const opts = [
    { val: 'BUENA',   label: 'Buena',   emoji: '🟢', color: C.green },
    { val: 'REGULAR', label: 'Regular', emoji: '🟡', color: C.amber },
    { val: 'MALA',    label: 'Mala',    emoji: '🔴', color: C.red   },
  ]
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {opts.map(o => (
        <button key={o.val} type="button" onClick={() => onChange(o.val)} style={{
          flex: 1, padding: '8px 6px', borderRadius: 10, cursor: 'pointer',
          fontSize: 12, fontWeight: 700, border: '2px solid',
          borderColor: value === o.val ? o.color : '#E2E8F0',
          background: value === o.val ? o.color + '18' : '#fff',
          color: value === o.val ? o.color : '#94A3B8',
          transition: 'all 0.15s',
        }}>
          {o.emoji} {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Mini KPI card ─────────────────────────────────────────────────────────────
function MiniKpi({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #F1F5F9',
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} color={color} />
      </div>
      <div>
        <p style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', lineHeight: 1, margin: 0 }}>{value}</p>
        <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{label}</p>
      </div>
    </div>
  )
}

// ─── Card de siembra (vista general) ─────────────────────────────────────────
function SiembraCard({ s, seguimientos, turnosActivos, esProductor, soloLectura,
  onToggle, expandido, onSeguimiento, onTurno }) {
  const segsS = seguimientos[s.idSiembra]
  const aptaParaCosecha = segsS && segsS.length > 0 && segsS[0]?.aptoCosecha === 'Y'
  const tieneTurno = turnosActivos.some(t => t.idSiembra === s.idSiembra)
  const cfg = ESTADOS[s.estado] || {}
  const isOpen = expandido === s.idSiembra

  // Botón de acción (lógica original)
  const renderAccion = () => {
    if (esProductor) {
      if (s.estado !== 'EN_CURSO') return null
      if (tieneTurno) return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#F0FDFA', border: '1px solid #99F6E4',
          borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#0F766E' }}>
          <CheckCircle2 size={13} /> Turno asignado
        </div>
      )
      if (segsS !== undefined) {
        if (aptaParaCosecha) return (
          <button onClick={e => { e.stopPropagation(); onTurno(s) }} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: `linear-gradient(135deg, ${C.green}, #059669)`,
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 3px 10px ${C.green}40`,
          }}>🎣 Reservar Turno</button>
        )
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 500, color: '#94A3B8' }}>
            <Clock size={13} /> Pendiente biólogo
          </div>
        )
      }
      return null
    }
    if (s.estado !== 'EN_CURSO') return null
    if (tieneTurno) return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
        background: '#F0FDF4', border: '1px solid #BBF7D0',
        borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#166534' }}>
        🎣 Listo para cosecha
      </div>
    )
    return null
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9',
      overflow: 'hidden', transition: 'all 0.2s',
    }}
      onMouseEnter={e => { if (!isOpen) { e.currentTarget.style.borderColor = cfg.color + '40'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)' } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#F1F5F9'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Borde top de color según estado */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cfg.color || C.teal}, ${cfg.color || C.teal}80)` }} />

      {/* Header de la card */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, cursor: 'pointer', minWidth: 0 }}
          onClick={() => onToggle(s.idSiembra)}>
          <div style={{
            width: 42, height: 42, borderRadius: 11, flexShrink: 0,
            background: `linear-gradient(135deg, ${cfg.color || C.teal}20, ${cfg.color || C.teal}10)`,
            border: `1px solid ${cfg.color || C.teal}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Fish size={20} color={cfg.color || C.teal} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 3px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.nombreEspecie} — {s.codigoEstanque}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Layers size={11} color="#94A3B8" /> {s.cantidadAlevinos?.toLocaleString()} alevinos
              </span>
              <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={11} color="#94A3B8" /> {formatFecha(s.fechaSiembra)}
              </span>
              {!esProductor && s.nombreProductor && (
                <span style={{ fontSize: 11, color: '#94A3B8' }}>· {s.nombreProductor}</span>
              )}
            </div>
          </div>
        </div>

        {/* Derecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {aptaParaCosecha && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              borderRadius: 999, padding: '3px 10px' }}>
              <CheckCircle2 size={11} color={C.green} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#166534' }}>Apto para cosechar</span>
            </div>
          )}
          <BadgeEstado estado={s.estado} />
          {renderAccion()}
          <button onClick={() => onToggle(s.idSiembra)} style={{
            width: 30, height: 30, borderRadius: 8, border: '1px solid #E2E8F0',
            background: 'transparent', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#94A3B8',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F0FDFA'; e.currentTarget.style.color = C.teal }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
          >
            {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Panel expandido */}
      {isOpen && (
        <div style={{ borderTop: '1px solid #F8FAFC', padding: '16px 20px 20px', animation: 'pc-fade 0.2s ease' }}>
          {/* Mini datos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 18 }}>
            {[
              ['Peso inicial', `${s.promedioInicial} g`],
              ['Estanque', s.codigoEstanque],
              ['Observaciones', s.observaciones || 'Ninguna'],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontSize: 11, color: '#94A3B8', margin: '0 0 3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Historial de seguimientos */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ClipboardList size={15} color={C.teal} /> Historial de seguimientos
            </p>
            {!soloLectura && !esProductor && s.estado === 'EN_CURSO' && (
              <button onClick={() => onSeguimiento(s)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`,
                color: '#fff', border: 'none', borderRadius: 8,
                padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                boxShadow: `0 2px 8px ${C.teal}30`,
              }}>
                <Plus size={12} /> Registrar seguimiento
              </button>
            )}
          </div>

          {!segsS ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Sk h={64} /><Sk h={64} />
            </div>
          ) : segsS.length === 0 ? (
            <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '24px', textAlign: 'center', border: '1px dashed #E2E8F0' }}>
              <ClipboardList size={28} color="#CBD5E1" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 4px' }}>Sin seguimientos registrados</p>
              {esProductor && <p style={{ fontSize: 11, color: '#CBD5E1', margin: 0 }}>El biólogo registrará los seguimientos de tu siembra.</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {segsS.map((seg, idx) => {
                const aguaCfg = AGUA_CONFIG[seg.condicionAgua] || {}
                const saludCfg = SALUD_CONFIG[seg.estadoSalud] || {}
                return (
                  <div key={seg.idSeguimiento} style={{
                    borderRadius: 11, padding: '14px 16px',
                    background: seg.aptoCosecha === 'Y' ? '#F0FDF4' : idx === 0 ? '#FAFFFE' : '#F8FAFC',
                    border: `1px solid ${seg.aptoCosecha === 'Y' ? '#BBF7D0' : idx === 0 ? '#E2E8F0' : '#F1F5F9'}`,
                    borderLeft: `3px solid ${seg.aptoCosecha === 'Y' ? C.green : idx === 0 ? C.teal : '#CBD5E1'}`,
                    animation: 'pc-fade 0.25s ease',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={13} color="#94A3B8" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Visita: {formatFecha(seg.fechaVisita)}</span>
                        {idx === 0 && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: C.teal + '18', color: C.teal, borderRadius: 5, padding: '2px 7px' }}>Último</span>
                        )}
                      </div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: seg.aptoCosecha === 'Y' ? '#F0FDF4' : '#FFFBEB',
                        border: `1px solid ${seg.aptoCosecha === 'Y' ? '#BBF7D0' : '#FDE68A'}`,
                        borderRadius: 999, padding: '3px 10px',
                      }}>
                        {seg.aptoCosecha === 'Y'
                          ? <><CheckCircle2 size={11} color={C.green} /><span style={{ fontSize: 11, fontWeight: 700, color: '#166534' }}>Apto para cosecha</span></>
                          : <span style={{ fontSize: 11, fontWeight: 600, color: '#92400E' }}>No apto aún</span>
                        }
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                      {[
                        ['Peso promedio', `${seg.pesoPromedio} g`, null],
                        ['Cantidad est.', seg.cantidadEstimada?.toLocaleString(), null],
                        ['Condición agua', aguaCfg.label, aguaCfg.color],
                        ['Salud', saludCfg.label, saludCfg.color],
                      ].map(([lbl, val, col]) => (
                        <div key={lbl}>
                          <p style={{ fontSize: 10, color: '#94A3B8', margin: '0 0 2px', fontWeight: 600 }}>{lbl}</p>
                          <p style={{ fontSize: 12, fontWeight: 700, color: col || '#0F172A', margin: 0 }}>{val}</p>
                        </div>
                      ))}
                    </div>
                    {seg.observaciones && (
                      <p style={{ fontSize: 11, color: '#64748B', margin: '10px 0 0', paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                        {seg.observaciones}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Banner reservar turno */}
          {esProductor && s.estado === 'EN_CURSO' && segsS?.length > 0 && aptaParaCosecha && !tieneTurno && (
            <div style={{
              marginTop: 16, borderRadius: 12, padding: '14px 16px',
              background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
              border: '1px solid #BBF7D0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#166534', margin: '0 0 2px' }}>
                  ✅ Tus peces están listos para cosechar
                </p>
                <p style={{ fontSize: 11, color: '#4ADE80', margin: 0 }}>
                  El biólogo aprobó esta siembra. Puedes reservar tu turno de pesca.
                </p>
              </div>
              <button onClick={() => onTurno(s)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: `linear-gradient(135deg, ${C.green}, #059669)`,
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: `0 4px 14px ${C.green}40`, flexShrink: 0,
              }}>
                🎣 Reservar Turno
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// VISTA GENERAL — Productor / Admin / Gerente / Secretaria
// ════════════════════════════════════════════════════════════════════════════
function ProduccionGeneral() {
  // ── Lógica SIN TOCAR ──────────────────────────────────────────────────────
  const rol          = localStorage.getItem('rol') || ''
  const esProductor  = rol === 'ROLE_PRODUCTOR'
  const esSecretaria = rol === 'ROLE_SECRETARIA'
  const soloLectura  = esSecretaria
  const idProductor  = esProductor ? parseInt(localStorage.getItem('idProductor')) : null

  const [siembras,          setSiembras]          = useState([])
  const [especies,          setEspecies]          = useState([])
  const [estanques,         setEstanques]         = useState([])
  const [estanquesOcupados, setEstanquesOcupados] = useState([])
  const [turnosActivos,     setTurnosActivos]     = useState([])
  const [loading,           setLoading]           = useState(true)
  const [filtro,            setFiltro]            = useState('TODOS')
  const [expandido,         setExpandido]         = useState(null)
  const [seguimientos,      setSeguimientos]      = useState({})

  const [mostrarModalSiembra,     setMostrarModalSiembra]     = useState(false)
  const [mostrarModalSeguimiento, setMostrarModalSeguimiento] = useState(false)
  const [mostrarModalEstanque,    setMostrarModalEstanque]    = useState(false)
  const [mostrarModalEspecie,     setMostrarModalEspecie]     = useState(false)
  const [mostrarModalTurno,       setMostrarModalTurno]       = useState(false)
  const [siembraSeleccionada,     setSiembraSeleccionada]     = useState(null)

  const [form,            setForm]            = useState(FORM_SIEMBRA_INICIAL)
  const [formSeguimiento, setFormSeguimiento] = useState(FORM_SEGUIMIENTO_INICIAL)
  const [formEstanque,    setFormEstanque]    = useState(FORM_ESTANQUE_INICIAL)
  const [formEspecie,     setFormEspecie]     = useState(FORM_ESPECIE_INICIAL)
  const [formTurno,       setFormTurno]       = useState(FORM_TURNO_INICIAL)
  const [errorModal,      setErrorModal]      = useState('')

  const cargarSiembras = useCallback(async () => {
    try {
      const res = await api.get('/siembras')
      const todas = res.data
      const misSiembras = esProductor ? todas.filter(s => s.idProductor === idProductor) : todas
      setSiembras(misSiembras)
      if (esProductor) {
        const activas = misSiembras.filter(s => s.estado === 'EN_CURSO')
        const resultados = await Promise.all(
          activas.map(s =>
            api.get(`/seguimientos/siembra/${s.idSiembra}`)
              .then(r => ({ id: s.idSiembra, data: r.data }))
              .catch(() => ({ id: s.idSiembra, data: [] }))
          )
        )
        setSeguimientos(prev => {
          const next = { ...prev }
          for (const { id, data } of resultados) next[id] = data
          return next
        })
      }
    } catch (err) { console.error('Error cargando siembras:', err) }
    finally { setLoading(false) }
  }, [esProductor, idProductor])

  const cargarEspecies = useCallback(async () => {
    try { const res = await api.get('/especies'); setEspecies(res.data) }
    catch (err) { console.error('Error cargando especies:', err) }
  }, [])

  const cargarEstanques = useCallback(async () => {
    try {
      const res = esProductor
        ? await api.get(`/estanques/productor/${idProductor}`)
        : await api.get('/estanques')
      setEstanques(res.data)
    } catch (err) { console.error('Error cargando estanques:', err) }
  }, [esProductor, idProductor])

  const cargarEstanquesOcupados = useCallback(async () => {
    if (!esProductor) return
    try {
      const res = await api.get('/siembras/activas')
      setEstanquesOcupados(
        res.data.filter(s => s.idProductor === idProductor).map(s => s.idEstanque)
      )
    } catch (err) { console.error('Error cargando estanques ocupados:', err) }
  }, [esProductor, idProductor])

  const cargarTurnosActivos = useCallback(async () => {
    try {
      const res = esProductor
        ? await api.get(`/turnos-pesca/productor/${idProductor}`)
        : await api.get('/turnos-pesca/ordenados')
      setTurnosActivos(res.data.filter(t => t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'))
    } catch (err) { console.error('Error cargando turnos activos:', err) }
  }, [esProductor, idProductor])

  const cargarSeguimientos = async (idSiembra) => {
    try {
      const res = await api.get(`/seguimientos/siembra/${idSiembra}`)
      setSeguimientos(prev => ({ ...prev, [idSiembra]: res.data }))
    } catch (err) { console.error('Error cargando seguimientos:', err) }
  }

  useEffect(() => {
    Promise.all([
      cargarSiembras(), cargarEspecies(), cargarEstanques(),
      cargarEstanquesOcupados(), cargarTurnosActivos(),
    ])
  }, [cargarSiembras, cargarEspecies, cargarEstanques,
      cargarEstanquesOcupados, cargarTurnosActivos])

  const toggleExpandir = (idSiembra) => {
    if (expandido === idSiembra) { setExpandido(null) }
    else { setExpandido(idSiembra); cargarSeguimientos(idSiembra) }
  }

  const handleSubmitSiembra = async (e) => {
    e.preventDefault(); setErrorModal('')
    try {
      await api.post('/siembras', {
        ...form,
        cantidadAlevinos: parseInt(form.cantidadAlevinos),
        promedioInicial:  parseFloat(form.promedioInicial),
        idEspecie:        parseInt(form.idEspecie),
        idEstanque:       parseInt(form.idEstanque),
      })
      setMostrarModalSiembra(false); setForm(FORM_SIEMBRA_INICIAL)
      await Promise.all([cargarSiembras(), cargarEstanquesOcupados()])
    } catch (err) {
      setErrorModal(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar la siembra.')
    }
  }

  const handleSubmitSeguimiento = async (e) => {
    e.preventDefault(); setErrorModal('')
    try {
      await api.post('/seguimientos', {
        ...formSeguimiento,
        pesoPromedio:     parseFloat(formSeguimiento.pesoPromedio),
        cantidadEstimada: parseInt(formSeguimiento.cantidadEstimada),
        aptoCosecha:      formSeguimiento.aptoCosecha,
        idSiembra:        siembraSeleccionada.idSiembra,
      })
      setMostrarModalSeguimiento(false); setFormSeguimiento(FORM_SEGUIMIENTO_INICIAL)
      await Promise.all([cargarSeguimientos(siembraSeleccionada.idSiembra), cargarTurnosActivos()])
    } catch (err) {
      setErrorModal(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar el seguimiento.')
    }
  }

  const handleSubmitEstanque = async (e) => {
    e.preventDefault(); setErrorModal('')
    try {
      await api.post('/estanques', { ...formEstanque, capacidad: parseFloat(formEstanque.capacidad), idProductor })
      setMostrarModalEstanque(false); setFormEstanque(FORM_ESTANQUE_INICIAL)
      await cargarEstanques()
    } catch (err) {
      setErrorModal(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar el estanque.')
    }
  }

  const handleSubmitEspecie = async (e) => {
    e.preventDefault(); setErrorModal('')
    try {
      await api.post('/especies', formEspecie)
      setMostrarModalEspecie(false); setFormEspecie(FORM_ESPECIE_INICIAL)
      await cargarEspecies()
    } catch (err) {
      setErrorModal(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar la especie.')
    }
  }

  const handleSubmitTurno = async (e) => {
    e.preventDefault(); setErrorModal('')
    try {
      const horaCombinada = formTurno.fechaProgramada + 'T' + formTurno.horaProgramada + ':00'
      await api.post('/turnos-pesca', {
        fechaProgramada:  formTurno.fechaProgramada,
        horaProgramada:   horaCombinada,
        tipoPrioridad:    formTurno.tipoPrioridad,
        motivoEmergencia: formTurno.motivoEmergencia || null,
        estado:           'PENDIENTE',
        idSiembra:        siembraSeleccionada.idSiembra,
        idProductor:      idProductor,
      })
      setMostrarModalTurno(false); setFormTurno(FORM_TURNO_INICIAL); setSiembraSeleccionada(null)
      await cargarTurnosActivos()
    } catch (err) {
      setErrorModal(err.response?.data?.mensaje || err.response?.data?.message || 'Error al reservar el turno.')
    }
  }

  const abrirModalSeguimiento = (siembra) => {
    setSiembraSeleccionada(siembra); setErrorModal(''); setMostrarModalSeguimiento(true)
  }
  const abrirModalTurno = (siembra) => {
    setSiembraSeleccionada(siembra); setErrorModal(''); setFormTurno(FORM_TURNO_INICIAL); setMostrarModalTurno(true)
  }

  const siembrasFiltradas = filtro === 'TODOS' ? siembras : siembras.filter(s => s.estado === filtro)
  const enCurso = siembras.filter(s => s.estado === 'EN_CURSO').length

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDFA 0%, #F8FAFC 50%, #EFF6FF 100%)',
        border: '1px solid #E2E8F0', borderRadius: 18,
        padding: '22px 26px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(20,184,166,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 80, width: 90, height: 90, borderRadius: '50%', background: 'rgba(59,130,246,0.04)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 13, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(6,182,212,0.12))',
              border: '1px solid rgba(20,184,166,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Fish size={22} color={C.teal} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
                {esProductor ? 'Mi Producción' : 'Producción'}
              </h1>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                {loading ? 'Cargando...' : `${siembras.length} siembras registradas · ${enCurso} en curso`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {esProductor && (
              <>
                <button onClick={() => { setErrorModal(''); setMostrarModalEspecie(true) }} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: '#fff', border: '1.5px solid #E2E8F0',
                  color: C.violet, borderRadius: 10, padding: '9px 16px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.violet; e.currentTarget.style.background = C.violet + '08' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#fff' }}
                >
                  <Leaf size={15} /> Nueva Especie
                </button>
                <button onClick={() => { setErrorModal(''); setMostrarModalEstanque(true) }} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: '#fff', border: '1.5px solid #E2E8F0',
                  color: C.blue, borderRadius: 10, padding: '9px 16px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blue + '08' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#fff' }}
                >
                  <Waves size={15} /> Nuevo Estanque
                </button>
              </>
            )}
            {!soloLectura && (
              <button onClick={() => { setErrorModal(''); setMostrarModalSiembra(true) }} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`,
                color: '#fff', border: 'none', borderRadius: 11,
                padding: '10px 18px', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 14px rgba(20,184,166,0.3)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,184,166,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(20,184,166,0.3)'; e.currentTarget.style.transform = 'none' }}
              >
                <Plus size={16} /> Nueva Siembra
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CHIPS FILTRO ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <Chip label="Todas" count={siembras.length} active={filtro === 'TODOS'} onClick={() => setFiltro('TODOS')} />
        <Chip label="En Curso" count={siembras.filter(s => s.estado === 'EN_CURSO').length}
          active={filtro === 'EN_CURSO'} color={C.teal} onClick={() => setFiltro('EN_CURSO')} />
        <Chip label="Cosechadas" count={siembras.filter(s => s.estado === 'COSECHADO').length}
          active={filtro === 'COSECHADO'} color={C.green} onClick={() => setFiltro('COSECHADO')} />
        <Chip label="Perdidas" count={siembras.filter(s => s.estado === 'PERDIDO').length}
          active={filtro === 'PERDIDO'} color={C.red} onClick={() => setFiltro('PERDIDO')} />
      </div>

      {/* ── CONTENIDO ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
              <div style={{ height: 3, background: '#F1F5F9' }} />
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <Sk h={42} w={42} r={11} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <Sk h={14} w="45%" /><Sk h={11} w="65%" />
                </div>
                <Sk h={26} w={80} r={999} />
              </div>
            </div>
          ))}
        </div>
      ) : siembrasFiltradas.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', padding: '48px 20px', textAlign: 'center' }}>
          <Fish size={36} color="#CBD5E1" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Sin siembras</p>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 20px' }}>
            {esProductor ? '¡Crea tu primera siembra piscícola!' : 'No hay siembras en este filtro'}
          </p>
          {!soloLectura && (
            <button onClick={() => { setErrorModal(''); setMostrarModalSiembra(true) }} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`,
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(20,184,166,0.3)',
            }}>
              <Plus size={15} /> Nueva Siembra
            </button>
          )}
        </div>
      ) : (
        <>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 12px', fontWeight: 500 }}>
            Mostrando {siembrasFiltradas.length} de {siembras.length} siembras
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {siembrasFiltradas.map(s => (
              <SiembraCard
                key={s.idSiembra}
                s={s}
                seguimientos={seguimientos}
                turnosActivos={turnosActivos}
                esProductor={esProductor}
                soloLectura={soloLectura}
                onToggle={toggleExpandir}
                expandido={expandido}
                onSeguimiento={abrirModalSeguimiento}
                onTurno={abrirModalTurno}
              />
            ))}
          </div>
        </>
      )}

      {/* ══ MODAL NUEVA SIEMBRA ══════════════════════════════════════════════ */}
      {mostrarModalSiembra && (
        <Modal title="Nueva Siembra" subtitle="Registra un nuevo ciclo productivo en un estanque"
          icon={Fish} onClose={() => { setMostrarModalSiembra(false); setErrorModal('') }}>
          <form onSubmit={handleSubmitSiembra} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ErrorBanner msg={errorModal} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Especie" required>
                <select required value={form.idEspecie} onChange={e => setForm({ ...form, idEspecie: e.target.value })}
                  style={iS} onFocus={iFocus} onBlur={iBlur}>
                  <option value="">Seleccionar...</option>
                  {especies.map(e => <option key={e.idEspecie} value={e.idEspecie}>{e.nombre}</option>)}
                </select>
              </Field>
              <Field label="Estanque" required>
                <select required value={form.idEstanque} onChange={e => setForm({ ...form, idEstanque: e.target.value })}
                  style={iS} onFocus={iFocus} onBlur={iBlur}>
                  <option value="">Seleccionar...</option>
                  {estanques.map(e => {
                    const ocupado = estanquesOcupados.includes(e.idEstanque)
                    return <option key={e.idEstanque} value={e.idEstanque} disabled={ocupado}>
                      {e.codigo} - {e.nombre}{ocupado ? ' (Ocupado)' : ''}
                    </option>
                  })}
                </select>
                {esProductor && estanques.length === 0 && (
                  <p style={{ fontSize: 11, color: C.amber, marginTop: 4 }}>No tienes estanques. Crea uno primero.</p>
                )}
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Fecha de siembra" required>
                <input type="date" required value={form.fechaSiembra}
                  onChange={e => setForm({ ...form, fechaSiembra: e.target.value })}
                  style={iS} onFocus={iFocus} onBlur={iBlur} />
              </Field>
              <Field label="Cantidad de alevinos" required>
                <input type="number" min="1" required value={form.cantidadAlevinos}
                  onChange={e => setForm({ ...form, cantidadAlevinos: e.target.value })}
                  style={iS} onFocus={iFocus} onBlur={iBlur} />
              </Field>
            </div>
            <Field label="Peso promedio inicial (g)" required>
              <input type="number" step="0.01" min="0" required value={form.promedioInicial}
                onChange={e => setForm({ ...form, promedioInicial: e.target.value })}
                style={iS} onFocus={iFocus} onBlur={iBlur} />
            </Field>
            <Field label="Observaciones">
              <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })}
                rows={3} style={{ ...iS, resize: 'none' }} onFocus={iFocus} onBlur={iBlur} />
            </Field>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <BtnCancelar onClick={() => { setMostrarModalSiembra(false); setErrorModal('') }} />
              <BtnPrimario label="Guardar Siembra" icon={Fish} />
            </div>
          </form>
        </Modal>
      )}

      {/* ══ MODAL SEGUIMIENTO ════════════════════════════════════════════════ */}
      {mostrarModalSeguimiento && siembraSeleccionada && (
        <Modal title="Registrar Seguimiento"
          subtitle={`${siembraSeleccionada.nombreEspecie} — ${siembraSeleccionada.codigoEstanque}`}
          icon={ClipboardList} onClose={() => { setMostrarModalSeguimiento(false); setErrorModal('') }}>
          <form onSubmit={handleSubmitSeguimiento} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ErrorBanner msg={errorModal} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Fecha de visita" required>
                <input type="date" required value={formSeguimiento.fechaVisita}
                  onChange={e => setFormSeguimiento({ ...formSeguimiento, fechaVisita: e.target.value })}
                  style={iS} onFocus={iFocus} onBlur={iBlur} />
              </Field>
              <Field label="Peso promedio (g)" required>
                <input type="number" step="0.01" min="0" required value={formSeguimiento.pesoPromedio}
                  onChange={e => setFormSeguimiento({ ...formSeguimiento, pesoPromedio: e.target.value })}
                  style={iS} onFocus={iFocus} onBlur={iBlur} />
              </Field>
            </div>
            <Field label="Cantidad estimada de peces" required>
              <input type="number" min="1" required value={formSeguimiento.cantidadEstimada}
                onChange={e => setFormSeguimiento({ ...formSeguimiento, cantidadEstimada: e.target.value })}
                style={iS} onFocus={iFocus} onBlur={iBlur} />
            </Field>
            <Field label="Condición del agua">
              <SelectorAgua value={formSeguimiento.condicionAgua}
                onChange={v => setFormSeguimiento({ ...formSeguimiento, condicionAgua: v })} />
            </Field>
            <Field label="Estado de salud" required>
              <select value={formSeguimiento.estadoSalud}
                onChange={e => setFormSeguimiento({ ...formSeguimiento, estadoSalud: e.target.value })}
                style={iS} onFocus={iFocus} onBlur={iBlur}>
                <option value="SALUDABLE">Saludable</option>
                <option value="CON_SIGNOS_ENFERMEDAD">Con signos de enfermedad</option>
                <option value="CRITICO">Crítico</option>
              </select>
            </Field>
            <Field label="Observaciones">
              <textarea rows={3} value={formSeguimiento.observaciones}
                onChange={e => setFormSeguimiento({ ...formSeguimiento, observaciones: e.target.value })}
                style={{ ...iS, resize: 'none' }} onFocus={iFocus} onBlur={iBlur} />
            </Field>
            <ToggleApto value={formSeguimiento.aptoCosecha}
              onChange={v => setFormSeguimiento({ ...formSeguimiento, aptoCosecha: v })} />
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <BtnCancelar onClick={() => { setMostrarModalSeguimiento(false); setErrorModal('') }} />
              <BtnPrimario label="Guardar Seguimiento" icon={ClipboardList} />
            </div>
          </form>
        </Modal>
      )}

      {/* ══ MODAL NUEVO ESTANQUE ═════════════════════════════════════════════ */}
      {mostrarModalEstanque && (
        <Modal title="Nuevo Estanque" subtitle="El estanque quedará registrado a tu nombre"
          icon={Waves} iconColor={C.blue} iconBg="rgba(59,130,246,0.1)"
          onClose={() => { setMostrarModalEstanque(false); setErrorModal('') }}>
          <form onSubmit={handleSubmitEstanque} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ErrorBanner msg={errorModal} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Código (ej: EST-001)" required>
                <input type="text" required maxLength={10} value={formEstanque.codigo}
                  onChange={e => setFormEstanque({ ...formEstanque, codigo: e.target.value })}
                  placeholder="EST-001" style={iS} onFocus={iFocus} onBlur={iBlur} />
              </Field>
              <Field label="Nombre" required>
                <input type="text" required maxLength={20} value={formEstanque.nombre}
                  onChange={e => setFormEstanque({ ...formEstanque, nombre: e.target.value })}
                  placeholder="Estanque Principal" style={iS} onFocus={iFocus} onBlur={iBlur} />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Capacidad" required>
                <input type="number" step="0.01" min="0.01" required value={formEstanque.capacidad}
                  onChange={e => setFormEstanque({ ...formEstanque, capacidad: e.target.value })}
                  placeholder="50.00" style={iS} onFocus={iFocus} onBlur={iBlur} />
              </Field>
              <Field label="Estado" required>
                <select value={formEstanque.estadoEstanque}
                  onChange={e => setFormEstanque({ ...formEstanque, estadoEstanque: e.target.value })}
                  style={iS} onFocus={iFocus} onBlur={iBlur}>
                  <option value="ACTIVO">Activo</option>
                  <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </Field>
            </div>
            <Field label="Ubicación" required>
              <input type="text" required maxLength={100} value={formEstanque.ubicacion}
                onChange={e => setFormEstanque({ ...formEstanque, ubicacion: e.target.value })}
                placeholder="Vereda La Esperanza, finca El Porvenir"
                style={iS} onFocus={iFocus} onBlur={iBlur} />
            </Field>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <BtnCancelar onClick={() => { setMostrarModalEstanque(false); setErrorModal('') }} />
              <BtnPrimario label="Guardar Estanque" icon={Waves} color={C.blue} color2="#2563EB" />
            </div>
          </form>
        </Modal>
      )}

      {/* ══ MODAL NUEVA ESPECIE ══════════════════════════════════════════════ */}
      {mostrarModalEspecie && (
        <Modal title="Nueva Especie" subtitle="Disponible para todos los productores"
          icon={Leaf} iconColor={C.violet} iconBg="rgba(139,92,246,0.1)" maxWidth={460}
          onClose={() => { setMostrarModalEspecie(false); setErrorModal('') }}>
          <form onSubmit={handleSubmitEspecie} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ErrorBanner msg={errorModal} />
            <Field label="Nombre de la especie" required>
              <input type="text" required maxLength={20} value={formEspecie.nombre}
                onChange={e => setFormEspecie({ ...formEspecie, nombre: e.target.value })}
                placeholder="Cachama blanca" style={iS} onFocus={iFocus} onBlur={iBlur} />
            </Field>
            <Field label="Descripción" required>
              <textarea required maxLength={100} rows={3} value={formEspecie.descripcion}
                onChange={e => setFormEspecie({ ...formEspecie, descripcion: e.target.value })}
                placeholder="Especie de agua dulce, ciclo de 6 meses..."
                style={{ ...iS, resize: 'none' }} onFocus={iFocus} onBlur={iBlur} />
            </Field>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <BtnCancelar onClick={() => { setMostrarModalEspecie(false); setErrorModal('') }} />
              <BtnPrimario label="Guardar Especie" icon={Leaf} color={C.violet} color2="#7C3AED" />
            </div>
          </form>
        </Modal>
      )}

      {/* ══ MODAL RESERVAR TURNO ════════════════════════════════════════════ */}
      {mostrarModalTurno && siembraSeleccionada && (
        <Modal title="Reservar Turno de Pesca" subtitle="Siembra aprobada para cosecha"
          icon={Calendar} iconColor={C.green} iconBg="rgba(16,185,129,0.1)"
          onClose={() => { setMostrarModalTurno(false); setErrorModal(''); setSiembraSeleccionada(null) }}>
          <form onSubmit={handleSubmitTurno} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Resumen siembra */}
            <div style={{
              background: 'linear-gradient(135deg, #F0FDFA, #EFF6FF)',
              border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['Siembra', `${siembraSeleccionada.nombreEspecie} — ${siembraSeleccionada.codigoEstanque}`],
                  ['Productor', siembraSeleccionada.nombreProductor],
                ].map(([lbl, val]) => (
                  <div key={lbl}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
            <ErrorBanner msg={errorModal} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Fecha deseada" required>
                <input type="date" required min={new Date().toISOString().split('T')[0]}
                  value={formTurno.fechaProgramada}
                  onChange={e => setFormTurno({ ...formTurno, fechaProgramada: e.target.value })}
                  style={iS} onFocus={iFocus} onBlur={iBlur} />
              </Field>
              <Field label="Hora deseada" required>
                <input type="time" required value={formTurno.horaProgramada}
                  onChange={e => setFormTurno({ ...formTurno, horaProgramada: e.target.value })}
                  style={iS} onFocus={iFocus} onBlur={iBlur} />
              </Field>
            </div>
            <Field label="Tipo de solicitud">
              <select value={formTurno.tipoPrioridad}
                onChange={e => setFormTurno({ ...formTurno, tipoPrioridad: e.target.value })}
                style={iS} onFocus={iFocus} onBlur={iBlur}>
                <option value="NORMAL">Normal</option>
                <option value="EMERGENCIA">Emergencia</option>
              </select>
            </Field>
            {formTurno.tipoPrioridad === 'EMERGENCIA' && (
              <Field label="Motivo de emergencia" required>
                <textarea required rows={3} value={formTurno.motivoEmergencia}
                  onChange={e => setFormTurno({ ...formTurno, motivoEmergencia: e.target.value })}
                  placeholder="Describe el motivo..."
                  style={{ ...iS, resize: 'none' }} onFocus={iFocus} onBlur={iBlur} />
              </Field>
            )}
            <div style={{
              background: '#F0FDFA', border: '1px solid #CCFBF1',
              borderRadius: 10, padding: '11px 14px', fontSize: 12, color: '#0F766E',
            }}>
              ℹ️ El gerente de planta confirmará tu turno según prioridad y fecha de siembra.
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <BtnCancelar onClick={() => { setMostrarModalTurno(false); setErrorModal(''); setSiembraSeleccionada(null) }} />
              <BtnPrimario label="Reservar Turno" icon={Calendar} color={C.green} color2="#059669" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS BIÓLOGO SIN TOCAR
// ════════════════════════════════════════════════════════════════════════════
const FORM_SEG_INICIAL = {
  fechaVisita: '', pesoPromedio: '', cantidadEstimada: '',
  condicionAgua: 'BUENA', estadoSalud: 'SALUDABLE',
  observaciones: '', aptoCosecha: 'N',
}

// ─── Badge siembra (biólogo) ──────────────────────────────────────────────────
function BadgeSiembraBio({ siembra, seguimientos: segs }) {
  const aprobada = estaAprobada(segs)
  if (aprobada) return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
      background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '4px 10px' }}>
      <CheckCircle2 size={12} color={C.green} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#166534' }}>Apta para cosecha</span>
    </div>
  )
  if (siembra.estado !== 'EN_CURSO') return null
  if (!segs || segs.length === 0) return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
      background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '4px 10px' }}>
      <Clock size={12} color="#94A3B8" />
      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>Sin seguimientos</span>
    </div>
  )
  const dias = diasDesde(segs[0].fechaVisita)
  if (dias !== null && dias > 15) return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
      background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '4px 10px' }}>
      <AlertTriangle size={12} color={C.amber} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>Sin visita {dias}d</span>
    </div>
  )
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
      background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '4px 10px' }}>
      <Activity size={12} color={C.blue} />
      <span style={{ fontSize: 11, fontWeight: 600, color: '#1D4ED8' }}>En seguimiento</span>
    </div>
  )
}

// ─── Panel de siembra del biólogo ─────────────────────────────────────────────
function PanelSiembraBio({ siembra, seguimientos: segs, loadingSegs, onRegistrar }) {
  const aprobada = estaAprobada(segs)
  const bloqueada = aprobada || siembra.estado !== 'EN_CURSO'

  return (
    <div style={{ borderTop: '1px solid #F1F5F9', padding: '16px 20px 20px', animation: 'pc-fade 0.2s ease' }}>
      {/* Mini datos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 16 }}>
        {[
          ['Peso inicial', `${siembra.promedioInicial} g`],
          ['Estanque', siembra.codigoEstanque],
          ['Alevinos', siembra.cantidadAlevinos?.toLocaleString()],
          ['Observaciones', siembra.observaciones || '—'],
        ].map(([lbl, val]) => (
          <div key={lbl} style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px' }}>
            <p style={{ fontSize: 10, color: '#94A3B8', margin: '0 0 3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Banner bloqueado */}
      {bloqueada && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 15px',
          borderRadius: 11, marginBottom: 14,
          background: aprobada ? '#F0FDF4' : '#F8FAFC',
          border: `1px solid ${aprobada ? '#BBF7D0' : '#E2E8F0'}`,
        }}>
          {aprobada
            ? <CheckCircle2 size={17} color={C.green} style={{ flexShrink: 0, marginTop: 1 }} />
            : <Lock size={17} color="#94A3B8" style={{ flexShrink: 0, marginTop: 1 }} />
          }
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: aprobada ? '#166534' : '#475569', margin: '0 0 2px' }}>
              {aprobada ? 'Ciclo biológico cerrado' : `Siembra ${siembra.estado.toLowerCase()}`}
            </p>
            <p style={{ fontSize: 11, color: aprobada ? '#4ADE80' : '#94A3B8', margin: 0 }}>
              {aprobada
                ? 'Aprobada para cosecha. El productor debe agendar su turno. No se permiten más seguimientos.'
                : 'El ciclo productivo de esta siembra ha finalizado.'}
            </p>
          </div>
        </div>
      )}

      {/* Header historial */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ClipboardList size={14} color={C.teal} /> Historial de seguimientos
        </p>
        {!bloqueada && (
          <button onClick={() => onRegistrar(siembra)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`,
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 2px 8px ${C.teal}30`,
          }}>
            <Plus size={12} /> Registrar seguimiento
          </button>
        )}
      </div>

      {/* Lista seguimientos */}
      {loadingSegs ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><Sk h={72} /><Sk h={72} /></div>
      ) : !segs || segs.length === 0 ? (
        <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '24px', textAlign: 'center', border: '1px dashed #E2E8F0' }}>
          <ClipboardList size={26} color="#CBD5E1" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 8px' }}>Sin seguimientos registrados</p>
          {!bloqueada && (
            <button onClick={() => onRegistrar(siembra)} style={{
              fontSize: 12, fontWeight: 700, color: C.teal,
              background: 'none', border: 'none', cursor: 'pointer',
            }}>+ Registrar primer seguimiento</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {segs.map((seg, idx) => {
            const aguaCfg   = AGUA_CONFIG[seg.condicionAgua]   || {}
            const saludCfg  = SALUD_CONFIG[seg.estadoSalud]    || {}
            return (
              <div key={seg.idSeguimiento} style={{
                borderRadius: 11, padding: '13px 15px',
                background: seg.aptoCosecha === 'Y' ? '#F0FDF4' : idx === 0 ? '#fff' : '#F8FAFC',
                border: `1px solid ${seg.aptoCosecha === 'Y' ? '#BBF7D0' : idx === 0 ? '#E2E8F0' : '#F1F5F9'}`,
                borderLeft: `3px solid ${seg.aptoCosecha === 'Y' ? C.green : idx === 0 ? C.teal : '#CBD5E1'}`,
                animation: 'pc-fade 0.25s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={13} color="#94A3B8" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Visita: {formatFecha(seg.fechaVisita)}</span>
                    {idx === 0 && <span style={{ fontSize: 10, fontWeight: 700, background: C.teal + '18', color: C.teal, borderRadius: 5, padding: '2px 7px' }}>Último</span>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: seg.aptoCosecha === 'Y' ? '#166534' : '#94A3B8' }}>
                    {seg.aptoCosecha === 'Y' ? '✓ Apto para cosecha' : 'No apto aún'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                  <div>
                    <p style={{ fontSize: 10, color: '#94A3B8', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 3 }}>
                      Peso promedio
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: 0 }}>{seg.pesoPromedio} g</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#94A3B8', margin: '0 0 2px' }}>Cantidad est.</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: 0 }}>{seg.cantidadEstimada?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#94A3B8', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Droplets size={10} /> Agua
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: aguaCfg.color || '#0F172A', margin: 0 }}>{aguaCfg.label}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#94A3B8', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Heart size={10} /> Salud
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: saludCfg.color || '#0F172A', margin: 0 }}>{saludCfg.label}</p>
                  </div>
                </div>
                {seg.observaciones && (
                  <p style={{ fontSize: 11, color: '#64748B', margin: '10px 0 0', paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>{seg.observaciones}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// VISTA BIÓLOGO — Consola de monitoreo
// ════════════════════════════════════════════════════════════════════════════
function ProduccionBiologo() {
  // ── Lógica SIN TOCAR ──────────────────────────────────────────────────────
  const [productores,  setProductores]  = useState([])
  const [siembras,     setSiembras]     = useState([])
  const [seguimientos, setSeguimientos] = useState({})
  const [loadingSegs,  setLoadingSegs]  = useState({})
  const [loading,      setLoading]      = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [busqueda,     setBusqueda]     = useState('')
  const [productorOpen,  setProductorOpen]  = useState(null)
  const [siembraOpen,    setSiembraOpen]    = useState(null)
  const [modalSeg,       setModalSeg]       = useState(false)
  const [siembraSeleccionada, setSiembraSeleccionada] = useState(null)
  const [formSeg,    setFormSeg]    = useState(FORM_SEG_INICIAL)
  const [errorModal, setErrorModal] = useState('')
  const [guardando,  setGuardando]  = useState(false)

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      const [resProd, resSiem] = await Promise.all([
        api.get('/productores/activos'),
        api.get('/siembras'),
      ])
      setProductores(resProd.data)
      const todasSiembras = resSiem.data
      setSiembras(todasSiembras)
      const activas = todasSiembras.filter(s => s.estado === 'EN_CURSO')
      const resultados = await Promise.all(
        activas.map(s =>
          api.get(`/seguimientos/siembra/${s.idSiembra}`)
            .then(r => ({ id: s.idSiembra, data: r.data }))
            .catch(() => ({ id: s.idSiembra, data: [] }))
        )
      )
      setSeguimientos(prev => {
        const next = { ...prev }
        for (const { id, data } of resultados) next[id] = data
        return next
      })
    } catch (err) { console.error('Error cargando datos:', err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  const recargarSeguimientos = async (idSiembra) => {
    setLoadingSegs(prev => ({ ...prev, [idSiembra]: true }))
    try {
      const res = await api.get(`/seguimientos/siembra/${idSiembra}`)
      setSeguimientos(prev => ({ ...prev, [idSiembra]: res.data }))
    } catch { setSeguimientos(prev => ({ ...prev, [idSiembra]: [] })) }
    finally { setLoadingSegs(prev => ({ ...prev, [idSiembra]: false })) }
  }

  const cargarSeguimientos = async (idSiembra) => {
    if (seguimientos[idSiembra] !== undefined) return
    await recargarSeguimientos(idSiembra)
  }

  const toggleProductor = (id) => {
    setProductorOpen(prev => prev === id ? null : id)
    setSiembraOpen(null)
  }
  const toggleSiembra = (id) => {
    if (siembraOpen === id) { setSiembraOpen(null) }
    else { setSiembraOpen(id); cargarSeguimientos(id) }
  }

  const abrirModalSeguimiento = (siembra) => {
    setSiembraSeleccionada(siembra); setFormSeg(FORM_SEG_INICIAL); setErrorModal(''); setModalSeg(true)
  }

  const handleSubmitSeguimiento = async (e) => {
    e.preventDefault(); setErrorModal(''); setGuardando(true)
    try {
      await api.post('/seguimientos', {
        fechaVisita:      formSeg.fechaVisita,
        pesoPromedio:     parseFloat(formSeg.pesoPromedio),
        cantidadEstimada: parseInt(formSeg.cantidadEstimada),
        condicionAgua:    formSeg.condicionAgua,
        estadoSalud:      formSeg.estadoSalud,
        observaciones:    formSeg.observaciones || null,
        aptoCosecha:      formSeg.aptoCosecha,
        idSiembra:        siembraSeleccionada.idSiembra,
      })
      setModalSeg(false)
      await recargarSeguimientos(siembraSeleccionada.idSiembra)
    } catch (err) {
      setErrorModal(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar el seguimiento.')
    } finally { setGuardando(false) }
  }

  const siembrasFiltradas = siembras.filter(s => filtroEstado === 'TODOS' || s.estado === filtroEstado)
  const siembrasPorProductor = {}
  for (const s of siembrasFiltradas) {
    if (!siembrasPorProductor[s.idProductor]) siembrasPorProductor[s.idProductor] = []
    siembrasPorProductor[s.idProductor].push(s)
  }
  const productoresFiltrados = productores.filter(p => {
    if (!siembrasPorProductor[p.idProductor]) return false
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      return nombreCompleto(p).toLowerCase().includes(q) || p.documento?.toLowerCase().includes(q)
    }
    return true
  })

  const siembrasActivas = siembras.filter(s => s.estado === 'EN_CURSO')
  const siembrasAptas   = siembrasActivas.filter(s => estaAprobada(seguimientos[s.idSiembra]))
  const seguimientosMes = Object.values(seguimientos).flat().filter(seg => {
    if (!seg?.fechaVisita) return false
    const hoy = new Date(), vis = new Date(seg.fechaVisita)
    return vis.getFullYear() === hoy.getFullYear() && vis.getMonth() === hoy.getMonth()
  }).length

  // ─── RENDER biólogo ──────────────────────────────────────────────────────
  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDFA 0%, #F8FAFC 50%, #EFF6FF 100%)',
        border: '1px solid #E2E8F0', borderRadius: 18,
        padding: '22px 26px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(20,184,166,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 13, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(6,182,212,0.12))',
              border: '1px solid rgba(20,184,166,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Activity size={22} color={C.teal} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
                Consola de Monitoreo
              </h1>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                Supervisión técnica de siembras por productor
              </p>
            </div>
          </div>
          <button onClick={cargarDatos} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#fff', border: '1.5px solid #E2E8F0',
            borderRadius: 10, padding: '9px 16px',
            fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
          >
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[1,2,3,4].map(i => <Sk key={i} h={80} r={12} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          <MiniKpi icon={User}         label="Productores activos"   value={productores.length}     color={C.teal}   />
          <MiniKpi icon={Fish}         label="Siembras activas"      value={siembrasActivas.length} color={C.blue}   />
          <MiniKpi icon={CheckCircle2} label="Aptas para cosecha"    value={siembrasAptas.length}   color={C.green}  />
          <MiniKpi icon={Activity}     label="Seguimientos este mes" value={seguimientosMes}        color={C.violet} />
        </div>
      )}

      {/* ── BÚSQUEDA + FILTROS ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          <input type="text" placeholder="Buscar productor..." value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ ...iS, paddingLeft: 34 }}
            onFocus={iFocus} onBlur={iBlur} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Chip label="Todas"      count={siembras.length}                                    active={filtroEstado === 'TODOS'}    onClick={() => setFiltroEstado('TODOS')} />
          <Chip label="En Curso"   count={siembras.filter(s => s.estado === 'EN_CURSO').length}  active={filtroEstado === 'EN_CURSO'}  color={C.teal}  onClick={() => setFiltroEstado('EN_CURSO')} />
          <Chip label="Cosechadas" count={siembras.filter(s => s.estado === 'COSECHADO').length} active={filtroEstado === 'COSECHADO'} color={C.green} onClick={() => setFiltroEstado('COSECHADO')} />
          <Chip label="Perdidas"   count={siembras.filter(s => s.estado === 'PERDIDO').length}   active={filtroEstado === 'PERDIDO'}   color={C.red}   onClick={() => setFiltroEstado('PERDIDO')} />
        </div>
      </div>

      {/* ── LISTA PRODUCTORES ─────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <Sk key={i} h={88} r={14} />)}
        </div>
      ) : productoresFiltrados.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', padding: '48px 20px', textAlign: 'center' }}>
          <Fish size={34} color="#CBD5E1" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Sin productores</p>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>No hay productores con siembras en este filtro</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {productoresFiltrados.map(productor => {
            const siembrasProd = siembrasPorProductor[productor.idProductor] || []
            const activasProd  = siembrasProd.filter(s => s.estado === 'EN_CURSO')
            const estadoSan    = estadoSanitarioProductor(siembrasProd, seguimientos)
            const sanConf      = SAN_CONFIG[estadoSan]
            const isOpen       = productorOpen === productor.idProductor
            const ultimaVisita = Object.entries(seguimientos)
              .filter(([id]) => siembrasProd.some(s => s.idSiembra === parseInt(id)))
              .flatMap(([, segs]) => segs)
              .sort((a, b) => new Date(b.fechaVisita) - new Date(a.fechaVisita))[0]?.fechaVisita

            return (
              <div key={productor.idProductor} style={{
                background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (!isOpen) e.currentTarget.style.borderColor = C.teal + '30' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#F1F5F9' }}
              >
                {/* Borde top de color según estado sanitario */}
                <div style={{ height: 3, background: `linear-gradient(90deg, ${sanConf.color}, ${sanConf.color}60)` }} />

                <div style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', cursor: 'pointer', flexWrap: 'wrap', gap: 10,
                }} onClick={() => toggleProductor(productor.idProductor)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: '#fff',
                      boxShadow: '0 2px 8px rgba(20,184,166,0.25)',
                    }}>
                      {productor.nombre1?.charAt(0)}{productor.apellido1?.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 3px' }}>
                        {nombreCompleto(productor)}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>Doc: {productor.documento}</span>
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>{productor.telefono}</span>
                        {ultimaVisita && (
                          <span style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={10} /> Última visita: {formatFecha(ultimaVisita)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {/* Badge estado sanitario */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: sanConf.bg, border: `1px solid ${sanConf.border}`,
                      borderRadius: 8, padding: '4px 10px',
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: sanConf.color,
                        animation: estadoSan === 'CRITICO' ? 'pc-pulse 1s ease-in-out infinite' : 'none' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: sanConf.text }}>{sanConf.label}</span>
                    </div>
                    {/* Badge siembras activas */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: '#EFF6FF', border: '1px solid #BFDBFE',
                      borderRadius: 8, padding: '4px 10px',
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8' }}>
                        {activasProd.length} activa{activasProd.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <button style={{
                      width: 28, height: 28, borderRadius: 7, border: '1px solid #E2E8F0',
                      background: 'transparent', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', color: '#94A3B8',
                    }}>
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Siembras del productor */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #F1F5F9', background: '#F8FAFC', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {siembrasProd.length === 0 ? (
                      <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '12px 0', margin: 0 }}>Sin siembras en este filtro</p>
                    ) : siembrasProd.map(siembra => {
                      const segsS    = seguimientos[siembra.idSiembra]
                      const aprobadaS = estaAprobada(segsS)
                      const isSOpen   = siembraOpen === siembra.idSiembra
                      const cfgS      = ESTADOS[siembra.estado] || {}

                      return (
                        <div key={siembra.idSiembra} style={{
                          background: '#fff', borderRadius: 11,
                          border: `1px solid ${aprobadaS ? '#BBF7D0' : siembra.estado === 'EN_CURSO' ? '#E2E8F0' : '#F1F5F9'}`,
                          overflow: 'hidden',
                          opacity: siembra.estado !== 'EN_CURSO' && !aprobadaS ? 0.8 : 1,
                        }}>
                          {/* Borde izquierdo de color */}
                          <div style={{ height: 2, background: aprobadaS ? C.green : cfgS.color || C.teal }} />
                          <div style={{
                            padding: '12px 16px', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', cursor: 'pointer', flexWrap: 'wrap', gap: 8,
                          }} onClick={() => toggleSiembra(siembra.idSiembra)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                background: (cfgS.color || C.teal) + '18',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Fish size={15} color={cfgS.color || C.teal} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>
                                  {siembra.nombreEspecie} — {siembra.codigoEstanque}
                                </p>
                                <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>
                                  {siembra.cantidadAlevinos?.toLocaleString()} alevinos · Siembra: {formatFecha(siembra.fechaSiembra)}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <BadgeEstado estado={siembra.estado} />
                              <BadgeSiembraBio siembra={siembra} seguimientos={segsS} />
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                                {isSOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </div>
                          </div>
                          {isSOpen && (
                            <PanelSiembraBio
                              siembra={siembra}
                              seguimientos={segsS}
                              loadingSegs={!!loadingSegs[siembra.idSiembra]}
                              onRegistrar={abrirModalSeguimiento}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ══ MODAL SEGUIMIENTO BIÓLOGO ════════════════════════════════════════ */}
      {modalSeg && siembraSeleccionada && (
        <Modal
          title="Registrar Seguimiento"
          subtitle={`${siembraSeleccionada.nombreEspecie} — ${siembraSeleccionada.codigoEstanque} · ${siembraSeleccionada.nombreProductor}`}
          icon={ClipboardList}
          onClose={() => { setModalSeg(false); setErrorModal('') }}
        >
          <form onSubmit={handleSubmitSeguimiento} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ErrorBanner msg={errorModal} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Fecha de visita" required>
                <input type="date" required value={formSeg.fechaVisita}
                  onChange={e => setFormSeg({ ...formSeg, fechaVisita: e.target.value })}
                  style={iS} onFocus={iFocus} onBlur={iBlur} />
              </Field>
              <Field label="Peso promedio (g)" required>
                <input type="number" step="0.01" min="0" required value={formSeg.pesoPromedio}
                  onChange={e => setFormSeg({ ...formSeg, pesoPromedio: e.target.value })}
                  style={iS} onFocus={iFocus} onBlur={iBlur} />
              </Field>
            </div>
            <Field label="Cantidad estimada de peces" required>
              <input type="number" min="1" required value={formSeg.cantidadEstimada}
                onChange={e => setFormSeg({ ...formSeg, cantidadEstimada: e.target.value })}
                style={iS} onFocus={iFocus} onBlur={iBlur} />
            </Field>
            <Field label="Condición del agua">
              <SelectorAgua value={formSeg.condicionAgua}
                onChange={v => setFormSeg({ ...formSeg, condicionAgua: v })} />
            </Field>
            <Field label="Estado de salud" required>
              <select value={formSeg.estadoSalud}
                onChange={e => setFormSeg({ ...formSeg, estadoSalud: e.target.value })}
                style={iS} onFocus={iFocus} onBlur={iBlur}>
                <option value="SALUDABLE">Saludable</option>
                <option value="CON_SIGNOS_ENFERMEDAD">Con signos de enfermedad</option>
                <option value="CRITICO">Crítico</option>
              </select>
            </Field>
            <Field label="Observaciones">
              <textarea rows={3} value={formSeg.observaciones}
                onChange={e => setFormSeg({ ...formSeg, observaciones: e.target.value })}
                placeholder="Recomendaciones, tratamientos, notas técnicas..."
                style={{ ...iS, resize: 'none' }} onFocus={iFocus} onBlur={iBlur} />
            </Field>
            <ToggleApto
              value={formSeg.aptoCosecha}
              onChange={v => setFormSeg({ ...formSeg, aptoCosecha: v })}
              infoText="Al marcar como apto, el ciclo biológico se cierra y no se podrán registrar más seguimientos."
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <BtnCancelar onClick={() => { setModalSeg(false); setErrorModal('') }} />
              <BtnPrimario label={guardando ? 'Guardando...' : 'Guardar Seguimiento'} icon={ClipboardList} disabled={guardando} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE RAÍZ — enruta según rol (SIN TOCAR)
// ════════════════════════════════════════════════════════════════════════════
function Produccion() {
  const rol = localStorage.getItem('rol') || ''
  if (rol === 'ROLE_BIOLOGO') return <ProduccionBiologo />
  return <ProduccionGeneral />
}

export default Produccion

// ─── Keyframes globales ───────────────────────────────────────────────────────
const style = document.createElement('style')
style.textContent = `
  @keyframes pc-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes pc-modal-in { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes pc-fade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
`
if (!document.getElementById('pc-styles')) {
  style.id = 'pc-styles'
  document.head.appendChild(style)
}
