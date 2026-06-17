// src/pages/puntosDeVenta/PuntosDeVenta.jsx
import { useState, useEffect, useMemo } from 'react'
import {
  Store, Plus, Search, X, MapPin, Phone, Mail,
  User, Edit3, ToggleLeft, ToggleRight, Eye,
  ChevronRight, Building2, Star, Clock, CheckCircle,
  AlertTriangle, Filter, BarChart2, Calendar, RefreshCw,
  ShieldAlert
} from 'lucide-react'
import api from '../../services/api'

// ── Constantes ────────────────────────────────────────────────────────────────

const TIPOS = ['PROPIO', 'ALIADO', 'TEMPORAL']
const ESTADOS = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO']

const TIPO_CONFIG = {
  PROPIO:   { label: 'Propio',   cls: 'bg-teal-50 text-teal-700 border-teal-200',    dot: 'bg-teal-500'   },
  ALIADO:   { label: 'Aliado',   cls: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500'   },
  TEMPORAL: { label: 'Temporal', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500'  },
}

const TIPO_STYLE = {
  PROPIO:   { background: '#F0FDFA', color: '#0F766E', borderColor: '#CCFBF1' },
  ALIADO:   { background: '#DBEAFE', color: '#1E40AF', borderColor: '#BFDBFE' },
  TEMPORAL: { background: '#FFFBEB', color: '#92400E', borderColor: '#FED7AA' },
}

const TIPO_DOT = {
  PROPIO:   '#14B8A6',
  ALIADO:   '#3B82F6',
  TEMPORAL: '#F59E0B',
}

const TIPO_BORDER_TOP = {
  PROPIO:   'linear-gradient(90deg, #14B8A6, #06B6D4)',
  ALIADO:   'linear-gradient(90deg, #3B82F6, #6366F1)',
  TEMPORAL: 'linear-gradient(90deg, #F59E0B, #EF4444)',
}

const ESTADO_CONFIG = {
  ACTIVO:     { label: 'Activo',     cls: 'bg-green-50 text-green-700 border-green-200',   dot: 'bg-green-500',  icon: CheckCircle  },
  INACTIVO:   { label: 'Inactivo',   cls: 'bg-gray-50 text-gray-500 border-gray-200',      dot: 'bg-gray-400',   icon: ToggleLeft   },
  SUSPENDIDO: { label: 'Suspendido', cls: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-500',    icon: AlertTriangle },
}

const ESTADO_STYLE = {
  ACTIVO:     { background: '#D1FAE5', color: '#065F46' },
  INACTIVO:   { background: '#F1F5F9', color: '#64748B' },
  SUSPENDIDO: { background: '#FEE2E2', color: '#991B1B' },
}

const ESTADO_BTN_STYLE = {
  ACTIVO:     { border: '#A7F3D0', color: '#059669', hoverBg: '#F0FDF4' },
  INACTIVO:   { border: '#E2E8F0', color: '#64748B', hoverBg: '#F1F5F9' },
  SUSPENDIDO: { border: '#FECACA', color: '#EF4444', hoverBg: '#FEF2F2' },
}

const DEPARTAMENTOS_CO = [
  'Amazonas','Antioquia','Arauca','Atlántico','Bolívar','Boyacá','Caldas','Caquetá',
  'Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca','Guainía','Guaviare',
  'Huila','La Guajira','Magdalena','Meta','Nariño','Norte de Santander','Putumayo',
  'Quindío','Risaralda','San Andrés y Providencia','Santander','Sucre','Tolima',
  'Valle del Cauca','Vaupés','Vichada',
]

// ── Animaciones globales ─────────────────────────────────────────────────────
const GLOBAL_STYLES = `
@keyframes pdv-fade {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pdv-modal-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes pdv-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
@keyframes pdv-toast {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

// ── Helpers ───────────────────────────────────────────────────────────────────
const getIniciales = (nombre = '') => {
  const partes = nombre.trim().split(/\s+/)
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
  return nombre.slice(0, 2).toUpperCase()
}

// ── MODAL FORMULARIO ──────────────────────────────────────────────────────────
function ModalFormulario({ punto, onClose, onGuardado }) {
  const editando = Boolean(punto)
  const [form, setForm] = useState({
    codigo:           punto?.codigo           || '',
    nombre:           punto?.nombre           || '',
    tipo:             punto?.tipo             || 'PROPIO',
    direccion:        punto?.direccion        || '',
    ciudad:           punto?.ciudad           || '',
    departamento:     punto?.departamento     || 'Norte de Santander',
    responsable:      punto?.responsable      || '',
    cargoResponsable: punto?.cargoResponsable || '',
    telefono:         punto?.telefono         || '',
    correo:           punto?.correo           || '',
    fechaApertura:    punto?.fechaApertura    || '',
    observaciones:    punto?.observaciones    || '',
  })
  const [error,     setError]     = useState('')
  const [guardando, setGuardando] = useState(false)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleGuardar = async () => {
    setError('')
    if (!form.codigo)    { setError('El código es obligatorio.');             return }
    if (!form.nombre)    { setError('El nombre es obligatorio.');             return }
    if (!form.tipo)      { setError('Selecciona el tipo de punto de venta.'); return }
    if (!form.direccion) { setError('La dirección es obligatoria.');          return }
    if (!form.ciudad)    { setError('La ciudad es obligatoria.');             return }

    setGuardando(true)
    try {
      const payload = {
        ...form,
        codigo: form.codigo.toUpperCase(),
        fechaApertura: form.fechaApertura || null,
      }
      if (editando) {
        await api.put(`/puntos-venta/${punto.idPunto}`, payload)
      } else {
        await api.post('/puntos-venta', payload)
      }
      onGuardado()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Error al guardar.'
      setError(typeof msg === 'string' ? msg : 'Error al guardar.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 600,
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        animation: 'pdv-modal-in 0.2s ease both'
      }}>
        {/* Header sticky */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '18px 24px', borderBottom: '1px solid #F1F5F9',
          borderRadius: '20px 20px 0 0', flexShrink: 0
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
            boxShadow: '0 4px 12px rgba(20,184,166,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Store size={18} color="#fff" aria-hidden />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {editando ? 'Editar Punto de Venta' : 'Nuevo Punto de Venta'}
            </h2>
            <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>
              {editando ? `Editando: ${punto.nombre}` : 'Completa la información del nuevo punto.'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
              display: 'flex', padding: 6, borderRadius: 8, transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8' }}
            aria-label="Cerrar"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Sección: Identificación */}
          <SeccionForm titulo="Identificación">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <CampoForm label="Código *">
                <InputForm
                  value={form.codigo} placeholder="PV-001" maxLength={15}
                  onChange={v => set('codigo', v)}
                  style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                />
              </CampoForm>
              <CampoForm label="Nombre *">
                <InputForm
                  value={form.nombre} placeholder="Punto Centro El Tarra" maxLength={40}
                  onChange={v => set('nombre', v)}
                />
              </CampoForm>
            </div>

            {/* Selector de Tipo — botones visuales */}
            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Tipo *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {TIPOS.map(t => {
                  const activo = form.tipo === t
                  const ts = TIPO_STYLE[t]
                  return (
                    <button
                      key={t}
                      onClick={() => set('tipo', t)}
                      style={{
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        border: activo ? `2px solid ${TIPO_DOT[t]}` : '2px solid #E2E8F0',
                        background: activo ? ts.background : '#FAFAFA',
                        color: activo ? ts.color : '#64748B',
                        fontSize: 13, fontWeight: 700,
                        transition: 'all 0.18s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: activo ? TIPO_DOT[t] : '#CBD5E1', flexShrink: 0 }} />
                      {TIPO_CONFIG[t].label}
                    </button>
                  )
                })}
              </div>
            </div>
          </SeccionForm>

          {/* Sección: Ubicación */}
          <SeccionForm titulo="Ubicación">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <CampoForm label="Dirección *">
                <InputForm
                  value={form.direccion} placeholder="Calle 5 # 10-20, Barrio Centro" maxLength={50}
                  onChange={v => set('direccion', v)}
                />
              </CampoForm>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <CampoForm label="Ciudad *">
                  <InputForm
                    value={form.ciudad} placeholder="El Tarra" maxLength={30}
                    onChange={v => set('ciudad', v)}
                  />
                </CampoForm>
                <CampoForm label="Departamento">
                  <SelectForm value={form.departamento} onChange={v => set('departamento', v)}>
                    <option value="">Seleccionar...</option>
                    {DEPARTAMENTOS_CO.map(d => <option key={d} value={d}>{d}</option>)}
                  </SelectForm>
                </CampoForm>
              </div>
            </div>
          </SeccionForm>

          {/* Sección: Contacto */}
          <SeccionForm titulo="Información de Contacto">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <CampoForm label="Responsable">
                <InputForm value={form.responsable} placeholder="Nombre completo" maxLength={60} onChange={v => set('responsable', v)} />
              </CampoForm>
              <CampoForm label="Cargo">
                <InputForm value={form.cargoResponsable} placeholder="Administrador, Vendedor..." maxLength={50} onChange={v => set('cargoResponsable', v)} />
              </CampoForm>
              <CampoForm label="Teléfono">
                <InputForm value={form.telefono} placeholder="300 000 0000" maxLength={15} onChange={v => set('telefono', v)} />
              </CampoForm>
              <CampoForm label="Correo">
                <InputForm type="email" value={form.correo} placeholder="punto@asopistar.com" maxLength={60} onChange={v => set('correo', v)} />
              </CampoForm>
            </div>
          </SeccionForm>

          {/* Sección: Operativo */}
          <SeccionForm titulo="Información Operativa">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <CampoForm label="Fecha de apertura">
                <InputForm type="date" value={form.fechaApertura} onChange={v => set('fechaApertura', v)} />
              </CampoForm>
              <CampoForm label="Observaciones">
                <textarea
                  value={form.observaciones}
                  onChange={e => set('observaciones', e.target.value)}
                  rows={2} maxLength={200}
                  placeholder="Notas adicionales sobre el punto de venta..."
                  style={{
                    width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0',
                    borderRadius: 9, background: '#FAFAFA', fontSize: 13, color: '#0F172A',
                    outline: 'none', resize: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit', transition: 'all 0.2s ease'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                />
                <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'right', margin: '2px 0 0' }}>
                  {form.observaciones.length}/200
                </p>
              </CampoForm>
            </div>
          </SeccionForm>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 9, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <AlertTriangle size={15} color="#EF4444" aria-hidden />
              <span style={{ fontSize: 13, color: '#991B1B' }}>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #F1F5F9',
          borderRadius: '0 0 20px 20px',
          display: 'flex', gap: 10, flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 0', border: '1.5px solid #E2E8F0', background: '#FAFAFA',
              color: '#64748B', borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar} disabled={guardando}
            style={{
              flex: 1, padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
              color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(20,184,166,0.3)', transition: 'all 0.2s ease'
            }}
          >
            {guardando && <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} aria-hidden />}
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear punto de venta'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── MODAL DETALLE ─────────────────────────────────────────────────────────────
function ModalDetalle({ punto, onClose, onEditar, onCambiarEstado }) {
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  const handleEstado = async (nuevoEstado) => {
    setCambiandoEstado(true)
    try {
      await onCambiarEstado(punto.idPunto, nuevoEstado)
      onClose()
    } finally {
      setCambiandoEstado(false)
    }
  }

  const estadosCambiables = ESTADOS.filter(e => e !== punto.estado)
  const ts = TIPO_STYLE[punto.tipo] || TIPO_STYLE.PROPIO

  const headerBg = punto.tipo === 'PROPIO'
    ? 'linear-gradient(135deg, #F0FDFA, #F8FAFC)'
    : punto.tipo === 'ALIADO'
    ? 'linear-gradient(135deg, #EFF6FF, #F8FAFC)'
    : 'linear-gradient(135deg, #FFFBEB, #FFF7ED)'

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        animation: 'pdv-modal-in 0.2s ease both'
      }}>
        {/* Header con color según tipo */}
        <div style={{
          padding: '22px 24px', background: headerBg,
          borderRadius: '20px 20px 0 0', borderBottom: '1px solid #F1F5F9'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(135deg, ${ts.background}, #F8FAFC)`,
                border: `2px solid ${ts.borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800, color: ts.color
              }}>
                {getIniciales(punto.nombre)}
              </div>
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  <ChipInline style={{ ...TIPO_STYLE[punto.tipo], border: `1px solid ${TIPO_STYLE[punto.tipo]?.borderColor}` }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: TIPO_DOT[punto.tipo], flexShrink: 0 }} />
                    {TIPO_CONFIG[punto.tipo]?.label}
                  </ChipInline>
                  <ChipInline style={ESTADO_STYLE[punto.estado]}>
                    {punto.estado}
                  </ChipInline>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>{punto.nombre}</h2>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0', fontFamily: 'monospace' }}>{punto.codigo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
                display: 'flex', padding: 6, borderRadius: 8, transition: 'all 0.2s ease', flexShrink: 0
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8' }}
              aria-label="Cerrar"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Ubicación */}
          <GrupoDetalle titulo="Ubicación">
            <ItemDetalle icon={<MapPin size={13} aria-hidden />}
              label={`${punto.direccion}${punto.ciudad ? `, ${punto.ciudad}` : ''}${punto.departamento ? `, ${punto.departamento}` : ''}`} />
          </GrupoDetalle>

          {/* Responsable */}
          {punto.responsable && (
            <GrupoDetalle titulo="Responsable">
              <ItemDetalle icon={<User size={13} aria-hidden />}
                label={punto.cargoResponsable ? `${punto.responsable} — ${punto.cargoResponsable}` : punto.responsable} />
            </GrupoDetalle>
          )}

          {/* Contacto */}
          {(punto.telefono || punto.correo) && (
            <GrupoDetalle titulo="Contacto">
              {punto.telefono && <ItemDetalle icon={<Phone size={13} aria-hidden />} label={punto.telefono} />}
              {punto.correo   && <ItemDetalle icon={<Mail size={13} aria-hidden />}  label={punto.correo} />}
            </GrupoDetalle>
          )}

          {/* Fecha apertura */}
          {punto.fechaApertura && (
            <GrupoDetalle titulo="Fecha de apertura">
              <ItemDetalle icon={<Calendar size={13} aria-hidden />} label={punto.fechaApertura} />
            </GrupoDetalle>
          )}

          {/* Observaciones */}
          {punto.observaciones && (
            <GrupoDetalle titulo="Observaciones">
              <div style={{ background: '#FFFBEB', border: '1px solid #FED7AA', borderRadius: 9, padding: '10px 12px' }}>
                <p style={{ fontSize: 12, color: '#92400E', margin: 0 }}>{punto.observaciones}</p>
              </div>
            </GrupoDetalle>
          )}

          {/* Cambiar estado */}
          {estadosCambiables.length > 0 && (
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                Cambiar estado
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {estadosCambiables.map(e => {
                  const bs = ESTADO_BTN_STYLE[e]
                  return (
                    <BtnEstado
                      key={e}
                      onClick={() => handleEstado(e)}
                      disabled={cambiandoEstado}
                      border={bs.border} color={bs.color} hoverBg={bs.hoverBg}
                    >
                      {ESTADO_CONFIG[e].label}
                    </BtnEstado>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #F1F5F9',
          display: 'flex', gap: 10
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 0', border: '1.5px solid #E2E8F0', background: '#FAFAFA',
              color: '#64748B', borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA' }}
          >
            Cerrar
          </button>
          <button
            onClick={() => { onClose(); onEditar(punto) }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
              color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 10px rgba(20,184,166,0.25)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 14px rgba(20,184,166,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(20,184,166,0.25)' }}
          >
            <Edit3 size={14} aria-hidden /> Editar
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function PuntosDeVenta() {
  const [puntos,       setPuntos]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [busqueda,     setBusqueda]     = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [filtroTipo,   setFiltroTipo]   = useState('TODOS')
  const [modalForm,    setModalForm]    = useState(false)
  const [editando,     setEditando]     = useState(null)
  const [detalle,      setDetalle]      = useState(null)
  const [toastMsg,     setToastMsg]     = useState('')

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      setLoading(true)
      const res = await api.get('/puntos-venta')
      setPuntos(res.data)
    } catch (err) {
      console.error('Error cargando puntos de venta:', err)
    } finally {
      setLoading(false)
    }
  }

  const mostrarToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleGuardado = () => {
    setModalForm(false)
    setEditando(null)
    cargar()
    mostrarToast(editando ? 'Punto de venta actualizado.' : 'Punto de venta creado correctamente.')
  }

  const handleCambiarEstado = async (id, nuevoEstado) => {
    await api.patch(`/puntos-venta/${id}/estado`, { estado: nuevoEstado })
    cargar()
    mostrarToast(`Estado cambiado a ${ESTADO_CONFIG[nuevoEstado]?.label}.`)
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      puntos.length,
    activos:    puntos.filter(p => p.estado === 'ACTIVO').length,
    propios:    puntos.filter(p => p.tipo === 'PROPIO').length,
    aliados:    puntos.filter(p => p.tipo === 'ALIADO').length,
    temporales: puntos.filter(p => p.tipo === 'TEMPORAL').length,
  }), [puntos])

  // ── Filtrado ───────────────────────────────────────────────────────────────
  const puntosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return puntos.filter(p => {
      const matchBusqueda = !q
        || p.nombre?.toLowerCase().includes(q)
        || p.codigo?.toLowerCase().includes(q)
        || p.ciudad?.toLowerCase().includes(q)
        || p.responsable?.toLowerCase().includes(q)
      const matchEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado
      const matchTipo   = filtroTipo   === 'TODOS' || p.tipo   === filtroTipo
      return matchBusqueda && matchEstado && matchTipo
    })
  }, [puntos, busqueda, filtroEstado, filtroTipo])

  const hayFiltros = filtroEstado !== 'TODOS' || filtroTipo !== 'TODOS'

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '24px', position: 'relative' }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 60,
          background: '#0F172A', color: '#fff',
          padding: '12px 18px', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'pdv-toast 0.25s ease both'
        }}>
          <CheckCircle size={15} color="#14B8A6" aria-hidden />
          {toastMsg}
        </div>
      )}

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC, #EFF6FF)',
        border: '1px solid #E2E8F0', borderRadius: 16,
        padding: '24px 28px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16
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
            <Store size={24} color="#fff" aria-hidden />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Puntos de Venta
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
              Red comercial de ASOPISTAR — {stats.activos} activo{stats.activos !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => { setEditando(null); setModalForm(true) }}
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
          <Plus size={17} aria-hidden /> Nuevo punto
        </button>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16, marginBottom: 24
      }}>
        {[
          {
            label: 'TOTAL', sub: 'puntos registrados', valor: stats.total,
            bg: '#F0FDFA', color: '#0F766E', border: '#CCFBF1', iconBg: '#14B8A6', Icon: Store
          },
          {
            label: 'ACTIVOS', sub: `${stats.total - stats.activos} inactivo${stats.total - stats.activos !== 1 ? 's' : ''}`, valor: stats.activos,
            bg: '#F0FDF4', color: '#065F46', border: '#A7F3D0', iconBg: '#10B981', Icon: CheckCircle
          },
          {
            label: 'PROPIOS', sub: 'de ASOPISTAR', valor: stats.propios,
            bg: '#F0FDFA', color: '#0F766E', border: '#A5F3FC', iconBg: '#06B6D4', Icon: Building2
          },
          {
            label: 'ALIADOS', sub: `+ ${stats.temporales} temporal${stats.temporales !== 1 ? 'es' : ''}`, valor: stats.aliados,
            bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE', iconBg: '#3B82F6', Icon: Star
          },
        ].map(({ label, sub, valor, bg, color, border, iconBg, Icon }) => (
          <div key={label} style={{
            background: bg, border: `1px solid ${border}`, borderRadius: 14,
            padding: '16px', transition: 'all 0.2s ease'
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

      {/* ── Barra de búsqueda y filtros ─────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid #F1F5F9',
        borderRadius: 14, padding: '14px 18px', marginBottom: 24
      }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Input búsqueda */}
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} aria-hidden />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, código, ciudad o responsable..."
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

          {/* Select estado */}
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            style={{
              padding: '9px 12px', border: `1.5px solid ${filtroEstado !== 'TODOS' ? '#14B8A6' : '#E2E8F0'}`,
              background: filtroEstado !== 'TODOS' ? '#F0FDFA' : '#FAFAFA',
              color: filtroEstado !== 'TODOS' ? '#0F766E' : '#64748B',
              borderRadius: 9, fontSize: 13, outline: 'none', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
            onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
            onBlur={e => { e.target.style.borderColor = filtroEstado !== 'TODOS' ? '#14B8A6' : '#E2E8F0'; e.target.style.boxShadow = 'none' }}
          >
            <option value="TODOS">Todos los estados</option>
            {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>)}
          </select>

          {/* Select tipo */}
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            style={{
              padding: '9px 12px', border: `1.5px solid ${filtroTipo !== 'TODOS' ? '#14B8A6' : '#E2E8F0'}`,
              background: filtroTipo !== 'TODOS' ? '#F0FDFA' : '#FAFAFA',
              color: filtroTipo !== 'TODOS' ? '#0F766E' : '#64748B',
              borderRadius: 9, fontSize: 13, outline: 'none', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
            onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
            onBlur={e => { e.target.style.borderColor = filtroTipo !== 'TODOS' ? '#14B8A6' : '#E2E8F0'; e.target.style.boxShadow = 'none' }}
          >
            <option value="TODOS">Todos los tipos</option>
            {TIPOS.map(t => <option key={t} value={t}>{TIPO_CONFIG[t].label}</option>)}
          </select>

          {/* Botón recargar */}
          <button
            onClick={cargar} title="Recargar datos"
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

        {/* Contador */}
        {(busqueda || hayFiltros) && (
          <p style={{ fontSize: 11, color: '#94A3B8', margin: '10px 0 0' }}>
            Mostrando {puntosFiltrados.length} de {puntos.length} resultado{puntos.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Grid de Cards ───────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ height: 3, background: '#F1F5F9', animation: 'pdv-pulse 1.4s ease infinite' }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F1F5F9', animation: 'pdv-pulse 1.4s ease infinite', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, marginBottom: 6, animation: 'pdv-pulse 1.4s ease infinite' }} />
                    <div style={{ height: 10, width: '50%', background: '#F1F5F9', borderRadius: 6, animation: 'pdv-pulse 1.4s ease infinite', animationDelay: '0.1s' }} />
                  </div>
                </div>
                {[0,1,2].map(j => (
                  <div key={j} style={{ height: 10, background: '#F1F5F9', borderRadius: 6, marginBottom: 8, animation: 'pdv-pulse 1.4s ease infinite', animationDelay: `${0.1*j}s` }} />
                ))}
              </div>
              <div style={{ height: 44, background: '#FAFBFC', borderTop: '1px solid #F1F5F9', animation: 'pdv-pulse 1.4s ease infinite' }} />
            </div>
          ))}
        </div>
      ) : puntosFiltrados.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, marginBottom: 16,
            background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Store size={28} color="#14B8A6" aria-hidden />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>
            {puntos.length === 0 ? 'No hay puntos de venta registrados.' : 'Sin resultados para la búsqueda.'}
          </p>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>
            {puntos.length === 0 ? 'Crea el primer punto de venta de ASOPISTAR.' : 'Ajusta la búsqueda o los filtros.'}
          </p>
          {puntos.length === 0 && (
            <button
              onClick={() => { setEditando(null); setModalForm(true) }}
              style={{
                marginTop: 16, display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(20,184,166,0.3)'
              }}
            >
              <Plus size={15} aria-hidden /> Crear el primero
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {puntosFiltrados.map((p, idx) => (
            <PuntoCard
              key={p.idPunto}
              punto={p}
              idx={idx}
              onVer={() => setDetalle(p)}
              onEditar={() => { setEditando(p); setModalForm(true) }}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      {modalForm && (
        <ModalFormulario
          punto={editando}
          onClose={() => { setModalForm(false); setEditando(null) }}
          onGuardado={handleGuardado}
        />
      )}
      {detalle && (
        <ModalDetalle
          punto={detalle}
          onClose={() => setDetalle(null)}
          onEditar={(p) => { setEditando(p); setModalForm(true) }}
          onCambiarEstado={handleCambiarEstado}
        />
      )}
    </div>
  )
}

// ── Card de punto de venta ────────────────────────────────────────────────────
function PuntoCard({ punto: p, idx, onVer, onEditar }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${hovered ? 'rgba(20,184,166,0.3)' : '#F1F5F9'}`,
        borderRadius: 14, overflow: 'hidden',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        cursor: 'pointer',
        animation: 'pdv-fade 0.22s ease both',
        animationDelay: `${idx * 0.04}s`
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onVer}
    >
      {/* Borde top según tipo */}
      <div style={{ height: 3, background: TIPO_BORDER_TOP[p.tipo] || TIPO_BORDER_TOP.PROPIO }} />

      {/* Cuerpo */}
      <div style={{ padding: '14px 16px' }}>
        {/* Header de la card */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: TIPO_STYLE[p.tipo]?.background || '#F0FDFA',
            border: `1.5px solid ${TIPO_STYLE[p.tipo]?.borderColor || '#CCFBF1'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: TIPO_STYLE[p.tipo]?.color || '#0F766E'
          }}>
            {getIniciales(p.nombre)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                {p.nombre}
              </p>
              <ChipInline style={TIPO_STYLE[p.tipo]}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: TIPO_DOT[p.tipo], flexShrink: 0 }} />
                {TIPO_CONFIG[p.tipo]?.label}
              </ChipInline>
            </div>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0', fontFamily: 'monospace' }}>
              {p.codigo || '—'}
            </p>
          </div>
        </div>

        {/* Datos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {p.direccion && (
            <DatoCard icon={<MapPin size={12} aria-hidden />} texto={p.direccion} />
          )}
          <DatoCard icon={<MapPin size={12} aria-hidden color="#06B6D4" />} texto={`${p.ciudad}${p.departamento ? `, ${p.departamento}` : ''}`} />
          {p.responsable && (
            <DatoCard icon={<User size={12} aria-hidden />} texto={p.cargoResponsable ? `${p.responsable} · ${p.cargoResponsable}` : p.responsable} />
          )}
          {p.telefono && <DatoCard icon={<Phone size={12} aria-hidden />} texto={p.telefono} />}
          {p.fechaApertura && <DatoCard icon={<Calendar size={12} aria-hidden />} texto={`Apertura: ${p.fechaApertura}`} />}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: '#FAFBFC', borderTop: '1px solid #F1F5F9',
        padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <ChipInline style={ESTADO_STYLE[p.estado]}>
          {p.estado}
        </ChipInline>

        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
          <BtnIcono onClick={onVer} title="Ver detalle" hoverColor="#14B8A6" hoverBg="#F0FDFA">
            <Eye size={14} aria-hidden />
          </BtnIcono>
          <BtnIcono onClick={onEditar} title="Editar" hoverColor="#3B82F6" hoverBg="#EFF6FF">
            <Edit3 size={14} aria-hidden />
          </BtnIcono>
        </div>
      </div>
    </div>
  )
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

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
        margin: '0 0 10px', paddingBottom: 8,
        borderBottom: '1px solid #F1F5F9'
      }}>
        {titulo}
      </p>
      {children}
    </div>
  )
}

function CampoForm({ label, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function InputForm({ value, onChange, placeholder, type = 'text', maxLength, min, style: extraStyle }) {
  return (
    <input
      type={type} value={value} placeholder={placeholder}
      maxLength={maxLength} min={min}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '9px 12px', boxSizing: 'border-box',
        border: '1.5px solid #E2E8F0', borderRadius: 9, background: '#FAFAFA',
        fontSize: 13, color: '#0F172A', outline: 'none',
        transition: 'all 0.2s ease', ...extraStyle
      }}
      onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
      onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
    />
  )
}

function SelectForm({ value, onChange, children }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '9px 12px', boxSizing: 'border-box',
        border: '1.5px solid #E2E8F0', borderRadius: 9, background: '#FAFAFA',
        fontSize: 13, color: '#0F172A', outline: 'none', cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
      onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
    >
      {children}
    </select>
  )
}

function GrupoDetalle({ titulo, children }) {
  return (
    <div style={{ background: '#FAFBFC', border: '1px solid #F1F5F9', borderRadius: 10, padding: '12px 14px' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
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

function BtnEstado({ children, onClick, disabled, border, color, hoverBg }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        flex: 1, padding: '8px 12px', border: `1.5px solid ${border}`, color,
        background: hov ? hoverBg : '#fff', borderRadius: 9,
        fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'all 0.2s ease'
      }}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  )
}
