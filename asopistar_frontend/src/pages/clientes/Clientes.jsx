// src/pages/clientes/Clientes.jsx
import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import {
  Building2, Plus, Search, Filter, X, Eye, Pencil,
  ChevronDown, ChevronUp, CheckCircle, XCircle, ShieldAlert,
  Phone, Mail, MapPin, CreditCard, User, Star, RefreshCw,
  TrendingUp, Users, AlertTriangle
} from 'lucide-react'

// ── Constantes de dominio ────────────────────────────────────────
const TIPOS_CLIENTE = ['DISTRIBUIDOR', 'PUNTO_DE_VENTA', 'EMPRESA', 'COMERCIALIZADORA', 'OTRO']
const TIPOS_DOCUMENTO = ['NIT', 'CC', 'CE', 'PASAPORTE']
const CLASIFICACIONES = ['PREFERENCIAL', 'ACTIVO', 'INACTIVO', 'BLOQUEADO']
const ESTADOS = ['ACTIVO', 'INACTIVO', 'BLOQUEADO']

const DEPARTAMENTOS_COL = [
  'Amazonas','Antioquia','Arauca','Atlántico','Bolívar','Boyacá','Caldas',
  'Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca',
  'Guainía','Guaviare','Huila','La Guajira','Magdalena','Meta','Nariño',
  'Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés y Providencia',
  'Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada'
]

// ── Helpers de presentación ──────────────────────────────────────
const TIPO_LABEL = {
  DISTRIBUIDOR: 'Distribuidor', PUNTO_DE_VENTA: 'Punto de Venta',
  EMPRESA: 'Empresa', COMERCIALIZADORA: 'Comercializadora', OTRO: 'Otro'
}
const TIPO_COLOR = {
  DISTRIBUIDOR:     'bg-blue-100 text-blue-700',
  PUNTO_DE_VENTA:   'bg-purple-100 text-purple-700',
  EMPRESA:          'bg-indigo-100 text-indigo-700',
  COMERCIALIZADORA: 'bg-cyan-100 text-cyan-700',
  OTRO:             'bg-gray-100 text-gray-600'
}
const TIPO_STYLE = {
  DISTRIBUIDOR:     { background: '#DBEAFE', color: '#1E40AF' },
  PUNTO_DE_VENTA:   { background: '#F3E8FF', color: '#6B21A8' },
  EMPRESA:          { background: '#E0E7FF', color: '#3730A3' },
  COMERCIALIZADORA: { background: '#CFFAFE', color: '#164E63' },
  OTRO:             { background: '#F1F5F9', color: '#475569' },
}
const CLASI_COLOR = {
  PREFERENCIAL: 'bg-amber-100 text-amber-700',
  ACTIVO:       'bg-emerald-100 text-emerald-700',
  INACTIVO:     'bg-gray-100 text-gray-500',
  BLOQUEADO:    'bg-red-100 text-red-600'
}
const CLASI_STYLE = {
  PREFERENCIAL: { background: '#FEF3C7', color: '#92400E' },
  ACTIVO:       { background: '#D1FAE5', color: '#065F46' },
  INACTIVO:     { background: '#F1F5F9', color: '#64748B' },
  BLOQUEADO:    { background: '#FEE2E2', color: '#991B1B' },
}
const ESTADO_COLOR = {
  ACTIVO:   'bg-emerald-100 text-emerald-700',
  INACTIVO: 'bg-gray-100 text-gray-500',
  BLOQUEADO:'bg-red-100 text-red-600'
}
const ESTADO_STYLE = {
  ACTIVO:   { background: '#D1FAE5', color: '#065F46' },
  INACTIVO: { background: '#F1F5F9', color: '#64748B' },
  BLOQUEADO:{ background: '#FEE2E2', color: '#991B1B' },
}
const ESTADO_ICON = {
  ACTIVO:   <CheckCircle size={12} />,
  INACTIVO: <XCircle size={12} />,
  BLOQUEADO:<ShieldAlert size={12} />
}

const fmtMoneda = (v) => v != null
  ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
  : '$0'

const fmtFecha = (s) => s
  ? new Date(s).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—'

// ── Formulario vacío ─────────────────────────────────────────────
const FORM_VACIO = {
  tipoDocumento: 'NIT', numeroDocumento: '', nit: '', razonSocial: '',
  tipoCliente: '', clasificacionComercial: 'ACTIVO',
  nombreContacto: '', cargoContacto: '',
  telefono: '', telefonoSecundario: '',
  correo: '', correoSecundario: '',
  direccion: '', ciudad: '', departamento: '',
  limiteCredito: '', observaciones: ''
}

// ── Iniciales del avatar ─────────────────────────────────────────
const getIniciales = (razonSocial = '') => {
  const partes = razonSocial.trim().split(/\s+/)
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
  return razonSocial.slice(0, 2).toUpperCase()
}

// ── Borde top según estado ───────────────────────────────────────
const getBordeTop = (c) => {
  if (c.estado === 'BLOQUEADO') return 'linear-gradient(90deg, #EF4444, #DC2626)'
  if (c.estado === 'INACTIVO')  return 'linear-gradient(90deg, #94A3B8, #CBD5E1)'
  return 'linear-gradient(90deg, #14B8A6, #06B6D4)'
}

