// src/pages/dashboard/widgets/PlantaWidget.jsx
import { ClipboardCheck, Snowflake } from 'lucide-react'
import KpiCard    from '../../../components/ui/KpiCard'
import WidgetShell from '../../../components/ui/WidgetShell'

// ── Predicciones ─────────────────────────────────────────────────────────────
function PrediccionPlanta({ data }) {
  if (!data) return null
  const alertas = []

  const kilosEnFrio     = Number(data.kilosEnFrio ?? 0)
  const kilosMes        = Number(data.kilosRecibidosMes ?? 0)
  const lotesDecision   = data.lotesPendientesDecision ?? 0
  const lotesDisponibles = data.lotesDisponibles ?? 0

  // Predicción de rotación: cuántos meses dura el stock actual al ritmo de recepción del mes
  if (kilosEnFrio > 0 && kilosMes > 0) {
    const mesesStock = (kilosEnFrio / kilosMes).toFixed(1)
    alertas.push({
      icono: '❄️',
      titulo: `Stock actual cubre ~${mesesStock} mes(es) al ritmo actual`,
      desc:  `Con ${kilosEnFrio.toLocaleString('es-CO')} kg en frío y un ingreso de ${kilosMes.toLocaleString('es-CO')} kg/mes, el inventario se rota en aproximadamente ${mesesStock} meses.`,
      color: parseFloat(mesesStock) < 1
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-blue-50 border-blue-200 text-blue-800',
    })
  }

  if (lotesDecision > 0) {
    alertas.push({
      icono: '⏳',
      titulo: `${lotesDecision} lote(s) esperando decisión de destino`,
      desc:  'Asignar destino (almacenar o despachar) a los lotes pendientes para liberar espacio y optimizar el flujo comercial.',
      color: 'bg-amber-50 border-amber-200 text-amber-800',
    })
  }

  if (kilosEnFrio === 0 && lotesDisponibles === 0) {
    alertas.push({
      icono: '📭',
      titulo: 'Cuarto frío vacío',
      desc:  'No hay lotes disponibles actualmente. El stock se agotará si no hay recepciones próximas.',
      color: 'bg-gray-50 border-gray-200 text-gray-700',
    })
  }

  if (alertas.length === 0) return null

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

function PlantaWidget({ data, loading, error, onRetry }) {
  const totalLotes    = (data?.lotesDisponibles ?? 0) + (data?.lotesDespachados ?? 0)
  const pctDespachados = totalLotes > 0 ? Math.round((data.lotesDespachados / totalLotes) * 100) : 0

  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Recepciones este mes" value={data?.recepcionesMes}    icon={ClipboardCheck} color="teal"   loading={loading} error={error} subtexto={`${data?.recepcionesTotal ?? '—'} históricas`} delay={0}   />
        <KpiCard label="Kilos recibidos (mes)" value={data?.kilosRecibidosMes} icon={ClipboardCheck} color="blue"   loading={loading} error={error} formato="kg" delay={60}  />
        <KpiCard label="Lotes en cuarto frío"  value={data?.lotesDisponibles}  icon={Snowflake}      color="blue"   loading={loading} error={error} subtexto="Disponibles" delay={120} />
        <KpiCard label="Kilos almacenados"     value={data?.kilosEnFrio}        icon={Snowflake}      color="violet" loading={loading} error={error} formato="kg" delay={180} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetShell title="Recepciones" icon={ClipboardCheck} color="text-teal-600" loading={loading} error={error} onRetry={onRetry}>
          <div className="space-y-0">
            <FilaDetalle label="Recepciones este mes"   value={data?.recepcionesMes} />
            <FilaDetalle label="Total histórico"        value={data?.recepcionesTotal} />
            <FilaDetalle label="Kilos recibidos (mes)"  value={data?.kilosRecibidosMes ? Number(data.kilosRecibidosMes).toLocaleString('es-CO', { minimumFractionDigits: 1 }) + ' kg' : '—'} color="text-teal-600" />
            <FilaDetalle label="Kilos totales históricos" value={data?.kilosRecibidosTotal ? Number(data.kilosRecibidosTotal).toLocaleString('es-CO', { minimumFractionDigits: 1 }) + ' kg' : '—'} />
          </div>
        </WidgetShell>
        <WidgetShell title="Cuarto frío" icon={Snowflake} color="text-blue-500" loading={loading} error={error} onRetry={onRetry}>
          <div className="space-y-0">
            <FilaDetalle label="Lotes disponibles"           value={data?.lotesDisponibles}        color="text-blue-600" />
            <FilaDetalle label="Lotes despachados"           value={data?.lotesDespachados} />
            <FilaDetalle label="Kilos en frío"               value={data?.kilosEnFrio ? Number(data.kilosEnFrio).toLocaleString('es-CO', { minimumFractionDigits: 1 }) + ' kg' : '—'} color="text-blue-600" />
            <FilaDetalle label="Lotes pendientes de decisión" value={data?.lotesPendientesDecision} color={data?.lotesPendientesDecision > 0 ? 'text-amber-500 font-semibold' : 'text-gray-600'} />
          </div>
          {totalLotes > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Despachados</span><span>{pctDespachados}%</span></div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full transition-all duration-700" style={{ width: `${pctDespachados}%` }} />
              </div>
            </div>
          )}
          {!loading && !error && <PrediccionPlanta data={data} />}
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

export default PlantaWidget
