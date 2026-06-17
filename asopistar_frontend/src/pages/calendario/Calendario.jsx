// src/pages/calendario/Calendario.jsx
import { useState, useEffect, useCallback } from 'react'
import { Calendar, Plus, Clock, Fish, AlertTriangle, X, CheckCircle, ChevronRight } from 'lucide-react'
import api from '../../services/api'

/* ─── Tokens visuales del sistema ──────────────────────────────────────────── */
const T = {
  teal:    '#14B8A6',
  cyan:    '#06B6D4',
  green:   '#10B981',
  amber:   '#F59E0B',
  red:     '#EF4444',
  blue:    '#3B82F6',
  txt:     '#0F172A',
  txt2:    '#64748B',
  muted:   '#94A3B8',
  bg:      '#F8FAFC',
  card:    '#FFFFFF',
  border:  '#F1F5F9',
  border2: '#E2E8F0',
}

const ESTADOS_TURNO = {
  PENDIENTE:  { label: 'Pendiente',  color: T.amber, bg: '#FEF3C7', text: '#92400E' },
  CONFIRMADO: { label: 'Confirmado', color: T.blue,  bg: '#DBEAFE', text: '#1E40AF' },
  REALIZADO:  { label: 'Realizado',  color: T.green, bg: '#D1FAE5', text: '#065F46' },
  CANCELADO:  { label: 'Cancelado',  color: T.red,   bg: '#FEE2E2', text: '#991B1B' },
}

const FILTROS = [
  { key: 'TODOS',     label: 'Todos',     color: T.teal  },
  { key: 'PENDIENTE', label: 'Pendiente', color: T.amber },
  { key: 'CONFIRMADO',label: 'Confirmado',color: T.blue  },
  { key: 'REALIZADO', label: 'Realizado', color: T.green },
  { key: 'CANCELADO', label: 'Cancelado', color: T.red   },
]

const FORM_INICIAL = {
  fechaProgramada: '', horaProgramada: '',
  tipoPrioridad: 'NORMAL', motivoEmergencia: '',
  estado: 'PENDIENTE', idSiembra: '', idProductor: '',
}

const hoy = () => new Date().toISOString().split('T')[0]
const horaActual = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

/* ─── Estilos globales (keyframes) ─────────────────────────────────────────── */
const GLOBAL_STYLES = `
  @keyframes cal-fade { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
  @keyframes cal-modal-in { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
  @keyframes cal-pulse { 0%,100% { opacity:1 } 50% { opacity:.45 } }
  .cal-card { animation: cal-fade 0.22s ease both }
  .cal-modal { animation: cal-modal-in 0.2s ease both }
  .cal-sk { animation: cal-pulse 1.4s ease infinite }
  .cal-chip-active { transition: all 0.15s ease }
  .cal-turno-card { transition: all 0.2s ease; cursor:default }
`

/* ─── Componentes auxiliares ────────────────────────────────────────────────── */

/* Avatar de inicial */
const Avatar = ({ nombre, size = 34 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: T.teal, fontWeight: 700, fontSize: size * 0.38,
    flexShrink: 0,
  }}>
    {nombre?.charAt(0)?.toUpperCase() || '?'}
  </div>
)

/* Badge de posición */
const PosBadge = ({ pos }) => (
  <div style={{
    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700,
    background: pos === 0 ? `linear-gradient(135deg, ${T.teal}, ${T.cyan})`
               : pos === 1 ? '#CCFBF1' : '#F1F5F9',
    color: pos === 0 ? '#fff' : pos === 1 ? T.teal : T.txt2,
    boxShadow: pos === 0 ? `0 2px 8px rgba(20,184,166,0.35)` : 'none',
  }}>
    {pos + 1}
  </div>
)

/* Skeleton card */
const SkCard = () => (
  <div style={{
    background: T.card, borderRadius: 14, border: `1px solid ${T.border}`,
    overflow: 'hidden', padding: '18px 20px',
  }}>
    <div style={{ height: 3, background: '#F1F5F9', marginBottom: 16 }} className="cal-sk" />
    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F1F5F9' }} className="cal-sk" />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, width: '60%', marginBottom: 8 }} className="cal-sk" />
        <div style={{ height: 10, background: '#F1F5F9', borderRadius: 6, width: '40%' }} className="cal-sk" />
      </div>
    </div>
    <div style={{ height: 10, background: '#F1F5F9', borderRadius: 6, width: '80%', marginBottom: 8 }} className="cal-sk" />
    <div style={{ height: 10, background: '#F1F5F9', borderRadius: 6, width: '55%' }} className="cal-sk" />
  </div>
)

