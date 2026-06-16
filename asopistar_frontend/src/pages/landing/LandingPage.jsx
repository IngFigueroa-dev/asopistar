// src/pages/landing/LandingPage.jsx
// Landing Page pública de ASOPISTAR — versión 1.1
// Fixes: responsive mobile, cerrar sesión → "/", "Solicitar acceso" → scroll, mailto eliminado

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ── Contador animado: arranca cuando "started" se pone en true ── */
function useCountUp(target, started, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return count;
}

/* ── Reveal on scroll ── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

/* ─────────────────────────────────────────────────────────
   LANDING PAGE PRINCIPAL
───────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = () => window.innerWidth <= 768;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar menú mobile al hacer scroll
  useEffect(() => {
    if (menuOpen) {
      const close = () => setMenuOpen(false);
      window.addEventListener("scroll", close, { once: true });
    }
  }, [menuOpen]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Un ref para la sección — dispara todos los contadores a la vez
  const impactRef = useRef(null);
  const [impactStarted, setImpactStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setImpactStarted(true); },
      { threshold: 0.2 }
    );
    if (impactRef.current) obs.observe(impactRef.current);
    return () => obs.disconnect();
  }, []);
  const c1 = useCountUp(47, impactStarted);
  const c2 = useCountUp(320, impactStarted);
  const c3 = useCountUp(1200, impactStarted);
  const c4 = useCountUp(180, impactStarted);
  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useReveal();
  const r5 = useReveal();
  const r6 = useReveal();

  const pipeline = [
    { icon: "🐟", label: "Siembra", desc: "Registro de alevinos en estanques activos" },
    { icon: "🔬", label: "Seguimiento", desc: "Visitas del biólogo y aprobación de cosecha" },
    { icon: "📅", label: "Turno de Pesca", desc: "Programación automática por prioridad" },
    { icon: "🏭", label: "Recepción", desc: "Entrada a planta, pesaje y registro" },
    { icon: "❄️", label: "Cuarto Frío", desc: "Almacenamiento con trazabilidad total" },
    { icon: "🚚", label: "Distribución", desc: "Envíos a clientes y puntos de venta" },
    { icon: "💰", label: "Pagos", desc: "Liquidación automática al productor" },
    { icon: "📊", label: "Reportes", desc: "Visibilidad financiera en tiempo real" },
  ];

  const benefits = [
    { icon: "📍", title: "Trazabilidad total", desc: "Desde el alevino hasta el cliente final, cada kilo tiene historia." },
    { icon: "🗓️", title: "Turnos organizados", desc: "Sin conflictos ni favoritismos. El sistema ordena por urgencia real." },
    { icon: "🧪", title: "Seguimiento técnico", desc: "El biólogo registra visitas y aprueba cosechas directamente." },
    { icon: "🛒", title: "Acceso a insumos", desc: "Alevinos y concentrado disponibles a través de la asociación." },
    { icon: "💵", title: "Pagos transparentes", desc: "Liquidación con precio por kilo visible y estado de pago claro." },
    { icon: "📱", title: "Info en tiempo real", desc: "Cuarto frío, siembras activas y pagos pendientes, siempre al día." },
  ];

  const services = [
    { icon: "🐠", title: "Producción Piscícola", desc: "Gestión de estanques, siembras y ciclos productivos." },
    { icon: "🔬", title: "Seguimiento Biológico", desc: "Monitoreo de peces con indicadores de salud y agua." },
    { icon: "🏗️", title: "Procesamiento", desc: "Eviscerado, limpieza y preparación para distribución." },
    { icon: "❄️", title: "Almacenamiento Frío", desc: "Cuarto frío con lotes codificados y estado en vivo." },
    { icon: "🚛", title: "Logística", desc: "Envíos a mayoristas, restaurantes y puntos propios." },
    { icon: "📦", title: "Insumos", desc: "Venta de alevinos y alimento a los productores." },
  ];

  return (
    <div style={{ background: "#0F172A", color: "#F8FAFC", fontFamily: "'Inter',system-ui,sans-serif", overflowX: "hidden", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }/* ── Animaciones ── */
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .reveal.visible { opacity: 1; transform: none; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatDelay { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float { animation: float 4s ease-in-out infinite; }
        .float-d { animation: floatDelay 4s ease-in-out 1.5s infinite; }

        /* ── Cards ── */
        .card-h { transition: transform .3s, box-shadow .3s, border-color .3s; }
        .card-h:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(20,184,166,.14); border-color: rgba(20,184,166,.4) !important; }
        .pipe-step:hover .pipe-icon { background: rgba(20,184,166,.25) !important; border-color: rgba(20,184,166,.6) !important; transform: scale(1.1); }
        .pipe-icon { transition: all .3s; }

        /* ── Botones ── */
        .btn-p {
          background: linear-gradient(135deg,#14B8A6,#06B6D4);
          color: #0F172A; font-weight: 700; border: none; cursor: pointer;
          transition: transform .25s, box-shadow .25s, filter .25s;
          font-family: inherit;
        }
        .btn-p:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(20,184,166,.38); filter: brightness(1.06); }
        .btn-g {
          background: transparent; color: #F8FAFC; font-weight: 600;
          border: 1.5px solid rgba(248,250,252,.22); cursor: pointer;
          transition: all .25s; font-family: inherit;
        }
        .btn-g:hover { border-color: rgba(20,184,166,.6); color: #14B8A6; background: rgba(20,184,166,.05); }

        /* ── Nav ── */
        .nav-link { color: #94A3B8; font-size:14px; font-weight:500; cursor:pointer; transition: color .2s; }
        .nav-link:hover { color: #F8FAFC; }

        /* ── Glow ── */
        .glow { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }

        /* ══════════════════════════════════════
           RESPONSIVE — MOBILE FIRST
        ══════════════════════════════════════ */

        /* Hero */
        .hero-inner { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
        .hero-mock { display:block; }

        /* Sección beneficios (izq/der en desktop) */
        .benefits-outer { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:start; }
        .benefits-grid  { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

        /* Grids de cards */
        .services-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .pipe-grid     { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .impact-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
        .footer-grid   { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; margin-bottom:40px; }

        /* Nav desktop links */
        .nav-links-desktop { display:flex; gap:28px; align-items:center; }
        .nav-btn-group { display:flex; gap:10px; align-items:center; }
        .hamburger { display:none; }
        .mobile-menu { display:none; }

        @media (max-width: 900px) {
          .services-grid { grid-template-columns:repeat(2,1fr) !important; }
          .pipe-grid     { grid-template-columns:repeat(2,1fr) !important; }
          .benefits-outer{ grid-template-columns:1fr !important; gap:40px !important; }
        }

        @media (max-width: 768px) {
          /* Ocultar nav links en desktop, mostrar hamburger */
          .nav-links-desktop { display:none !important; }
          .nav-btn-group { gap:8px; }
          .nav-btn-group .btn-g { display:none; } /* ocultar "Iniciar sesión" — hay botón en menú */
          .hamburger { display:flex !important; }

          /* Menú mobile overlay */
          .mobile-menu.open {
            display:flex !important;
            flex-direction:column;
            position:fixed; top:72px; left:0; right:0;
            background:rgba(15,23,42,0.97);
            backdrop-filter:blur(20px);
            border-bottom:1px solid rgba(255,255,255,0.08);
            padding:20px 24px 28px;
            gap:4px;
            z-index:999;
          }
          .mobile-menu .mn-link {
            padding:14px 0;
            color:#CBD5E1;
            font-size:16px;
            font-weight:500;
            border-bottom:1px solid rgba(255,255,255,0.06);
            cursor:pointer;
          }
          .mobile-menu .mn-link:hover { color:#14B8A6; }
          .mobile-menu .mn-btns { display:flex; flex-direction:column; gap:10px; margin-top:16px; }

          /* Hero: una columna, ocultar mockup */
          .hero-inner { grid-template-columns:1fr !important; gap:40px !important; }
          .hero-mock  { display:none !important; }

          /* Grids */
          .services-grid { grid-template-columns:1fr 1fr !important; }
          .pipe-grid     { grid-template-columns:1fr 1fr !important; }
          .impact-grid   { grid-template-columns:1fr 1fr !important; }
          .benefits-outer{ grid-template-columns:1fr !important; }
          .benefits-grid { grid-template-columns:1fr 1fr !important; }
          .footer-grid   { grid-template-columns:1fr !important; gap:28px !important; }

          /* Secciones: menos padding */
          .section-pad { padding:64px 5% !important; }
          .section-pad-sm { padding:48px 5% !important; }

          /* Historia: menos padding lateral */
          .mision-box { padding:40px 24px !important; }

          /* Ocultar mini-stats hero en móvil muy pequeño */
          .hero-mini-stats { flex-wrap:wrap; gap:24px !important; }
        }

        @media (max-width: 480px) {
          .services-grid { grid-template-columns:1fr !important; }
          .benefits-grid { grid-template-columns:1fr !important; }
          .impact-grid   { grid-template-columns:1fr 1fr !important; }
          .pipe-grid     { grid-template-columns:1fr 1fr !important; }
          .hero-btns     { flex-direction:column !important; }
          .hero-btns button { width:100% !important; }
          .cta-btns { flex-direction:column !important; align-items:stretch !important; }
          .cta-btns button { width:100% !important; }
        }
      `}</style>

      {/* ════════════════════════════════
          NAVBAR
      ════════════════════════════════ */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:1000,
        padding:"0 5%", height:"72px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        transition:"all .4s",
        background: scrolled ? "rgba(15,23,42,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:"linear-gradient(135deg,#14B8A6,#06B6D4)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
          }}>🐟</div>
          <span style={{ fontWeight:800, fontSize:18, letterSpacing:"-0.02em" }}>
            ASO<span style={{ color:"#14B8A6" }}>PISTAR</span>
          </span>
        </div>

        {/* Links desktop */}
        <div className="nav-links-desktop">
          {["inicio","nosotros","servicios","productores","contacto"].map(s => (
            <span key={s} className="nav-link" onClick={() => scrollTo(s)}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </span>
          ))}
        </div>

        {/* Botones derecha */}
        <div className="nav-btn-group">
          <button className="btn-g" style={{ padding:"8px 18px", borderRadius:10, fontSize:14 }} onClick={() => navigate("/login")}>
            Iniciar sesión
          </button>
          <button className="btn-p" style={{ padding:"8px 18px", borderRadius:10, fontSize:14 }} onClick={() => scrollTo("contacto")}>
            Solicitar acceso
          </button>
          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display:"none", // se sobreescribe con CSS
              background:"transparent", border:"none", cursor:"pointer",
              flexDirection:"column", gap:"5px", padding:"8px",
            }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display:"block", width:22, height:2, borderRadius:2,
                background:"#F8FAFC",
                transition:"all .3s",
                transform: menuOpen && i===0 ? "rotate(45deg) translate(5px,5px)"
                  : menuOpen && i===1 ? "scaleX(0)"
                  : menuOpen && i===2 ? "rotate(-45deg) translate(5px,-5px)"
                  : "none",
              }}/>
            ))}
          </button>
        </div>
      </nav>

      {/* Menú mobile */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {["inicio","nosotros","servicios","productores","contacto"].map(s => (
          <div key={s} className="mn-link" onClick={() => scrollTo(s)}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
          </div>
        ))}
        <div className="mn-btns">
          <button className="btn-g" style={{ padding:"12px", borderRadius:12, fontSize:15, width:"100%" }} onClick={() => { setMenuOpen(false); navigate("/login"); }}>
            Iniciar sesión
          </button>
          <button className="btn-p" style={{ padding:"12px", borderRadius:12, fontSize:15, width:"100%" }} onClick={() => scrollTo("contacto")}>
            Solicitar acceso →
          </button>
        </div>
      </div>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section id="inicio" style={{ minHeight:"100vh", display:"flex", alignItems:"center", position:"relative", padding:"120px 5% 80px", overflow:"hidden" }}>
        <div className="glow" style={{ width:600, height:600, background:"rgba(20,184,166,.07)", top:-120, right:-120 }}/>
        <div className="glow" style={{ width:350, height:350, background:"rgba(6,182,212,.05)", bottom:0, left:"8%" }}/>
        {/* Grid pattern */}
        <div style={{
          position:"absolute", inset:0, opacity:0.025, pointerEvents:"none",
          backgroundImage:"linear-gradient(#14B8A6 1px,transparent 1px),linear-gradient(90deg,#14B8A6 1px,transparent 1px)",
          backgroundSize:"60px 60px",
        }}/>

        <div style={{ maxWidth:1280, margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>
          <div className="hero-inner">
            {/* Texto */}
            <div>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background:"rgba(20,184,166,.1)", border:"1px solid rgba(20,184,166,.25)",
                borderRadius:100, padding:"6px 16px", marginBottom:28,
              }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#14B8A6", boxShadow:"0 0 8px #14B8A6" }}/>
                <span style={{ fontSize:13, color:"#14B8A6", fontWeight:600 }}>Sistema activo en el Catatumbo</span>
              </div>

              <h1 style={{
                fontSize:"clamp(36px,5vw,66px)", fontWeight:900,
                lineHeight:1.06, letterSpacing:"-0.03em", marginBottom:22,
              }}>
                Impulsamos el<br/>
                <span style={{ color:"#14B8A6" }}>desarrollo</span><br/>
                piscícola del<br/>
                Catatumbo
              </h1>

              <p style={{ fontSize:17, color:"#94A3B8", lineHeight:1.7, maxWidth:460, marginBottom:36 }}>
                Una plataforma que conecta productores, técnicos, planta de procesamiento
                y comercialización para construir un futuro sostenible y organizado.
              </p>

              <div className="hero-btns" style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:48 }}>
                <button className="btn-p" style={{ padding:"14px 28px", borderRadius:12, fontSize:16 }} onClick={() => scrollTo("contacto")}>
                  Solicitar acceso →
                </button>
                <button className="btn-g" style={{ padding:"14px 28px", borderRadius:12, fontSize:16 }} onClick={() => scrollTo("nosotros")}>
                  Conocer más
                </button>
              </div>

              <div className="hero-mini-stats" style={{ display:"flex", gap:36 }}>
                {[["47+","Productores"],["1.2K","Kilos/mes"],["8","Módulos"]].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ fontSize:24, fontWeight:800 }}>{n}</div>
                    <div style={{ fontSize:13, color:"#64748B", fontWeight:500 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup — se oculta en mobile via CSS */}
            <div className="hero-mock" style={{ position:"relative", display:"flex", justifyContent:"center", alignItems:"center" }}>
              <div className="float" style={{
                width:"100%", maxWidth:460,
                background:"rgba(20,184,166,.04)", border:"1px solid rgba(20,184,166,.15)",
                borderRadius:24, padding:"28px 28px 24px",
                position:"relative", overflow:"hidden",
              }}>
                {/* Titlebar */}
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:22 }}>
                  {["#EF4444","#F59E0B","#10B981"].map(c => (
                    <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c }}/>
                  ))}
                  <span style={{ marginLeft:10, fontSize:11, color:"#475569", fontFamily:"monospace" }}>asopistar.com/dashboard</span>
                </div>
                {/* Stats */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:10, color:"#475569", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", marginBottom:12 }}>Resumen de hoy</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      ["Kilos en cuarto frío","2,340 kg","#14B8A6"],
                      ["Turnos pendientes","3","#F59E0B"],
                      ["Siembras activas","12","#06B6D4"],
                      ["Pagos pendientes","$ 4.2M","#8B5CF6"],
                    ].map(([lbl,val,col]) => (
                      <div key={lbl} style={{
                        background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)",
                        borderRadius:10, padding:"12px 10px",
                      }}>
                        <div style={{ fontSize:9, color:"#475569", marginBottom:6 }}>{lbl}</div>
                        <div style={{ fontSize:18, fontWeight:700, color:col }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Chart bars */}
                <div>
                  <div style={{ fontSize:10, color:"#475569", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", marginBottom:10 }}>Producción reciente</div>
                  <div style={{ display:"flex", gap:7, alignItems:"flex-end", height:54 }}>
                    {[35,55,42,70,58,80,65].map((h,i) => (
                      <div key={i} style={{ flex:1, borderRadius:"4px 4px 0 0", height:`${h}%`, background: i===5 ? "#14B8A6" : "rgba(20,184,166,.2)" }}/>
                    ))}
                  </div>
                </div>
                {/* Online badge */}
                <div style={{
                  position:"absolute", top:14, right:14,
                  display:"flex", alignItems:"center", gap:6,
                  background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.2)",
                  borderRadius:100, padding:"4px 10px",
                }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"#10B981", boxShadow:"0 0 6px #10B981" }}/>
                  <span style={{ fontSize:10, color:"#10B981", fontWeight:600 }}>En línea</span>
                </div>
              </div>
              {/* Badge flotante */}
              <div className="float-d" style={{
                position:"absolute", bottom:-14, left:-14,
                background:"rgba(15,23,42,.92)", backdropFilter:"blur(12px)",
                border:"1px solid rgba(20,184,166,.3)", borderRadius:14,
                padding:"10px 14px", display:"flex", alignItems:"center", gap:10,
              }}>
                <span style={{ fontSize:22 }}>🐟</span>
                <div>
                  <div style={{ fontSize:11, color:"#14B8A6", fontWeight:700 }}>Nuevo lote registrado</div>
                  <div style={{ fontSize:10, color:"#475569" }}>LOTE-047 · 280 kg cachama</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          IMPACTO
      ════════════════════════════════ */}
      <section id="nosotros" className="section-pad" style={{ padding:"90px 5%" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div ref={r1.ref} className={`reveal${r1.visible?" visible":""}`} style={{ textAlign:"center", marginBottom:56 }}>
            <span style={{ fontSize:12, color:"#14B8A6", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}>Nuestro impacto</span>
            <h2 style={{ fontSize:"clamp(26px,4vw,46px)", fontWeight:800, marginTop:12, letterSpacing:"-0.02em", lineHeight:1.1 }}>
              Cifras que representan familias reales
            </h2>
          </div>
          <div ref={impactRef} className={`impact-grid reveal${r1.visible?" visible":""}`}>
            {[
              { v:c1, s:"+", label:"Productores asociados", icon:"👨‍🌾", col:"#14B8A6" },
              { v:c2, s:" ton", label:"Toneladas procesadas", icon:"🐟", col:"#06B6D4" },
              { v:c3, s:"+", label:"Lotes gestionados", icon:"📦", col:"#8B5CF6" },
              { v:c4, s:"+", label:"Familias beneficiadas", icon:"🏘️", col:"#F59E0B" },
            ].map(({ v,s,label,icon,col }) => (
              <div key={label} className="card-h" style={{
                background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.08)",
                borderRadius:20, padding:"28px 20px", textAlign:"center",
              }}>
                <div style={{ fontSize:32, marginBottom:10 }}>{icon}</div>
                <div style={{ fontSize:"clamp(36px,5vw,52px)", fontWeight:900, color:col, letterSpacing:"-0.03em", lineHeight:1 }}>{v}{s}</div>
                <div style={{ fontSize:13, color:"#64748B", marginTop:8, fontWeight:500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          PIPELINE
      ════════════════════════════════ */}
      <section id="servicios" className="section-pad" style={{ padding:"90px 5%", background:"rgba(255,255,255,.015)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div ref={r2.ref} className={`reveal${r2.visible?" visible":""}`} style={{ textAlign:"center", marginBottom:60 }}>
            <span style={{ fontSize:12, color:"#14B8A6", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}>Flujo operativo</span>
            <h2 style={{ fontSize:"clamp(26px,4vw,46px)", fontWeight:800, marginTop:12, letterSpacing:"-0.02em", lineHeight:1.1 }}>
              Del estanque al <span style={{ color:"#14B8A6" }}>mercado</span>, sin perder nada
            </h2>
            <p style={{ color:"#64748B", fontSize:16, marginTop:14, maxWidth:480, margin:"14px auto 0" }}>
              Cada paso está conectado. El sistema valida y avanza automáticamente.
            </p>
          </div>
          <div ref={r2.ref} className={`pipe-grid reveal${r2.visible?" visible":""}`}>
            {pipeline.map(({ icon,label,desc }, i) => (
              <div key={label} className="pipe-step card-h" style={{
                background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.08)",
                borderRadius:16, padding:"22px 18px",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <div className="pipe-icon" style={{
                    width:42, height:42, borderRadius:12,
                    background:"rgba(20,184,166,.1)", border:"1px solid rgba(20,184,166,.2)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                  }}>{icon}</div>
                  <div style={{
                    width:20, height:20, borderRadius:"50%", background:"rgba(20,184,166,.15)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:9, fontWeight:800, color:"#14B8A6", flexShrink:0,
                  }}>{i+1}</div>
                </div>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:5 }}>{label}</div>
                <div style={{ fontSize:12, color:"#64748B", lineHeight:1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          BENEFICIOS
      ════════════════════════════════ */}
      <section id="productores" className="section-pad" style={{ padding:"90px 5%" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div ref={r3.ref} className={`benefits-outer reveal${r3.visible?" visible":""}`}>
            {/* Texto izquierda */}
            <div>
              <span style={{ fontSize:12, color:"#14B8A6", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}>Para productores</span>
              <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:800, marginTop:12, letterSpacing:"-0.02em", lineHeight:1.1 }}>
                Herramientas que le dan<br/>poder al <span style={{ color:"#14B8A6" }}>campesino</span>
              </h2>
              <p style={{ color:"#64748B", fontSize:16, marginTop:18, lineHeight:1.75, maxWidth:400 }}>
                ASOPISTAR no es solo software. Es la formalización de un proceso
                que antes vivía en cuadernos. Ahora cada productor tiene visibilidad
                total de su ciclo y sus pagos.
              </p>
              <button
                className="btn-p"
                style={{ marginTop:28, padding:"13px 26px", borderRadius:12, fontSize:15 }}
                onClick={() => scrollTo("contacto")}
              >
                Unirse a la asociación
              </button>
            </div>
            {/* Cards derecha */}
            <div className="benefits-grid">
              {benefits.map(({ icon,title,desc }) => (
                <div key={title} className="card-h" style={{
                  background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.08)",
                  borderRadius:16, padding:"18px 16px",
                }}>
                  <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:5 }}>{title}</div>
                  <div style={{ fontSize:12, color:"#64748B", lineHeight:1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          SERVICIOS
      ════════════════════════════════ */}
      <section className="section-pad" style={{ padding:"90px 5%", background:"rgba(255,255,255,.015)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div ref={r4.ref} className={`reveal${r4.visible?" visible":""}`} style={{ textAlign:"center", marginBottom:56 }}>
            <span style={{ fontSize:12, color:"#14B8A6", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}>Módulos del sistema</span>
            <h2 style={{ fontSize:"clamp(26px,4vw,46px)", fontWeight:800, marginTop:12, letterSpacing:"-0.02em" }}>
              Todo lo que ASOPISTAR gestiona
            </h2>
          </div>
          <div className={`services-grid reveal${r4.visible?" visible":""}`}>
            {services.map(({ icon,title,desc }) => (
              <div key={title} className="card-h" style={{
                background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.08)",
                borderRadius:20, padding:"28px 24px",
              }}>
                <div style={{
                  width:50, height:50, borderRadius:14,
                  background:"linear-gradient(135deg,rgba(20,184,166,.15),rgba(6,182,212,.1))",
                  border:"1px solid rgba(20,184,166,.2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:22, marginBottom:16,
                }}>{icon}</div>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>{title}</div>
                <div style={{ fontSize:13, color:"#64748B", lineHeight:1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          MISIÓN
      ════════════════════════════════ */}
      <section className="section-pad" style={{ padding:"90px 5%" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div ref={r5.ref} className={`mision-box reveal${r5.visible?" visible":""}`} style={{
            background:"linear-gradient(135deg,rgba(20,184,166,.08),rgba(6,182,212,.05))",
            border:"1px solid rgba(20,184,166,.15)", borderRadius:28,
            padding:"64px 56px", textAlign:"center", position:"relative", overflow:"hidden",
          }}>
            <div style={{
              position:"absolute", width:360, height:360, borderRadius:"50%",
              background:"rgba(20,184,166,.05)", filter:"blur(60px)", top:-80, right:-80, pointerEvents:"none",
            }}/>
            <div style={{ fontSize:44, marginBottom:18 }}>🌊</div>
            <h2 style={{ fontSize:"clamp(24px,4vw,42px)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:18, lineHeight:1.1 }}>
              Transformando oportunidades en<br/><span style={{ color:"#14B8A6" }}>desarrollo regional</span>
            </h2>
            <p style={{ fontSize:17, color:"#94A3B8", lineHeight:1.75, maxWidth:580, margin:"0 auto 28px" }}>
              La Asociación de Piscicultores del Tarra nació de la necesidad de organizar
              y formalizar la producción piscícola del Catatumbo. Hoy, con ASOPISTAR,
              cada productor tiene acceso a tecnología que antes era exclusiva de grandes empresas.
            </p>
            <div style={{ display:"flex", justifyContent:"center", gap:40, flexWrap:"wrap" }}>
              {[["Catatumbo","Región"],["Cachama","Especie principal"],["2026","Versión actual"]].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontSize:20, fontWeight:800, color:"#14B8A6" }}>{v}</div>
                  <div style={{ fontSize:12, color:"#475569", fontWeight:500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          CTA FINAL
      ════════════════════════════════ */}
      <section id="contacto" className="section-pad" style={{ padding:"90px 5%" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div ref={r6.ref} className={`reveal${r6.visible?" visible":""}`} style={{ textAlign:"center" }}>
            <span style={{ fontSize:12, color:"#14B8A6", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}>¿Listo para empezar?</span>
            <h2 style={{
              fontSize:"clamp(28px,5vw,58px)", fontWeight:900,
              letterSpacing:"-0.03em", marginTop:16, marginBottom:18, lineHeight:1.05,
            }}>
              Únete a la transformación<br/>
              piscícola del <span style={{ color:"#14B8A6" }}>Catatumbo</span>
            </h2>
            <p style={{ fontSize:17, color:"#64748B", maxWidth:460, margin:"0 auto 36px", lineHeight:1.65 }}>
              Si eres productor asociado, solicita tu acceso al sistema.
              Si representas a la dirección, inicia sesión directamente.
            </p>
            <div className="cta-btns" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
              {/* ✅ FIX: navega a /registro en vez de abrir mailto */}
              <button className="btn-p" style={{ padding:"15px 30px", borderRadius:14, fontSize:16 }} onClick={() => navigate("/registro")}>
                Solicitar acceso →
              </button>
              <button className="btn-g" style={{ padding:"15px 30px", borderRadius:14, fontSize:16 }} onClick={() => navigate("/login")}>
                Iniciar sesión
              </button>
            </div>
            <div style={{ marginTop:52, display:"flex", gap:32, justifyContent:"center", flexWrap:"wrap" }}>
              {[["📧","contacto@asopistar.com"],["📍","Región del Catatumbo, Colombia"],["📞","+57 (xxx) xxx-xxxx"]].map(([icon,label]) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:8, color:"#475569", fontSize:13 }}>
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FOOTER
      ════════════════════════════════ */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,.06)", padding:"48px 5%", background:"rgba(0,0,0,.2)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div className="footer-grid">
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{
                  width:30, height:30, borderRadius:8,
                  background:"linear-gradient(135deg,#14B8A6,#06B6D4)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:15,
                }}>🐟</div>
                <span style={{ fontWeight:800, fontSize:16 }}>ASO<span style={{ color:"#14B8A6" }}>PISTAR</span></span>
              </div>
              <p style={{ fontSize:13, color:"#475569", lineHeight:1.65, maxWidth:260 }}>
                Sistema de Gestión Piscícola de la Asociación de Piscicultores del Tarra.
                Región del Catatumbo, Colombia.
              </p>
            </div>
            {[
              { title:"Sistema", links:["Dashboard","Producción","Logística","Reportes"] },
              { title:"Organización", links:["Nosotros","Productores","Servicios","Contacto"] },
              { title:"Legal", links:["Privacidad","Términos","Políticas","Accesibilidad"] },
            ].map(({ title,links }) => (
              <div key={title}>
                <div style={{ fontSize:11, color:"#64748B", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", marginBottom:14 }}>{title}</div>
                {links.map(l => (
                  <div key={l} style={{ fontSize:13, color:"#475569", marginBottom:10, cursor:"pointer", transition:"color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#94A3B8"}
                    onMouseLeave={e => e.currentTarget.style.color="#475569"}
                  >{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{
            borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:22,
            display:"flex", justifyContent:"space-between", alignItems:"center",
            flexWrap:"wrap", gap:10,
          }}>
            <span style={{ fontSize:12, color:"#334155" }}>© 2026 ASOPISTAR · Asociación de Piscicultores del Tarra</span>
            <span style={{ fontSize:12, color:"#334155" }}>Versión 1.1 · Hecho con ❤️ en el Catatumbo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
