// src/pages/dashboard/widgets/ComercialWidget.jsx
import { Truck, Building2, Store, PackageCheck } from 'lucide-react'
import KpiCard from '../../../components/ui/KpiCard'
import WidgetShell from '../../../components/ui/WidgetShell'

function ComercialWidget({ data, loading, error, onRetry }) {
  const totalEnviosActivos = (data?.enviosPreparados ?? 0) + (data?.enviosEnCamino ?? 0)

  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard
          label="Envíos preparados"
          value={data?.enviosPreparados}
          icon={Truck}
          color="orange"
          loading={loading}
          error={error}
          subtexto="Listos para despachar"
          delay={0}
        />
        <KpiCard
          label="En camino"
          value={data?.enviosEnCamino}
          icon={Truck}
          color="blue"
          loading={loading}
          error={error}
          delay={60}
        />
        <KpiCard
          label="Entregados este mes"
          value={data?.enviosEntregadosMes}
          icon={PackageCheck}
          color="green"
          loading={loading}
          error={error}
          delay={120}
        />
        <KpiCard
          label="Kilos despachados (mes)"
          value={data?.kilosDespachadosMes}
          icon={PackageCheck}
          color="teal"
          loading={loading}
          error={error}
          formato="kg"
          delay={180}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetShell
          title="Estado de envíos"
          icon={Truck}
          color="text-orange-500"
          loading={loading}
          error={error}
          onRetry={onRetry}
        >
          <div className="space-y-0">
            <FilaDetalle
              label="Preparados"
              value={data?.enviosPreparados}
              color={data?.enviosPreparados > 0 ? 'text-orange-500' : 'text-gray-600'}
            />
            <FilaDetalle
              label="En camino"
              value={data?.enviosEnCamino}
              color={data?.enviosEnCamino > 0 ? 'text-blue-500' : 'text-gray-600'}
            />
            <FilaDetalle label="Entregados este mes"    value={data?.enviosEntregadosMes} color="text-green-600" />
            <FilaDetalle label="Total histórico"        value={data?.enviosTotal} />
          </div>

          {/* Indicador de envíos activos */}
          {!loading && !error && totalEnviosActivos > 0 && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-xs text-orange-600 font-medium">
                {totalEnviosActivos} envío{totalEnviosActivos > 1 ? 's' : ''} en movimiento
              </p>
            </div>
          )}
        </WidgetShell>

        <WidgetShell
          title="Clientes y distribución"
          icon={Building2}
          color="text-violet-500"
          loading={loading}
          error={error}
          onRetry={onRetry}
        >
          <div className="space-y-0">
            <FilaDetalle label="Total clientes"          value={data?.clientesTotal}      color="text-violet-600" />
            <FilaDetalle label="Puntos de venta activos" value={data?.puntosVentaActivos} color="text-teal-600" />
          </div>

          {/* Iconos decorativos */}
          {!loading && !error && (
            <div className="mt-4 flex gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 rounded-lg">
                <Building2 size={14} className="text-violet-500" />
                <span className="text-xs font-semibold text-violet-700">
                  {data?.clientesTotal ?? 0} clientes
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-lg">
                <Store size={14} className="text-teal-500" />
                <span className="text-xs font-semibold text-teal-700">
                  {data?.puntosVentaActivos ?? 0} puntos
                </span>
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
