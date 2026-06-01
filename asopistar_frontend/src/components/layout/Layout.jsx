// src/components/layout/Layout.jsx
import { useState } from 'react'
import useSessionTimeout from '../../hooks/useSessionTimeout'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
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
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-20'}
        bg-[#1a2332] flex flex-col transition-all duration-300 shrink-0
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <div className="text-2xl shrink-0">🐟</div>
          {sidebarOpen && (
            <div>
              <h1 className="text-white font-extrabold text-lg leading-none">ASOPISTAR</h1>
              <p className="text-teal-400 text-xs">Gestión Piscícola</p>
            </div>
          )}
        </div>

        {/* Navegación filtrada por rol */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex items-center gap-3 px-5 py-3 mx-2 rounded-lg mb-1
                transition-colors text-sm font-medium
                ${isActive
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'}
              `}
            >
              <Icon size={20} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut size={20} className="shrink-0" />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{nombre}</p>
              <p className="text-xs text-gray-500">{rolLabel}</p>
            </div>
            <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {nombre.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
