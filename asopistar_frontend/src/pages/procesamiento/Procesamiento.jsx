import { useState, useEffect } from 'react'
import { CheckCircle, ChevronRight, Fish, Snowflake, Scissors, Scale, X, AlertTriangle, Layers } from 'lucide-react'
import api from '../../services/api'

/* ─── CONSTANTES DE NEGOCIO (SIN MODIFICAR) ────────────────────── */
const ETAPAS = ['PESAJE', 'EVISCERADO', 'LIMPIEZA', 'CONGELAMIENTO']

const ETAPA_CONFIG = {
  PESAJE:        { label: 'Pesaje',        icon: Scale,     colorKey: 'blue'   },
  EVISCERADO:    { label: 'Eviscerado',    icon: Fish,      colorKey: 'orange' },
  LIMPIEZA:      { label: 'Limpieza',      icon: Scissors,  colorKey: 'purple' },
  CONGELAMIENTO: { label: 'Congelamiento', icon: Snowflake, colorKey: 'teal'   },
}

/* ─── TOKENS DE COLOR POR ETAPA ────────────────────────────────── */
const ETAPA_COLORS = {
  blue:   { accent: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', badge: '#DBEAFE' },
  orange: { accent: '#F97316', bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C', badge: '#FFEDD5' },
  purple: { accent: '#A855F7', bg: '#FAF5FF', border: '#E9D5FF', text: '#7E22CE', badge: '#F3E8FF' },
  teal:   { accent: '#14B8A6', bg: '#F0FDFA', border: '#99F6E4', text: '#0F766E', badge: '#CCFBF1' },
}

/* ─── KEYFRAMES ─────────────────────────────────────────────────── */
const STYLES = `
@keyframes proc-fade {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes proc-modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
@keyframes proc-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
@keyframes proc-progress {
  from { width: 0%; }
}
.proc-fade    { animation: proc-fade    0.22s ease both; }
.proc-modal   { animation: proc-modal-in 0.22s ease both; }
.proc-skel    { animation: proc-pulse   1.6s ease infinite; background: #F1F5F9; border-radius: 6px; }
`

/* ─── TOKENS GLOBALES ───────────────────────────────────────────── */
const T = {
  teal:   '#14B8A6',
  cyan:   '#06B6D4',
  green:  '#10B981',
  amber:  '#F59E0B',
  red:    '#EF4444',
  text:   '#0F172A',
  sub:    '#64748B',
  muted:  '#94A3B8',
  border: '#F1F5F9',
  bg:     '#F8FAFC',
}

const gradBtn = {
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
  gap:          7,
}

const inputBase = {
  width:       '100%',
  padding:     '10px 13px',
  border:      '1.5px solid #E2E8F0',
  borderRadius: 9,
  background:  '#FAFAFA',
  fontSize:    13,
  color:       T.text,
  outline:     'none',
  transition:  'all 0.2s ease',
  boxSizing:   'border-box',
}

/* ─── HELPERS ───────────────────────────────────────────────────── */
const Avatar = ({ name, size = 36, completed = false }) => {
  const initial = name?.charAt(0)?.toUpperCase() || '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: completed
        ? 'linear-gradient(135deg, #CCFBF1, #A5F3FC)'
        : 'linear-gradient(135deg, #FFEDD5, #FEF3C7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.38,
      color: completed ? T.teal : '#C2410C',
    }}>{initial}</div>
  )
}

