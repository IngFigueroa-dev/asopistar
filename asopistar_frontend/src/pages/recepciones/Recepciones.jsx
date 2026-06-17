import { useState, useEffect } from 'react'
import {
  Plus, ClipboardCheck, Clock, Fish, CheckCircle,
  Calendar, AlertTriangle, X, FileText
} from 'lucide-react'
import api from '../../services/api'

/* ─── KEYFRAMES ────────────────────────────────────────────────── */
const STYLES = `
@keyframes rec-fade {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rec-modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
@keyframes rec-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
@keyframes rec-bar {
  from { width: 0%; }
}
.rec-fade       { animation: rec-fade    0.22s ease both; }
.rec-modal-in   { animation: rec-modal-in 0.22s ease both; }
.rec-skeleton   { animation: rec-pulse   1.6s ease infinite; background: #F1F5F9; border-radius: 6px; }
`

/* ─── TOKENS ────────────────────────────────────────────────────── */
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
  background:    'linear-gradient(135deg, #14B8A6, #06B6D4)',
  boxShadow:     '0 2px 12px rgba(20,184,166,0.28)',
  color:         '#fff',
  border:        'none',
  borderRadius:  10,
  fontWeight:    700,
  fontSize:      13,
  cursor:        'pointer',
  transition:    'all 0.2s ease',
  padding:       '10px 20px',
  display:       'flex',
  alignItems:    'center',
  gap:           7,
}

const inputBase = {
  width:          '100%',
  padding:        '10px 13px',
  border:         '1.5px solid #E2E8F0',
  borderRadius:   9,
  background:     '#FAFAFA',
  fontSize:       13,
  color:          T.text,
  outline:        'none',
  transition:     'all 0.2s ease',
  boxSizing:      'border-box',
}

/* ─── HELPERS ───────────────────────────────────────────────────── */
const Avatar = ({ name, size = 36 }) => {
  const initial = name?.charAt(0)?.toUpperCase() || '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.38, color: T.teal, flexShrink: 0,
    }}>{initial}</div>
  )
}

const Chip = ({ children, color = T.teal, bg = '#CCFBF1', icon }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: bg, color, borderRadius: 99, padding: '3px 10px',
    fontSize: 11, fontWeight: 700,
  }}>
    {icon && <span aria-hidden>{icon}</span>}
    {children}
  </span>
)

