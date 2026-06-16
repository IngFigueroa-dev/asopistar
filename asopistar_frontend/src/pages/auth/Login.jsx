// src/pages/auth/Login.jsx
// Rediseño visual v2 — mantiene toda la lógica original intacta
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, X, ArrowLeft, Mail, Lock, RefreshCw } from 'lucide-react'
import api from '../../services/api'

/* ── Logo ASOPISTAR (importar en tu proyecto así):
   import logo from '../../assets/Logo_asopistar_jpeg.jpeg'
   y reemplazar la constante LOGO_SRC abajo ──────────────── */
const LOGO_SRC = '/src/assets/Logo_asopistar_jpeg.jpeg'

/* ── Panel izquierdo: tarjetas del flujo ── */
const FEATURES = [
  { icon: '🐟', label: 'Producción', desc: 'Siembras y seguimiento biológico' },
  { icon: '🏭', label: 'Procesamiento', desc: 'Planta y cuarto frío' },
  { icon: '❄️', label: 'Almacenamiento', desc: 'Lotes codificados en tiempo real' },
  { icon: '🚚', label: 'Distribución', desc: 'Envíos a clientes y puntos de venta' },
]

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ email: '', contrasena: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  // Modal reenvío
  const [modalReenvio, setModalReenvio]   = useState(false)
  const [emailReenvio, setEmailReenvio]   = useState('')
  const [reenvioEstado, setReenvioEstado] = useState('idle')
  const [reenvioMensaje, setReenvioMensaje] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token',     res.data.token)
      localStorage.setItem('email',     res.data.email)
      localStorage.setItem('rol',       res.data.rol)
      localStorage.setItem('nombre',    res.data.nombre)
      localStorage.setItem('idUsuario', res.data.idUsuario)
      if (res.data.idProductor != null) {
        localStorage.setItem('idProductor', res.data.idProductor)
      } else {
        localStorage.removeItem('idProductor')
      }
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      if (status === 401) setError('Correo o contraseña incorrectos.')
      else if (status === 403) setError('Tu cuenta aún no está aprobada o fue desactivada.')
      else setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const abrirModalReenvio = () => {
    setEmailReenvio(form.email)
    setReenvioEstado('idle')
    setReenvioMensaje('')
    setModalReenvio(true)
  }

  const handleReenviar = async () => {
    if (!emailReenvio.trim()) {
      setReenvioMensaje('Ingresa tu correo electrónico.')
      setReenvioEstado('error')
      return
    }
    setReenvioEstado('loading')
    setReenvioMensaje('')
    try {
      await api.post('/auth/reenviar-verificacion', { email: emailReenvio.trim() })
      setReenvioEstado('exito')
      setReenvioMensaje('Hemos enviado un nuevo correo de verificación a tu dirección registrada.')
    } catch (err) {
      setReenvioEstado('error')
      const msg = err.response?.data?.mensaje || err.response?.data?.message
      setReenvioMensaje(msg || 'No se pudo reenviar. Verifica que el correo esté registrado.')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .auth-root *, .auth-root *::before, .auth-root *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; }

        @keyframes authFloat  { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-8px)} }
        @keyframes authFloat2 { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-6px)} }
        @keyframes authFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes authPulse  { 0%,100%{opacity:.6} 50%{opacity:1} }

        .auth-float   { animation: authFloat  5s ease-in-out infinite; }
        .auth-float2  { animation: authFloat2 6s ease-in-out 1s infinite; }
        .auth-float3  { animation: authFloat2 7s ease-in-out 2s infinite; }
        .auth-fadein  { animation: authFadeUp .55s ease both; }
        .auth-fadein-2{ animation: authFadeUp .55s .1s ease both; }
        .auth-fadein-3{ animation: authFadeUp .55s .2s ease both; }
        .auth-fadein-4{ animation: authFadeUp .55s .3s ease both; }

        .auth-input {
          width:100%; padding:12px 14px 12px 42px;
          background:rgba(255,255,255,.05);
          border:1.5px solid rgba(255,255,255,.12);
          border-radius:12px; color:#F8FAFC; font-size:15px;
          outline:none; transition:border-color .25s, background .25s;
        }
        .auth-input::placeholder { color:#475569; }
        .auth-input:focus { border-color:#14B8A6; background:rgba(20,184,166,.06); }

        .auth-btn-primary {
          width:100%; padding:14px; border-radius:12px; border:none;
          background:linear-gradient(135deg,#14B8A6,#06B6D4);
          color:#0F172A; font-size:15px; font-weight:700; cursor:pointer;
          transition:transform .25s, box-shadow .25s, filter .25s;
          font-family:inherit;
        }
        .auth-btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 36px rgba(20,184,166,.4); filter:brightness(1.05); }
        .auth-btn-primary:disabled { opacity:.65; cursor:not-allowed; }

        .auth-feat-card {
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.1);
          border-radius:14px; padding:14px 16px;
          display:flex; align-items:center; gap:12px;
          transition:border-color .3s, background .3s;
        }
        .auth-feat-card:hover { border-color:rgba(20,184,166,.35); background:rgba(20,184,166,.06); }


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
        body.alt-font .reg-root *  { font-family: Arial, sans-serif !important; letter-spacing: 0.05em; }/* Responsive split */
        .auth-split { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
        .auth-left  { display:flex; }
        @media (max-width:900px) {
          .auth-split { grid-template-columns:1fr; }
          .auth-left  { display:none; }
        }
        @media (max-width:480px) {
          .auth-right-inner { padding:32px 20px !important; }
        }
      `}</style>

      <div className="auth-root auth-split" style={{ background:'#0F172A' }}>

        {/* ══ PANEL IZQUIERDO ══ */}
        <div className="auth-left" style={{
          background:'linear-gradient(160deg,#0F172A 0%,#0d2a2a 60%,#0a2020 100%)',
          borderRight:'1px solid rgba(255,255,255,.06)',
          flexDirection:'column', justifyContent:'space-between',
          padding:'48px 52px', position:'relative', overflow:'hidden',
        }}>
          {/* Glow */}
          <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(20,184,166,.07)', filter:'blur(80px)', top:-80, right:-80, pointerEvents:'none' }}/>
          <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'rgba(6,182,212,.05)', filter:'blur(60px)', bottom:0, left:0, pointerEvents:'none' }}/>
          {/* Grid bg */}
          <div style={{ position:'absolute', inset:0, opacity:.025, backgroundImage:'linear-gradient(#14B8A6 1px,transparent 1px),linear-gradient(90deg,#14B8A6 1px,transparent 1px)', backgroundSize:'50px 50px', pointerEvents:'none' }}/>

          {/* Logo + back */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:52 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <img src={LOGO_SRC} alt="ASOPISTAR" style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(20,184,166,.4)' }} onError={e=>{ e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                <div style={{ display:'none', width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#14B8A6,#06B6D4)', alignItems:'center', justifyContent:'center', fontSize:20 }}>🐟</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:17, color:'#F8FAFC', letterSpacing:'-0.02em' }}>ASO<span style={{ color:'#14B8A6' }}>PISTAR</span></div>
                  <div style={{ fontSize:11, color:'#475569', fontWeight:500 }}>Sistema Piscícola</div>
                </div>
              </div>
              <button onClick={() => navigate('/')} style={{
                display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.06)',
                border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'7px 12px',
                color:'#94A3B8', fontSize:13, cursor:'pointer', transition:'all .2s',
                fontFamily:'inherit',
              }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(20,184,166,.4)'; e.currentTarget.style.color='#14B8A6'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; e.currentTarget.style.color='#94A3B8'; }}
              >
                <ArrowLeft size={14}/> Inicio
              </button>
            </div>

            {/* Headline */}
            <div style={{ marginBottom:36 }}>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:7,
                background:'rgba(20,184,166,.1)', border:'1px solid rgba(20,184,166,.2)',
                borderRadius:100, padding:'5px 14px', marginBottom:18,
              }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#14B8A6', boxShadow:'0 0 8px #14B8A6', animation:'authPulse 2s infinite' }}/>
                <span style={{ fontSize:12, color:'#14B8A6', fontWeight:600 }}>Sistema activo · Catatumbo</span>
              </div>
              <h2 style={{ fontSize:'clamp(24px,3vw,34px)', fontWeight:900, color:'#F8FAFC', lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:12 }}>
                Gestión piscícola<br/><span style={{ color:'#14B8A6' }}>del campo al mercado</span>
              </h2>
              <p style={{ fontSize:15, color:'#64748B', lineHeight:1.65 }}>
                Todo el ciclo productivo en una sola plataforma, accesible para cada rol de la organización.
              </p>
            </div>

            {/* Feature cards */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {FEATURES.map(({ icon, label, desc }, i) => (
                <div key={label} className={`auth-feat-card auth-float${i===1?'2':i===2?'3':''}`}
                  style={{ animationDelay:`${i*0.8}s` }}>
                  <div style={{
                    width:38, height:38, borderRadius:10, flexShrink:0,
                    background:'rgba(20,184,166,.12)', border:'1px solid rgba(20,184,166,.2)',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                  }}>{icon}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:'#F8FAFC' }}>{label}</div>
                    <div style={{ fontSize:12, color:'#475569', marginTop:2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer izquierdo */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:20 }}>
              <p style={{ fontSize:12, color:'#334155' }}>© 2026 Asociación de Piscicultores del Tarra · Región del Catatumbo</p>
            </div>
          </div>
        </div>

        {/* ══ PANEL DERECHO ══ */}
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'32px 5%', position:'relative', overflow:'hidden',
          background:'#0F172A',
        }}>
          {/* Back link mobile */}
          <div style={{ position:'absolute', top:20, left:20, display:'none' }} className="mobile-back">
            <button onClick={() => navigate('/')} style={{
              display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.06)',
              border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'7px 12px',
              color:'#94A3B8', fontSize:13, cursor:'pointer', fontFamily:'inherit',
            }}>
              <ArrowLeft size={14}/> Inicio
            </button>
          </div>
          <style>{`@media(max-width:900px){ .mobile-back{ display:block !important; } }`}</style>

          <div className="auth-right-inner" style={{ width:'100%', maxWidth:420, padding:'0 8px' }}>

            {/* Logo mobile */}
            <div className="auth-fadein" style={{ textAlign:'center', marginBottom:36, display:'none' }} id="logo-mobile">
              <style>{`@media(max-width:900px){ #logo-mobile{ display:block !important; } }`}</style>
              <div style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#14B8A6,#06B6D4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🐟</div>
                <span style={{ fontWeight:800, fontSize:18, color:'#F8FAFC', letterSpacing:'-0.02em' }}>ASO<span style={{ color:'#14B8A6' }}>PISTAR</span></span>
              </div>
            </div>

            {/* Header */}
            <div className="auth-fadein" style={{ marginBottom:32 }}>
              <h1 style={{ fontSize:'clamp(24px,4vw,30px)', fontWeight:900, color:'#F8FAFC', letterSpacing:'-0.025em', marginBottom:8 }}>
                Bienvenido de nuevo
              </h1>
              <p style={{ fontSize:15, color:'#64748B', lineHeight:1.55 }}>
                Ingresa tus credenciales para acceder a la plataforma.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Email */}
              <div className="auth-fadein-2" style={{ position:'relative' }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:7 }}>Correo electrónico</label>
                <div style={{ position:'relative' }}>
                  <Mail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }}/>
                  <input
                    type="email" required placeholder="correo@asopistar.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="auth-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-fadein-3" style={{ position:'relative' }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:7 }}>Contraseña</label>
                <div style={{ position:'relative' }}>
                  <Lock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }}/>
                  <input
                    type={showPass ? 'text' : 'password'} required placeholder="••••••••"
                    value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })}
                    className="auth-input" style={{ paddingRight:44 }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color:'#475569', padding:0,
                  }}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="auth-fadein" style={{
                  background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.25)',
                  borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'center', gap:10,
                }}>
                  <span style={{ fontSize:16 }}>⚠️</span>
                  <span style={{ fontSize:14, color:'#FCA5A5' }}>{error}</span>
                </div>
              )}

              {/* Botón submit */}
              <div className="auth-fadein-4">
                <button type="submit" disabled={loading} className="auth-btn-primary" style={{ marginTop:4 }}>
                  {loading ? 'Ingresando...' : 'Iniciar sesión →'}
                </button>
              </div>
            </form>

            {/* Links */}
            <div className="auth-fadein-4" style={{ marginTop:24, display:'flex', flexDirection:'column', gap:14, alignItems:'center' }}>
              <p style={{ fontSize:14, color:'#475569' }}>
                ¿No tienes acceso?{' '}
                <Link to="/registro" style={{ color:'#14B8A6', fontWeight:600, textDecoration:'none' }}>
                  Solicitar acceso
                </Link>
              </p>

              <button type="button" onClick={abrirModalReenvio} style={{
                background:'none', border:'none', cursor:'pointer',
                fontSize:13, color:'#334155', fontFamily:'inherit',
                display:'flex', alignItems:'center', gap:6,
                transition:'color .2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color='#14B8A6'}
                onMouseLeave={e => e.currentTarget.style.color='#334155'}
              >
                <RefreshCw size={13}/>
                ¿No recibiste el correo de verificación?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MODAL REENVÍO ══ */}
      {modalReenvio && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.6)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:20,
        }}>
          <div className="auth-fadein" style={{
            background:'#111827', border:'1px solid rgba(255,255,255,.1)', borderRadius:20,
            width:'100%', maxWidth:400, boxShadow:'0 30px 80px rgba(0,0,0,.6)',
            overflow:'hidden',
          }}>
            {/* Header modal */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'rgba(20,184,166,.15)', border:'1px solid rgba(20,184,166,.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Mail size={15} color="#14B8A6"/>
                </div>
                <span style={{ fontWeight:700, fontSize:15, color:'#F8FAFC' }}>Reenviar verificación</span>
              </div>
              <button onClick={() => setModalReenvio(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', display:'flex', alignItems:'center', justifyContent:'center', padding:4 }}>
                <X size={18}/>
              </button>
            </div>

            <div style={{ padding:24 }}>
              {reenvioEstado !== 'exito' ? (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <p style={{ fontSize:14, color:'#64748B', lineHeight:1.6 }}>
                    Ingresa el correo con el que te registraste y te enviaremos un nuevo enlace de verificación.
                  </p>
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:7 }}>Correo electrónico</label>
                    <div style={{ position:'relative' }}>
                      <Mail size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#475569' }}/>
                      <input
                        type="email" value={emailReenvio}
                        onChange={e => setEmailReenvio(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="auth-input" style={{ fontSize:14, padding:'11px 14px 11px 38px' }}
                      />
                    </div>
                  </div>
                  {reenvioEstado === 'error' && reenvioMensaje && (
                    <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#FCA5A5' }}>
                      ⚠️ {reenvioMensaje}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setModalReenvio(false)} style={{
                      flex:1, padding:'11px', borderRadius:10, border:'1px solid rgba(255,255,255,.1)',
                      background:'transparent', color:'#94A3B8', fontSize:14, cursor:'pointer', fontFamily:'inherit',
                    }}>
                      Cancelar
                    </button>
                    <button onClick={handleReenviar} disabled={reenvioEstado === 'loading'} className="auth-btn-primary" style={{ flex:1, padding:'11px', fontSize:14 }}>
                      {reenvioEstado === 'loading' ? 'Enviando...' : 'Reenviar enlace'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'8px 0' }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(20,184,166,.12)', border:'1px solid rgba(20,184,166,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>✅</div>
                  <p style={{ fontSize:14, color:'#94A3B8', textAlign:'center', lineHeight:1.6 }}>{reenvioMensaje}</p>
                  <button onClick={() => setModalReenvio(false)} className="auth-btn-primary" style={{ padding:'11px', fontSize:14 }}>
                    Entendido
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
