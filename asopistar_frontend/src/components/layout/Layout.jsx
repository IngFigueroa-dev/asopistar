// src/components/layout/Layout.jsx
import { useState } from 'react'
import useSessionTimeout from '../../hooks/useSessionTimeout'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu, ChevronLeft } from 'lucide-react'
import { getNavItemsParaRol, ROL_LABELS } from '../../config/navItemsByRol'

function Layout({ children }) {
  useSessionTimeout()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const email  = localStorage.getItem('email')  || 'Usuario'
  const rol    = localStorage.getItem('rol')    || ''
  const nombre = localStorage.getItem('nombre') || email

  const rolLabel = ROL_LABELS[rol] || rol
  const navItems = getNavItemsParaRol(rol)

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300"
        style={{
          width: sidebarOpen ? 240 : 68,
          background: '#0F172A',
          borderRight: '1px solid rgba(255,255,255,0.06)',
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
                width: 26, height: 26, borderRadius: 6,
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
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={!sidebarOpen ? label : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: sidebarOpen ? 10 : 0,
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                padding: sidebarOpen ? '9px 12px' : '10px 0',
                borderRadius: 8,
                marginBottom: 2,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : '#64748B',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(20,184,166,0.25) 0%, rgba(20,184,166,0.1) 100%)'
                  : 'transparent',
                borderLeft: isActive ? '3px solid #14B8A6' : '3px solid transparent',
                transition: 'all 0.15s',
              })}
              onMouseEnter={e => {
                const isActive = e.currentTarget.style.background.includes('rgba(20,184,166,0.25)')
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = '#CBD5E1'
                }
              }}
              onMouseLeave={e => {
                const isActive = e.currentTarget.style.borderLeft === '3px solid rgb(20, 184, 166)'
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#64748B'
                }
              }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Perfil + logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {sidebarOpen ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              marginBottom: 6,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {nombre.charAt(0).toUpperCase()}
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
              <div title={nombre} style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>
                {nombre.charAt(0).toUpperCase()}
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

        {/* Header — ahora con el botón hamburguesa a la izquierda */}
        <header style={{
          background: '#ffffff',
          borderBottom: '1px solid #F1F5F9',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          {/* Botón expandir — solo visible cuando sidebar está colapsado */}
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
            {/* Breadcrumb sutil */}
            <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
              Panel de control
            </span>
          </div>

          {/* Derecha: fecha + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', margin: 0 }}>{nombre}</p>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{rolLabel}</p>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>
              {nombre.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main id="main-content" className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