/* ─── SKELETON ───────────────────────────────────────────────────── */
const SkeletonCard = ({ delay = 0 }) => (
  <div style={{
    background: '#fff', border: `1px solid ${T.border}`, borderRadius: 14,
    overflow: 'hidden', animationDelay: `${delay}s`,
  }} className="proc-fade">
    <div style={{ height: 3, background: 'linear-gradient(90deg, #E2E8F0, #F1F5F9)' }} />
    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="proc-skel" style={{ width: 40, height: 40, borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="proc-skel" style={{ width: 120, height: 14 }} />
            <div className="proc-skel" style={{ width: 80,  height: 12 }} />
          </div>
        </div>
        <div className="proc-skel" style={{ width: 110, height: 34, borderRadius: 9 }} />
      </div>
      {/* Pipeline skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div className="proc-skel" style={{ width: 44, height: 44, borderRadius: '50%' }} />
              <div className="proc-skel" style={{ width: 52, height: 10 }} />
            </div>
            {i < 4 && <div className="proc-skel" style={{ width: 16, height: 10, borderRadius: 3 }} />}
          </div>
        ))}
      </div>
    </div>
  </div>
)

/* ══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════ */
function Procesamiento() {
  const [procesamientos, setProcesamientos] = useState([])
  const [loading,        setLoading]        = useState(true)
  const [modalData,      setModalData]      = useState(null)
  const [form,           setForm]           = useState({ responsable: '', observaciones: '' })
  const [error,          setError]          = useState('')
  const [guardando,      setGuardando]      = useState(false)

  const onFocus = e => { e.target.style.borderColor = T.teal; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }
  const onBlur  = e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }

  useEffect(() => { cargar() }, [])

  /* ── LÓGICA DE NEGOCIO (SIN MODIFICAR) ── */
  const cargar = async () => {
    try {
      setLoading(true)
      const res = await api.get('/procesamientos')
      setProcesamientos(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const grupos = procesamientos.reduce((acc, p) => {
    const key = p.idRecepcion
    if (!acc[key]) acc[key] = {
      idRecepcion:     p.idRecepcion,
      kilosRecibidos:  p.kilosRecibidos,
      nombreProductor: p.nombreProductor,
      etapas:          [],
    }
    acc[key].etapas.push(p)
    return acc
  }, {})

  const grupos_arr = Object.values(grupos)
  const activos    = grupos_arr.filter(g => g.etapas.some(e => e.estado === 'EN_PROCESO'))
  const completos  = grupos_arr.filter(g =>
    g.etapas.some(e => e.etapa === 'CONGELAMIENTO' && e.estado === 'COMPLETADO')
  )

  const etapaActual = (g) => g.etapas.find(e => e.estado === 'EN_PROCESO')

  const abrirModal = (etapa) => {
    setModalData(etapa)
    setForm({ responsable: '', observaciones: '' })
    setError('')
  }

  const handleAvanzar = async (e) => {
    e.preventDefault()
    if (!form.responsable.trim()) { setError('El responsable es obligatorio.'); return }
    setGuardando(true); setError('')
    try {
      await api.patch(`/procesamientos/${modalData.idProcesamiento}/avanzar`, {
        idRecepcion:   modalData.idRecepcion,
        responsable:   form.responsable,
        observaciones: form.observaciones,
      })
      setModalData(null)
      cargar()
    } catch (err) {
      setError('Error al avanzar la etapa. Intenta de nuevo.')
      console.error(err)
    } finally { setGuardando(false) }
  }

  const esUltimaEtapa = (etapa) => etapa === 'CONGELAMIENTO'

  /* ── STATS ── */
  const etapasActivas = procesamientos.filter(p => p.estado === 'EN_PROCESO').length

  /* ── PROGRESO COMPLETADO (para barra del hero) ── */
  const totalEtapas    = grupos_arr.length * ETAPAS.length
  const etapasHechas   = procesamientos.filter(p => p.estado === 'COMPLETADO').length
  const pctProgreso    = totalEtapas > 0 ? Math.round((etapasHechas / totalEtapas) * 100) : 0

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
        {/* Burbujas decorativas */}
        <div aria-hidden style={{ position: 'absolute', top: -30,  right: 60,  width: 120, height: 120, borderRadius: '50%', background: 'rgba(20,184,166,0.07)' }} />
        <div aria-hidden style={{ position: 'absolute', top: 20,   right: -20, width: 80,  height: 80,  borderRadius: '50%', background: 'rgba(6,182,212,0.06)'  }} />
        <div aria-hidden style={{ position: 'absolute', bottom: -20, right: 140, width: 60, height: 60, borderRadius: '50%', background: 'rgba(20,184,166,0.05)' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          {/* Izquierda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background:  'linear-gradient(135deg, #14B8A6, #06B6D4)',
              boxShadow:   '0 4px 14px rgba(20,184,166,0.35)',
              display:     'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Layers size={26} color="#fff" aria-hidden />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2 }}>
                Procesamiento de Lotes
              </h1>
              <p style={{ color: T.sub, fontSize: 13, margin: '4px 0 0', fontWeight: 500 }}>
                {loading
                  ? 'Cargando...'
                  : `${activos.length} lote${activos.length !== 1 ? 's' : ''} en proceso · ${completos.length} en cuarto frío · ${etapasActivas} etapa${etapasActivas !== 1 ? 's' : ''} activa${etapasActivas !== 1 ? 's' : ''}`
                }
              </p>
              {!loading && grupos_arr.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <div style={{ flex: 1, background: 'rgba(20,184,166,0.15)', borderRadius: 999, height: 5, minWidth: 160, overflow: 'hidden' }}>
                    <div style={{
                      height: 5, borderRadius: 999,
                      background:  'linear-gradient(90deg, #14B8A6, #06B6D4)',
                      width:       `${pctProgreso}%`,
                      transition:  'width 0.8s ease',
                      animation:   'proc-progress 1s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.teal }}>{pctProgreso}% completado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ───────────────────────────────────────────── */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'En proceso',     value: activos.length,     color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA', icon: '🔄' },
            { label: 'En cuarto frío', value: completos.length,   color: T.teal,   bg: '#F0FDFA', border: '#99F6E4', icon: '❄️' },
            { label: 'Total lotes',    value: grupos_arr.length,  color: T.text,   bg: '#fff',    border: T.border,   icon: '📦' },
            { label: 'Etapas activas', value: etapasActivas,      color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', icon: '⚡' },
          ].map((s, i) => (
            <div key={s.label} className="proc-fade" style={{
              background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14,
              padding: '16px 18px', animationDelay: `${i * 0.05}s`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span aria-hidden style={{ fontSize: 16 }}>{s.icon}</span>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.sub, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {s.label}
                </p>
              </div>
              <p style={{ fontSize: 28, fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── BANNER FLUJO VISUAL ──────────────────────────────────── */}
      <div style={{
        background:   'linear-gradient(135deg, #F0FDFA, #F8FAFC)',
        border:       '1px solid #CCFBF1',
        borderRadius: 14,
        padding:      '14px 20px',
        marginBottom: 28,
        display:      'flex',
        alignItems:   'center',
        gap:          8,
        flexWrap:     'wrap',
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: T.teal, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>
          Flujo:
        </span>
        {ETAPAS.map((e, i) => {
          const cfg = ETAPA_CONFIG[e]
          const col = ETAPA_COLORS[cfg.colorKey]
          const Ico = cfg.icon
          return (
            <span key={e} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: col.bg, border: `1px solid ${col.border}`,
                color: col.text, borderRadius: 99, padding: '4px 10px',
                fontSize: 11, fontWeight: 700,
              }}>
                <Ico size={11} aria-hidden /> {cfg.label}
              </span>
              {i < ETAPAS.length - 1 && <ChevronRight size={12} color={T.muted} aria-hidden />}
            </span>
          )
        })}
        <ChevronRight size={12} color={T.muted} aria-hidden />
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
          color: '#fff', borderRadius: 99, padding: '4px 12px',
          fontSize: 11, fontWeight: 700,
          boxShadow: '0 2px 8px rgba(20,184,166,0.28)',
        }}>
          📦 Cuarto Frío
        </span>
      </div>

      {/* ── CONTENIDO ───────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} delay={i * 0.06} />)}
        </div>

      ) : grupos_arr.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '64px 24px', textAlign: 'center',
        }} className="proc-fade">
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <Layers size={34} color={T.teal} aria-hidden />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text, margin: '0 0 8px' }}>
            No hay procesamientos activos
          </h3>
          <p style={{ color: T.sub, fontSize: 13, margin: 0, maxWidth: 340 }}>
            Los lotes se crean automáticamente al registrar una recepción en la planta
          </p>
        </div>

      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Activos */}
          {activos.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: '#FFF7ED', border: '1px solid #FED7AA',
                  color: '#C2410C', borderRadius: 99, padding: '4px 12px',
                  fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  🔄 En proceso ({activos.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activos.map((g, i) => (
                  <GrupoCard key={g.idRecepcion} grupo={g}
                    etapaActual={etapaActual(g)}
                    onAvanzar={abrirModal}
                    esUltimaEtapa={esUltimaEtapa}
                    completado={false}
                    index={i}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completos */}
          {completos.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: '#F0FDFA', border: '1px solid #99F6E4',
                  color: T.teal, borderRadius: 99, padding: '4px 12px',
                  fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  ❄️ En cuarto frío ({completos.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {completos.map((g, i) => (
                  <GrupoCard key={g.idRecepcion} grupo={g}
                    etapaActual={null}
                    onAvanzar={abrirModal}
                    esUltimaEtapa={esUltimaEtapa}
                    completado
                    index={i}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL AVANZAR ETAPA ─────────────────────────────────── */}
      {modalData && (() => {
        const cfg      = ETAPA_CONFIG[modalData.etapa]
        const col      = ETAPA_COLORS[cfg?.colorKey || 'teal']
        const Ico      = cfg?.icon || Fish
        const sigIdx   = ETAPAS.indexOf(modalData.etapa) + 1
        const sigEtapa = ETAPAS[sigIdx]
        const sigCfg   = sigEtapa ? ETAPA_CONFIG[sigEtapa] : null
        const esUltima = esUltimaEtapa(modalData.etapa)

        return (
          <div
            onClick={e => { if (e.target === e.currentTarget) setModalData(null) }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(15,23,42,0.45)',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 50, padding: 16,
            }}
          >
            <div className="proc-modal" style={{
              background: '#fff', borderRadius: 20,
              width: '100%', maxWidth: 500,
              maxHeight: '92vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(15,23,42,0.22)',
            }}>
              {/* Header */}
              <div style={{
                padding: '22px 24px 18px',
                borderBottom: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: col.bg, border: `1.5px solid ${col.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ico size={20} color={col.accent} aria-hidden />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: 0 }}>
                      Completar: {cfg?.label}
                    </h2>
                    <p style={{ fontSize: 12, color: T.sub, margin: 0 }}>
                      Recepción #{modalData.idRecepcion} · {modalData.nombreProductor} · {modalData.kilosRecibidos?.toFixed(1)} kg
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalData(null)}
                  aria-label="Cerrar modal"
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: 'none',
                    background: 'transparent', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                    color: T.muted,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = T.red }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.muted }}
                >
                  <X size={17} aria-hidden />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleAvanzar} style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Responsable */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.sub, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Responsable *
                  </label>
                  <input
                    type="text"
                    value={form.responsable}
                    onChange={e => setForm({ ...form, responsable: e.target.value })}
                    placeholder="Nombre del encargado de esta etapa"
                    style={inputBase}
                    onFocus={onFocus} onBlur={onBlur}
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
                    rows={3}
                    placeholder="Condiciones, novedades de esta etapa..."
                    style={{ ...inputBase, resize: 'none' }}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>

                {/* Indicador siguiente etapa */}
                {esUltima ? (
                  <div style={{
                    background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC)',
                    border: '1px solid #99F6E4',
                    borderRadius: 12, padding: '14px 16px',
                  }}>
                    <p style={{ fontWeight: 800, color: T.teal, fontSize: 13, margin: '0 0 4px' }}>
                      🧊 Última etapa de procesamiento
                    </p>
                    <p style={{ fontSize: 12, color: T.sub, margin: 0, lineHeight: 1.5 }}>
                      Al completar, el sistema creará automáticamente un lote disponible en el{' '}
                      <strong style={{ color: T.teal }}>Cuarto Frío</strong> para despacho desde Almacenamiento.
                    </p>
                  </div>
                ) : sigCfg && (() => {
                  const sigCol = ETAPA_COLORS[sigCfg.colorKey]
                  const SigIco = sigCfg.icon
                  return (
                    <div style={{
                      background: sigCol.bg, border: `1px solid ${sigCol.border}`,
                      borderRadius: 12, padding: '12px 16px',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <ChevronRight size={16} color={sigCol.accent} aria-hidden />
                      <span style={{ fontSize: 12, color: sigCol.text, fontWeight: 600 }}>
                        Siguiente etapa:
                      </span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: '#fff', border: `1px solid ${sigCol.border}`,
                        color: sigCol.text, borderRadius: 99, padding: '3px 10px',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        <SigIco size={11} aria-hidden /> {sigCfg.label}
                      </span>
                    </div>
                  )
                })()}

                {/* Error */}
                {error && (
                  <div style={{
                    background: '#FEF2F2', border: '1px solid #FECACA',
                    borderRadius: 9, padding: '12px 14px',
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                  }}>
                    <AlertTriangle size={15} color={T.red} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
                    <p style={{ fontSize: 13, color: '#B91C1C', margin: 0 }}>{error}</p>
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setModalData(null)}
                    style={{
                      flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
                      border: '1.5px solid #E2E8F0', background: 'transparent', color: T.sub,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E2E8F0' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    style={{
                      ...gradBtn, flex: 1, justifyContent: 'center', padding: '11px 0',
                      opacity: guardando ? 0.65 : 1,
                    }}
                    onMouseEnter={e => { if (!guardando) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(20,184,166,0.40)' }}}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(20,184,166,0.28)' }}
                  >
                    <CheckCircle size={15} aria-hidden />
                    {guardando
                      ? 'Guardando...'
                      : esUltima
                        ? 'Completar y enviar a Cuarto Frío'
                        : 'Completar etapa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CARD DE GRUPO (PIPELINE POR RECEPCIÓN)
══════════════════════════════════════════════════════════════════ */
function GrupoCard({ grupo, etapaActual, onAvanzar, esUltimaEtapa, completado, index }) {
  const [hovered, setHovered] = useState(false)

  /* Calcular progreso de etapas completadas */
  const hechas      = grupo.etapas.filter(e => e.estado === 'COMPLETADO').length
  const pctEtapas   = Math.round((hechas / ETAPAS.length) * 100)
  const ultimaEtapa = esUltimaEtapa(etapaActual?.etapa)

  return (
    <div
      className="proc-fade"
      style={{
        background:    '#fff',
        border:        `1px solid ${hovered ? 'rgba(20,184,166,0.25)' : (completado ? '#CCFBF1' : T.border)}`,
        borderRadius:  14,
        overflow:      'hidden',
        transition:    'all 0.2s ease',
        boxShadow:     hovered ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        animationDelay:`${index * 0.05}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Borde top gradiente */}
      <div style={{
        height: 3,
        background: completado
          ? 'linear-gradient(90deg, #14B8A6, #10B981)'
          : 'linear-gradient(90deg, #F97316, #FBBF24)',
      }} />

      {/* Header de la card */}
      <div style={{
        padding:         '16px 20px 14px',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        gap:             12,
        flexWrap:        'wrap',
        borderBottom:    `1px solid ${T.border}`,
      }}>
        {/* Info productor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={grupo.nombreProductor} size={40} completed={completado} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
                Recepción #{grupo.idRecepcion}
              </span>
              {completado && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: '#CCFBF1', color: T.teal, borderRadius: 99,
                  padding: '3px 10px', fontSize: 11, fontWeight: 700,
                }}>
                  📦 En Cuarto Frío
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: T.sub, margin: '2px 0 0' }}>
              {grupo.nombreProductor} · {grupo.kilosRecibidos?.toFixed(1)} kg
            </p>
          </div>
        </div>

        {/* Botón avanzar */}
        {etapaActual && (
          <button
            onClick={() => onAvanzar(etapaActual)}
            style={{
              ...gradBtn,
              background: ultimaEtapa
                ? 'linear-gradient(135deg, #14B8A6, #06B6D4)'
                : 'linear-gradient(135deg, #F97316, #FBBF24)',
              boxShadow: ultimaEtapa
                ? '0 2px 10px rgba(20,184,166,0.30)'
                : '0 2px 10px rgba(249,115,22,0.30)',
              padding: '9px 16px', fontSize: 12, borderRadius: 9,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {ultimaEtapa ? (
              <><Snowflake size={13} aria-hidden /> Completar y congelar</>
            ) : (
              <><ChevronRight size={13} aria-hidden /> Avanzar etapa</>
            )}
          </button>
        )}
      </div>

      {/* Barra de progreso interna */}
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Progreso de etapas
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: completado ? T.teal : '#C2410C' }}>
            {hechas}/{ETAPAS.length} completadas
          </span>
        </div>
        <div style={{ background: '#F1F5F9', borderRadius: 999, height: 4, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{
            height: 4, borderRadius: 999,
            background: completado
              ? 'linear-gradient(90deg, #14B8A6, #10B981)'
              : 'linear-gradient(90deg, #F97316, #FBBF24)',
            width: `${pctEtapas}%`,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* Pipeline visual */}
      <div style={{ padding: '0 20px 20px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, minWidth: 'max-content' }}>
          {ETAPAS.map((etapa, idx) => {
            const cfg    = ETAPA_CONFIG[etapa]
            const col    = ETAPA_COLORS[cfg.colorKey]
            const Icono  = cfg.icon
            const reg    = grupo.etapas.find(e => e.etapa === etapa)
            const hecho  = reg?.estado === 'COMPLETADO'
            const activa = reg?.estado === 'EN_PROCESO'

            return (
              <div key={etapa} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                {/* Nodo de etapa */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: 72 }}>
                  {/* Círculo */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: hecho
                      ? '2px solid #34D399'
                      : activa
                        ? `2.5px solid ${col.accent}`
                        : `2px solid #E2E8F0`,
                    background: hecho
                      ? '#D1FAE5'
                      : activa
                        ? col.bg
                        : '#FAFAFA',
                    boxShadow: activa
                      ? `0 0 0 4px ${col.badge}`
                      : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                    {hecho
                      ? <CheckCircle size={20} color="#059669" aria-hidden />
                      : <Icono size={18} color={activa ? col.accent : '#CBD5E1'} aria-hidden />
                    }
                  </div>

                  {/* Label */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
                    color: hecho ? '#059669' : activa ? col.text : T.muted,
                  }}>
                    {cfg.label}
                  </span>

                  {/* Badge estado */}
                  {activa && (
                    <span style={{
                      background: col.badge, color: col.text,
                      border: `1px solid ${col.border}`,
                      borderRadius: 99, padding: '2px 7px', fontSize: 9, fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      Activa
                    </span>
                  )}
                  {hecho && reg?.responsable && (
                    <span style={{ fontSize: 9, color: T.muted, textAlign: 'center', maxWidth: 64, lineHeight: 1.3, fontStyle: 'italic' }}>
                      {reg.responsable.split(' ')[0]}
                    </span>
                  )}
                </div>

                {/* Conector */}
                {idx < ETAPAS.length - 1 ? (
                  <div style={{
                    marginTop: 20,
                    width: 20, height: 2, borderRadius: 1, flexShrink: 0,
                    background: hecho ? '#34D399' : '#E2E8F0',
                    transition: 'background 0.3s',
                  }} />
                ) : (
                  /* Conector final → Cuarto Frío */
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                    <div style={{
                      marginTop: 20,
                      width: 20, height: 2, borderRadius: 1, flexShrink: 0,
                      background: hecho ? '#14B8A6' : '#E2E8F0',
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: 72 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: hecho ? '2px solid #14B8A6' : '2px solid #E2E8F0',
                        background: hecho ? '#CCFBF1' : '#FAFAFA',
                        fontSize: 20,
                        opacity: hecho ? 1 : 0.3,
                      }}>
                        📦
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
                        color: hecho ? T.teal : T.muted,
                      }}>
                        Cuarto Frío
                      </span>
                      {hecho && (
                        <span style={{
                          background: '#CCFBF1', color: T.teal,
                          border: '1px solid #99F6E4',
                          borderRadius: 99, padding: '2px 7px', fontSize: 9, fontWeight: 800,
                        }}>
                          Lote creado
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Procesamiento
