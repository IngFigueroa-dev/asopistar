import { useState, useEffect } from 'react'
import {
  Snowflake, Package, CheckCircle, XCircle,
  AlertTriangle, Truck, Clock, ChevronRight, X
} from 'lucide-react'
import api from '../../services/api'

/* ─── KEYFRAMES ─────────────────────────────────────────────────── */
const STYLES = `
@keyframes alm-fade {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes alm-modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
@keyframes alm-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
@keyframes alm-bar {
  from { width: 0%; }
}
.alm-fade   { animation: alm-fade    0.22s ease both; }
.alm-modal  { animation: alm-modal-in 0.22s ease both; }
.alm-skel   { animation: alm-pulse   1.6s ease infinite; background: #F1F5F9; border-radius: 6px; }
`

/* ─── TOKENS ────────────────────────────────────────────────────── */
const T = {
  teal:   '#14B8A6',
  cyan:   '#06B6D4',
  green:  '#10B981',
  amber:  '#F59E0B',
  red:    '#EF4444',
  blue:   '#3B82F6',
  text:   '#0F172A',
  sub:    '#64748B',
  muted:  '#94A3B8',
  border: '#F1F5F9',
  bg:     '#F8FAFC',
}

const gradBtn = (custom = {}) => ({
  background:   'linear-gradient(135deg, #14B8A6, #06B6D4)',
  boxShadow:    '0 2px 12px rgba(20,184,166,0.28)',
  color:        '#fff',
  border:       'none',
  borderRadius: 10,
  fontWeight:   700,
  fontSize:     13,
  cursor:       'pointer',
  transition:   'all 0.2s ease',
  padding:      '10px 20px',
  display:      'flex',
  alignItems:   'center',
  justifyContent: 'center',
  gap:          7,
  ...custom,
})

const inputBase = {
  width:        '100%',
  padding:      '10px 13px',
  border:       '1.5px solid #E2E8F0',
  borderRadius: 9,
  background:   '#FAFAFA',
  fontSize:     13,
  color:        T.text,
  outline:      'none',
  transition:   'all 0.2s ease',
  boxSizing:    'border-box',
}

/* ─── HELPERS ───────────────────────────────────────────────────── */
const estadoConfig = (decision) => {
  switch (decision) {
    case 'PENDIENTE_DECISION':
      return { label: 'Pendiente decisión', bg: '#FFFBEB', color: '#B45309', border: '#FED7AA', dot: T.amber }
    case 'ALMACENADO':
      return { label: 'Almacenado',         bg: '#F0FDFA', color: T.teal,   border: '#99F6E4', dot: T.teal  }
    case 'DESPACHADO':
      return { label: 'Despachado',          bg: '#F8FAFC', color: T.sub,    border: '#E2E8F0', dot: T.muted }
    default:
      return { label: decision,             bg: '#F8FAFC', color: T.muted,  border: '#E2E8F0', dot: T.muted }
  }
}

const barraColors = (pct) => {
  if (pct >= 90) return { bar: T.red,   track: '#FEE2E2', text: '#B91C1C', bg: '#FFF1F2', border: '#FECDD3' }
  if (pct >= 70) return { bar: T.amber, track: '#FEF3C7', text: '#92400E', bg: '#FFFBEB', border: '#FED7AA' }
  return               { bar: T.teal,  track: '#CCFBF1', text: T.teal,   bg: '#F0FDFA', border: '#99F6E4' }
}

const Avatar = ({ name, color = T.teal, bg = '#CCFBF1', size = 34 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: size * 0.38, color,
  }}>
    {name?.charAt(0)?.toUpperCase() || '?'}
  </div>
)

