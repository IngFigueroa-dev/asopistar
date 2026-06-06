// src/pages/dashboard/widgets/PlantaWidget.jsx
import { ClipboardCheck, Snowflake, Package } from 'lucide-react'
import KpiCard from '../../../components/ui/KpiCard'
import WidgetShell from '../../../components/ui/WidgetShell'

function PlantaWidget({ data, loading, error, onRetry }) {
  // Porcentaje de lotes despachados vs total
  const totalLotes = (data?.lotesDisponibles ?? 0) + (data?.lotesDespachados ?? 0)
  const pctDespachados = totalLotes > 0
    ? Math.round((data.lotesDespachados / totalLotes) * 100)
    : 0

  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard
          label="Recepciones este mes"
          value={data?.recepcionesMes}
          icon={ClipboardCheck}
          color="teal"
          loading={loading}
          error={error}
          subtexto={`${data?.recepcionesTotal ?? '—'} históricas`}
          delay={0}
        />
        <KpiCard
          label="Kilos recibidos (mes)"
          value={data?.kilosRecibidosMes}
          icon={ClipboardCheck}
          color="blue"
          loading={loading}
          error={error}
          formato="kg"
          delay={60}
        />
        <KpiCard
          label="Lotes en cuarto frío"
          value={data?.lotesDisponibles}
          icon={Snowflake}
          color="blue"
          loading={loading}
          error={error}
          subtexto="Disponibles"
          delay={120}
        />
        <KpiCard
          label="Kilos almacenados"
          value={data?.kilosEnFrio}
          icon={Snowflake}
          color="violet"
          loading={loading}
          error={error}
          formato="kg"
          delay={180}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetShell
          title="Recepciones"
          icon={ClipboardCheck}
          color="text-teal-600"
          loading={loading}
          error={error}
          onRetry={onRetry}
        >
          <div className="space-y-0">
            <FilaDetalle label="Recepciones este mes"    value={data?.recepcionesMes} />
            <FilaDetalle label="Total histórico"         value={data?.recepcionesTotal} />
            <FilaDetalle
              label="Kilos recibidos (mes)"
              value={data?.kilosRecibidosMes
                ? Number(data.kilosRecibidosMes).toLocaleString('es-CO', { minimumFractionDigits: 1 }) + ' kg'
                : '—'}
              color="text-teal-600"
            />
            <FilaDetalle
              label="Kilos totales históricos"
              value={data?.kilosRecibidosTotal
                ? Number(data.kilosRecibidosTotal).toLocaleString('es-CO', { minimumFractionDigits: 1 }) + ' kg'
                : '—'}
            />
          </div>
        </WidgetShell>

        <WidgetShell
          title="Cuarto frío"
          icon={Snowflake}
          color="text-blue-500"
          loading={loading}
          error={error}
          onRetry={onRetry}
        >
          <div className="space-y-0">
            <FilaDetalle
              label="Lotes disponibles"
              value={data?.lotesDisponibles}
              color="text-blue-600"
            />
            <FilaDetalle label="Lotes despachados" value={data?.lotesDespachados} />
            <FilaDetalle
              label="Kilos en frío"
              value={data?.kilosEnFrio
                ? Number(data.kilosEnFrio).toLocaleString('es-CO', { minimumFractionDigits: 1 }) + ' kg'
                : '—'}
              color="text-blue-600"
            />
            <FilaDetalle
              label="Lotes pendientes de decisión"
              value={data?.lotesPendientesDecision}
              color={data?.lotesPendientesDecision > 0 ? 'text-amber-500 font-semibold' : 'text-gray-600'}
            />
          </div>

          {/* Barra de ocupación */}
          {totalLotes > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Despachados</span>
                <span>{pctDespachados}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-700"
                  style={{ width: `${pctDespachados}%` }}
                />
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

export default PlantaWidget
