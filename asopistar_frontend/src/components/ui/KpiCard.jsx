// src/components/ui/KpiCard.jsx
// Tarjeta de KPI reutilizable en todo el dashboard.
// Soporta estado de carga, error, tendencia y formato de valor.

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * @param {string}   label       - Etiqueta descriptiva del indicador
 * @param {any}      value       - Valor principal a mostrar
 * @param {React.FC} icon        - Ícono de lucide-react
 * @param {string}   color       - Clase Tailwind del color del ícono y acento (ej: 'teal')
 * @param {boolean}  loading     - Mostrar skeleton de carga
 * @param {string}   error       - Mensaje de error (si existe)
 * @param {string}   formato     - 'numero' | 'moneda' | 'decimal' | 'kg'
 * @param {string}   tendencia   - 'sube' | 'baja' | 'neutro' (opcional)
 * @param {string}   subtexto    - Línea secundaria debajo del valor (opcional)
 * @param {number}   delay       - ms de animación de entrada (stagger)
 */
function KpiCard({
  label,
  value,
  icon: Icon,
  color = 'teal',
  loading = false,
  error = null,
  formato = 'numero',
  tendencia,
  subtexto,
  delay = 0,
}) {
  const colorMap = {
    teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-200',   accent: 'bg-teal-600'   },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   accent: 'bg-blue-600'   },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', accent: 'bg-orange-600' },
    red:    { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    accent: 'bg-red-600'    },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200',  accent: 'bg-green-600'  },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', accent: 'bg-violet-600' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200',  accent: 'bg-amber-600'  },
    slate:  { bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200',  accent: 'bg-slate-600'  },
  }

  const c = colorMap[color] || colorMap.teal

  const formatearValor = (val) => {
    if (val === null || val === undefined) return '—'
    const num = Number(val)
    if (isNaN(num)) return val
    switch (formato) {
      case 'moneda':
        return '$' + num.toLocaleString('es-CO', { maximumFractionDigits: 0 })
      case 'decimal':
        return num.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      case 'kg':
        return num.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg'
      default:
        return num.toLocaleString('es-CO')
    }
  }

  const TendenciaIcon = tendencia === 'sube'
    ? TrendingUp
    : tendencia === 'baja'
    ? TrendingDown
    : Minus

  const tendenciaColor = tendencia === 'sube'
    ? 'text-green-500'
    : tendencia === 'baja'
    ? 'text-red-500'
    : 'text-gray-400'

  return (
    <div
      className={`
        bg-white rounded-xl p-5 shadow-sm border ${c.border}
        opacity-0 translate-y-2
        animate-[fadeSlideIn_0.4s_ease_forwards]
        hover:shadow-md transition-shadow duration-200
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Cabecera: label + ícono */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">
          {label}
        </p>
        <div className={`p-2 rounded-lg ${c.bg}`}>
          {Icon && <Icon size={17} className={c.text} />}
        </div>
      </div>

      {/* Valor principal */}
      {loading ? (
        <div className="space-y-2 mt-1">
          <div className="h-8 w-24 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : error ? (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      ) : (
        <>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-800 leading-none">
              {formatearValor(value)}
            </p>
            {tendencia && (
              <TendenciaIcon size={15} className={`${tendenciaColor} mb-0.5`} />
            )}
          </div>
          {subtexto && (
            <p className="text-xs text-gray-400 mt-1.5 leading-tight">{subtexto}</p>
          )}
        </>
      )}

      {/* Barra de acento inferior */}
      <div className={`mt-4 h-0.5 w-8 rounded-full ${c.accent} opacity-40`} />
    </div>
  )
}

export default KpiCard