/* ─── SKELETON CARDS ────────────────────────────────────────────── */
const SkeletonCard = ({ delay = 0 }) => (
  <div className="alm-fade" style={{
    background: '#fff', border: `1px solid ${T.border}`, borderRadius: 14,
    overflow: 'hidden', animationDelay: `${delay}s`,
  }}>
    <div style={{ height: 3, background: 'linear-gradient(90deg, #E2E8F0, #F1F5F9)' }} />
    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="alm-skel" style={{ width: 80, height: 18 }} />
        <div className="alm-skel" style={{ width: 90, height: 20, borderRadius: 99 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="alm-skel" style={{ width: 34, height: 34, borderRadius: '50%' }} />
        <div className="alm-skel" style={{ width: 120, height: 14 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <div className="alm-skel" style={{ width: 60, height: 28 }} />
        <div className="alm-skel" style={{ width: 20, height: 14 }} />
      </div>
    </div>
    <div style={{ background: '#FAFBFC', borderTop: `1px solid ${T.border}`, padding: '10px 18px' }}>
      <div className="alm-skel" style={{ width: '60%', height: 14 }} />
    </div>
  </div>
)

/* ══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════ */
function Almacenamiento() {
  const [lotes,       setLotes]       = useState([])
  const [capacidadMax, setCapacidadMax] = useState(10000)
  const [clientes,    setClientes]    = useState([])
  const [puntos,      setPuntos]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loteModal,   setLoteModal]   = useState(null)
  const [paso,        setPaso]        = useState(1)
  const [decision,    setDecision]    = useState('')
  const [form,        setForm]        = useState({
    tipoDestino: '', idCliente: '', idPunto: '',
    destinoCiudad: '', observaciones: '',
  })
  const [error,     setError]     = useState('')
  const [guardando, setGuardando] = useState(false)

  const onFocus = e => { e.target.style.borderColor = T.teal;  e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }
  const onBlur  = e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }
  const onFocusBlue = e => { e.target.style.borderColor = T.blue;  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }

  useEffect(() => { cargarTodo() }, [])

  /* ── DATA LOADERS (SIN MODIFICAR LÓGICA) ── */
  const cargarTodo = async () => {
    try {
      setLoading(true)
      const [lotesRes, clientesRes, puntosRes, capRes] = await Promise.all([
        api.get('/lotes-cuarto-frio'),
        api.get('/clientes').catch(() => ({ data: [] })),
        api.get('/puntos-venta').catch(() => ({ data: [] })),
        api.get('/capacidad-cuarto-frio').catch(() => ({ data: null })),
      ])
      setLotes(lotesRes.data)
      setClientes(clientesRes.data)
      setPuntos(puntosRes.data)
      if (capRes.data?.capacidadMaxKg) setCapacidadMax(Number(capRes.data.capacidadMaxKg))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  /* ── MÉTRICAS (SIN MODIFICAR LÓGICA) ── */
  const almacenados     = lotes.filter(l => l.estadoDecision === 'ALMACENADO')
  const pendientes      = lotes.filter(l => l.estadoDecision === 'PENDIENTE_DECISION')
  const despachados     = lotes.filter(l => l.estadoDecision === 'DESPACHADO')
  const kilosStock      = almacenados.reduce((a, l) => a + (parseFloat(l.kilos) || 0), 0)
  const kilosPendientes = pendientes.reduce((a, l) => a + (parseFloat(l.kilos) || 0), 0)
  const pct             = Math.min(((kilosStock + kilosPendientes) / capacidadMax) * 100, 100)
  const kilosLibres     = Math.max(capacidadMax - kilosStock - kilosPendientes, 0)
  const bc              = barraColors(pct)

  /* ── HANDLERS (SIN MODIFICAR LÓGICA) ── */
  const abrirDecision = (lote) => {
    setLoteModal(lote)
    setDecision('')
    setPaso(1)
    setForm({ tipoDestino: '', idCliente: '', idPunto: '', destinoCiudad: '', observaciones: '' })
    setError('')
  }

  const handleConfirmar = async () => {
    setError('')
    if (!decision) { setError('Selecciona una opción.'); return }

    if (decision === 'ALMACENAR') {
      if (parseFloat(loteModal.kilos) > kilosLibres + kilosPendientes) {
        setError(`Sin espacio suficiente. Disponible: ${kilosLibres.toFixed(1)} kg`)
        return
      }
      await enviarDecision({ decision: 'ALMACENAR' })
      return
    }

    if (paso === 1) { setPaso(2); return }

    if (!form.tipoDestino)   { setError('Selecciona el tipo de destino.'); return }
    if (!form.destinoCiudad) { setError('Ingresa la ciudad de destino.'); return }
    if (form.tipoDestino === 'CLIENTE'     && !form.idCliente) { setError('Selecciona un cliente.'); return }
    if (form.tipoDestino === 'PUNTO_VENTA' && !form.idPunto)   { setError('Selecciona un punto de venta.'); return }

    await enviarDecision({
      decision:      'DESPACHAR',
      tipoDestino:   form.tipoDestino,
      idCliente:     form.idCliente ? parseInt(form.idCliente) : null,
      idPunto:       form.idPunto   ? parseInt(form.idPunto)   : null,
      destinoCiudad: form.destinoCiudad,
      observaciones: form.observaciones,
    })
  }

  const enviarDecision = async (payload) => {
    setGuardando(true)
    try {
      await api.patch(`/lotes-cuarto-frio/${loteModal.idLote}/decision`, payload)
      setLoteModal(null)
      cargarTodo()
    } catch (err) {
      setError('Error al procesar la decisión. Intenta de nuevo.')
      console.error(err)
    } finally { setGuardando(false) }
  }

  /* ── ORDEN DE LOTES: pendientes primero ── */
  const lotesOrdenados = [
    ...pendientes,
    ...almacenados,
    ...despachados,
  ]

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ background: T.bg, minHeight: '100vh', padding: '0 0 40px' }}>
      <style>{STYLES}</style>

      {/* ── HERO HEADER ─────────────────────────────────────────── */}
      <div style={{
        background:   'linear-gradient(135deg, #F0FDFA, #F8FAFC, #EFF6FF)',
        border:       '1px solid #E2E8F0',
        borderRadius: 18,
        padding:      '28px 32px',
        marginBottom: 24,
        position:     'relative',
        overflow:     'hidden',
      }}>
        <div aria-hidden style={{ position: 'absolute', top: -30,  right: 60,  width: 120, height: 120, borderRadius: '50%', background: 'rgba(20,184,166,0.07)' }} />
        <div aria-hidden style={{ position: 'absolute', top: 20,   right: -20, width: 80,  height: 80,  borderRadius: '50%', background: 'rgba(6,182,212,0.06)'  }} />
        <div aria-hidden style={{ position: 'absolute', bottom: -20, right: 140, width: 60, height: 60, borderRadius: '50%', background: 'rgba(20,184,166,0.05)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background:  'linear-gradient(135deg, #14B8A6, #06B6D4)',
            boxShadow:   '0 4px 14px rgba(20,184,166,0.35)',
            display:     'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Snowflake size={26} color="#fff" aria-hidden />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2 }}>
              Almacenamiento — Cuarto Frío
            </h1>
            <p style={{ color: T.sub, fontSize: 13, margin: '4px 0 0', fontWeight: 500 }}>
              {loading
                ? 'Cargando...'
                : `${lotes.length} lote${lotes.length !== 1 ? 's' : ''} en el sistema · ${kilosStock.toFixed(1)} kg en stock · ${kilosLibres.toFixed(1)} kg disponibles`
              }
            </p>
          </div>
        </div>
      </div>

      {/* ── ALERTA PENDIENTES ────────────────────────────────────── */}
      {pendientes.length > 0 && (
        <div className="alm-fade" style={{
          background:   'linear-gradient(135deg, #FFFBEB, #FFF7ED)',
          border:       '1px solid #FED7AA',
          borderRadius: 14,
          padding:      '16px 20px',
          marginBottom: 24,
          display:      'flex',
          alignItems:   'flex-start',
          gap:          12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'rgba(245,158,11,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={18} color={T.amber} aria-hidden />
          </div>
          <div>
            <p style={{ fontWeight: 800, color: '#92400E', fontSize: 14, margin: 0 }}>
              {pendientes.length} lote{pendientes.length > 1 ? 's' : ''} esperando decisión
            </p>
            <p style={{ color: '#B45309', fontSize: 12, margin: '3px 0 0' }}>
              Estos lotes acaban de salir de Procesamiento. Define si se almacenan en el Cuarto Frío o se despachan de inmediato.
            </p>
          </div>
        </div>
      )}

      {/* ── KPI CARDS ───────────────────────────────────────────── */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Pendientes',    value: pendientes.length,    icon: <Clock size={15} color={T.amber} />,  numColor: '#B45309', bg: '#FFFBEB', border: '#FED7AA' },
            { label: 'En Cuarto Frío', value: almacenados.length,  icon: <Snowflake size={15} color={T.teal} />, numColor: T.teal,   bg: '#F0FDFA', border: '#99F6E4' },
            { label: 'Stock actual',  value: `${kilosStock.toFixed(1)} kg`, icon: <Package size={15} color={T.sub} />, numColor: T.text, bg: '#fff',    border: T.border, small: true },
            { label: 'Despachados',   value: despachados.length,   icon: <Truck size={15} color={T.muted} />,  numColor: T.sub,    bg: '#fff',    border: T.border },
          ].map((s, i) => (
            <div key={s.label} className="alm-fade" style={{
              background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14,
              padding: '16px 18px', animationDelay: `${i * 0.05}s`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span aria-hidden>{s.icon}</span>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.sub, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {s.label}
                </p>
              </div>
              <p style={{ fontSize: s.small ? 20 : 28, fontWeight: 900, color: s.numColor, margin: 0, lineHeight: 1 }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── PANEL CAPACIDAD CUARTO FRÍO ─────────────────────────── */}
      {!loading && (
        <div className="alm-fade" style={{
          background:   bc.bg,
          border:       `1px solid ${bc.border}`,
          borderRadius: 14,
          padding:      '18px 22px',
          marginBottom: 28,
          animationDelay: '0.1s',
        }}>
          {/* Header capacidad */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Snowflake size={17} color={bc.text} aria-hidden />
              <span style={{ fontSize: 13, fontWeight: 800, color: bc.text }}>Capacidad del Cuarto Frío</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: bc.text }}>
              {(kilosStock + kilosPendientes).toFixed(1)} / {capacidadMax.toLocaleString('es-CO')} kg
              <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginLeft: 4 }}>({pct.toFixed(1)}%)</span>
            </span>
          </div>

          {/* Métricas en grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Almacenado', value: `${kilosStock.toFixed(1)} kg`,      color: bc.text },
              { label: 'Pendiente',  value: `${kilosPendientes.toFixed(1)} kg`, color: T.amber },
              { label: 'Disponible', value: `${kilosLibres.toFixed(1)} kg`,      color: T.green },
            ].map(m => (
              <div key={m.label} style={{
                background: 'rgba(255,255,255,0.6)', borderRadius: 9, padding: '10px 12px',
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: T.sub, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {m.label}
                </p>
                <p style={{ fontSize: 16, fontWeight: 900, color: m.color, margin: 0 }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Barra de progreso */}
          <div style={{ background: '#F1F5F9', borderRadius: 999, height: 10, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              height: 10, borderRadius: 999,
              background: pct >= 90
                ? 'linear-gradient(90deg, #EF4444, #F97316)'
                : pct >= 70
                  ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                  : 'linear-gradient(90deg, #14B8A6, #06B6D4)',
              width: `${pct}%`,
              transition: 'width 0.8s ease',
              animation: 'alm-bar 1s ease',
            }} />
          </div>
          <p style={{ fontSize: 11, color: T.muted, textAlign: 'right', margin: 0 }}>
            {pct.toFixed(1)}% utilizado
          </p>

          {/* Alertas de capacidad */}
          {pct >= 90 && (
            <div style={{
              marginTop: 12, background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertTriangle size={14} color={T.red} aria-hidden />
              <p style={{ fontSize: 12, color: '#B91C1C', fontWeight: 700, margin: 0 }}>
                ¡Cuarto frío casi lleno! Solo quedan {kilosLibres.toFixed(1)} kg disponibles.
              </p>
            </div>
          )}
          {pct >= 70 && pct < 90 && (
            <div style={{
              marginTop: 12, background: '#FFFBEB', border: '1px solid #FED7AA',
              borderRadius: 8, padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertTriangle size={14} color={T.amber} aria-hidden />
              <p style={{ fontSize: 12, color: '#92400E', fontWeight: 600, margin: 0 }}>
                Capacidad alta. Considera despachar lotes almacenados.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── GRID DE LOTES ───────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} delay={i * 0.05} />)}
        </div>

      ) : lotes.length === 0 ? (
        <div className="alm-fade" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '64px 24px', textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <Package size={34} color={T.teal} aria-hidden />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text, margin: '0 0 8px' }}>
            No hay lotes registrados
          </h3>
          <p style={{ color: T.sub, fontSize: 13, margin: 0, maxWidth: 340 }}>
            Los lotes se crean automáticamente al completar el Congelamiento en Procesamiento
          </p>
        </div>

      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {lotesOrdenados.map((l, i) => (
            <LoteCard
              key={l.idLote}
              lote={l}
              index={i}
              kilosLibres={kilosLibres}
              onDecidir={abrirDecision}
            />
          ))}
        </div>
      )}

      {/* ── MODAL DE DECISIÓN ───────────────────────────────────── */}
      {loteModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setLoteModal(null) }}
          style={{
            position: 'fixed', inset: 0,
            background:     'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: 16,
          }}
        >
          <div className="alm-modal" style={{
            background:  '#fff',
            borderRadius: 20,
            width: '100%', maxWidth: 520,
            maxHeight: '92vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 60px rgba(15,23,42,0.22)',
          }}>

            {/* Header modal */}
            <div style={{
              padding: '22px 24px 18px',
              borderBottom: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
              flexShrink: 0,
            }}>
              <div>
                {/* Indicador de paso */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  {[1, 2].map(n => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', fontSize: 10, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: paso >= n
                          ? (decision === 'DESPACHAR' && paso === 2 ? T.blue : T.teal)
                          : '#F1F5F9',
                        color: paso >= n ? '#fff' : T.muted,
                        transition: 'all 0.2s',
                      }}>{n}</div>
                      {n < 2 && (
                        <div style={{
                          width: 20, height: 2, borderRadius: 1,
                          background: paso >= 2 ? T.blue : '#E2E8F0',
                          transition: 'background 0.3s',
                        }} />
                      )}
                    </div>
                  ))}
                  <span style={{ fontSize: 11, color: T.sub, fontWeight: 600, marginLeft: 4 }}>
                    {paso === 1 ? 'Decisión' : 'Destino del despacho'}
                  </span>
                </div>

                <h2 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: '0 0 6px' }}>
                  {paso === 1 ? '¿Qué hacemos con este lote?' : 'Datos del despacho'}
                </h2>

                {/* Info del lote */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                    background: '#F1F5F9', color: T.sub, borderRadius: 6, padding: '2px 8px',
                  }}>
                    {loteModal.codigoLote}
                  </span>
                  <span style={{ fontSize: 12, color: T.sub }}>·</span>
                  <span style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>{loteModal.nombreProductor}</span>
                  <span style={{ fontSize: 12, color: T.sub }}>·</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.teal }}>{parseFloat(loteModal.kilos).toFixed(1)} kg</span>
                </div>
              </div>

              <button
                onClick={() => setLoteModal(null)}
                aria-label="Cerrar modal"
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.muted, transition: 'all 0.15s', flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = T.red }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.muted }}
              >
                <X size={17} aria-hidden />
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ── PASO 1: ELEGIR DECISIÓN ── */}
              {paso === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                  {/* Almacenar */}
                  <button
                    onClick={() => setDecision('ALMACENAR')}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                      padding: '22px 16px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                      border: decision === 'ALMACENAR' ? `2px solid ${T.teal}` : '2px solid #E2E8F0',
                      background: decision === 'ALMACENAR' ? '#F0FDFA' : '#FAFAFA',
                      outline: 'none',
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: decision === 'ALMACENAR' ? 'linear-gradient(135deg, #CCFBF1, #A5F3FC)' : '#F1F5F9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      <Snowflake size={24} color={decision === 'ALMACENAR' ? T.teal : T.muted} aria-hidden />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: decision === 'ALMACENAR' ? T.teal : T.text, margin: '0 0 4px' }}>
                        Almacenar
                      </p>
                      <p style={{ fontSize: 11, color: T.sub, margin: 0, lineHeight: 1.4 }}>
                        Guardar en el Cuarto Frío hasta el próximo despacho
                      </p>
                    </div>
                    {kilosLibres < parseFloat(loteModal.kilos) && (
                      <span style={{ fontSize: 11, color: T.red, fontWeight: 700 }}>
                        ⚠ Solo {kilosLibres.toFixed(1)} kg libres
                      </span>
                    )}
                  </button>

                  {/* Despachar */}
                  <button
                    onClick={() => setDecision('DESPACHAR')}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                      padding: '22px 16px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                      border: decision === 'DESPACHAR' ? `2px solid ${T.blue}` : '2px solid #E2E8F0',
                      background: decision === 'DESPACHAR' ? '#EFF6FF' : '#FAFAFA',
                      outline: 'none',
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: decision === 'DESPACHAR' ? 'linear-gradient(135deg, #DBEAFE, #BFDBFE)' : '#F1F5F9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      <Truck size={24} color={decision === 'DESPACHAR' ? T.blue : T.muted} aria-hidden />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: decision === 'DESPACHAR' ? T.blue : T.text, margin: '0 0 4px' }}>
                        Despachar ahora
                      </p>
                      <p style={{ fontSize: 11, color: T.sub, margin: 0, lineHeight: 1.4 }}>
                        El carro está disponible, enviar directamente
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {/* ── PASO 2: DATOS DEL DESPACHO ── */}
              {paso === 2 && decision === 'DESPACHAR' && (
                <>
                  {/* Tipo de destino */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: T.sub, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Tipo de destino *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[
                        { key: 'CLIENTE',     label: '👤 Cliente',          desc: 'Comprador registrado' },
                        { key: 'PUNTO_VENTA', label: '🏪 Punto de venta',   desc: 'Punto propio de ASOPISTAR' },
                      ].map(tipo => (
                        <button key={tipo.key}
                          onClick={() => setForm({ ...form, tipoDestino: tipo.key, idCliente: '', idPunto: '' })}
                          style={{
                            padding: '12px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                            border: form.tipoDestino === tipo.key ? `2px solid ${T.blue}` : '2px solid #E2E8F0',
                            background: form.tipoDestino === tipo.key ? '#EFF6FF' : '#FAFAFA',
                            outline: 'none', textAlign: 'left',
                          }}
                        >
                          <p style={{ fontSize: 13, fontWeight: 700, color: form.tipoDestino === tipo.key ? T.blue : T.text, margin: '0 0 2px' }}>
                            {tipo.label}
                          </p>
                          <p style={{ fontSize: 11, color: T.sub, margin: 0 }}>{tipo.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select cliente */}
                  {form.tipoDestino === 'CLIENTE' && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: T.sub, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Cliente *
                      </label>
                      <select value={form.idCliente}
                        onChange={e => setForm({ ...form, idCliente: e.target.value })}
                        style={{ ...inputBase, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 34 }}
                        onFocus={onFocusBlue} onBlur={onBlur}
                      >
                        <option value="">Seleccionar cliente...</option>
                        {clientes.map(c => (
                          <option key={c.idCliente} value={c.idCliente}>
                            {c.nombre1} {c.apellido1} — {c.ciudad}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Select punto de venta */}
                  {form.tipoDestino === 'PUNTO_VENTA' && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: T.sub, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Punto de venta *
                      </label>
                      <select value={form.idPunto}
                        onChange={e => setForm({ ...form, idPunto: e.target.value })}
                        style={{ ...inputBase, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 34 }}
                        onFocus={onFocusBlue} onBlur={onBlur}
                      >
                        <option value="">Seleccionar punto de venta...</option>
                        {puntos.map(p => (
                          <option key={p.idPunto} value={p.idPunto}>
                            {p.nombre} — {p.ciudadd}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Ciudad destino */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: T.sub, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Ciudad de destino *
                    </label>
                    <input type="text"
                      value={form.destinoCiudad}
                      onChange={e => setForm({ ...form, destinoCiudad: e.target.value })}
                      placeholder="Ej: Cúcuta, Ocaña..."
                      style={inputBase}
                      onFocus={onFocusBlue} onBlur={onBlur}
                    />
                  </div>

                  {/* Observaciones */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: T.sub, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Observaciones
                    </label>
                    <textarea
                      value={form.observaciones}
                      onChange={e => setForm({ ...form, observaciones: e.target.value })}
                      rows={2}
                      placeholder="Condiciones del despacho, novedades..."
                      style={{ ...inputBase, resize: 'none' }}
                      onFocus={onFocusBlue} onBlur={onBlur}
                    />
                  </div>

                  {/* Info automatismo */}
                  <div style={{
                    background: 'linear-gradient(135deg, #EFF6FF, #F8FAFC)',
                    border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <Truck size={15} color={T.blue} aria-hidden />
                    <p style={{ fontSize: 12, color: '#1D4ED8', margin: 0, fontWeight: 600 }}>
                      Se creará un envío en estado <strong>EN_CAMINO</strong> en el módulo de Logística.
                    </p>
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '12px 14px',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}>
                  <AlertTriangle size={15} color={T.red} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
                  <p style={{ fontSize: 13, color: '#B91C1C', margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Botones footer */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button
                  onClick={() => paso === 2 ? setPaso(1) : setLoteModal(null)}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    border: '1.5px solid #E2E8F0', background: 'transparent', color: T.sub,
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E2E8F0' }}
                >
                  {paso === 2 ? <><ChevronRight size={13} style={{ transform: 'rotate(180deg)' }} aria-hidden /> Volver</> : 'Cancelar'}
                </button>

                <button
                  onClick={handleConfirmar}
                  disabled={guardando || !decision}
                  style={{
                    ...gradBtn(
                      decision === 'DESPACHAR'
                        ? { background: 'linear-gradient(135deg, #3B82F6, #6366F1)', boxShadow: '0 2px 12px rgba(59,130,246,0.28)' }
                        : {}
                    ),
                    flex: 1, padding: '11px 0',
                    opacity: (guardando || !decision) ? 0.55 : 1,
                    cursor:  (guardando || !decision) ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => { if (!guardando && decision) { e.currentTarget.style.transform = 'translateY(-1px)' }}}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <CheckCircle size={15} aria-hidden />
                  {guardando            ? 'Procesando...'
                    : paso === 1 && decision === 'DESPACHAR' ? 'Continuar →'
                    : paso === 1 && decision === 'ALMACENAR' ? 'Confirmar almacenamiento'
                    : 'Confirmar despacho'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CARD DE LOTE
══════════════════════════════════════════════════════════════════ */
function LoteCard({ lote, index, kilosLibres, onDecidir }) {
  const [hovered, setHovered] = useState(false)
  const cfg = estadoConfig(lote.estadoDecision)
  const esPendiente  = lote.estadoDecision === 'PENDIENTE_DECISION'
  const esAlmacenado = lote.estadoDecision === 'ALMACENADO'
  const esDespachado = lote.estadoDecision === 'DESPACHADO'

  /* Color del borde top según estado */
  const topGrad = esPendiente
    ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
    : esAlmacenado
      ? 'linear-gradient(90deg, #14B8A6, #06B6D4)'
      : 'linear-gradient(90deg, #94A3B8, #CBD5E1)'

  return (
    <div
      className="alm-fade"
      style={{
        background:    '#fff',
        border:        `1px solid ${hovered && !esDespachado ? 'rgba(20,184,166,0.25)' : (esPendiente ? '#FED7AA' : T.border)}`,
        borderRadius:  14,
        overflow:      'hidden',
        transition:    'all 0.2s ease',
        transform:     hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow:     hovered ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        animationDelay:`${index * 0.04}s`,
        display:       'flex',
        flexDirection: 'column',
        opacity:       esDespachado ? 0.75 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Borde top gradiente */}
      <div style={{ height: 3, background: topGrad, flexShrink: 0 }} />

      {/* Header card */}
      <div style={{
        padding: '14px 18px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
          background: '#F1F5F9', color: T.sub, borderRadius: 6, padding: '3px 8px',
        }}>
          {lote.codigoLote}
        </span>
        {/* Badge estado */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
          borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
          {cfg.label}
        </span>
      </div>

      {/* Cuerpo */}
      <div style={{ padding: '0 18px 16px', flex: 1 }}>
        {/* Productor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Avatar
            name={lote.nombreProductor}
            color={esPendiente ? '#92400E' : T.teal}
            bg={esPendiente ? '#FEF3C7' : '#CCFBF1'}
            size={34}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{lote.nombreProductor}</span>
        </div>

        {/* Kilos — métrica principal */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 10 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: esAlmacenado ? '#14B8A6' : esPendiente ? '#B45309' : T.muted, lineHeight: 1 }}>
            {parseFloat(lote.kilos).toFixed(1)}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.muted }}>kg</span>
        </div>

        {/* Fecha ingreso */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: esPendiente ? 14 : 0 }}>
          <Clock size={11} color={T.muted} aria-hidden />
          <span style={{ fontSize: 11, color: T.muted }}>
            {lote.fechaIngreso?.replace('T', ' ').substring(0, 16)}
          </span>
        </div>

        {/* Botón decidir (solo pendiente) */}
        {esPendiente && (
          <button
            onClick={() => onDecidir(lote)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
              boxShadow:  '0 2px 10px rgba(245,158,11,0.28)',
              color:      '#fff',
              border:     'none',
              borderRadius: 9,
              fontWeight: 700,
              fontSize:   12,
              cursor:     'pointer',
              transition: 'all 0.2s ease',
              padding:    '9px 0',
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap:        6,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,158,11,0.40)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = '0 2px 10px rgba(245,158,11,0.28)' }}
          >
            <ChevronRight size={13} aria-hidden /> Decidir destino
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={{
        background: '#FAFBFC', borderTop: `1px solid ${T.border}`,
        padding: '10px 18px',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {esAlmacenado && (
          <>
            <CheckCircle size={13} color={T.teal} aria-hidden />
            <span style={{ fontSize: 12, color: T.teal, fontWeight: 600 }}>En cuarto frío</span>
          </>
        )}
        {esDespachado && (
          <>
            <XCircle size={13} color={T.muted} aria-hidden />
            <span style={{ fontSize: 12, color: T.muted }}>
              Enviado{lote.idEnvio ? ` · Envío #${lote.idEnvio}` : ''}
            </span>
          </>
        )}
        {esPendiente && (
          <>
            <AlertTriangle size={13} color={T.amber} aria-hidden />
            <span style={{ fontSize: 12, color: '#B45309', fontWeight: 600 }}>Requiere decisión</span>
          </>
        )}
      </div>
    </div>
  )
}

export default Almacenamiento
