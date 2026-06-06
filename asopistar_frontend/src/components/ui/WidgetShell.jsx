// src/components/ui/WidgetShell.jsx
// Contenedor visual para cada sección del dashboard.
// Maneja el estado de carga y error a nivel de sección completa.

import { RefreshCw, AlertCircle } from 'lucide-react'

/**
 * @param {string}      title    - Título de la sección
 * @param {React.FC}    icon     - Ícono de lucide-react
 * @param {string}      color    - Color del ícono (clase text-*)
 * @param {boolean}     loading  - Mostrar skeleton de sección
 * @param {string}      error    - Error a nivel de sección
 * @param {function}    onRetry  - Callback para reintentar la carga
 * @param {ReactNode}   children - Contenido del widget
 */
function WidgetShell({ title, icon: Icon, color = 'text-teal-600', loading, error, onRetry, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header del widget */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={17} className={color} />}
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        </div>
        {error && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-teal-600 transition-colors"
          >
            <RefreshCw size={13} />
            Reintentar
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 py-4 text-red-400">
            <AlertCircle size={16} />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

export default WidgetShell
