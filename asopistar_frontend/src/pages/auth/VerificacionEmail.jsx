// src/pages/auth/VerificacionEmail.jsx
// Rediseño visual v2 — lógica original intacta
// NO verificamos en useEffect porque los clientes de correo hacen pre-fetch de los enlaces.
import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, CheckCircle, XCircle, Loader } from 'lucide-react'
import api from '../../services/api'

const LOGO_SRC = '/src/assets/Logo_asopistar_jpeg.jpeg'

export default function VerificacionEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [estado, setEstado] = useState('esperando') // esperando | cargando | exito | error
  const [mensaje, setMensaje] = useState('')

  const handleVerificar = async () => {
    setEstado('cargando')
    try {
      await api.get(`/auth/verificar-email?token=${token}`)
      setEstado('exito')
    } catch (err) {
      setEstado('error')
      const msg = err.response?.data?.mensaje || err.response?.data?.message
      setMensaje(msg || 'El enlace expiró o ya fue usado. Solicita un nuevo enlace.')
    }
  }

  /* ── contenido según estado ── */
  const content = {
    esperando: {
      icon: <Mail size={34} color="#14B8A6"/>,
      iconBg: 'rgba(20,184,166,.1)',
      iconBorder: 'rgba(20,184,166,.25)',
      title: 'Confirma tu correo electrónico',
      desc: 'Haz clic en el botón de abajo para verificar tu dirección de correo y enviar tu solicitud de acceso al administrador.',
    },
    cargando: {
      icon: <Loader size={34} color="#14B8A6" style={{ animation:'spin 1s linear infinite' }}/>,
      iconBg: 'rgba(20,184,166,.08)',
      iconBorder: 'rgba(20,184,166,.2)',
      title: 'Verificando tu correo...',
      desc: 'Por favor espera un momento mientras procesamos tu solicitud.',
    },
    exito: {
      icon: <CheckCircle size={34} color="#10B981"/>,
      iconBg: 'rgba(16,185,129,.1)',
      iconBorder: 'rgba(16,185,129,.25)',
      title: '¡Correo verificado exitosamente!',
      desc: 'Tu solicitud fue enviada al administrador. Recibirás un correo cuando tu acceso sea aprobado.',
    },
    error: {
      icon: <XCircle size={34} color="#F87171"/>,
      iconBg: 'rgba(239,68,68,.1)',
      iconBorder: 'rgba(239,68,68,.25)',
      title: 'Enlace inválido o expirado',
      desc: mensaje || 'El enlace no es válido o ya fue utilizado.',
    },
  }

  const c = content[estado]

  /* ── token inválido ── */
  if (!token) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          .ve-root *, .ve-root *::before, .ve-root *::after { box-sizing:border-box; margin:0; padding:0; font-family:'Inter',system-ui,sans-serif; }
        `}</style>
        <div className="ve-root" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0F172A', padding:20 }}>
          <div style={{ textAlign:'center', maxWidth:380 }}>
            <div style={{ width:64, height:64, borderRadius:18, background:'rgba(239,68,68,.1)', border:'1.5px solid rgba(239,68,68,.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:30 }}>❌</div>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#F8FAFC', marginBottom:10 }}>Enlace inválido</h2>
            <p style={{ fontSize:15, color:'#64748B', marginBottom:24, lineHeight:1.6 }}>El enlace no contiene un token de verificación válido.</p>
            <Link to="/login" style={{ color:'#14B8A6', fontWeight:600, textDecoration:'none', fontSize:14 }}>← Volver al login</Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .ve-root *, .ve-root *::before, .ve-root *::after { box-sizing:border-box; margin:0; padding:0; font-family:'Inter',system-ui,sans-serif; }
        @keyframes spin    { to{ transform:rotate(360deg) } }
        @keyframes veFadeUp{ from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes veFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        .ve-fadein  { animation: veFadeUp .5s ease both; }
        .ve-fadein2 { animation: veFadeUp .5s .1s ease both; }
        .ve-fadein3 { animation: veFadeUp .5s .2s ease both; }
        .ve-icon-wrap { animation: veFloat 4s ease-in-out infinite; }
        .ve-btn-primary {
          width:100%; padding:14px; border-radius:12px; border:none;
          background:linear-gradient(135deg,#14B8A6,#06B6D4);
          color:#0F172A; font-size:15px; font-weight:700; cursor:pointer;
          transition:transform .25s, box-shadow .25s; font-family:inherit;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .ve-btn-primary:hover:not(:disabled){ transform:translateY(-2px); box-shadow:0 10px 36px rgba(20,184,166,.38); }
        .ve-btn-primary:disabled{ opacity:.65; cursor:not-allowed; }
        .ve-btn-ghost {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
          border-radius:10px; padding:8px 14px; color:#94A3B8; font-size:13px;
          cursor:pointer; font-family:inherit; transition:all .2s; text-decoration:none;
        }
        .ve-btn-ghost:hover { border-color:rgba(20,184,166,.35); color:#14B8A6; }

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
        body.alt-font .reg-root *  { font-family: Arial, sans-serif !important; letter-spacing: 0.05em; }/* split */
        .ve-split { display:grid; grid-template-columns:380px 1fr; min-height:100vh; }
        .ve-left   { display:flex; }
        @media(max-width:900px){ .ve-split{ grid-template-columns:1fr; } .ve-left{ display:none; } }
        @media(max-width:480px){ .ve-right-inner{ padding:28px 16px !important; } }
      `}</style>

      <div className="ve-root ve-split" style={{ background:'#0F172A' }}>

        {/* ══ PANEL IZQUIERDO ══ */}
        <div className="ve-left" style={{
          background:'linear-gradient(160deg,#0b1829 0%,#0c2020 100%)',
          borderRight:'1px solid rgba(255,255,255,.06)',
          flexDirection:'column', justifyContent:'space-between',
          padding:'44px 44px', position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'rgba(20,184,166,.07)', filter:'blur(70px)', top:-60, right:-60, pointerEvents:'none' }}/>
          <div style={{ position:'absolute', inset:0, opacity:.025, backgroundImage:'linear-gradient(#14B8A6 1px,transparent 1px),linear-gradient(90deg,#14B8A6 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' }}/>

          <div style={{ position:'relative', zIndex:1 }}>
            {/* Logo + nav */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:52 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <img src={LOGO_SRC} alt="ASOPISTAR" style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(20,184,166,.4)' }} onError={e=>{ e.target.style.display='none'; }}/>
                <div>
                  <div style={{ fontWeight:800, fontSize:16, color:'#F8FAFC', letterSpacing:'-0.02em' }}>ASO<span style={{ color:'#14B8A6' }}>PISTAR</span></div>
                  <div style={{ fontSize:10, color:'#475569' }}>Sistema Piscícola</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="ve-btn-ghost" onClick={() => navigate('/')} style={{ fontSize:12, padding:'6px 10px' }}>
                  <ArrowLeft size={12}/> Inicio
                </button>
                <Link to="/login" className="ve-btn-ghost" style={{ fontSize:12, padding:'6px 10px' }}>
                  <ArrowLeft size={12}/> Login
                </Link>
              </div>
            </div>

            {/* Explicación del proceso */}
            <div style={{ marginBottom:36 }}>
              <h2 style={{ fontSize:20, fontWeight:900, color:'#F8FAFC', letterSpacing:'-0.025em', lineHeight:1.1, marginBottom:10 }}>
                Verificación de <span style={{ color:'#14B8A6' }}>identidad</span>
              </h2>
              <p style={{ fontSize:13, color:'#64748B', lineHeight:1.65 }}>
                Este paso confirma que eres dueño del correo electrónico registrado.
                Es requerido antes de que el administrador apruebe tu acceso.
              </p>
            </div>

            {/* Por qué verificamos */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <p style={{ fontSize:11, color:'#475569', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em' }}>¿Por qué este paso?</p>
              {[
                { icon:'🔒', title:'Seguridad', desc:'Garantiza que solo tú puedes acceder con este correo.' },
                { icon:'✅', title:'Confianza', desc:'El administrador sabrá que el correo es válido.' },
                { icon:'⚡', title:'Rapidez', desc:'Agiliza el proceso de aprobación del administrador.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:'rgba(20,184,166,.08)', border:'1px solid rgba(20,184,166,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#CBD5E1', marginBottom:2 }}>{title}</div>
                    <div style={{ fontSize:12, color:'#475569', lineHeight:1.5 }}>{desc}</div>
                  </div>
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
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'40px 5%', background:'#0F172A', minHeight:'100vh',
        }}>


          {/* Nav mobile */}
          <div style={{ width:'100%', maxWidth:420, display:'none', gap:8, marginBottom:24 }} id="ve-mobile-nav">
            <style>{`@media(max-width:900px){ #ve-mobile-nav{ display:flex !important; } }`}</style>
            <button className="ve-btn-ghost" onClick={() => navigate('/')} style={{ fontSize:12 }}>
              <ArrowLeft size={12}/> Inicio
            </button>
            <Link to="/login" className="ve-btn-ghost" style={{ fontSize:12 }}>
              <ArrowLeft size={12}/> Login
            </Link>
          </div>

          <div className="ve-right-inner" style={{ width:'100%', maxWidth:420, padding:'0 8px' }}>

            {/* Ícono animado */}
            <div className="ve-fadein" style={{ textAlign:'center', marginBottom:32 }}>
              <div className="ve-icon-wrap" style={{
                width:80, height:80, borderRadius:22, margin:'0 auto 22px',
                background: c.iconBg, border:`1.5px solid ${c.iconBorder}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all .4s',
              }}>
                {c.icon}
              </div>
              <h1 style={{ fontSize:'clamp(20px,4vw,26px)', fontWeight:900, color:'#F8FAFC', letterSpacing:'-0.025em', marginBottom:10, lineHeight:1.1, transition:'all .4s' }}>
                {c.title}
              </h1>
              <p style={{ fontSize:15, color:'#64748B', lineHeight:1.65, transition:'all .4s' }}>
                {c.desc}
              </p>
            </div>

            {/* Card de estado */}
            <div className="ve-fadein2" style={{
              background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.07)',
              borderRadius:16, padding:'18px 20px', marginBottom:20,
            }}>
              {estado === 'esperando' && (
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#F59E0B', boxShadow:'0 0 8px #F59E0B', flexShrink:0 }}/>
                  <span style={{ fontSize:13, color:'#FCD34D', fontWeight:600 }}>Pendiente de verificación</span>
                </div>
              )}
              {estado === 'cargando' && (
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#14B8A6', animation:'pulse 1.5s infinite', flexShrink:0 }}/>
                  <span style={{ fontSize:13, color:'#14B8A6', fontWeight:600 }}>Procesando verificación...</span>
                </div>
              )}
              {estado === 'exito' && (
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#10B981', flexShrink:0 }}/>
                  <span style={{ fontSize:13, color:'#6EE7B7', fontWeight:600 }}>Verificado · Pendiente de aprobación del administrador</span>
                </div>
              )}
              {estado === 'error' && (
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#EF4444', flexShrink:0 }}/>
                  <span style={{ fontSize:13, color:'#FCA5A5', fontWeight:600 }}>Verificación fallida</span>
                </div>
              )}
            </div>

            {/* Acciones según estado */}
            <div className="ve-fadein3" style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {estado === 'esperando' && (
                <button onClick={handleVerificar} className="ve-btn-primary">
                  <CheckCircle size={18}/> Verificar mi correo
                </button>
              )}
              {estado === 'cargando' && (
                <button disabled className="ve-btn-primary">
                  <Loader size={18} style={{ animation:'spin 1s linear infinite' }}/> Verificando...
                </button>
              )}
              {estado === 'exito' && (
                <>
                  <Link to="/login" className="ve-btn-primary" style={{ textDecoration:'none' }}>
                    Ir al inicio de sesión →
                  </Link>
                </>
              )}
              {estado === 'error' && (
                <>
                  <Link to="/registro" className="ve-btn-primary" style={{ textDecoration:'none' }}>
                    Registrarme de nuevo
                  </Link>
                  <Link to="/login" className="ve-btn-ghost" style={{ justifyContent:'center' }}>
                    <ArrowLeft size={13}/> Volver al login
                  </Link>
                </>
              )}
              {estado !== 'error' && (
                <Link to="/login" className="ve-btn-ghost" style={{ justifyContent:'center' }}>
                  <ArrowLeft size={13}/> Volver al inicio de sesión
                </Link>
              )}
            </div>

            <p style={{ fontSize:12, color:'#334155', textAlign:'center', marginTop:20 }}>
              Asociación de Piscicultores del Tarra · Catatumbo
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
