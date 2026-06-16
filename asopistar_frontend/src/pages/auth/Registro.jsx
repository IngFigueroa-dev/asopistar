// src/pages/auth/Registro.jsx
// Rediseño visual v2 — mantiene toda la lógica original intacta
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ChevronDown, ArrowLeft, User, Mail, Lock, Phone, FileText, MapPin, Calendar, Users } from 'lucide-react'
import api from '../../services/api'

const LOGO_SRC = '/src/assets/Logo_asopistar_jpeg.jpeg'

const CARGOS = [
  { value: 'PRODUCTOR',            label: 'Productor' },
  { value: 'BIOLOGO',              label: 'Biólogo' },
  { value: 'GERENTE_PLANTA',       label: 'Gerente de Planta' },
  { value: 'PERSONAL_CUARTO_FRIO', label: 'Personal de Cuarto Frío' },
  { value: 'CONTADORA',            label: 'Contadora' },
  { value: 'SECRETARIA',           label: 'Secretaria' },
  { value: 'GERENTE_COMERCIAL',    label: 'Gerente Comercial' },
  { value: 'VENDEDOR_INSUMOS',     label: 'Vendedor de Insumos' },
]

const TRUST_ITEMS = [
  { icon: '👨‍🌾', text: 'Más de 47 productores vinculados' },
  { icon: '🔬', text: 'Seguimiento técnico especializado' },
  { icon: '📦', text: 'Trazabilidad completa de la producción' },
  { icon: '🌿', text: 'Fortalecimiento del sector piscícola' },
]

const PASOS_PROCESO = [
  { n: 1, label: 'Completa el formulario' },
  { n: 2, label: 'Verifica tu correo' },
  { n: 3, label: 'Espera aprobación' },
  { n: 4, label: 'Accede al sistema' },
]

const FORM_INICIAL = {
  nombre1:'', nombre2:'', apellido1:'', apellido2:'',
  documento:'', telefono:'', email:'',
  contrasena:'', confirmarContrasena:'',
  cargoSolicitado:'',
  fechaNacimiento:'', cantidadHijos:'', direccion:'',
}

function Campo({ label, required, icon: Icon, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:13, fontWeight:600, color:'#94A3B8' }}>
        {label} {required && <span style={{ color:'#F87171' }}>*</span>}
      </label>
      {Icon ? (
        <div style={{ position:'relative' }}>
          <Icon size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#475569', pointerEvents:'none' }}/>
          {children}
        </div>
      ) : children}
    </div>
  )
}

function passStrength(p) {
  if (!p) return { level:0, label:'', color:'#1E293B' }
  let score = 0
  if (p.length >= 8)  score++
  if (/[A-Z]/.test(p)) score++
  if (/[a-z]/.test(p)) score++
  if (/\d/.test(p))   score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { level:1, label:'Débil', color:'#EF4444' }
  if (score === 2) return { level:2, label:'Media', color:'#F59E0B' }
  if (score === 3) return { level:3, label:'Fuerte', color:'#14B8A6' }
  return { level:4, label:'Muy fuerte', color:'#10B981' }
}

