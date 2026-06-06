// src/pages/dashboard/widgets/AlertasWidget.jsx
import { AlertTriangle, AlertCircle, Info, CheckCircle, RefreshCw } from 'lucide-react'

const PRIORIDAD_CONFIG = {
  ALTA: {
    bg:     'bg-red-50',
    border: 'border-red-200',
    text:   'text-red-700',
    sub:    'text-red-500',
    badge:  'bg-red-100 text-red-700',
    icon:   AlertTriangle,
    dot:    'bg-red-500',
  },
  MEDIA: {
    bg:     'bg-amber-50',
    border: 'border-amber-200',
    text:   'text-amber-700',
    sub:    'text-amber-500',
    badge:  'bg-amber-100 text-amber-700',
    icon:   AlertCircle,
    dot:    'bg-amber-500',
  },
  BAJA: {
    bg:     'bg-blue-50',
    border: 'border-blue-200',
    text:   'text-blue-700',
    sub:    'text-blue-500',
    badge:  'bg-blue-100 text-blue-700',
    icon:   Info,
    dot:    'bg-blue-400',
  },
}

const MODULO_LABEL = {
  PRODUCCION: 'Producción',
  PLANTA:     'Planta',
  COMERCIAL:  'Comercial',
  FINANZAS:   'Finanzas',
  INSUMOS:    'Insumos',
}

function AlertasWidget({ data, loading, error, onRetry }) {
  const alertas = Array.isArray(data) ? data : []

  // Ordenar: ALTA → MEDIA → BAJA
  const ORDEN = { ALTA: 0, MEDIA: 1, BAJA: 2 }
  const alertasOrdenadas = [...alertas].sort(
    (a, b) => (ORDEN[a.prioridad] ?? 3) - (ORDEN[b.prioridad] ?? 3)
  )

  const altaCount  = alertas.filter(a => a.prioridad === 'ALTA').length
  const mediaCount = alertas.filter(a => a.prioridad === 'MEDIA').length
  const bajaCount  = alertas.filter(a => a.prioridad === 'BAJA').length

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <AlertTriangle size={17} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-gray-700">Centro de alertas</h2>
          {!loading && !error && alertas.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              {alertas.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Resumen por prioridad */}
          {!loading && !error && alertas.length > 0 && (
            <div className="flex gap-1.5">
              {altaCount  > 0 && <PrioridadBadge count={altaCount}  tipo="ALTA" />}
              {mediaCount > 0 && <PrioridadBadge count={mediaCount} tipo="MEDIA" />}
              {bajaCount  > 0 && <PrioridadBadge count={bajaCount}  tipo="BAJA" />}
            </div>
          )}
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
      </div>

      {/* Contenido */}
      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 py-4 text-red-400">
            <AlertCircle size={16} />
            <p className="text-sm">{error}</p>
          </div>
        ) : alertasOrdenadas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
            <CheckCircle size={28} className="text-green-400" />
            <p className="text-sm font-medium text-gray-500">Todo al día</p>
            <p className="text-xs text-gray-400">Sin alertas operativas pendientes</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alertasOrdenadas.map((alerta, i) => (
              <AlertaItem key={i} alerta={alerta} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AlertaItem({ alerta }) {
  const cfg = PRIORIDAD_CONFIG[alerta.prioridad] || PRIORIDAD_CONFIG.BAJA
  const Icon = cfg.icon

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-lg border ${cfg.bg} ${cfg.border}`}>
      <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot} mt-1.5`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className={`text-sm font-semibold ${cfg.text}`}>{alerta.titulo}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.badge}`}>
            {MODULO_LABEL[alerta.modulo] || alerta.modulo}
          </span>
        </div>
        <p className={`text-xs leading-relaxed ${cfg.sub}`}>{alerta.descripcion}</p>
      </div>
    </div>
  )
}

function PrioridadBadge({ count, tipo }) {
  const cfg = PRIORIDAD_CONFIG[tipo]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${cfg.badge}`}>
      {count}
    </span>
  )
}

export default AlertasWidget
