// src/pages/dashboard/widgets/InsumosWidget.jsx
import { Package, TrendingUp, AlertTriangle, ShoppingCart } from 'lucide-react'
import KpiCard    from '../../../components/ui/KpiCard'
import WidgetShell from '../../../components/ui/WidgetShell'

const fmt = (val) =>
  val != null ? '$' + Number(val).toLocaleString('es-CO', { maximumFractionDigits: 0 }) : '—'

// ── Panel de predicción inteligente ──────────────────────────────────────────
function PrediccionInsumos({ data }) {
  if (!data) return null
  const alertas = []

  // Predicción 1: riesgo de desabastecimiento
  if ((data.insumosBajoStock ?? 0) > 0) {
    alertas.push({
      tipo:  'riesgo',
      icono: '⚠️',
      titulo: `${data.insumosBajoStock} insumo(s) bajo stock mínimo`,
      desc:  'Reabastecer antes de la próxima temporada de siembra para evitar desabastecimiento a productores.',
      color: 'bg-red-50 border-red-200 text-red-800',
    })
  }

  // Predicción 2: tendencia de ventas
  // Solo mostrar si hay ventas en meses anteriores (ventasTotal > ventasMes)
  // para evitar porcentajes distorsionados cuando todos los datos son del mes actual
  const ventasAnteriores = (data.ventasTotal ?? 0) - (data.ventasMes ?? 0)
  if ((data.ventasMes ?? 0) > 0 && ventasAnteriores > 0) {
    // Promedio mensual basado solo en ventas anteriores para no inflar el numerador
    const promedioMensual = ventasAnteriores / 11  // los otros 11 meses del año
    const tendencia = data.ventasMes > promedioMensual ? 'superior' : 'inferior'
    const pct = Math.abs(Math.round(((data.ventasMes - promedioMensual) / promedioMensual) * 100))
    // Solo mostrar si la diferencia es significativa (> 10%) para evitar ruido
    if (pct > 10) {
      alertas.push({
        tipo:  'tendencia',
        icono: tendencia === 'superior' ? '📈' : '📉',
        titulo: `Ventas este mes ${tendencia} al promedio histórico`,
        desc:  `${pct}% ${tendencia === 'superior' ? 'por encima' : 'por debajo'} del promedio mensual. ${
          tendencia === 'superior'
            ? 'Verifica que el stock esté preparado para sostener esta demanda.'
            : 'Considera estrategias de promoción para productores.'
        }`,
        color: tendencia === 'superior'
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-amber-50 border-amber-200 text-amber-800',
      })
    }
  }

  // Predicción 3: cobertura del inventario
  if ((data.ventasMes ?? 0) > 0 && (data.insumosActivos ?? 0) > 0) {
    alertas.push({
      tipo:  'cobertura',
      icono: '📦',
      titulo: 'Revisión de inventario recomendada',
      desc:  `Tienes ${data.insumosActivos} insumos activos. Con el ritmo de ventas actual (${data.ventasMes} ventas/mes) asegúrate de que el stock cubra la demanda del próximo mes.`,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
    })
  }

  if (alertas.length === 0) return (
    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
      <span>✅</span> Inventario en buen estado. Sin alertas de reabastecimiento.
    </div>
  )

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Análisis predictivo</p>
      {alertas.map((a, i) => (
        <div key={i} className={`rounded-xl border p-4 ${a.color}`}>
          <p className="text-sm font-semibold mb-1">{a.icono} {a.titulo}</p>
          <p className="text-xs leading-relaxed opacity-90">{a.desc}</p>
        </div>
      ))}
    </div>
  )
}

function InsumosWidget({ data, loading, error, onRetry }) {
  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Insumos activos"     value={data?.insumosActivos}   icon={Package}      color="teal"   loading={loading} error={error} delay={0} />
        <KpiCard label="Bajo stock mínimo"   value={data?.insumosBajoStock} icon={AlertTriangle} color="red"   loading={loading} error={error} subtexto="Requieren reabastecimiento" delay={60} />
        <KpiCard label="Ventas este mes"     value={data?.ventasMes}        icon={ShoppingCart}  color="blue"  loading={loading} error={error} delay={120} />
        <KpiCard label="Valor ventas (mes)"  value={data?.valorVentasMes}   icon={TrendingUp}    color="green" loading={loading} error={error} formato="moneda" delay={180} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetShell title="Inventario" icon={Package} color="text-teal-600" loading={loading} error={error} onRetry={onRetry}>
          <div className="space-y-0">
            <FilaDetalle label="Total insumos"       value={data?.totalInsumos} />
            <FilaDetalle label="Insumos activos"     value={data?.insumosActivos}   color="text-teal-600" />
            <FilaDetalle label="Bajo stock mínimo"   value={data?.insumosBajoStock} color={data?.insumosBajoStock > 0 ? 'text-red-500 font-semibold' : 'text-gray-600'} />
          </div>
        </WidgetShell>

        <WidgetShell title="Ventas de insumos" icon={ShoppingCart} color="text-blue-500" loading={loading} error={error} onRetry={onRetry}>
          <div className="space-y-0">
            <FilaDetalle label="Ventas este mes"   value={data?.ventasMes}                                                                             color="text-blue-600" />
            <FilaDetalle label="Valor ventas (mes)" value={data?.valorVentasMes != null ? fmt(data.valorVentasMes) : '—'}                              color="text-green-600" />
            <FilaDetalle label="Total ventas históricas" value={data?.ventasTotal} />
          </div>
          {!loading && !error && <PrediccionInsumos data={data} />}
        </WidgetShell>
      </div>
    </section>
  )
}

function FilaDetalle({ label, value, color = 'text-gray-700' }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value ?? '—'}</span>
    </div>
  )
}

export default InsumosWidget