const capacidadColors = (pct) => {
  if (pct >= 90) return { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C', bar: T.red }
  if (pct >= 70) return { bg: '#FFFBEB', border: '#FED7AA', text: '#B45309', bar: T.amber }
  return           { bg: '#F0FDFA',  border: '#CCFBF1', text: T.teal,   bar: T.teal }
}

/* ─── SKELETON CARDS ────────────────────────────────────────────── */
const SkeletonCard = ({ delay = 0 }) => (
  <div style={{
    background: '#fff', border: `1px solid ${T.border}`, borderRadius: 14,
    overflow: 'hidden', animationDelay: `${delay}s`,
  }} className="rec-fade">
    <div style={{ height: 3, background: 'linear-gradient(90deg, #E2E8F0, #F1F5F9)' }} />
    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="rec-skeleton" style={{ width: 72, height: 22 }} />
        <div className="rec-skeleton" style={{ width: 100, height: 16 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="rec-skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
        <div className="rec-skeleton" style={{ width: 130, height: 16 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div className="rec-skeleton" style={{ width: 70, height: 32 }} />
        <div className="rec-skeleton" style={{ width: 24, height: 16 }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="rec-skeleton" style={{ width: 100, height: 22, borderRadius: 99 }} />
        <div className="rec-skeleton" style={{ width: 80,  height: 22, borderRadius: 99 }} />
      </div>
    </div>
    <div style={{ background: '#FAFBFC', borderTop: `1px solid ${T.border}`, padding: '12px 20px' }}>
      <div className="rec-skeleton" style={{ width: '70%', height: 14 }} />
    </div>
  </div>
)

/* ══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════ */
function Recepciones() {
  const [recepciones,     setRecepciones]     = useState([])
  const [turnos,          setTurnos]          = useState([])
  const [loading,         setLoading]         = useState(true)
  const [mostrarModal,    setMostrarModal]    = useState(false)
  const [error,           setError]           = useState('')
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null)
  const [capacidad,       setCapacidad]       = useState(null)
  const [form, setForm] = useState({
    fechaHora: '', kilosRecibidos: '',
    observaciones: '', idProductor: '', idTurno: '',
  })

  /* ── focus ring helpers ── */
  const onFocus  = e => { e.target.style.borderColor = T.teal; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }
  const onBlur   = e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }

  useEffect(() => {
    Promise.all([cargarRecepciones(), cargarTurnos(), cargarCapacidad()])
  }, [])

  /* ── DATA LOADERS (SIN MODIFICAR LÓGICA) ── */
  const cargarRecepciones = async () => {
    try {
      const res = await api.get('/recepciones')
      setRecepciones(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const cargarCapacidad = async () => {
    try {
      const res = await api.get('/capacidad-cuarto-frio')
      setCapacidad(res.data)
    } catch { /* silencioso */ }
  }

  const cargarTurnos = async () => {
    try {
      const res = await api.get('/turnos-pesca')
      setTurnos(res.data.filter(t => t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'))
    } catch (err) { console.error(err) }
  }

  /* ── HANDLERS (SIN MODIFICAR LÓGICA) ── */
  const handleTurnoChange = async (idTurno) => {
    if (!idTurno) {
      setTurnoSeleccionado(null)
      setForm(prev => ({ ...prev, idTurno: '', idProductor: '' }))
      return
    }
    const turno = turnos.find(t => t.idTurno === parseInt(idTurno))
    setForm(prev => ({
      ...prev,
      idTurno:     idTurno,
      idProductor: turno?.idProductor || '',
    }))
    if (turno?.idSiembra) {
      try {
        const res = await api.get(`/seguimientos/siembra/${turno.idSiembra}/ultimo`)
        setTurnoSeleccionado({ ...turno, cantidadEstimada: res.data.cantidadEstimada, pesoPromedio: res.data.pesoPromedio })
      } catch {
        setTurnoSeleccionado(turno)
      }
    } else {
      setTurnoSeleccionado(turno)
    }
  }

  const abrirModal = (turnoPreseleccionado = null) => {
    setError('')
    setTurnoSeleccionado(null)
    setForm({ fechaHora: '', kilosRecibidos: '', observaciones: '', idProductor: '', idTurno: '' })
    setMostrarModal(true)
    if (turnoPreseleccionado) {
      setTimeout(() => handleTurnoChange(String(turnoPreseleccionado.idTurno)), 0)
    }
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setError('')
    setTurnoSeleccionado(null)
    setForm({ fechaHora: '', kilosRecibidos: '', observaciones: '', idProductor: '', idTurno: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/recepciones', {
        ...form,
        kilosRecibidos: parseFloat(form.kilosRecibidos),
        idProductor:    parseInt(form.idProductor),
        idTurno:        parseInt(form.idTurno),
        fechaHora:      form.fechaHora + ':00',
      })
      cerrarModal()
      await Promise.all([cargarRecepciones(), cargarTurnos()])
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message
        || 'Error al registrar la recepción. Verifica los datos.'
      setError(msg)
    }
  }

  /* ── CÁLCULOS PARA SUBTÍTULO ── */
  const totalKg = recepciones.reduce((s, r) => s + (r.kilosRecibidos || 0), 0)

  /* ── KG OVERFLOW CHECK ── */
  const hayOverflow = form.kilosRecibidos && capacidad &&
    Number(form.kilosRecibidos) > Number(capacidad.kilosDisponibles)

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
        marginBottom: 28,
        position:     'relative',
        overflow:     'hidden',
      }}>
        {/* Burbujas decorativas */}
        <div aria-hidden style={{ position:'absolute', top:-30, right:60,  width:120, height:120, borderRadius:'50%', background:'rgba(20,184,166,0.07)' }} />
        <div aria-hidden style={{ position:'absolute', top:20,  right:-20, width:80,  height:80,  borderRadius:'50%', background:'rgba(6,182,212,0.06)'  }} />
        <div aria-hidden style={{ position:'absolute', bottom:-20, right:140, width:60, height:60, borderRadius:'50%', background:'rgba(20,184,166,0.05)' }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
          {/* Izquierda */}
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{
              width:52, height:52, borderRadius:14,
              background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
              boxShadow:  '0 4px 14px rgba(20,184,166,0.35)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <ClipboardCheck size={26} color="#fff" aria-hidden />
            </div>
            <div>
              <h1 style={{ fontSize:22, fontWeight:800, color:T.text, margin:0, lineHeight:1.2 }}>
                Recepciones de Pescado
              </h1>
              <p style={{ color:T.sub, fontSize:13, margin:'4px 0 0', fontWeight:500 }}>
                {loading
                  ? 'Cargando...'
                  : `${recepciones.length} recepciones registradas · ${totalKg.toLocaleString('es-CO')} kg totales recibidos`
                }
              </p>
            </div>
          </div>

          {/* Botón primario */}
          <button
            onClick={() => abrirModal()}
            style={gradBtn}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(20,184,166,0.40)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';   e.currentTarget.style.boxShadow='0 2px 12px rgba(20,184,166,0.28)' }}
          >
            <Plus size={16} aria-hidden /> Nueva Recepción
          </button>
        </div>
      </div>

      {/* ── PANEL TURNOS PENDIENTES ──────────────────────────────── */}
      {turnos.length > 0 && (
        <div style={{
          background:   'linear-gradient(135deg, #FFFBEB, #FFF7ED)',
          border:       '1px solid #FED7AA',
          borderRadius: 14,
          marginBottom: 28,
          overflow:     'hidden',
        }} className="rec-fade">
          {/* Header del panel */}
          <div style={{ padding:'16px 20px 14px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:10,
              background:'rgba(245,158,11,0.15)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <Clock size={17} color={T.amber} aria-hidden />
            </div>
            <div>
              <p style={{ fontWeight:800, color:'#92400E', fontSize:14, margin:0 }}>
                Turnos esperando recepción ({turnos.length})
              </p>
              <p style={{ color:'#B45309', fontSize:12, margin:0 }}>
                El pescado de estos productores está listo para ingresar
              </p>
            </div>
          </div>

          {/* Filas de turno */}
          <div style={{ padding:'0 16px 16px', display:'flex', flexDirection:'column', gap:8 }}>
            {turnos.slice(0, 3).map((t, i) => (
              <div key={t.idTurno}
                style={{
                  background: '#fff', border:'1px solid #FEF3C7', borderRadius:10,
                  padding:'12px 16px',
                  display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap',
                  animation: `rec-fade 0.22s ease both`, animationDelay: `${i * 0.06}s`,
                }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', flex:1 }}>
                  <Avatar name={t.nombreProductor} size={34} />
                  <div>
                    <p style={{ fontWeight:700, color:T.text, fontSize:13, margin:0 }}>{t.nombreProductor}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3, flexWrap:'wrap' }}>
                      {t.codigoEstanque && (
                        <Chip bg="#CCFBF1" color={T.teal} icon={<Fish size={10} />}>
                          {t.codigoEstanque}
                        </Chip>
                      )}
                      <span style={{ display:'flex', alignItems:'center', gap:3, color:T.muted, fontSize:11 }}>
                        <Calendar size={10} aria-hidden /> {t.fechaProgramada}
                      </span>
                      <Chip
                        bg={t.estado === 'CONFIRMADO' ? '#EFF6FF' : '#FEF3C7'}
                        color={t.estado === 'CONFIRMADO' ? '#1D4ED8' : '#92400E'}
                      >
                        {t.estado}
                      </Chip>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => abrirModal(t)}
                  style={{
                    ...gradBtn, padding:'7px 14px', fontSize:12, borderRadius:8,
                    boxShadow:'0 2px 8px rgba(20,184,166,0.22)', flexShrink:0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 14px rgba(20,184,166,0.36)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';   e.currentTarget.style.boxShadow='0 2px 8px rgba(20,184,166,0.22)' }}
                >
                  Registrar entrada →
                </button>
              </div>
            ))}

            {turnos.length > 3 && (
              <div style={{ textAlign:'center', paddingTop:4 }}>
                <Chip bg="#CCFBF1" color={T.teal}>
                  + {turnos.length - 3} más turnos pendientes
                </Chip>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CONTENIDO PRINCIPAL ─────────────────────────────────── */}
      {loading ? (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
          gap:18,
        }}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} delay={i * 0.05} />)}
        </div>

      ) : recepciones.length === 0 ? (
        /* Estado vacío */
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'64px 24px', textAlign:'center',
        }} className="rec-fade">
          <div style={{
            width:72, height:72, borderRadius:20,
            background:'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
            display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20,
          }}>
            <ClipboardCheck size={34} color={T.teal} aria-hidden />
          </div>
          <h3 style={{ fontSize:17, fontWeight:800, color:T.text, margin:'0 0 8px' }}>
            No hay recepciones registradas
          </h3>
          <p style={{ color:T.sub, fontSize:13, margin:'0 0 24px', maxWidth:340 }}>
            Cuando un productor traiga su cosecha, registra la entrada aquí
          </p>
          <button
            onClick={() => abrirModal()}
            style={gradBtn}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(20,184,166,0.40)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';   e.currentTarget.style.boxShadow='0 2px 12px rgba(20,184,166,0.28)' }}
          >
            <Plus size={15} aria-hidden /> Nueva Recepción
          </button>
        </div>

      ) : (
        /* Grid de cards */
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
          gap:18,
        }}>
          {recepciones.map((r, i) => (
            <RecepcionCard key={r.idRecepcion} r={r} index={i} />
          ))}
        </div>
      )}

      {/* ── MODAL ───────────────────────────────────────────────── */}
      {mostrarModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) cerrarModal() }}
          style={{
            position:'fixed', inset:0,
            background:'rgba(15,23,42,0.45)',
            backdropFilter:'blur(4px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            zIndex:50, padding:'16px',
          }}
        >
          <div
            className="rec-modal-in"
            style={{
              background:'#fff', borderRadius:20,
              width:'100%', maxWidth:540,
              maxHeight:'92vh', display:'flex', flexDirection:'column',
              boxShadow:'0 24px 60px rgba(15,23,42,0.22)',
            }}
          >
            {/* Header modal */}
            <div style={{
              padding:'22px 24px 18px',
              borderBottom:`1px solid ${T.border}`,
              display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
              flexShrink:0,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  width:40, height:40, borderRadius:11,
                  background:'linear-gradient(135deg, #14B8A6, #06B6D4)',
                  boxShadow:'0 3px 10px rgba(20,184,166,0.30)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <ClipboardCheck size={20} color="#fff" aria-hidden />
                </div>
                <div>
                  <h2 style={{ fontSize:16, fontWeight:800, color:T.text, margin:0 }}>Nueva Recepción</h2>
                  <p style={{ fontSize:12, color:T.sub, margin:0 }}>Registra la entrada de pescado a la planta</p>
                </div>
              </div>
              <button
                onClick={cerrarModal}
                aria-label="Cerrar modal"
                style={{
                  width:32, height:32, borderRadius:8, border:'none',
                  background:'transparent', cursor:'pointer', display:'flex',
                  alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='#FEE2E2'; e.currentTarget.style.color=T.red }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=T.muted }}
              >
                <X size={17} aria-hidden />
              </button>
            </div>

            {/* Body scrollable */}
            <form onSubmit={handleSubmit} style={{ overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

              {/* ── SELECT TURNO ── */}
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:T.sub, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>
                  Turno de pesca *
                </label>
                <select
                  required
                  value={form.idTurno}
                  onChange={e => handleTurnoChange(e.target.value)}
                  style={{ ...inputBase, appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center', paddingRight:34 }}
                  onFocus={onFocus} onBlur={onBlur}
                >
                  <option value="">Seleccionar turno pendiente...</option>
                  {turnos.map(t => (
                    <option key={t.idTurno} value={t.idTurno}>
                      {t.nombreProductor} — {t.fechaProgramada}
                    </option>
                  ))}
                </select>
              </div>

              {/* ── PANEL INFO TURNO ── */}
              {form.idTurno && turnoSeleccionado && (
                <div style={{
                  background:'linear-gradient(135deg, #F0FDFA, #F8FAFC)',
                  border:'1px solid #CCFBF1',
                  borderRadius:12, overflow:'hidden',
                }} className="rec-fade">
                  <div style={{ padding:'10px 14px', borderBottom:'1px solid #CCFBF1' }}>
                    <p style={{ fontSize:10, fontWeight:800, color:T.teal, textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>
                      Referencia del biólogo
                    </p>
                  </div>
                  <div style={{ padding:'12px 14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                      <p style={{ fontSize:10, color:T.sub, margin:'0 0 2px', fontWeight:600 }}>Productor</p>
                      <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:0 }}>{turnoSeleccionado.nombreProductor}</p>
                    </div>
                    <div>
                      <p style={{ fontSize:10, color:T.sub, margin:'0 0 2px', fontWeight:600 }}>Estanque</p>
                      {turnoSeleccionado.codigoEstanque
                        ? <Chip bg="#CCFBF1" color={T.teal} icon={<Fish size={10} />}>{turnoSeleccionado.codigoEstanque}</Chip>
                        : <p style={{ fontSize:13, fontWeight:700, color:T.muted, margin:0 }}>—</p>
                      }
                    </div>
                    {turnoSeleccionado.cantidadEstimada && (
                      <div>
                        <p style={{ fontSize:10, color:T.sub, margin:'0 0 2px', fontWeight:600 }}>Peces estimados</p>
                        <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:0 }}>
                          {turnoSeleccionado.cantidadEstimada?.toLocaleString('es-CO')} unid.
                        </p>
                      </div>
                    )}
                    {turnoSeleccionado.pesoPromedio && (
                      <div>
                        <p style={{ fontSize:10, color:T.sub, margin:'0 0 2px', fontWeight:600 }}>Peso promedio</p>
                        <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:0 }}>
                          {turnoSeleccionado.pesoPromedio} g/pez
                        </p>
                      </div>
                    )}
                  </div>
                  {turnoSeleccionado.cantidadEstimada && turnoSeleccionado.pesoPromedio && (
                    <div style={{ margin:'0 14px 14px', background:'#CCFBF1', borderRadius:8, padding:'10px 14px' }}>
                      <p style={{ fontSize:10, color:T.teal, fontWeight:700, margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                        📊 Kilos estimados de cosecha
                      </p>
                      <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                        <span style={{ fontSize:22, fontWeight:900, color:T.teal }}>
                          ≈ {((turnoSeleccionado.cantidadEstimada * turnoSeleccionado.pesoPromedio) / 1000).toFixed(1)}
                        </span>
                        <span style={{ fontSize:13, fontWeight:700, color:'#0D9488' }}>kg</span>
                      </div>
                      <p style={{ fontSize:11, color:'#0D9488', margin:'3px 0 0' }}>
                        Referencia para validar los kilos reales recibidos
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── FECHA / KILOS ── */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:T.sub, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>
                    Fecha y hora *
                  </label>
                  <input
                    type="datetime-local" required
                    value={form.fechaHora}
                    onChange={e => setForm({ ...form, fechaHora: e.target.value })}
                    style={inputBase}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:T.sub, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>
                    Kilos recibidos *
                  </label>
                  <input
                    type="number" step="0.01" min="0.01" required
                    value={form.kilosRecibidos}
                    onChange={e => setForm({ ...form, kilosRecibidos: e.target.value })}
                    placeholder="0.00"
                    style={{
                      ...inputBase,
                      borderColor: hayOverflow ? T.red : '#E2E8F0',
                      boxShadow:   hayOverflow ? `0 0 0 3px rgba(239,68,68,0.12)` : 'none',
                    }}
                    onFocus={e => { if (!hayOverflow) onFocus(e) }}
                    onBlur={e =>  { if (!hayOverflow) onBlur(e)  }}
                  />
                </div>
              </div>

              {/* ── OBSERVACIONES ── */}
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:T.sub, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>
                  Observaciones
                </label>
                <textarea
                  value={form.observaciones}
                  onChange={e => setForm({ ...form, observaciones: e.target.value })}
                  rows={3}
                  placeholder="Estado del pescado, condiciones de entrega..."
                  style={{ ...inputBase, resize:'none' }}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {/* ── PANEL CAPACIDAD CUARTO FRÍO ── */}
              {capacidad && (() => {
                const pct = capacidad.porcentajeOcupacion
                const c   = capacidadColors(pct)
                return (
                  <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                      <span aria-hidden style={{ fontSize:16 }}>❄️</span>
                      <p style={{ fontWeight:800, color: c.text, fontSize:13, margin:0 }}>Capacidad del Cuarto Frío</p>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                      <div>
                        <p style={{ fontSize:10, color: c.text, fontWeight:700, margin:'0 0 3px', textTransform:'uppercase', opacity:0.7 }}>Disponible</p>
                        <p style={{ fontSize:18, fontWeight:900, color: c.text, margin:0 }}>
                          {Number(capacidad.kilosDisponibles).toLocaleString('es-CO')} <span style={{ fontSize:12, fontWeight:600 }}>kg</span>
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize:10, color: c.text, fontWeight:700, margin:'0 0 3px', textTransform:'uppercase', opacity:0.7 }}>Ocupado</p>
                        <p style={{ fontSize:13, fontWeight:700, color: c.text, margin:0 }}>
                          {Number(capacidad.kilosActuales).toLocaleString('es-CO')} <span style={{ fontWeight:400, fontSize:11 }}>de {Number(capacidad.capacidadMaxKg).toLocaleString('es-CO')} kg</span>
                        </p>
                      </div>
                    </div>
                    {/* Barra de progreso */}
                    <div style={{ background:'#F1F5F9', borderRadius:999, height:8, overflow:'hidden' }}>
                      <div style={{
                        height:8, borderRadius:999,
                        background: c.bar,
                        width: `${Math.min(pct, 100)}%`,
                        transition: 'width 0.6s ease',
                        animation: 'rec-bar 0.8s ease',
                      }} />
                    </div>
                    <p style={{ fontSize:11, color: c.text, textAlign:'right', margin:'4px 0 0', opacity:0.75 }}>
                      {pct}% ocupado
                    </p>

                    {/* Alerta overflow */}
                    {hayOverflow && (
                      <div style={{
                        marginTop:10, background:'#FEF2F2', border:'1px solid #FECACA',
                        borderRadius:8, padding:'10px 12px',
                        display:'flex', alignItems:'flex-start', gap:8,
                      }}>
                        <AlertTriangle size={15} color={T.red} style={{ flexShrink:0, marginTop:1 }} aria-hidden />
                        <p style={{ fontSize:12, color:'#B91C1C', fontWeight:600, margin:0 }}>
                          Los kilos a recibir ({Number(form.kilosRecibidos).toLocaleString('es-CO')} kg) superan el espacio disponible en el cuarto frío.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* ── ERROR ── */}
              {error && (
                <div style={{
                  background:'#FEF2F2', border:`1px solid #FECACA`,
                  borderRadius:9, padding:'12px 14px',
                  display:'flex', alignItems:'flex-start', gap:8,
                }}>
                  <AlertTriangle size={15} color={T.red} style={{ flexShrink:0, marginTop:1 }} aria-hidden />
                  <p style={{ fontSize:13, color:'#B91C1C', margin:0 }}>{error}</p>
                </div>
              )}

              {/* ── FOOTER MODAL ── */}
              <div style={{ display:'flex', gap:10, paddingTop:4 }}>
                <button
                  type="button" onClick={cerrarModal}
                  style={{
                    flex:1, padding:'11px 0', borderRadius:10, fontSize:13, fontWeight:700,
                    border:'1.5px solid #E2E8F0', background:'transparent', color:T.sub, cursor:'pointer', transition:'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='#F8FAFC'; e.currentTarget.style.borderColor='#CBD5E1' }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='#E2E8F0' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ ...gradBtn, flex:1, justifyContent:'center', padding:'11px 0' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(20,184,166,0.40)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';   e.currentTarget.style.boxShadow='0 2px 12px rgba(20,184,166,0.28)' }}
                >
                  <CheckCircle size={15} aria-hidden /> Registrar Recepción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CARD DE RECEPCIÓN
══════════════════════════════════════════════════════════════════ */
function RecepcionCard({ r, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="rec-fade"
      style={{
        background:   '#fff',
        border:       `1px solid ${hovered ? 'rgba(20,184,166,0.25)' : T.border}`,
        borderRadius: 14,
        overflow:     'hidden',
        cursor:       'default',
        transition:   'all 0.2s ease',
        transform:    hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow:    hovered ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        animationDelay: `${index * 0.04}s`,
        display:      'flex',
        flexDirection:'column',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Borde top gradiente */}
      <div style={{ height:3, background:'linear-gradient(90deg, #14B8A6, #06B6D4)', flexShrink:0 }} />

      {/* Header card */}
      <div style={{
        padding:'14px 18px 12px',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:8,
      }}>
        <span style={{
          fontFamily:'monospace', fontSize:11, fontWeight:700,
          background:T.border, color:T.muted, borderRadius:6, padding:'3px 8px',
        }}>
          #REC-{String(r.idRecepcion).padStart(3,'0')}
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:4, color:T.muted, fontSize:11 }}>
          <Clock size={11} aria-hidden />
          {r.fechaHora?.replace('T',' ').substring(0,16)}
        </span>
      </div>

      {/* Cuerpo */}
      <div style={{ padding:'0 18px 14px', flex:1 }}>
        {/* Productor */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <Avatar name={r.nombreProductor} size={36} />
          <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{r.nombreProductor}</span>
        </div>

        {/* Kilos — métrica principal */}
        <div style={{ display:'flex', alignItems:'baseline', gap:5, marginBottom:12 }}>
          <span style={{ fontSize:26, fontWeight:900, color:T.teal, lineHeight:1 }}>
            {Number(r.kilosRecibidos).toLocaleString('es-CO')}
          </span>
          <span style={{ fontSize:13, fontWeight:600, color:T.muted }}>kg</span>
        </div>

        {/* Chips de estado */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <Chip bg="#D1FAE5" color="#065F46" icon={<CheckCircle size={10} />}>
            🐟 Lote creado
          </Chip>
          {r.codigoEstanque && (
            <Chip bg="#CCFBF1" color={T.teal} icon={<Fish size={10} />}>
              {r.codigoEstanque}
            </Chip>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background:'#FAFBFC', borderTop:`1px solid ${T.border}`,
        padding:'10px 18px',
        display:'flex', alignItems:'flex-start', gap:6,
      }}>
        <FileText size={12} color={T.muted} style={{ flexShrink:0, marginTop:2 }} aria-hidden />
        {r.observaciones
          ? <p style={{
              fontSize:12, color:T.sub, margin:0, fontStyle:'italic',
              display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
            }}>{r.observaciones}</p>
          : <p style={{ fontSize:12, color:T.muted, margin:0 }}>Sin observaciones</p>
        }
      </div>
    </div>
  )
}

export default Recepciones