export default function Registro() {
  const navigate = useNavigate()
  const [form, setForm]         = useState(FORM_INICIAL)
  const [verPass, setVerPass]   = useState(false)
  const [verPass2, setVerPass2] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [paso, setPaso]         = useState(1)

  const esProductor = form.cargoSolicitado === 'PRODUCTOR'
  const set = campo => e => setForm({ ...form, [campo]: e.target.value })
  const strength = passStrength(form.contrasena)

  const validarPaso1 = () => {
    if (!form.nombre1 || !form.apellido1 || !form.documento || !form.telefono) {
      setError('Completa todos los campos obligatorios.')
      return false
    }
    if (esProductor && (!form.fechaNacimiento || !form.direccion)) {
      setError('La fecha de nacimiento y dirección son obligatorias para productores.')
      return false
    }
    setError('')
    return true
  }

  const handleSiguiente = () => { if (validarPaso1()) setPaso(2) }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.contrasena || !form.cargoSolicitado) {
      setError('Completa todos los campos obligatorios.'); return
    }
    if (form.contrasena !== form.confirmarContrasena) {
      setError('Las contraseñas no coinciden.'); return
    }
    if (form.contrasena.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.'); return
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.contrasena)) {
      setError('La contraseña debe tener mayúscula, minúscula y número.'); return
    }
    setLoading(true)
    try {
      const payload = {
        nombre1: form.nombre1, nombre2: form.nombre2 || null,
        apellido1: form.apellido1, apellido2: form.apellido2 || null,
        documento: form.documento, telefono: form.telefono,
        email: form.email, contrasena: form.contrasena,
        confirmarContrasena: form.confirmarContrasena,
        cargoSolicitado: form.cargoSolicitado,
        fechaNacimiento: esProductor ? form.fechaNacimiento : null,
        cantidadHijos:   esProductor ? (parseInt(form.cantidadHijos) || 0) : null,
        direccion:       esProductor ? form.direccion : null,
      }
      await api.post('/auth/registro', payload)
      navigate('/pendiente-aprobacion', { state: { email: form.email, tipo: 'verificacion' } })
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message
      setError(msg || 'Error al registrarse. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ── estilos reutilizables ──
  const inputStyle = {
    width:'100%', padding:'11px 13px 11px 38px',
    background:'rgba(255,255,255,.05)', border:'1.5px solid rgba(255,255,255,.1)',
    borderRadius:11, color:'#F8FAFC', fontSize:14, outline:'none',
    transition:'border-color .25s, background .25s', fontFamily:'inherit',
  }
  const inputStyleNoIcon = { ...inputStyle, padding:'11px 13px' }
  const inputFocus = e => { e.target.style.borderColor='#14B8A6'; e.target.style.background='rgba(20,184,166,.06)'; }
  const inputBlur  = e => { e.target.style.borderColor='rgba(255,255,255,.1)'; e.target.style.background='rgba(255,255,255,.05)'; }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .reg-root *, .reg-root *::before, .reg-root *::after { box-sizing:border-box; margin:0; padding:0; font-family:'Inter',system-ui,sans-serif; }
        .reg-root input::placeholder, .reg-root select option { color:#475569; }
        .reg-root select option { background:#111827; color:#F8FAFC; }

        @keyframes regFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes regFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        .reg-fadein { animation: regFadeUp .5s ease both; }

        .reg-btn-primary {
          width:100%; padding:13px; border-radius:12px; border:none;
          background:linear-gradient(135deg,#14B8A6,#06B6D4);
          color:#0F172A; font-size:15px; font-weight:700; cursor:pointer;
          transition:transform .25s, box-shadow .25s, filter .25s; font-family:inherit;
        }
        .reg-btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 36px rgba(20,184,166,.38); }
        .reg-btn-primary:disabled { opacity:.65; cursor:not-allowed; }

        .reg-btn-ghost {
          flex:1; padding:13px; border-radius:12px;
          border:1px solid rgba(255,255,255,.1);
          background:transparent; color:#94A3B8; font-size:14px;
          cursor:pointer; font-family:inherit; transition:all .2s;
        }
        .reg-btn-ghost:hover { border-color:rgba(20,184,166,.35); color:#14B8A6; }


        /* ── Accesibilidad: sincroniza con AccessibilityWidget global ── */
        body.large-text .auth-root *  { font-size: 1.2em !important; }
        body.large-text .pa-root *    { font-size: 1.2em !important; }
        body.large-text .ve-root *    { font-size: 1.2em !important; }
        body.large-text .reg-root *   { font-size: 1.2em !important; }

        body.high-contrast .auth-root { filter: contrast(150%); }
        body.high-contrast .pa-root   { filter: contrast(150%); }
        body.high-contrast .ve-root   { filter: contrast(150%); }
        body.high-contrast .reg-root  { filter: contrast(150%); }

        body.alt-font .auth-root,
        body.alt-font .auth-root * { font-family: Arial, sans-serif !important; letter-spacing: 0.05em; }
        body.alt-font .pa-root,
        body.alt-font .pa-root *   { font-family: Arial, sans-serif !important; letter-spacing: 0.05em; }
        body.alt-font .ve-root,
        body.alt-font .ve-root *   { font-family: Arial, sans-serif !important; letter-spacing: 0.05em; }
        body.alt-font .reg-root,
        body.alt-font .reg-root *  { font-family: Arial, sans-serif !important; letter-spacing: 0.05em; }/* Split layout */
        .reg-split { display:grid; grid-template-columns:420px 1fr; min-height:100vh; }
        .reg-left   { display:flex; }
        @media(max-width:1000px){ .reg-split{ grid-template-columns:1fr; } .reg-left{ display:none; } }
        @media(max-width:480px){  .reg-right-inner{ padding:28px 16px !important; } }

        /* Step indicator */
        .step-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; transition:all .3s; }
        .step-line { flex:1; height:1px; }
      `}</style>

      <div className="reg-root reg-split" style={{ background:'#0F172A' }}>

        {/* ══ PANEL IZQUIERDO ══ */}
        <div className="reg-left" style={{
          background:'linear-gradient(160deg,#0b1829 0%,#0c2020 100%)',
          borderRight:'1px solid rgba(255,255,255,.06)',
          flexDirection:'column', justifyContent:'space-between',
          padding:'40px 40px', position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'rgba(20,184,166,.06)', filter:'blur(70px)', top:-60, right:-60, pointerEvents:'none' }}/>
          <div style={{ position:'absolute', inset:0, opacity:.025, backgroundImage:'linear-gradient(#14B8A6 1px,transparent 1px),linear-gradient(90deg,#14B8A6 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' }}/>

          <div style={{ position:'relative', zIndex:1 }}>
            {/* Logo + back */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:40 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <img src={LOGO_SRC} alt="ASOPISTAR" style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(20,184,166,.4)' }} onError={e=>{ e.target.style.display='none'; }}/>
                <div>
                  <div style={{ fontWeight:800, fontSize:16, color:'#F8FAFC', letterSpacing:'-0.02em' }}>ASO<span style={{ color:'#14B8A6' }}>PISTAR</span></div>
                  <div style={{ fontSize:10, color:'#475569' }}>Sistema Piscícola</div>
                </div>
              </div>
              <button onClick={() => navigate('/')} style={{
                display:'flex', alignItems:'center', gap:5,
                background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)',
                borderRadius:9, padding:'6px 11px', color:'#94A3B8', fontSize:12,
                cursor:'pointer', fontFamily:'inherit', transition:'all .2s',
              }}
                onMouseEnter={e=>{ e.currentTarget.style.color='#14B8A6'; e.currentTarget.style.borderColor='rgba(20,184,166,.35)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.color='#94A3B8'; e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; }}
              >
                <ArrowLeft size={13}/> Inicio
              </button>
            </div>

            {/* Heading */}
            <div style={{ marginBottom:32 }}>
              <h2 style={{ fontSize:22, fontWeight:900, color:'#F8FAFC', letterSpacing:'-0.025em', lineHeight:1.1, marginBottom:10 }}>
                Solicita acceso a<br/><span style={{ color:'#14B8A6' }}>ASOPISTAR</span>
              </h2>
              <p style={{ fontSize:13, color:'#64748B', lineHeight:1.65 }}>
                La plataforma está destinada a productores, personal técnico y colaboradores autorizados por la asociación.
              </p>
            </div>

            {/* Proceso visual */}
            <div style={{ marginBottom:32 }}>
              <p style={{ fontSize:11, color:'#475569', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:16 }}>Proceso de registro</p>
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {PASOS_PROCESO.map(({ n, label }, i) => (
                  <div key={n} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{
                        width:28, height:28, borderRadius:'50%', flexShrink:0,
                        background: n <= paso ? 'rgba(20,184,166,.2)' : 'rgba(255,255,255,.06)',
                        border: n <= paso ? '1.5px solid rgba(20,184,166,.5)' : '1px solid rgba(255,255,255,.1)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:11, fontWeight:700,
                        color: n <= paso ? '#14B8A6' : '#475569',
                        transition:'all .3s',
                      }}>{n}</div>
                      {i < PASOS_PROCESO.length-1 && (
                        <div style={{ width:1, height:28, background: n < paso ? 'rgba(20,184,166,.3)' : 'rgba(255,255,255,.08)', margin:'2px 0' }}/>
                      )}
                    </div>
                    <div style={{ paddingTop:4, paddingBottom: i < PASOS_PROCESO.length-1 ? 22 : 0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color: n <= paso ? '#CBD5E1' : '#475569', transition:'color .3s' }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust items */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <p style={{ fontSize:11, color:'#475569', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>¿Por qué ASOPISTAR?</p>
              {TRUST_ITEMS.map(({ icon, text }) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:30, height:30, borderRadius:8, flexShrink:0,
                    background:'rgba(20,184,166,.08)', border:'1px solid rgba(20,184,166,.15)',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
                  }}>{icon}</div>
                  <span style={{ fontSize:13, color:'#64748B' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position:'relative', zIndex:1, borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:16 }}>
            <p style={{ fontSize:11, color:'#334155' }}>© 2026 Asociación de Piscicultores del Tarra</p>
          </div>
        </div>

        {/* ══ PANEL DERECHO ══ */}
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'flex-start', padding:'40px 5%',
          overflowY:'auto', background:'#0F172A',
          minHeight:'100vh',
        }}>
          {/* Back mobile */}
          <div style={{ width:'100%', maxWidth:560, marginBottom:16, display:'none' }} id="reg-back-mobile">
            <style>{`@media(max-width:1000px){ #reg-back-mobile{ display:block !important; } }`}</style>
            <button onClick={() => navigate('/')} style={{
              display:'inline-flex', alignItems:'center', gap:6,
              background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)',
              borderRadius:10, padding:'7px 13px', color:'#94A3B8', fontSize:13,
              cursor:'pointer', fontFamily:'inherit',
            }}>
              <ArrowLeft size={14}/> Volver al inicio
            </button>
          </div>

          <div className="reg-right-inner reg-fadein" style={{ width:'100%', maxWidth:560, padding:'0 4px' }}>

            {/* Logo mobile */}
            <div style={{ textAlign:'center', marginBottom:28, display:'none' }} id="reg-logo-mobile">
              <style>{`@media(max-width:1000px){ #reg-logo-mobile{ display:block !important; } }`}</style>
              <span style={{ fontWeight:800, fontSize:18, color:'#F8FAFC', letterSpacing:'-0.02em' }}>ASO<span style={{ color:'#14B8A6' }}>PISTAR</span></span>
            </div>

            {/* Stepper visual */}
            <div style={{ display:'flex', alignItems:'center', marginBottom:28 }}>
              {[1,2].map((n, i) => (
                <div key={n} style={{ display:'flex', alignItems:'center', flex: i===0 ? 'initial' : 1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{
                      width:32, height:32, borderRadius:'50%',
                      background: paso >= n ? 'linear-gradient(135deg,#14B8A6,#06B6D4)' : 'rgba(255,255,255,.07)',
                      border: paso >= n ? 'none' : '1.5px solid rgba(255,255,255,.12)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:13, fontWeight:700,
                      color: paso >= n ? '#0F172A' : '#475569',
                      transition:'all .35s', flexShrink:0,
                    }}>{paso > n ? '✓' : n}</div>
                    <span style={{ fontSize:13, fontWeight:600, color: paso >= n ? '#CBD5E1' : '#475569', whiteSpace:'nowrap' }}>
                      {n === 1 ? 'Datos personales' : 'Acceso y cargo'}
                    </span>
                  </div>
                  {i === 0 && (
                    <div style={{ flex:1, height:1, margin:'0 14px', background: paso > 1 ? 'rgba(20,184,166,.4)' : 'rgba(255,255,255,.08)', transition:'background .4s' }}/>
                  )}
                </div>
              ))}
            </div>

            {/* ── PASO 1 ── */}
            {paso === 1 && (
              <div className="reg-fadein" style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <div style={{ marginBottom:4 }}>
                  <h1 style={{ fontSize:22, fontWeight:800, color:'#F8FAFC', letterSpacing:'-0.025em', marginBottom:6 }}>Información personal</h1>
                  <p style={{ fontSize:14, color:'#64748B' }}>Ingresa tus datos tal como aparecen en tu documento de identidad.</p>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <Campo label="Primer nombre" required icon={User}>
                    <input value={form.nombre1} onChange={set('nombre1')} placeholder="Ej: Carlos" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                  </Campo>
                  <Campo label="Segundo nombre" icon={User}>
                    <input value={form.nombre2} onChange={set('nombre2')} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                  </Campo>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <Campo label="Primer apellido" required icon={User}>
                    <input value={form.apellido1} onChange={set('apellido1')} placeholder="Ej: Martínez" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                  </Campo>
                  <Campo label="Segundo apellido" icon={User}>
                    <input value={form.apellido2} onChange={set('apellido2')} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                  </Campo>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <Campo label="Número de documento" required icon={FileText}>
                    <input value={form.documento} onChange={set('documento')} placeholder="CC / NIT" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                  </Campo>
                  <Campo label="Teléfono" required icon={Phone}>
                    <input value={form.telefono} onChange={set('telefono')} placeholder="3001234567" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                  </Campo>
                </div>

                {/* Selector de cargo en paso 1 también (para mostrar campos de productor) */}
                <Campo label="Cargo solicitado" required>
                  <div style={{ position:'relative' }}>
                    <select
                      value={form.cargoSolicitado}
                      onChange={e => setForm({ ...form, cargoSolicitado: e.target.value })}
                      style={{ ...inputStyleNoIcon, paddingRight:36, cursor:'pointer', appearance:'none' }}
                      onFocus={inputFocus} onBlur={inputBlur}
                    >
                      <option value="">-- Selecciona tu cargo --</option>
                      {CARGOS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <ChevronDown size={15} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'#475569', pointerEvents:'none' }}/>
                  </div>
                  <p style={{ fontSize:12, color:'#334155', marginTop:4 }}>El administrador asignará tu rol definitivo al aprobar la solicitud.</p>
                </Campo>

                {/* Campos extra productor */}
                {esProductor && (
                  <div style={{
                    background:'rgba(20,184,166,.05)', border:'1px solid rgba(20,184,166,.18)',
                    borderRadius:14, padding:'18px 16px', display:'flex', flexDirection:'column', gap:14,
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'#14B8A6' }}/>
                      <p style={{ fontSize:13, fontWeight:600, color:'#14B8A6' }}>Información adicional requerida para productores</p>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      <Campo label="Fecha de nacimiento" required icon={Calendar}>
                        <input type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                      </Campo>
                      <Campo label="Cantidad de hijos" icon={Users}>
                        <input type="number" min="0" value={form.cantidadHijos} onChange={set('cantidadHijos')} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                      </Campo>
                    </div>
                    <Campo label="Dirección" required icon={MapPin}>
                      <input value={form.direccion} onChange={set('direccion')} placeholder="Vereda, municipio..." style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                    </Campo>
                  </div>
                )}

                {error && (
                  <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:10, padding:'11px 14px', display:'flex', alignItems:'center', gap:10 }}>
                    <span>⚠️</span><span style={{ fontSize:13, color:'#FCA5A5' }}>{error}</span>
                  </div>
                )}

                <div style={{ display:'flex', gap:10, paddingTop:4 }}>
                  <Link to="/login" style={{
                    flex:1, padding:'13px', borderRadius:12, border:'1px solid rgba(255,255,255,.1)',
                    background:'transparent', color:'#94A3B8', fontSize:14, fontWeight:600,
                    textDecoration:'none', textAlign:'center', transition:'all .2s',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.color='#14B8A6'; e.currentTarget.style.borderColor='rgba(20,184,166,.35)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.color='#94A3B8'; e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; }}
                  >
                    <ArrowLeft size={14}/> Volver al login
                  </Link>
                  <button type="button" onClick={handleSiguiente} className="reg-btn-primary" style={{ flex:1 }}>
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {/* ── PASO 2 ── */}
            {paso === 2 && (
              <form onSubmit={handleSubmit} className="reg-fadein" style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <div style={{ marginBottom:4 }}>
                  <h1 style={{ fontSize:22, fontWeight:800, color:'#F8FAFC', letterSpacing:'-0.025em', marginBottom:6 }}>Acceso al sistema</h1>
                  <p style={{ fontSize:14, color:'#64748B' }}>Define tu correo y contraseña para acceder a la plataforma.</p>
                </div>

                <Campo label="Correo electrónico" required icon={Mail}>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="nombre@correo.com" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                </Campo>

                {/* Contraseña + indicador de fortaleza */}
                <Campo label="Contraseña" required icon={Lock}>
                  <input
                    type={verPass ? 'text' : 'password'}
                    value={form.contrasena} onChange={set('contrasena')}
                    placeholder="Mín. 8 caracteres"
                    style={{ ...inputStyle, paddingRight:44 }}
                    onFocus={inputFocus} onBlur={inputBlur}
                  />
                  <button type="button" onClick={() => setVerPass(!verPass)} style={{
                    position:'absolute', right:13, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color:'#475569', padding:0,
                  }}>
                    {verPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </Campo>
                {form.contrasena && (
                  <div style={{ marginTop:-10 }}>
                    <div style={{ display:'flex', gap:5, marginBottom:5 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          flex:1, height:3, borderRadius:2,
                          background: i <= strength.level ? strength.color : 'rgba(255,255,255,.08)',
                          transition:'background .3s',
                        }}/>
                      ))}
                    </div>
                    <span style={{ fontSize:12, color: strength.color, fontWeight:600 }}>{strength.label}</span>
                    <span style={{ fontSize:12, color:'#334155', marginLeft:6 }}>— usa mayúscula, minúscula y número</span>
                  </div>
                )}

                <Campo label="Confirmar contraseña" required icon={Lock}>
                  <input
                    type={verPass2 ? 'text' : 'password'}
                    value={form.confirmarContrasena} onChange={set('confirmarContrasena')}
                    placeholder="Repite la contraseña"
                    style={{ ...inputStyle, paddingRight:44 }}
                    onFocus={inputFocus} onBlur={inputBlur}
                  />
                  <button type="button" onClick={() => setVerPass2(!verPass2)} style={{
                    position:'absolute', right:13, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color:'#475569', padding:0,
                  }}>
                    {verPass2 ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                  {form.confirmarContrasena && (
                    <div style={{ position:'absolute', right:44, top:'50%', transform:'translateY(-50%)', fontSize:14 }}>
                      {form.contrasena === form.confirmarContrasena ? '✅' : '❌'}
                    </div>
                  )}
                </Campo>

                {error && (
                  <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:10, padding:'11px 14px', display:'flex', alignItems:'center', gap:10 }}>
                    <span>⚠️</span><span style={{ fontSize:13, color:'#FCA5A5' }}>{error}</span>
                  </div>
                )}

                <div style={{ display:'flex', gap:10, paddingTop:4 }}>
                  <button type="button" className="reg-btn-ghost" onClick={() => { setPaso(1); setError('') }}>
                    ← Anterior
                  </button>
                  <button type="submit" disabled={loading} className="reg-btn-primary" style={{ flex:2 }}>
                    {loading ? 'Enviando solicitud...' : 'Enviar solicitud de acceso →'}
                  </button>
                </div>

                <p style={{ fontSize:13, color:'#334155', textAlign:'center', marginTop:4 }}>
                  ¿Ya tienes acceso?{' '}
                  <Link to="/login" style={{ color:'#14B8A6', fontWeight:600, textDecoration:'none' }}>Iniciar sesión</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