// ── Estilos globales de animación ────────────────────────────────
const GLOBAL_STYLES = `
@keyframes cli-fade {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cli-modal-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes cli-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
`

// ════════════════════════════════════════════════════════════════
export default function Clientes() {
  const [clientes, setClientes]               = useState([])
  const [cargando, setCargando]               = useState(true)
  const [error, setError]                     = useState(null)

  const [busqueda, setBusqueda]               = useState('')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [filtros, setFiltros]                 = useState({
    tipoCliente: '', estado: '', clasificacion: '', ciudad: ''
  })

  const [modalForm, setModalForm]             = useState(false)
  const [modalDetalle, setModalDetalle]       = useState(null)
  const [clienteEdit, setClienteEdit]         = useState(null)

  const [form, setForm]                       = useState(FORM_VACIO)
  const [erroresForm, setErroresForm]         = useState({})
  const [guardando, setGuardando]             = useState(false)

  const [stats, setStats]                     = useState(null)

  // ── Carga de datos ─────────────────────────────────────────────
  const cargarClientes = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await api.get('/clientes')
      setClientes(res.data)
    } catch {
      setError('No se pudieron cargar los clientes.')
    } finally {
      setCargando(false)
    }
  }, [])

  const cargarStats = useCallback(async () => {
    try {
      const res = await api.get('/clientes/resumen')
      setStats(res.data)
    } catch { /* silencioso */ }
  }, [])

  useEffect(() => {
    cargarClientes()
    cargarStats()
  }, [cargarClientes, cargarStats])

  // ── Filtrado en frontend ───────────────────────────────────────
  const clientesFiltrados = clientes.filter(c => {
    const q = busqueda.toLowerCase()
    const coincideBusqueda = !q ||
      c.razonSocial?.toLowerCase().includes(q) ||
      c.nit?.toLowerCase().includes(q) ||
      c.correo?.toLowerCase().includes(q) ||
      c.telefono?.includes(q) ||
      c.nombreContacto?.toLowerCase().includes(q)

    const coincideTipo   = !filtros.tipoCliente  || c.tipoCliente === filtros.tipoCliente
    const coincideEstado = !filtros.estado        || c.estado === filtros.estado
    const coincideClasi  = !filtros.clasificacion || c.clasificacionComercial === filtros.clasificacion
    const coincideCiudad = !filtros.ciudad        ||
      c.ciudad?.toLowerCase().includes(filtros.ciudad.toLowerCase())

    return coincideBusqueda && coincideTipo && coincideEstado && coincideClasi && coincideCiudad
  })

  const hayFiltros = Object.values(filtros).some(Boolean)

  // ── Abrir formulario ───────────────────────────────────────────
  const abrirCrear = () => {
    setClienteEdit(null)
    setForm(FORM_VACIO)
    setErroresForm({})
    setModalForm(true)
  }

  const abrirEditar = (c) => {
    setClienteEdit(c)
    setForm({
      tipoDocumento:          c.tipoDocumento || 'NIT',
      numeroDocumento:        c.numeroDocumento || '',
      nit:                    c.nit || '',
      razonSocial:            c.razonSocial || '',
      tipoCliente:            c.tipoCliente || '',
      clasificacionComercial: c.clasificacionComercial || 'ACTIVO',
      nombreContacto:         c.nombreContacto || '',
      cargoContacto:          c.cargoContacto || '',
      telefono:               c.telefono || '',
      telefonoSecundario:     c.telefonoSecundario || '',
      correo:                 c.correo || '',
      correoSecundario:       c.correoSecundario || '',
      direccion:              c.direccion || '',
      ciudad:                 c.ciudad || '',
      departamento:           c.departamento || '',
      limiteCredito:          c.limiteCredito ?? '',
      observaciones:          c.observaciones || ''
    })
    setErroresForm({})
    setModalForm(true)
    setModalDetalle(null)
  }

  // ── Validación ─────────────────────────────────────────────────
  const validar = () => {
    const e = {}
    if (!form.tipoDocumento)   e.tipoDocumento   = 'Requerido'
    if (!form.numeroDocumento) e.numeroDocumento = 'Requerido'
    if (!form.nit)             e.nit             = 'Requerido'
    if (!form.razonSocial)     e.razonSocial     = 'Requerido'
    if (!form.tipoCliente)     e.tipoCliente     = 'Requerido'
    if (!form.nombreContacto)  e.nombreContacto  = 'Requerido'
    if (!form.cargoContacto)   e.cargoContacto   = 'Requerido'
    if (!form.telefono)        e.telefono        = 'Requerido'
    if (!form.correo)          e.correo          = 'Requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = 'Correo inválido'
    if (!form.direccion)       e.direccion       = 'Requerido'
    if (!form.ciudad)          e.ciudad          = 'Requerido'
    if (!form.departamento)    e.departamento    = 'Requerido'
    setErroresForm(e)
    return Object.keys(e).length === 0
  }

  // ── Guardar ────────────────────────────────────────────────────
  const guardar = async () => {
    if (!validar()) return
    setGuardando(true)
    try {
      const payload = {
        ...form,
        limiteCredito:      form.limiteCredito !== '' ? parseFloat(form.limiteCredito) : 0,
        telefonoSecundario: form.telefonoSecundario || null,
        correoSecundario:   form.correoSecundario   || null,
        observaciones:      form.observaciones       || null
      }
      if (clienteEdit) {
        await api.put(`/clientes/${clienteEdit.idCliente}`, payload)
      } else {
        await api.post('/clientes', payload)
      }
      setModalForm(false)
      await cargarClientes()
      await cargarStats()
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar. Verifica los datos.'
      setErroresForm({ _global: msg })
    } finally {
      setGuardando(false)
    }
  }

  // ── Cambiar estado ─────────────────────────────────────────────
  const cambiarEstado = async (c, nuevoEstado) => {
    try {
      await api.patch(`/clientes/${c.idCliente}/estado?estado=${nuevoEstado}`)
      await cargarClientes()
      await cargarStats()
      if (modalDetalle?.idCliente === c.idCliente) {
        const r = await api.get(`/clientes/${c.idCliente}`)
        setModalDetalle(r.data)
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cambiar estado')
    }
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '24px' }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC, #EFF6FF)',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Burbujas decorativas */}
        <div style={{ position: 'absolute', top: -20, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(20,184,166,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 10, right: 30, width: 60, height: 60, borderRadius: '50%', background: 'rgba(6,182,212,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -15, right: 140, width: 80, height: 80, borderRadius: '50%', background: 'rgba(20,184,166,0.05)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
            boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Building2 size={24} color="#fff" aria-hidden />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Clientes Empresariales
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
              Gestión B2B — {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={abrirCrear}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 20px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,184,166,0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(20,184,166,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(20,184,166,0.3)' }}
        >
          <Plus size={17} aria-hidden /> Nuevo Cliente
        </button>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 24
        }}>
          {[
            {
              label: 'TOTAL', sub: 'clientes registrados', valor: stats.totalClientes,
              bg: '#F0FDFA', color: '#0F766E', border: '#CCFBF1', iconBg: '#14B8A6',
              Icon: Users
            },
            {
              label: 'ACTIVOS', sub: 'en operación', valor: stats.activos,
              bg: '#F0FDF4', color: '#065F46', border: '#A7F3D0', iconBg: '#10B981',
              Icon: CheckCircle
            },
            {
              label: 'PREFERENCIALES', sub: 'clasificación top', valor: stats.preferenciales,
              bg: '#FFFBEB', color: '#92400E', border: '#FED7AA', iconBg: '#F59E0B',
              Icon: Star
            },
            {
              label: 'BLOQUEADOS', sub: 'acceso restringido', valor: stats.bloqueados,
              bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', iconBg: '#EF4444',
              Icon: ShieldAlert
            },
          ].map(({ label, sub, valor, bg, color, border, iconBg, Icon }) => (
            <div key={label} style={{
              background: bg, border: `1px solid ${border}`, borderRadius: 14,
              padding: '16px', transition: 'all 0.2s ease', cursor: 'default'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color="#fff" aria-hidden />
                </div>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#0F172A' }}>{valor ?? '—'}</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
              <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Barra de búsqueda y filtros ─────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid #F1F5F9',
        borderRadius: filtrosAbiertos ? '14px 14px 0 0' : 14,
        padding: '14px 18px', marginBottom: filtrosAbiertos ? 0 : 24
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Input búsqueda */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} color="#94A3B8" aria-hidden style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por razón social, NIT, correo, teléfono o contacto…"
              style={{
                width: '100%', paddingLeft: 36, paddingRight: busqueda ? 32 : 12,
                paddingTop: 9, paddingBottom: 9, boxSizing: 'border-box',
                border: '1.5px solid #E2E8F0', borderRadius: 9, background: '#FAFAFA',
                fontSize: 13, color: '#0F172A', outline: 'none', transition: 'all 0.2s ease'
              }}
              onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
              onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda"
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                <X size={14} aria-hidden />
              </button>
            )}
          </div>

          {/* Botón filtros */}
          <button
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px',
              border: hayFiltros ? '1.5px solid #14B8A6' : '1.5px solid #E2E8F0',
              background: hayFiltros ? '#F0FDFA' : '#FAFAFA',
              color: hayFiltros ? '#0F766E' : '#64748B',
              borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Filter size={14} aria-hidden />
            Filtros
            {hayFiltros && (
              <span style={{
                background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                color: '#fff', borderRadius: '50%', width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700
              }}>
                {Object.values(filtros).filter(Boolean).length}
              </span>
            )}
            {filtrosAbiertos ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />}
          </button>

          {/* Botón recargar */}
          <button
            onClick={() => { cargarClientes(); cargarStats() }}
            title="Recargar datos"
            style={{
              padding: '9px 12px', border: '1.5px solid #E2E8F0', background: '#FAFAFA',
              borderRadius: 9, color: '#64748B', cursor: 'pointer', display: 'flex',
              alignItems: 'center', transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#14B8A6'; e.currentTarget.style.color = '#14B8A6' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
          >
            <RefreshCw size={15} aria-hidden />
          </button>
        </div>
      </div>

      {/* Panel de filtros */}
      {filtrosAbiertos && (
        <div style={{
          background: '#FAFBFC', borderTop: '1px solid #F1F5F9',
          border: '1px solid #F1F5F9', borderTop: 'none',
          borderRadius: '0 0 14px 14px', padding: '16px 18px', marginBottom: 24
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { key: 'tipoCliente', label: 'Tipo de cliente', options: TIPOS_CLIENTE.map(t => ({ value: t, label: TIPO_LABEL[t] })) },
              { key: 'estado',      label: 'Estado',           options: ESTADOS.map(e => ({ value: e, label: e })) },
              { key: 'clasificacion', label: 'Clasificación',  options: CLASIFICACIONES.map(c => ({ value: c, label: c })) },
            ].map(({ key, label, options }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{label}</label>
                <select
                  value={filtros[key]}
                  onChange={e => setFiltros(f => ({ ...f, [key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '8px 10px', border: '1.5px solid #E2E8F0',
                    borderRadius: 9, background: '#FAFAFA', fontSize: 12, color: '#0F172A',
                    outline: 'none', cursor: 'pointer'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                >
                  <option value="">Todos</option>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Ciudad</label>
              <input
                value={filtros.ciudad}
                onChange={e => setFiltros(f => ({ ...f, ciudad: e.target.value }))}
                placeholder="Ej: Cúcuta"
                style={{
                  width: '100%', padding: '8px 10px', border: '1.5px solid #E2E8F0',
                  borderRadius: 9, background: '#FAFAFA', fontSize: 12, color: '#0F172A',
                  outline: 'none', boxSizing: 'border-box'
                }}
                onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          </div>
          {hayFiltros && (
            <button
              onClick={() => setFiltros({ tipoCliente: '', estado: '', clasificacion: '', ciudad: '' })}
              style={{ marginTop: 12, background: 'none', border: 'none', color: '#14B8A6', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* ── Grid de Cards ───────────────────────────────────────── */}
      {cargando ? (
        /* Skeletons */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ height: 3, background: '#F1F5F9', animation: 'cli-pulse 1.4s ease infinite' }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F1F5F9', animation: 'cli-pulse 1.4s ease infinite', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, marginBottom: 6, animation: 'cli-pulse 1.4s ease infinite', animationDelay: '0.1s' }} />
                    <div style={{ height: 10, width: '60%', background: '#F1F5F9', borderRadius: 6, animation: 'cli-pulse 1.4s ease infinite', animationDelay: '0.2s' }} />
                  </div>
                </div>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{ height: 10, background: '#F1F5F9', borderRadius: 6, marginBottom: 8, animation: 'cli-pulse 1.4s ease infinite', animationDelay: `${0.1 * j}s` }} />
                ))}
              </div>
              <div style={{ height: 44, background: '#FAFBFC', borderTop: '1px solid #F1F5F9', animation: 'cli-pulse 1.4s ease infinite' }} />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error */
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14,
          padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12
        }}>
          <AlertTriangle size={20} color="#EF4444" aria-hidden />
          <span style={{ fontSize: 14, color: '#991B1B' }}>{error}</span>
        </div>
      ) : clientesFiltrados.length === 0 ? (
        /* Sin resultados */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '60px 20px', textAlign: 'center'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, marginBottom: 16,
            background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Building2 size={28} color="#14B8A6" aria-hidden />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>No se encontraron clientes</p>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>
            {busqueda || hayFiltros ? 'Ajusta la búsqueda o los filtros' : 'Crea el primer cliente empresarial'}
          </p>
          {!busqueda && !hayFiltros && (
            <button
              onClick={abrirCrear}
              style={{
                marginTop: 16, display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(20,184,166,0.3)', transition: 'all 0.2s ease'
              }}
            >
              <Plus size={15} aria-hidden /> Nuevo Cliente
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {clientesFiltrados.map((c, idx) => (
              <ClienteCard
                key={c.idCliente}
                cliente={c}
                idx={idx}
                onVer={() => setModalDetalle(c)}
                onEditar={() => abrirEditar(c)}
                onCambiarEstado={cambiarEstado}
              />
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: '#94A3B8', textAlign: 'right' }}>
            Mostrando {clientesFiltrados.length} de {clientes.length} clientes
          </div>
        </>
      )}

      {/* ── Modal Formulario ──────────────────────────────────── */}
      {modalForm && (
        <ModalOverlay onClose={() => setModalForm(false)}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 600,
            maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            animation: 'cli-modal-in 0.2s ease both'
          }}>
            {/* Header sticky */}
            <div style={{
              position: 'sticky', top: 0, zIndex: 10, background: '#fff',
              borderBottom: '1px solid #F1F5F9', padding: '18px 24px',
              borderRadius: '20px 20px 0 0',
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Building2 size={18} color="#fff" aria-hidden />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {clienteEdit ? 'Editar Cliente' : 'Nuevo Cliente Empresarial'}
                </h2>
                <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>
                  {clienteEdit ? 'Modifica los datos del cliente' : 'Registra un nuevo cliente B2B'}
                </p>
              </div>
              <button
                onClick={() => setModalForm(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
                  display: 'flex', padding: 6, borderRadius: 8, transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8' }}
                aria-label="Cerrar formulario"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Error global */}
              {erroresForm._global && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: 9, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <AlertTriangle size={15} color="#EF4444" aria-hidden />
                  <span style={{ fontSize: 13, color: '#991B1B' }}>{erroresForm._global}</span>
                </div>
              )}

              {/* Sección 1: Identificación */}
              <SeccionForm titulo="Identificación Empresarial">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <CampoForm label="Tipo de documento *" error={erroresForm.tipoDocumento}>
                    <SelectForm error={erroresForm.tipoDocumento}
                      value={form.tipoDocumento}
                      onChange={v => setForm(f => ({ ...f, tipoDocumento: v }))}>
                      {TIPOS_DOCUMENTO.map(t => <option key={t}>{t}</option>)}
                    </SelectForm>
                  </CampoForm>
                  <CampoForm label="Número de documento *" error={erroresForm.numeroDocumento}>
                    <InputForm error={erroresForm.numeroDocumento}
                      value={form.numeroDocumento} placeholder="Ej: 900123456"
                      onChange={v => setForm(f => ({ ...f, numeroDocumento: v }))} />
                  </CampoForm>
                  <CampoForm label="NIT *" error={erroresForm.nit}>
                    <InputForm error={erroresForm.nit}
                      value={form.nit} placeholder="Ej: 900123456-1"
                      onChange={v => setForm(f => ({ ...f, nit: v }))} />
                  </CampoForm>
                  <CampoForm label="Razón social *" error={erroresForm.razonSocial}>
                    <InputForm error={erroresForm.razonSocial}
                      value={form.razonSocial} placeholder="Nombre legal de la empresa"
                      onChange={v => setForm(f => ({ ...f, razonSocial: v }))} />
                  </CampoForm>
                  <CampoForm label="Tipo de cliente *" error={erroresForm.tipoCliente}>
                    <SelectForm error={erroresForm.tipoCliente}
                      value={form.tipoCliente}
                      onChange={v => setForm(f => ({ ...f, tipoCliente: v }))}>
                      <option value="">Seleccionar…</option>
                      {TIPOS_CLIENTE.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
                    </SelectForm>
                  </CampoForm>
                  <CampoForm label="Clasificación comercial">
                    <SelectForm value={form.clasificacionComercial}
                      onChange={v => setForm(f => ({ ...f, clasificacionComercial: v }))}>
                      {CLASIFICACIONES.map(c => <option key={c}>{c}</option>)}
                    </SelectForm>
                  </CampoForm>
                </div>
              </SeccionForm>

              {/* Sección 2: Contacto */}
              <SeccionForm titulo="Contacto Principal">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <CampoForm label="Nombre del contacto *" error={erroresForm.nombreContacto}>
                    <InputForm error={erroresForm.nombreContacto}
                      value={form.nombreContacto} placeholder="Nombre completo"
                      onChange={v => setForm(f => ({ ...f, nombreContacto: v }))} />
                  </CampoForm>
                  <CampoForm label="Cargo *" error={erroresForm.cargoContacto}>
                    <InputForm error={erroresForm.cargoContacto}
                      value={form.cargoContacto} placeholder="Ej: Gerente de Compras"
                      onChange={v => setForm(f => ({ ...f, cargoContacto: v }))} />
                  </CampoForm>
                  <CampoForm label="Teléfono *" error={erroresForm.telefono}>
                    <InputForm error={erroresForm.telefono}
                      value={form.telefono} placeholder="3001234567"
                      onChange={v => setForm(f => ({ ...f, telefono: v }))} />
                  </CampoForm>
                  <CampoForm label="Teléfono secundario">
                    <InputForm value={form.telefonoSecundario} placeholder="Opcional"
                      onChange={v => setForm(f => ({ ...f, telefonoSecundario: v }))} />
                  </CampoForm>
                  <CampoForm label="Correo electrónico *" error={erroresForm.correo}>
                    <InputForm type="email" error={erroresForm.correo}
                      value={form.correo} placeholder="empresa@correo.com"
                      onChange={v => setForm(f => ({ ...f, correo: v }))} />
                  </CampoForm>
                  <CampoForm label="Correo secundario">
                    <InputForm type="email" value={form.correoSecundario} placeholder="Opcional"
                      onChange={v => setForm(f => ({ ...f, correoSecundario: v }))} />
                  </CampoForm>
                </div>
              </SeccionForm>

              {/* Sección 3: Ubicación */}
              <SeccionForm titulo="Ubicación">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <CampoForm label="Dirección *" error={erroresForm.direccion}>
                      <InputForm error={erroresForm.direccion}
                        value={form.direccion} placeholder="Calle, número, barrio"
                        onChange={v => setForm(f => ({ ...f, direccion: v }))} />
                    </CampoForm>
                  </div>
                  <CampoForm label="Ciudad *" error={erroresForm.ciudad}>
                    <InputForm error={erroresForm.ciudad}
                      value={form.ciudad} placeholder="Ej: Cúcuta"
                      onChange={v => setForm(f => ({ ...f, ciudad: v }))} />
                  </CampoForm>
                  <CampoForm label="Departamento *" error={erroresForm.departamento}>
                    <SelectForm error={erroresForm.departamento}
                      value={form.departamento}
                      onChange={v => setForm(f => ({ ...f, departamento: v }))}>
                      <option value="">Seleccionar…</option>
                      {DEPARTAMENTOS_COL.map(d => <option key={d}>{d}</option>)}
                    </SelectForm>
                  </CampoForm>
                </div>
              </SeccionForm>

              {/* Sección 4: Comercial */}
              <SeccionForm titulo="Información Comercial">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <CampoForm label="Límite de crédito (COP)">
                    <InputForm type="number" min="0"
                      value={form.limiteCredito} placeholder="0"
                      onChange={v => setForm(f => ({ ...f, limiteCredito: v }))} />
                  </CampoForm>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <CampoForm label="Observaciones">
                      <textarea
                        value={form.observaciones}
                        onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                        rows={3} placeholder="Notas adicionales sobre el cliente…"
                        style={{
                          width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0',
                          borderRadius: 9, background: '#FAFAFA', fontSize: 13, color: '#0F172A',
                          outline: 'none', resize: 'none', boxSizing: 'border-box',
                          fontFamily: 'inherit', transition: 'all 0.2s ease'
                        }}
                        onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
                        onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                      />
                    </CampoForm>
                  </div>
                </div>
              </SeccionForm>
            </div>

            {/* Footer sticky */}
            <div style={{
              position: 'sticky', bottom: 0, background: '#fff',
              borderTop: '1px solid #F1F5F9', padding: '14px 24px',
              borderRadius: '0 0 20px 20px',
              display: 'flex', justifyContent: 'flex-end', gap: 10
            }}>
              <button
                onClick={() => setModalForm(false)}
                style={{
                  padding: '9px 18px', border: '1.5px solid #E2E8F0', background: '#FAFAFA',
                  color: '#64748B', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA' }}
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '9px 22px',
                  background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontSize: 13, fontWeight: 700, cursor: guardando ? 'not-allowed' : 'pointer',
                  opacity: guardando ? 0.7 : 1, transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(20,184,166,0.3)'
                }}
              >
                {guardando && <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} aria-hidden />}
                {guardando ? 'Guardando…' : (clienteEdit ? 'Guardar cambios' : 'Crear cliente')}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── Modal Detalle ─────────────────────────────────────── */}
      {modalDetalle && (
        <ModalOverlay onClose={() => setModalDetalle(null)}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520,
            maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            animation: 'cli-modal-in 0.2s ease both'
          }}>
            {/* Header con color según estado/clasificación */}
            <div style={{
              padding: '22px 24px',
              background: modalDetalle.estado === 'BLOQUEADO'
                ? 'linear-gradient(135deg, #FEF2F2, #FFF1F2)'
                : modalDetalle.clasificacionComercial === 'PREFERENCIAL'
                ? 'linear-gradient(135deg, #FFFBEB, #FFF7ED)'
                : 'linear-gradient(135deg, #F0FDFA, #F8FAFC)',
              borderRadius: '20px 20px 0 0',
              borderBottom: '1px solid #F1F5F9'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {/* Avatar grande */}
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color: '#0F766E'
                  }}>
                    {getIniciales(modalDetalle.razonSocial)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {modalDetalle.razonSocial}
                    </h2>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 10px', fontFamily: 'monospace' }}>
                      NIT: {modalDetalle.nit}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <ChipInline style={TIPO_STYLE[modalDetalle.tipoCliente]}>{TIPO_LABEL[modalDetalle.tipoCliente]}</ChipInline>
                      <ChipInline style={CLASI_STYLE[modalDetalle.clasificacionComercial]}>
                        {modalDetalle.clasificacionComercial === 'PREFERENCIAL' && <Star size={10} aria-hidden />}
                        {modalDetalle.clasificacionComercial}
                      </ChipInline>
                      <ChipInline style={ESTADO_STYLE[modalDetalle.estado]}>
                        {ESTADO_ICON[modalDetalle.estado]} {modalDetalle.estado}
                      </ChipInline>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setModalDetalle(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
                    display: 'flex', padding: 6, borderRadius: 8, transition: 'all 0.2s ease', flexShrink: 0
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8' }}
                  aria-label="Cerrar detalle"
                >
                  <X size={18} aria-hidden />
                </button>
              </div>
            </div>

            {/* Cuerpo */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Contacto */}
              <GrupoDetalle titulo="Contacto Principal">
                <ItemDetalle icon={<User size={13} aria-hidden />}
                  label={`${modalDetalle.nombreContacto} — ${modalDetalle.cargoContacto}`} />
                <ItemDetalle icon={<Phone size={13} aria-hidden />}
                  label={modalDetalle.telefonoSecundario
                    ? `${modalDetalle.telefono} / ${modalDetalle.telefonoSecundario}`
                    : modalDetalle.telefono} />
                <ItemDetalle icon={<Mail size={13} aria-hidden />}
                  label={modalDetalle.correoSecundario
                    ? `${modalDetalle.correo} / ${modalDetalle.correoSecundario}`
                    : modalDetalle.correo} />
              </GrupoDetalle>

              {/* Ubicación */}
              <GrupoDetalle titulo="Ubicación">
                <ItemDetalle icon={<MapPin size={13} aria-hidden />}
                  label={`${modalDetalle.direccion}, ${modalDetalle.ciudad}, ${modalDetalle.departamento}`} />
              </GrupoDetalle>

              {/* Comercial */}
              <GrupoDetalle titulo="Información Comercial">
                <ItemDetalle icon={<CreditCard size={13} aria-hidden />}
                  label={`Límite de crédito: ${fmtMoneda(modalDetalle.limiteCredito)}`} />
                <ItemDetalle icon={<TrendingUp size={13} aria-hidden />}
                  label={`Tipo de doc: ${modalDetalle.tipoDocumento} — ${modalDetalle.numeroDocumento}`} />
              </GrupoDetalle>

              {/* Historial */}
              <GrupoDetalle titulo="Historial Comercial">
                <p style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>
                  Próximamente: envíos recibidos, total comprado y última operación.
                </p>
              </GrupoDetalle>

              {modalDetalle.observaciones && (
                <GrupoDetalle titulo="Observaciones">
                  <div style={{ background: '#FFFBEB', border: '1px solid #FED7AA', borderRadius: 9, padding: '10px 12px' }}>
                    <p style={{ fontSize: 12, color: '#92400E', margin: 0 }}>{modalDetalle.observaciones}</p>
                  </div>
                </GrupoDetalle>
              )}

              <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'right', margin: 0 }}>
                Registrado el {fmtFecha(modalDetalle.fechaCreacion)}
                {modalDetalle.fechaActualizacion && ` · Actualizado ${fmtFecha(modalDetalle.fechaActualizacion)}`}
              </p>
            </div>

            {/* Footer */}
            <div style={{
              borderTop: '1px solid #F1F5F9', padding: '14px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: 10
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {modalDetalle.estado === 'ACTIVO' ? (
                  <BtnEstado
                    onClick={() => cambiarEstado(modalDetalle, 'INACTIVO')}
                    border="#FED7AA" color="#D97706" hoverBg="#FFFBEB"
                  >Desactivar</BtnEstado>
                ) : (
                  <BtnEstado
                    onClick={() => cambiarEstado(modalDetalle, 'ACTIVO')}
                    border="#A7F3D0" color="#059669" hoverBg="#F0FDF4"
                  >Activar</BtnEstado>
                )}
                {modalDetalle.estado !== 'BLOQUEADO' && (
                  <BtnEstado
                    onClick={() => cambiarEstado(modalDetalle, 'BLOQUEADO')}
                    border="#FECACA" color="#EF4444" hoverBg="#FEF2F2"
                  >Bloquear</BtnEstado>
                )}
              </div>
              <button
                onClick={() => abrirEditar(modalDetalle)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                  color: '#fff', border: 'none', borderRadius: 9,
                  padding: '8px 16px', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 4px 10px rgba(20,184,166,0.25)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 14px rgba(20,184,166,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(20,184,166,0.25)' }}
              >
                <Pencil size={13} aria-hidden /> Editar
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  )
}

// ── Card de cliente ──────────────────────────────────────────────
function ClienteCard({ cliente: c, idx, onVer, onEditar, onCambiarEstado }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${hovered ? 'rgba(20,184,166,0.3)' : '#F1F5F9'}`,
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'default',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        animation: 'cli-fade 0.22s ease both',
        animationDelay: `${idx * 0.04}s`
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Borde top */}
      <div style={{ height: 3, background: getBordeTop(c) }} />

      {/* Cuerpo */}
      <div style={{ padding: '14px 16px' }}>
        {/* Header card */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#0F766E'
          }}>
            {getIniciales(c.razonSocial)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                {c.razonSocial}
              </p>
              <ChipInline style={TIPO_STYLE[c.tipoCliente] || { background: '#F1F5F9', color: '#475569' }}>
                {TIPO_LABEL[c.tipoCliente] || c.tipoCliente}
              </ChipInline>
            </div>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0', fontFamily: 'monospace' }}>
              {c.nit}
            </p>
          </div>
        </div>

        {/* Datos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <DatoCard icon={<User size={12} aria-hidden />} texto={`${c.nombreContacto} · ${c.cargoContacto}`} />
          <DatoCard icon={<Phone size={12} aria-hidden />} texto={c.telefono} />
          <DatoCard icon={<MapPin size={12} aria-hidden />} texto={`${c.ciudad}, ${c.departamento}`} />
          {c.limiteCredito > 0 && (
            <DatoCard icon={<CreditCard size={12} aria-hidden />} texto={fmtMoneda(c.limiteCredito)} />
          )}
        </div>
      </div>

      {/* Footer card */}
      <div style={{
        background: '#FAFBFC', borderTop: '1px solid #F1F5F9',
        padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <ChipInline style={CLASI_STYLE[c.clasificacionComercial]}>
            {c.clasificacionComercial === 'PREFERENCIAL' && <Star size={10} aria-hidden />}
            {c.clasificacionComercial}
          </ChipInline>
          <ChipInline style={ESTADO_STYLE[c.estado]}>
            {ESTADO_ICON[c.estado]} {c.estado}
          </ChipInline>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <BtnIcono onClick={onVer} title="Ver detalle" hoverColor="#14B8A6" hoverBg="#F0FDFA">
            <Eye size={14} aria-hidden />
          </BtnIcono>
          <BtnIcono onClick={onEditar} title="Editar" hoverColor="#3B82F6" hoverBg="#EFF6FF">
            <Pencil size={14} aria-hidden />
          </BtnIcono>
          {c.estado === 'ACTIVO' ? (
            <BtnIcono onClick={() => onCambiarEstado(c, 'INACTIVO')} title="Desactivar" hoverColor="#F59E0B" hoverBg="#FFFBEB">
              <XCircle size={14} aria-hidden />
            </BtnIcono>
          ) : (
            <BtnIcono onClick={() => onCambiarEstado(c, 'ACTIVO')} title="Activar" hoverColor="#10B981" hoverBg="#F0FDF4">
              <CheckCircle size={14} aria-hidden />
            </BtnIcono>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Componentes auxiliares del sistema ───────────────────────────

function ModalOverlay({ children, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)'
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>
  )
}

function SeccionForm({ titulo, children }) {
  return (
    <div>
      <p style={{
        fontSize: 11, fontWeight: 700, color: '#14B8A6',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        margin: '0 0 8px', paddingBottom: 8,
        borderBottom: '1px solid #F1F5F9'
      }}>
        {titulo}
      </p>
      {children}
    </div>
  )
}

function CampoForm({ label, error, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5
      }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function InputForm({ value, onChange, placeholder, error, type = 'text', min }) {
  return (
    <input
      type={type} min={min} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '9px 12px', boxSizing: 'border-box',
        border: `1.5px solid ${error ? '#EF4444' : '#E2E8F0'}`,
        borderRadius: 9, background: '#FAFAFA',
        fontSize: 13, color: '#0F172A', outline: 'none',
        transition: 'all 0.2s ease'
      }}
      onFocus={e => {
        e.target.style.borderColor = error ? '#EF4444' : '#14B8A6'
        e.target.style.boxShadow = error
          ? '0 0 0 3px rgba(239,68,68,0.12)'
          : '0 0 0 3px rgba(20,184,166,0.12)'
      }}
      onBlur={e => {
        e.target.style.borderColor = error ? '#EF4444' : '#E2E8F0'
        e.target.style.boxShadow = 'none'
      }}
    />
  )
}

function SelectForm({ value, onChange, error, children }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '9px 12px', boxSizing: 'border-box',
        border: `1.5px solid ${error ? '#EF4444' : '#E2E8F0'}`,
        borderRadius: 9, background: '#FAFAFA',
        fontSize: 13, color: '#0F172A', outline: 'none',
        cursor: 'pointer', transition: 'all 0.2s ease'
      }}
      onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
      onBlur={e => { e.target.style.borderColor = error ? '#EF4444' : '#E2E8F0'; e.target.style.boxShadow = 'none' }}
    >
      {children}
    </select>
  )
}

function GrupoDetalle({ titulo, children }) {
  return (
    <div style={{ background: '#FAFBFC', border: '1px solid #F1F5F9', borderRadius: 10, padding: '12px 14px' }}>
      <p style={{
        fontSize: 10, fontWeight: 700, color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px'
      }}>
        {titulo}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  )
}

function ItemDetalle({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <span style={{ color: '#94A3B8', flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: 13, color: '#64748B', wordBreak: 'break-word' }}>{label}</span>
    </div>
  )
}

function DatoCard({ icon, texto }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: '#94A3B8', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, color: '#64748B' }}>{texto}</span>
    </div>
  )
}

function ChipInline({ children, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99,
      fontSize: 10, fontWeight: 700, ...style
    }}>
      {children}
    </span>
  )
}

function BtnIcono({ children, onClick, title, hoverColor, hoverBg }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick} title={title}
      style={{
        width: 30, height: 30, borderRadius: 8, border: 'none',
        background: hov ? hoverBg : 'transparent',
        color: hov ? hoverColor : '#94A3B8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s ease'
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  )
}

function BtnEstado({ children, onClick, border, color, hoverBg }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 13px', border: `1.5px solid ${border}`, color,
        background: hov ? hoverBg : '#fff', borderRadius: 9,
        fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease'
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  )
}