/* Input style reutilizable */
const inputBase = {
  width: '100%', padding: '10px 12px',
  border: `1.5px solid ${T.border2}`, borderRadius: 9,
  background: '#FAFAFA', fontSize: 14, color: T.txt,
  outline: 'none', boxSizing: 'border-box', transition: 'all 0.15s',
}
const inputFocus = {
  borderColor: T.teal,
  boxShadow: '0 0 0 3px rgba(20,184,166,0.12)',
  background: '#fff',
}

/* Input con focus state */
function StyledInput({ as: Tag = 'input', ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <Tag
      {...props}
      style={{ ...inputBase, ...(focused ? inputFocus : {}), ...(props.disabled ? { opacity: 0.55, cursor: 'not-allowed' } : {}), ...props.style }}
      onFocus={e => { setFocused(true); props.onFocus?.(e) }}
      onBlur={e => { setFocused(false); props.onBlur?.(e) }}
    />
  )
}

/* ─── Componente principal ──────────────────────────────────────────────────── */
function Calendario() {
  const rol         = localStorage.getItem('rol') || ''
  const esProductor = rol === 'ROLE_PRODUCTOR'
  const idProductor = esProductor ? parseInt(localStorage.getItem('idProductor')) : null

  const [turnos,       setTurnos]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filtro,       setFiltro]       = useState('TODOS')
  const [mostrarModal, setMostrarModal] = useState(false)

  const [form,             setForm]             = useState(FORM_INICIAL)
  const [loadingModal,     setLoadingModal]     = useState(false)
  const [siembrasSinTurno, setSiembrasSinTurno] = useState([])
  const [productoresModal, setProductoresModal] = useState([])
  const [errorModal,       setErrorModal]       = useState('')
  const [guardando,        setGuardando]        = useState(false)

  /* ── Carga de turnos ── */
  const cargarTurnos = useCallback(async () => {
    try {
      const res = esProductor
        ? await api.get(`/turnos-pesca/productor/${idProductor}`)
        : await api.get('/turnos-pesca/ordenados')
      setTurnos(res.data)
    } catch (err) { console.error('Error cargando turnos:', err) }
    finally { setLoading(false) }
  }, [esProductor, idProductor])

  useEffect(() => { cargarTurnos() }, [cargarTurnos])

  /* ── Abrir modal ── */
  const abrirModal = async () => {
    setMostrarModal(true)
    setForm(FORM_INICIAL)
    setErrorModal('')
    setSiembrasSinTurno([])
    setProductoresModal([])
    setLoadingModal(true)
    try {
      const [resSiembras, resTurnos] = await Promise.all([
        api.get('/siembras/listas-para-cosechar'),
        api.get('/turnos-pesca/ordenados'),
      ])
      const turnosActivos = resTurnos.data.filter(t => t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO')
      const disponibles   = resSiembras.data.filter(s => !turnosActivos.some(t => t.idSiembra === s.idSiembra))
      setSiembrasSinTurno(disponibles)

      const mapaProductores = new Map()
      for (const s of disponibles) {
        if (!mapaProductores.has(s.idProductor)) {
          mapaProductores.set(s.idProductor, { idProductor: s.idProductor, nombreProductor: s.nombreProductor })
        }
      }
      setProductoresModal([...mapaProductores.values()])
    } catch (err) {
      console.error('Error cargando datos del modal:', err)
      setErrorModal('Error al cargar los datos. Intenta de nuevo.')
    } finally {
      setLoadingModal(false)
    }
  }

  const cerrarModal = () => { setMostrarModal(false); setForm(FORM_INICIAL); setErrorModal('') }

  const siembrasFiltradas = form.idProductor
    ? siembrasSinTurno.filter(s => s.idProductor === parseInt(form.idProductor))
    : []

  const minHora = form.fechaProgramada === hoy() ? horaActual() : undefined

  const handleProductorChange = (e) => {
    setForm({ ...form, idProductor: e.target.value, idSiembra: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorModal('')
    if (form.fechaProgramada === hoy() && form.horaProgramada < horaActual()) {
      setErrorModal('La hora no puede ser anterior a la hora actual.')
      return
    }
    setGuardando(true)
    try {
      const horaCombinada = form.fechaProgramada + 'T' + form.horaProgramada + ':00'
      await api.post('/turnos-pesca', {
        ...form,
        horaProgramada: horaCombinada,
        idSiembra:   parseInt(form.idSiembra),
        idProductor: parseInt(form.idProductor),
      })
      cerrarModal()
      await cargarTurnos()
    } catch (err) {
      const msg = err.response?.data?.mensaje
        || err.response?.data?.message
        || 'Error al guardar el turno. Verifica los datos.'
      setErrorModal(msg)
    } finally {
      setGuardando(false)
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/turnos-pesca/${id}/estado?nuevoEstado=${nuevoEstado}`)
      await cargarTurnos()
    } catch (err) { console.error('Error cambiando estado:', err) }
  }

  const turnosFiltrados = filtro === 'TODOS' ? turnos : turnos.filter(t => t.estado === filtro)

  /* Conteo por estado para badges */
  const conteo = FILTROS.reduce((acc, f) => {
    acc[f.key] = f.key === 'TODOS' ? turnos.length : turnos.filter(t => t.estado === f.key).length
    return acc
  }, {})

  const pendientesCnt = turnos.filter(t => t.estado === 'PENDIENTE').length

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* Estilos globales */}
      <style>{GLOBAL_STYLES}</style>

      <div style={{ background: T.bg, minHeight: '100%', padding: '0 0 40px' }}>

        {/* ══ HERO HEADER ══════════════════════════════════════════════════════ */}
        <div style={{
          background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC, #EFF6FF)',
          border: `1px solid ${T.border2}`,
          borderRadius: 20, padding: '28px 32px',
          marginBottom: 28, position: 'relative', overflow: 'hidden',
        }}>
          {/* Burbujas decorativas */}
          {[
            { w:140, h:140, top:-40, right:80,  bg:'rgba(20,184,166,0.07)'  },
            { w:80,  h:80,  top: 20, right:20,  bg:'rgba(6,182,212,0.08)'   },
            { w:60,  h:60,  bottom:-20,right:160,bg:'rgba(16,185,129,0.06)' },
          ].map((b, i) => (
            <div key={i} style={{
              position:'absolute', width:b.w, height:b.h, borderRadius:'50%',
              background:b.bg, top:b.top, right:b.right, bottom:b.bottom,
              pointerEvents:'none',
            }} />
          ))}

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              {/* Ícono */}
              <div style={{
                width:52, height:52, borderRadius:14,
                background:'linear-gradient(135deg,#14B8A6,#06B6D4)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 16px rgba(20,184,166,0.30)', flexShrink:0,
              }}>
                <Calendar size={24} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize:22, fontWeight:800, color:T.txt, margin:0, lineHeight:1.2 }}>
                  {esProductor ? 'Mis Turnos de Pesca' : 'Calendario de Pesca'}
                </h1>
                <p style={{ color:T.txt2, fontSize:13.5, margin:'4px 0 0', fontWeight:500 }}>
                  {turnos.length} turno{turnos.length !== 1 ? 's' : ''} registrado{turnos.length !== 1 ? 's' : ''}
                  {pendientesCnt > 0 && (
                    <span style={{ color:T.amber, fontWeight:700 }}>
                      {' '}· {pendientesCnt} pendiente{pendientesCnt !== 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {!esProductor && (
              <button
                onClick={abrirModal}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(20,184,166,0.40)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 3px 12px rgba(20,184,166,0.28)' }}
                style={{
                  display:'flex', alignItems:'center', gap:8,
                  background:'linear-gradient(135deg,#14B8A6,#06B6D4)',
                  color:'#fff', border:'none', borderRadius:11,
                  padding:'11px 20px', fontWeight:700, fontSize:14,
                  cursor:'pointer', boxShadow:'0 3px 12px rgba(20,184,166,0.28)',
                  transition:'all 0.2s ease',
                }}>
                <Plus size={17} /> Agregar Turno
              </button>
            )}
          </div>
        </div>

        {/* ══ BANNER PRIORIDAD (solo no-productores) ═════════════════════════ */}
        {!esProductor && (
          <div style={{
            background:'linear-gradient(135deg, #F0FDFA, #EFF6FF)',
            border:`1px solid ${T.border2}`, borderRadius:12,
            padding:'13px 20px', marginBottom:20,
            display:'flex', alignItems:'center', gap:16, flexWrap:'wrap',
          }}>
            <span style={{ fontSize:13, fontWeight:700, color:T.txt2, flexShrink:0 }}>
              Orden automático:
            </span>
            {[
              { icon:'🚨', label:'Emergencias primero',    color:'#FEE2E2', txt:'#991B1B' },
              { icon:'🐟', label:'Menos alevinos → urgente', color:'#CCFBF1', txt:'#065F46' },
              { icon:'📅', label:'Siembra más antigua',    color:'#DBEAFE', txt:'#1E40AF' },
            ].map((c, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:6,
                background:c.color, borderRadius:8, padding:'5px 10px',
              }}>
                <span style={{ fontSize:14 }}>{c.icon}</span>
                <span style={{ fontSize:12, fontWeight:600, color:c.txt }}>{c.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ══ CHIPS DE FILTRO ═════════════════════════════════════════════════ */}
        <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
          {FILTROS.map(f => {
            const activo = filtro === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className="cal-chip-active"
                style={{
                  display:'flex', alignItems:'center', gap:7,
                  padding:'7px 14px', borderRadius:10, border:'none',
                  fontWeight:600, fontSize:13, cursor:'pointer',
                  background: activo ? f.color : T.card,
                  color:       activo ? '#fff' : T.txt2,
                  border:      activo ? 'none' : `1px solid ${T.border2}`,
                  boxShadow:   activo ? `0 3px 10px ${f.color}45` : 'none',
                }}>
                {f.label}
                <span style={{
                  background: activo ? 'rgba(255,255,255,0.25)' : T.border,
                  color:       activo ? '#fff' : T.muted,
                  borderRadius: 20, padding:'1px 7px', fontSize:11, fontWeight:700,
                }}>
                  {conteo[f.key]}
                </span>
              </button>
            )
          })}
        </div>

        {/* ══ CONTENIDO PRINCIPAL ══════════════════════════════════════════════ */}

        {/* Loading — skeletons */}
        {loading ? (
          <div style={{
            display:'grid', gap:16,
            gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
          }}>
            {Array.from({ length:6 }).map((_, i) => <SkCard key={i} />)}
          </div>

        /* Vacío */
        ) : turnosFiltrados.length === 0 ? (
          <div style={{
            background:T.card, border:`1px solid ${T.border}`,
            borderRadius:16, padding:'56px 24px',
            display:'flex', flexDirection:'column', alignItems:'center', gap:16, textAlign:'center',
          }}>
            {esProductor ? (
              <>
                {/* SVG pez decorativo */}
                <div style={{
                  width:72, height:72, borderRadius:'50%',
                  background:'linear-gradient(135deg,#CCFBF1,#A5F3FC)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <Fish size={32} color={T.teal} />
                </div>
                <div>
                  <p style={{ fontWeight:800, fontSize:16, color:T.txt, margin:'0 0 6px' }}>
                    No tienes turnos registrados
                  </p>
                  <p style={{ color:T.txt2, fontSize:13.5, maxWidth:340, margin:0, lineHeight:1.6 }}>
                    Cuando una siembra esté lista para cosechar, podrás reservar tu turno desde{' '}
                    <a href="/produccion" style={{ color:T.teal, fontWeight:700, textDecoration:'none' }}>
                      Mi Producción <ChevronRight size={12} style={{ verticalAlign:'middle' }} />
                    </a>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div style={{
                  width:64, height:64, borderRadius:16,
                  background:'linear-gradient(135deg,#F0FDFA,#EFF6FF)',
                  border:`1px solid ${T.border2}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <Calendar size={28} color={T.muted} />
                </div>
                <div>
                  <p style={{ fontWeight:700, fontSize:15, color:T.txt, margin:'0 0 4px' }}>
                    Sin turnos en este filtro
                  </p>
                  <p style={{ color:T.txt2, fontSize:13, margin:'0 0 16px' }}>
                    Prueba otro filtro o agrega un nuevo turno
                  </p>
                  <button
                    onClick={abrirModal}
                    style={{
                      display:'inline-flex', alignItems:'center', gap:7,
                      background:`linear-gradient(135deg,${T.teal},${T.cyan})`,
                      color:'#fff', border:'none', borderRadius:10,
                      padding:'10px 18px', fontWeight:700, fontSize:13, cursor:'pointer',
                      boxShadow:'0 3px 10px rgba(20,184,166,0.28)',
                    }}>
                    <Plus size={15} /> Agregar Turno
                  </button>
                </div>
              </>
            )}
          </div>

        /* ── GRID DE CARDS ── */
        ) : (
          <div style={{
            display:'grid', gap:16,
            gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
          }}>
            {turnosFiltrados.map((t, index) => {
              const estado    = ESTADOS_TURNO[t.estado] || ESTADOS_TURNO.PENDIENTE
              const esEmerg   = t.tipoPrioridad === 'EMERGENCIA'

              return (
                <div
                  key={t.idTurno}
                  className="cal-card cal-turno-card"
                  style={{
                    background: T.card,
                    border: `1px solid ${T.border}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                    position: 'relative',
                    animationDelay: `${index * 0.04}s`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = estado.color + '55'
                    e.currentTarget.style.boxShadow  = '0 4px 16px rgba(0,0,0,0.07)'
                    e.currentTarget.style.transform  = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = T.border
                    e.currentTarget.style.boxShadow  = 'none'
                    e.currentTarget.style.transform  = 'translateY(0)'
                  }}
                >
                  {/* Borde top coloreado por estado */}
                  <div style={{ height:3, background:estado.color }} />

                  <div style={{ padding:'16px 18px' }}>

                    {/* ── Card Header ── */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, gap:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <PosBadge pos={index} />
                        {esEmerg && (
                          <span style={{
                            display:'inline-flex', alignItems:'center', gap:4,
                            background:'#FEE2E2', color:'#991B1B',
                            borderRadius:8, padding:'3px 8px', fontSize:11, fontWeight:700,
                          }}>
                            🚨 Emergencia
                          </span>
                        )}
                      </div>
                      <span style={{
                        background: estado.bg, color: estado.text,
                        borderRadius: 8, padding:'4px 10px',
                        fontSize:11, fontWeight:700,
                      }}>
                        {estado.label}
                      </span>
                    </div>

                    {/* ── Productor (solo admin) ── */}
                    {!esProductor && (
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                        <Avatar nombre={t.nombreProductor} />
                        <div>
                          <p style={{ margin:0, fontWeight:700, fontSize:14, color:T.txt, lineHeight:1.2 }}>
                            {t.nombreProductor}
                          </p>
                          <p style={{ margin:'2px 0 0', fontSize:11.5, color:T.muted }}>Productor</p>
                        </div>
                      </div>
                    )}

                    {/* ── Estanque ── */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <div style={{
                        display:'inline-flex', alignItems:'center', gap:5,
                        background:'#CCFBF1', borderRadius:8, padding:'4px 10px',
                      }}>
                        <Fish size={13} color={T.teal} />
                        <span style={{ fontSize:12.5, fontWeight:700, color:T.teal }}>
                          {t.codigoEstanque}
                        </span>
                      </div>
                    </div>

                    {/* ── Fecha y hora ── */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom: t.motivoEmergencia ? 10 : 0 }}>
                      <Calendar size={13} color={T.muted} />
                      <span style={{ fontSize:13, color:T.txt2, fontWeight:500 }}>
                        {t.fechaProgramada}
                      </span>
                      <Clock size={13} color={T.muted} style={{ marginLeft:4 }} />
                      <span style={{ fontSize:13, color:T.txt2 }}>
                        {t.horaProgramada
                          ? String(t.horaProgramada).substring(0, 5)
                          : '—'}
                      </span>
                    </div>

                    {/* ── Motivo emergencia ── */}
                    {t.motivoEmergencia && (
                      <div style={{
                        background:'#FFF7ED', border:'1px solid #FED7AA',
                        borderRadius:8, padding:'7px 10px', marginTop:8,
                      }}>
                        <p style={{ margin:0, fontSize:12, color:'#92400E', fontWeight:600 }}>
                          ⚠️ {t.motivoEmergencia}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── Card Footer ── */}
                  <div style={{
                    borderTop:`1px solid ${T.border}`, padding:'11px 18px',
                    display:'flex', alignItems:'center', justifyContent:'flex-end',
                    background:'#FAFBFC',
                  }}>
                    {!esProductor ? (
                      <>
                        {t.estado === 'PENDIENTE' && (
                          <button
                            onClick={() => cambiarEstado(t.idTurno, 'CONFIRMADO')}
                            onMouseEnter={e => { e.currentTarget.style.background='#D1FAE5'; e.currentTarget.style.color='#065F46' }}
                            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=T.green }}
                            style={{
                              display:'inline-flex', alignItems:'center', gap:6,
                              background:'transparent', color:T.green,
                              border:`1.5px solid ${T.green}`, borderRadius:8,
                              padding:'6px 12px', fontSize:12, fontWeight:700,
                              cursor:'pointer', transition:'all 0.15s',
                            }}>
                            <CheckCircle size={13} /> Confirmar turno
                          </button>
                        )}
                        {t.estado === 'CONFIRMADO' && (
                          <span style={{ fontSize:12, color:T.blue, fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                            <Clock size={13} /> Esperando recepción
                          </span>
                        )}
                        {t.estado === 'REALIZADO' && (
                          <span style={{ fontSize:12, color:T.green, fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                            <CheckCircle size={13} /> Pescado recibido en planta
                          </span>
                        )}
                        {t.estado === 'CANCELADO' && (
                          <span style={{ fontSize:12, color:T.muted, fontWeight:500 }}>
                            Turno cancelado
                          </span>
                        )}
                      </>
                    ) : (
                      <span style={{
                        fontSize:12, fontWeight:600,
                        color: t.estado === 'PENDIENTE'  ? T.amber
                             : t.estado === 'CONFIRMADO' ? T.blue
                             : t.estado === 'REALIZADO'  ? T.green
                             : T.muted,
                      }}>
                        {t.estado === 'PENDIENTE'  ? '⏳ Esperando confirmación'  : ''}
                        {t.estado === 'CONFIRMADO' ? '✅ Turno confirmado'         : ''}
                        {t.estado === 'REALIZADO'  ? '🐟 Cosecha completada'       : ''}
                        {t.estado === 'CANCELADO'  ? '❌ Turno cancelado'          : ''}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ══ MODAL AGREGAR TURNO ══════════════════════════════════════════════ */}
        {mostrarModal && !esProductor && (
          <div
            onClick={e => { if (e.target === e.currentTarget) cerrarModal() }}
            style={{
              position:'fixed', inset:0, zIndex:50,
              background:'rgba(15,23,42,0.45)',
              backdropFilter:'blur(4px)',
              display:'flex', alignItems:'center', justifyContent:'center',
              padding:'16px',
            }}>
            <div
              className="cal-modal"
              style={{
                background:T.card, borderRadius:20,
                width:'100%', maxWidth:540,
                maxHeight:'92vh', overflowY:'auto',
                boxShadow:'0 24px 60px rgba(15,23,42,0.22)',
              }}>

              {/* Modal header */}
              <div style={{
                padding:'22px 24px 18px', borderBottom:`1px solid ${T.border}`,
                display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{
                    width:42, height:42, borderRadius:11,
                    background:'linear-gradient(135deg,#14B8A6,#06B6D4)',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    boxShadow:'0 3px 10px rgba(20,184,166,0.30)',
                  }}>
                    <Calendar size={19} color="#fff" />
                  </div>
                  <div>
                    <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:T.txt }}>
                      Agregar Turno de Pesca
                    </h2>
                    <p style={{ margin:'3px 0 0', fontSize:12.5, color:T.txt2 }}>
                      Solo productores con siembras aprobadas y sin turno activo
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarModal}
                  onMouseEnter={e => { e.currentTarget.style.background='#FEE2E2'; e.currentTarget.style.color=T.red }}
                  onMouseLeave={e => { e.currentTarget.style.background=T.border; e.currentTarget.style.color=T.txt2 }}
                  style={{
                    width:32, height:32, borderRadius:8, border:'none', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:T.border, color:T.txt2, transition:'all 0.15s', flexShrink:0,
                  }}>
                  <X size={16} />
                </button>
              </div>

              {/* ── Cargando datos del modal: skeletons ── */}
              {loadingModal ? (
                <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:14 }}>
                  {Array.from({ length:3 }).map((_, i) => (
                    <div key={i} style={{ height:44, background:'#F1F5F9', borderRadius:10 }} className="cal-sk" />
                  ))}
                </div>

              /* ── Sin siembras disponibles ── */
              ) : siembrasSinTurno.length === 0 ? (
                <div style={{ padding:'48px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:16, textAlign:'center' }}>
                  <div style={{
                    width:60, height:60, borderRadius:'50%',
                    background:'linear-gradient(135deg,#CCFBF1,#A5F3FC)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <Fish size={26} color={T.teal} />
                  </div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:15, color:T.txt, margin:'0 0 6px' }}>
                      No hay siembras disponibles
                    </p>
                    <p style={{ fontSize:13, color:T.txt2, maxWidth:300, margin:0, lineHeight:1.6 }}>
                      No existen siembras aprobadas por el biólogo sin turno de pesca asignado.
                    </p>
                  </div>
                  <button
                    onClick={cerrarModal}
                    style={{
                      padding:'10px 22px', border:`1.5px solid ${T.border2}`,
                      borderRadius:10, fontSize:13, fontWeight:600,
                      color:T.txt2, background:'#FAFAFA', cursor:'pointer',
                    }}>
                    Cerrar
                  </button>
                </div>

              /* ── Formulario ── */
              ) : (
                <form onSubmit={handleSubmit} style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:18 }}>

                  {/* Error */}
                  {errorModal && (
                    <div style={{
                      display:'flex', alignItems:'flex-start', gap:8,
                      background:'#FEF2F2', border:'1px solid #FECACA',
                      borderRadius:10, padding:'12px 14px',
                    }}>
                      <AlertTriangle size={15} color={T.red} style={{ flexShrink:0, marginTop:1 }} />
                      <span style={{ fontSize:13, color:'#991B1B', fontWeight:500 }}>{errorModal}</span>
                    </div>
                  )}

                  {/* Productor */}
                  <div>
                    <label style={{ fontSize:13, fontWeight:600, color:T.txt, display:'block', marginBottom:6 }}>
                      Productor *
                    </label>
                    <StyledInput
                      as="select"
                      required
                      value={form.idProductor}
                      onChange={handleProductorChange}>
                      <option value="">Seleccionar productor...</option>
                      {productoresModal.map(p => (
                        <option key={p.idProductor} value={p.idProductor}>
                          {p.nombreProductor}
                        </option>
                      ))}
                    </StyledInput>
                    <p style={{ fontSize:11.5, color:T.muted, margin:'5px 0 0' }}>
                      {productoresModal.length} productor{productoresModal.length !== 1 ? 'es' : ''} con siembra{productoresModal.length !== 1 ? 's' : ''} lista{productoresModal.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Siembra */}
                  <div>
                    <label style={{ fontSize:13, fontWeight:600, color:T.txt, display:'block', marginBottom:6 }}>
                      Siembra *
                    </label>
                    <StyledInput
                      as="select"
                      required
                      disabled={!form.idProductor}
                      value={form.idSiembra}
                      onChange={e => setForm({ ...form, idSiembra: e.target.value })}>
                      <option value="">
                        {form.idProductor ? 'Seleccionar siembra...' : 'Selecciona un productor primero'}
                      </option>
                      {siembrasFiltradas.map(s => (
                        <option key={s.idSiembra} value={s.idSiembra}>
                          {s.nombreEspecie} — {s.codigoEstanque} (Siembra: {s.fechaSiembra})
                        </option>
                      ))}
                    </StyledInput>
                    {form.idProductor && siembrasFiltradas.length === 0 && (
                      <p style={{ fontSize:12, color:T.amber, margin:'5px 0 0', fontWeight:600 }}>
                        ⚠️ Este productor no tiene siembras disponibles
                      </p>
                    )}
                  </div>

                  {/* Fecha y hora */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div>
                      <label style={{ fontSize:13, fontWeight:600, color:T.txt, display:'block', marginBottom:6 }}>Fecha *</label>
                      <StyledInput
                        type="date"
                        required
                        min={hoy()}
                        value={form.fechaProgramada}
                        onChange={e => setForm({ ...form, fechaProgramada: e.target.value, horaProgramada: '' })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize:13, fontWeight:600, color:T.txt, display:'block', marginBottom:6 }}>Hora *</label>
                      <StyledInput
                        type="time"
                        required
                        min={minHora}
                        value={form.horaProgramada}
                        onChange={e => setForm({ ...form, horaProgramada: e.target.value })}
                      />
                      {form.fechaProgramada === hoy() && (
                        <p style={{ fontSize:11.5, color:T.muted, margin:'4px 0 0' }}>
                          Mínimo: {horaActual()} (hora actual)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Prioridad — selector visual */}
                  <div>
                    <label style={{ fontSize:13, fontWeight:600, color:T.txt, display:'block', marginBottom:8 }}>
                      Tipo de prioridad
                    </label>
                    <div style={{ display:'flex', gap:10 }}>
                      {[
                        { val:'NORMAL',     label:'🟢 Normal',    activeColor:T.green, activeBg:'#D1FAE5', activeTxt:'#065F46' },
                        { val:'EMERGENCIA', label:'🚨 Emergencia', activeColor:T.red,   activeBg:'#FEE2E2', activeTxt:'#991B1B' },
                      ].map(opt => {
                        const sel = form.tipoPrioridad === opt.val
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setForm({ ...form, tipoPrioridad: opt.val, motivoEmergencia: '' })}
                            style={{
                              flex:1, padding:'10px 14px',
                              border: sel ? `2px solid ${opt.activeColor}` : `1.5px solid ${T.border2}`,
                              borderRadius:10, fontSize:13, fontWeight:700,
                              background: sel ? opt.activeBg : '#FAFAFA',
                              color:       sel ? opt.activeTxt : T.txt2,
                              cursor:'pointer', transition:'all 0.15s',
                            }}>
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Motivo emergencia (condicional) */}
                  {form.tipoPrioridad === 'EMERGENCIA' && (
                    <div>
                      <label style={{ fontSize:13, fontWeight:600, color:T.txt, display:'block', marginBottom:6 }}>
                        Motivo de emergencia *
                      </label>
                      <StyledInput
                        as="textarea"
                        required
                        rows={3}
                        value={form.motivoEmergencia}
                        onChange={e => setForm({ ...form, motivoEmergencia: e.target.value })}
                        placeholder="Describe el motivo de la emergencia..."
                        style={{ resize:'none' }}
                      />
                    </div>
                  )}

                  {/* Footer botones */}
                  <div style={{ display:'flex', gap:10, paddingTop:4 }}>
                    <button
                      type="button"
                      onClick={cerrarModal}
                      style={{
                        flex:1, padding:'11px 16px',
                        border:`1.5px solid ${T.border2}`, borderRadius:10,
                        fontSize:13, fontWeight:600, color:T.txt2,
                        background:'#FAFAFA', cursor:'pointer',
                      }}>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardando}
                      style={{
                        flex:1, padding:'11px 16px',
                        background: guardando
                          ? '#94A3B8'
                          : 'linear-gradient(135deg,#14B8A6,#06B6D4)',
                        color:'#fff', border:'none', borderRadius:10,
                        fontSize:13, fontWeight:700,
                        cursor: guardando ? 'not-allowed' : 'pointer',
                        boxShadow: guardando ? 'none' : '0 3px 10px rgba(20,184,166,0.30)',
                        transition:'all 0.2s',
                        opacity: guardando ? 0.75 : 1,
                      }}>
                      {guardando ? 'Guardando...' : 'Guardar Turno'}
                    </button>
                  </div>

                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  )
}

export default Calendario
