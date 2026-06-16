// src/pages/auth/PendienteAprobacion.jsx
// Rediseño visual v2 — lógica original intacta
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Clock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../../services/api'

const LOGO_SRC = '/src/assets/Logo_asopistar_jpeg.jpeg'

export default function PendienteAprobacion() {
  const location = useLocation()
  const navigate  = useNavigate()
  const email = location.state?.email || ''
  const tipo  = location.state?.tipo  || 'verificacion' // 'verificacion' | 'aprobacion'

  const [reenvioEstado, setReenvioEstado] = useState('idle') // idle | loading | exito | error

  const handleReenviar = async () => {
    if (!email) return
    setReenvioEstado('loading')
    try {
      await api.post('/auth/reenviar-verificacion', { email })
      setReenvioEstado('exito')
    } catch {
      setReenvioEstado('error')
    }
  }

  /* ── pasos según tipo ── */
  const pasosVerificacion = [
    { n:1, texto:'Revisa tu bandeja de entrada (y la carpeta de spam)' },
    { n:2, texto:'Haz clic en el enlace "Verificar correo"' },
    { n:3, texto:'Espera la aprobación del administrador' },
    { n:4, texto:'Recibirás un correo cuando tu acceso sea aprobado' },
  ]
  const pasosAprobacion = [
    { n:1, texto:'Tu correo ya fue verificado correctamente' },
    { n:2, texto:'El administrador revisará tu solicitud' },
    { n:3, texto:'Recibirás un correo con la decisión' },
    { n:4, texto:'Si es aprobada, podrás iniciar sesión' },
  ]
  const pasos = tipo === 'verificacion' ? pasosVerificacion : pasosAprobacion

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .pa-root *, .pa-root *::before, .pa-root *::after { box-sizing:border-box; margin:0; padding:0; font-family:'Inter',system-ui,sans-serif; }
        @keyframes paFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes paPulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes paFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .pa-fadein  { animation: paFadeUp .5s ease both; }
        .pa-fadein2 { animation: paFadeUp .5s .1s ease both; }
        .pa-fadein3 { animation: paFadeUp .5s .2s ease both; }
        .pa-icon    { animation: paFloat 4s ease-in-out infinite; }
        .pa-btn-primary {
          width:100%; padding:14px; border-radius:12px; border:none;
          background:linear-gradient(135deg,#14B8A6,#06B6D4);
          color:#0F172A; font-size:15px; font-weight:700; cursor:pointer;
          transition:transform .25s, box-shadow .25s; font-family:inherit;
        }
        .pa-btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 36px rgba(20,184,166,.38); }
        .pa-btn-ghost {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
          border-radius:10px; padding:8px 14px; color:#94A3B8; font-size:13px;
          cursor:pointer; font-family:inherit; transition:all .2s; text-decoration:none;
        }
        .pa-btn-ghost:hover { border-color:rgba(20,184,166,.35); color:#14B8A6; }

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
        .pa-split { display:grid; grid-template-columns:380px 1fr; min-height:100vh; }
        .pa-left  { display:flex; }
        @media(max-width:900px){ .pa-split{ grid-template-columns:1fr; } .pa-left{ display:none; } }
        @media(max-width:480px){ .pa-right-inner{ padding:28px 16px !important; } }
      `}</style>

      <div className="pa-root pa-split" style={{ background:'#0F172A' }}>

        {/* ══ PANEL IZQUIERDO ══ */}
        <div className="pa-left" style={{
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
                <button className="pa-btn-ghost" onClick={() => navigate('/')} style={{ fontSize:12, padding:'6px 10px' }}>
                  <ArrowLeft size={12}/> Inicio
                </button>
                <Link to="/login" className="pa-btn-ghost" style={{ fontSize:12, padding:'6px 10px' }}>
                  <ArrowLeft size={12}/> Login
                </Link>
              </div>
            </div>

            {/* Estado visual */}
            <div style={{ marginBottom:36 }}>
              <div style={{
                width:64, height:64, borderRadius:18, marginBottom:20,
                background: tipo==='verificacion' ? 'rgba(20,184,166,.12)' : 'rgba(245,158,11,.1)',
                border: tipo==='verificacion' ? '1.5px solid rgba(20,184,166,.3)' : '1.5px solid rgba(245,158,11,.3)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
              }}>
                {tipo==='verificacion' ? '📧' : '⏳'}
              </div>
              <h2 style={{ fontSize:20, fontWeight:900, color:'#F8FAFC', lineHeight:1.1, letterSpacing:'-0.025em', marginBottom:10 }}>
                {tipo==='verificacion' ? 'Verifica tu correo' : 'Solicitud en revisión'}
              </h2>
              <p style={{ fontSize:13, color:'#64748B', lineHeight:1.65 }}>
                {tipo==='verificacion'
                  ? 'Enviamos un enlace de verificación a tu correo. Sigue los pasos para completar el registro.'
                  : 'Tu solicitud está siendo revisada por el administrador del sistema.'
                }
              </p>
            </div>

            {/* Pasos */}
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              <p style={{ fontSize:11, color:'#475569', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14 }}>Próximos pasos</p>
              {pasos.map(({ n, texto }, i) => (
                <div key={n} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div style={{
                      width:26, height:26, borderRadius:'50%', flexShrink:0,
                      background:'rgba(20,184,166,.15)', border:'1.5px solid rgba(20,184,166,.35)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:11, fontWeight:700, color:'#14B8A6',
                    }}>{n}</div>
                    {i < pasos.length-1 && <div style={{ width:1, height:26, background:'rgba(20,184,166,.2)', margin:'2px 0' }}/>}
                  </div>
                  <div style={{ paddingTop:3, paddingBottom: i < pasos.length-1 ? 20 : 0 }}>
                    <p style={{ fontSize:13, color:'#64748B', lineHeight:1.5 }}>{texto}</p>
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


          {/* Nav mobile — solo visible cuando el panel izquierdo está oculto (≤900px) */}
          <div style={{ width:'100%', maxWidth:440, display:'none', gap:8, marginBottom:24 }} id="pa-mobile-nav">
            <style>{`@media(max-width:900px){ #pa-mobile-nav{ display:flex !important; } }`}</style>
            <button className="pa-btn-ghost" onClick={() => navigate('/')} style={{ fontSize:12 }}>
              <ArrowLeft size={12}/> Inicio
            </button>
            <Link to="/login" className="pa-btn-ghost" style={{ fontSize:12 }}>
              <ArrowLeft size={12}/> Login
            </Link>
          </div>

          <div className="pa-right-inner" style={{ width:'100%', maxWidth:440, padding:'0 8px' }}>

            {/* Ícono central animado */}
            <div className="pa-fadein" style={{ textAlign:'center', marginBottom:32 }}>
              <div className="pa-icon" style={{
                width:80, height:80, borderRadius:22, margin:'0 auto 20px',
                background: tipo==='verificacion' ? 'rgba(20,184,166,.1)' : 'rgba(245,158,11,.08)',
                border: tipo==='verificacion' ? '1.5px solid rgba(20,184,166,.25)' : '1.5px solid rgba(245,158,11,.2)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:36,
              }}>
                {tipo==='verificacion' ? '📧' : '⏳'}
              </div>
              <h1 style={{ fontSize:'clamp(22px,4vw,28px)', fontWeight:900, color:'#F8FAFC', letterSpacing:'-0.025em', marginBottom:10, lineHeight:1.1 }}>
                {tipo==='verificacion' ? 'Verifica tu correo electrónico' : 'Solicitud enviada correctamente'}
              </h1>
              <p style={{ fontSize:15, color:'#64748B', lineHeight:1.65 }}>
                {tipo==='verificacion' ? (
                  <>Te enviamos un enlace de verificación a{' '}
                    <span style={{ color:'#CBD5E1', fontWeight:600 }}>{email || 'tu correo'}</span>.
                    Haz clic en ese enlace para confirmar tu cuenta.</>
                ) : (
                  <>Tu solicitud ha sido enviada. El administrador revisará tu perfil y recibirás un correo en{' '}
                    <span style={{ color:'#CBD5E1', fontWeight:600 }}>{email}</span> cuando sea aprobada.</>
                )}
              </p>
            </div>

            {/* Card de estado */}
            <div className="pa-fadein2" style={{
              background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.07)',
              borderRadius:16, padding:'20px 22px', marginBottom:20,
            }}>
              {tipo === 'verificacion' ? (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#F59E0B', boxShadow:'0 0 8px #F59E0B', flexShrink:0 }}/>
                    <span style={{ fontSize:14, fontWeight:600, color:'#FCD34D' }}>Pendiente de verificación</span>
                  </div>
                  <p style={{ fontSize:13, color:'#64748B', lineHeight:1.55 }}>
                    Revisa tu bandeja de entrada y la carpeta de <strong style={{ color:'#94A3B8' }}>spam</strong>. El enlace expira en 24 horas.
                  </p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#14B8A6', boxShadow:'0 0 8px #14B8A6', flexShrink:0 }}/>
                    <span style={{ fontSize:14, fontWeight:600, color:'#14B8A6' }}>Correo verificado · Pendiente de aprobación</span>
                  </div>
                  <p style={{ fontSize:13, color:'#64748B', lineHeight:1.55 }}>
                    El administrador revisará tu solicitud y recibirás una notificación por correo.
                  </p>
                </div>
              )}
            </div>

            {/* Acciones reenvío — solo para tipo verificacion */}
            {tipo === 'verificacion' && (
              <div className="pa-fadein3" style={{ marginBottom:20 }}>
                {reenvioEstado === 'exito' ? (
                  <div style={{
                    background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.2)',
                    borderRadius:12, padding:'14px 16px',
                    display:'flex', alignItems:'center', gap:10,
                  }}>
                    <CheckCircle size={18} color="#10B981"/>
                    <span style={{ fontSize:14, color:'#6EE7B7' }}>Nuevo enlace enviado. Revisa tu correo.</span>
                  </div>
                ) : reenvioEstado === 'error' ? (
                  <div style={{
                    background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)',
                    borderRadius:12, padding:'14px 16px',
                    display:'flex', alignItems:'center', gap:10,
                  }}>
                    <AlertCircle size={18} color="#F87171"/>
                    <span style={{ fontSize:14, color:'#FCA5A5' }}>No se pudo reenviar. Intenta más tarde.</span>
                  </div>
                ) : email && (
                  <button
                    onClick={handleReenviar}
                    disabled={reenvioEstado === 'loading'}
                    style={{
                      width:'100%', padding:'13px', borderRadius:12,
                      background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)',
                      color:'#94A3B8', fontSize:14, cursor:'pointer', fontFamily:'inherit',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                      transition:'all .25s',
                    }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(20,184,166,.35)'; e.currentTarget.style.color='#14B8A6'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; e.currentTarget.style.color='#94A3B8'; }}
                  >
                    <RefreshCw size={15} style={{ animation: reenvioEstado==='loading' ? 'spin 1s linear infinite' : 'none' }}/>
                    {reenvioEstado === 'loading' ? 'Enviando...' : '¿No recibiste el correo? Reenviar enlace'}
                  </button>
                )}
              </div>
            )}

            {/* Botón volver login */}
            <div className="pa-fadein3">
              <Link to="/login" className="pa-btn-primary" style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                textDecoration:'none',
              }}>
                Volver al inicio de sesión
              </Link>
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
