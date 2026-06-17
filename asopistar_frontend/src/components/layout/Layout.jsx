// src/components/layout/Layout.jsx
import { useState } from 'react'
import useSessionTimeout from '../../hooks/useSessionTimeout'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, ChevronLeft } from 'lucide-react'
import { getNavItemsParaRol, ROL_LABELS } from '../../config/navItemsByRol'
import ChatWidget from '../ChatWidget'

// ── Scrollbars personalizadas (reemplazan la barra nativa) ───────
const SCROLL_STYLES = `
.aso-nav-scroll::-webkit-scrollbar { width: 5px; }
.aso-nav-scroll::-webkit-scrollbar-track { background: transparent; }
.aso-nav-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.18); border-radius: 10px; }
.aso-nav-scroll::-webkit-scrollbar-thumb:hover { background: rgba(20,184,166,0.55); }

.aso-main-scroll::-webkit-scrollbar { width: 8px; }
.aso-main-scroll::-webkit-scrollbar-track { background: transparent; }
.aso-main-scroll::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
.aso-main-scroll::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }

@keyframes aso-fade {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

function Layout({ children }) {
  useSessionTimeout()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const email  = localStorage.getItem('email')  || 'Usuario'
  const rol    = localStorage.getItem('rol')    || ''
  const nombre = localStorage.getItem('nombre') || email

  const rolLabel = ROL_LABELS[rol] || rol
  const navItems = getNavItemsParaRol(rol)

  // Título de sección actual — derivado de navItems + ruta, solo presentación
  const itemActual = navItems.find(item =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  )
  const tituloSeccion = itemActual?.label || 'Panel de control'

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <>
    <style>{SCROLL_STYLES}</style>
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300"
        style={{
          width: sidebarOpen ? 240 : 68,
          background: 'linear-gradient(180deg, #0F172A 0%, #0B1220 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '2px 0 24px rgba(0,0,0,0.18)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo + botón colapsar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          padding: sidebarOpen ? '18px 16px 18px 20px' : '18px 0',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          minHeight: 65,
        }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Logo SVG pez */}
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(20,184,166,0.15)',
                border: '1px solid rgba(20,184,166,0.25)',
                boxShadow: '0 0 0 3px rgba(20,184,166,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M2 12C2 12 7 4 14 4C18 4 22 8 22 12C22 16 18 20 14 20C7 20 2 12 2 12Z" fill="#14B8A6" opacity="0.3"/>
                  <path d="M2 12C2 12 7 4 14 4C18 4 22 8 22 12" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M2 12C2 12 7 20 14 20C18 20 22 16 22 12" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="17" cy="9" r="1.2" fill="#14B8A6"/>
                  <path d="M22 6L19 9L22 12" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.01em', lineHeight: 1 }}>
                  ASOPISTAR
                </p>
                <p style={{ fontSize: 10, color: '#14B8A6', marginTop: 2, letterSpacing: '0.02em' }}>
                  Gestión Piscícola
                </p>
              </div>
            </div>
          )}

          {/* Sin sidebar abierto: solo logo centrado */}
          {!sidebarOpen && (
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(20,184,166,0.15)',
              border: '1px solid rgba(20,184,166,0.25)',
              boxShadow: '0 0 0 3px rgba(20,184,166,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2 12C2 12 7 4 14 4C18 4 22 8 22 12C22 16 18 20 14 20C7 20 2 12 2 12Z" fill="#14B8A6" opacity="0.3"/>
                <path d="M2 12C2 12 7 4 14 4C18 4 22 8 22 12" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2 12C2 12 7 20 14 20C18 20 22 16 22 12" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="17" cy="9" r="1.2" fill="#14B8A6"/>
              </svg>
            </div>
          )}

          {/* Botón colapsar — solo visible cuando está abierto */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              title="Colapsar menú"
              style={{
                width: 26, height: 26, borderRadius: 7,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748B', cursor: 'pointer', flexShrink: 0,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(20,184,166,0.15)'
                e.currentTarget.style.color = '#14B8A6'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color = '#64748B'
              }}
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Navegación */}
        <nav className="aso-nav-scroll" style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(148,163,184,0.25) transparent' }}>
          {navItems.map(({ to, icon: Icon, label }, idx) => (
            <NavItem key={to} to={to} Icon={Icon} label={label} sidebarOpen={sidebarOpen} idx={idx} />
          ))}
        </nav>

        {/* Perfil + logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {sidebarOpen ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 9,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: 6,
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                }}>
                  {nombre.charAt(0).toUpperCase()}
                </div>
                <span style={{
                  position: 'absolute', bottom: -1, right: -1, width: 8, height: 8,
                  borderRadius: '50%', background: '#10B981', border: '1.5px solid #0F172A'
                }} title="Sesión activa" />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#F1F5F9', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nombre}
                </p>
                <p style={{ fontSize: 10, color: '#64748B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {rolLabel}
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: 6,
            }}>
              <div title={nombre} style={{ position: 'relative' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                }}>
                  {nombre.charAt(0).toUpperCase()}
                </div>
                <span style={{
                  position: 'absolute', bottom: -1, right: -1, width: 8, height: 8,
                  borderRadius: '50%', background: '#10B981', border: '1.5px solid #0F172A'
                }} />
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title={!sidebarOpen ? 'Cerrar sesión' : undefined}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: sidebarOpen ? 8 : 0,
              width: '100%', padding: sidebarOpen ? '8px 10px' : '8px 0',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'transparent',
              color: '#64748B', fontSize: 13, fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
              e.currentTarget.style.color = '#F87171'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#64748B'
            }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header style={{
          background: '#ffffff',
          borderBottom: '1px solid #F1F5F9',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
        }}>
          {/* Izquierda: botón expandir + título de sección */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                title="Expandir menú"
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid #E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748B', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#F8FAFC'
                  e.currentTarget.style.color = '#0F172A'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#64748B'
                }}
              >
                <Menu size={16} />
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {itemActual?.icon && (
                <itemActual.icon size={15} color="#14B8A6" aria-hidden />
              )}
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                {tituloSeccion}
              </span>
            </div>
          </div>

          {/* Derecha: nombre + rol + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', margin: 0 }}>{nombre}</p>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{rolLabel}</p>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff',
              }}>
                {nombre.charAt(0).toUpperCase()}
              </div>
              <span style={{
                position: 'absolute', bottom: -1, right: -1, width: 9, height: 9,
                borderRadius: '50%', background: '#10B981', border: '1.5px solid #fff'
              }} title="Sesión activa" />
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main id="main-content" className="aso-main-scroll flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>
          {children}
        </main>
      </div>
    </div>
    <ChatWidget />
    </>
  )
}

// ── Item de navegación con indicador lateral + hover por estado ──
function NavItem({ to, Icon, label, sidebarOpen, idx }) {
  const [hov, setHov] = useState(false)

  return (
    <NavLink
      to={to}
      title={!sidebarOpen ? label : undefined}
      style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {({ isActive }) => (
        <div style={{
          position: 'relative',
          display: 'flex', alignItems: 'center',
          gap: sidebarOpen ? 10 : 0,
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          padding: sidebarOpen ? '8px 12px 8px 16px' : '9px 0',
          borderRadius: 9,
          background: isActive
            ? 'linear-gradient(90deg, rgba(20,184,166,0.18) 0%, rgba(6,182,212,0.04) 100%)'
            : hov ? 'rgba(255,255,255,0.05)' : 'transparent',
          transition: 'background 0.18s ease',
          animation: 'aso-fade 0.25s ease both',
          animationDelay: `${idx * 0.02}s`
        }}>
          {/* Indicador lateral */}
          {isActive && (
            <span style={{
              position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
              width: 3, height: '62%', borderRadius: '0 4px 4px 0',
              background: 'linear-gradient(180deg, #14B8A6, #06B6D4)'
            }} />
          )}

          {/* Ícono */}
          <span style={{
            width: 26, height: 26, borderRadius: 7, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isActive ? 'rgba(20,184,166,0.16)' : 'transparent',
            color: isActive ? '#2DD4BF' : hov ? '#CBD5E1' : '#64748B',
            transition: 'all 0.18s ease'
          }}>
            <Icon size={16} style={{ flexShrink: 0 }} />
          </span>

          {/* Etiqueta */}
          {sidebarOpen && (
            <span style={{
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#F1F5F9' : hov ? '#E2E8F0' : '#94A3B8',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              transition: 'color 0.18s ease'
            }}>
              {label}
            </span>
          )}
        </div>
      )}
    </NavLink>
  )
}

export default Layout
