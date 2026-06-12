// src/pages/dashboard/widgets/ComercialWidget.jsx
import { Truck, Building2, Store, PackageCheck } from 'lucide-react'
import KpiCard    from '../../../components/ui/KpiCard'
import WidgetShell from '../../../components/ui/WidgetShell'

function PrediccionComercial({ data }) {
  if (!data) return null
  const alertas = []
  const preparados = data.enviosPreparados ?? 0
  const enCamino   = data.enviosEnCamino   ?? 0
  const entregados = data.enviosEntregadosMes ?? 0
  const total      = data.enviosTotal ?? 0

  if (preparados > 0) {
    alertas.push({
      icono: '🚚',
      titulo: `${preparados} envío(s) listo(s) sin despachar`,
      desc:  'Los envíos preparados están ocupando espacio en planta. Programar despacho para optimizar el flujo de distribución.',
      color: 'bg-orange-50 border-orange-200 text-orange-800',
    })
  }

  if (total > 0 && entregados > 0) {
    const diasMes  = new Date().getDate()
    const diasRest = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - diasMes
    const proyectado = Math.round(entregados + (entregados / diasMes) * diasRest)
    alertas.push({
      icono: '📊',
      titulo: `Proyección: ~${proyectado} entregas al finalizar el mes`,
      desc:  `Con ${entregados} entregas en ${diasMes} días, se proyectan aproximadamente ${proyectado} entregas totales este mes.`,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
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

function ComercialWidget({ data, loading, error, onRetry }) {
  const totalActivos = (data?.enviosPreparados ?? 0) + (data?.enviosEnCamino ?? 0)
  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Envíos preparados"     value={data?.enviosPreparados}    icon={Truck}        color="orange" loading={loading} error={error} subtexto="Listos para despachar" delay={0}   />
        <KpiCard label="En camino"             value={data?.enviosEnCamino}      icon={Truck}        color="blue"   loading={loading} error={error} delay={60}  />
        <KpiCard label="Entregados este mes"   value={data?.enviosEntregadosMes} icon={PackageCheck} color="green"  loading={loading} error={error} delay={120} />
        <KpiCard label="Kilos despachados (mes)" value={data?.kilosDespachadosMes} icon={PackageCheck} color="teal" loading={loading} error={error} formato="kg" delay={180} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetShell title="Estado de envíos" icon={Truck} color="text-orange-500" loading={loading} error={error} onRetry={onRetry}>
          <div className="space-y-0">
            <FilaDetalle label="Preparados"         value={data?.enviosPreparados}    color={data?.enviosPreparados > 0 ? 'text-orange-500' : 'text-gray-600'} />
            <FilaDetalle label="En camino"          value={data?.enviosEnCamino}      color={data?.enviosEnCamino > 0   ? 'text-blue-500'   : 'text-gray-600'} />
            <FilaDetalle label="Entregados este mes" value={data?.enviosEntregadosMes} color="text-green-600" />
            <FilaDetalle label="Total histórico"    value={data?.enviosTotal} />
          </div>
          {totalActivos > 0 && !loading && !error && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-xs text-orange-600 font-medium">{totalActivos} envío{totalActivos > 1 ? 's' : ''} en movimiento</p>
            </div>
          )}
          {!loading && !error && <PrediccionComercial data={data} />}
        </WidgetShell>
        <WidgetShell title="Clientes y distribución" icon={Building2} color="text-violet-500" loading={loading} error={error} onRetry={onRetry}>
          <div className="space-y-0">
            <FilaDetalle label="Total clientes"          value={data?.clientesTotal}      color="text-violet-600" />
            <FilaDetalle label="Puntos de venta activos" value={data?.puntosVentaActivos} color="text-teal-600" />
          </div>
          {!loading && !error && (
            <div className="mt-4 flex gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 rounded-lg">
                <Building2 size={14} className="text-violet-500" />
                <span className="text-xs font-semibold text-violet-700">{data?.clientesTotal ?? 0} clientes</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-lg">
                <Store size={14} className="text-teal-500" />
                <span className="text-xs font-semibold text-teal-700">{data?.puntosVentaActivos ?? 0} puntos</span>
              </div>
            </div>
          )}
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

export default ComercialWidget
