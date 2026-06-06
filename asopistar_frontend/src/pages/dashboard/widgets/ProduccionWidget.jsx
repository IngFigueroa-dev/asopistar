// src/pages/dashboard/widgets/ProduccionWidget.jsx
import { Fish, Leaf, AlertTriangle, Users, Layers } from 'lucide-react'
import KpiCard from '../../../components/ui/KpiCard'
import WidgetShell from '../../../components/ui/WidgetShell'

function ProduccionWidget({ data, loading, error, onRetry }) {
  return (
    <section>
      {/* KPIs de producción */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard
          label="Siembras activas"
          value={data?.siembrasActivas}
          icon={Fish}
          color="teal"
          loading={loading}
          error={error}
          delay={0}
        />
        <KpiCard
          label="Listas para cosechar"
          value={data?.siembrasListasParaCosechar}
          icon={Leaf}
          color="green"
          loading={loading}
          error={error}
          subtexto="Aprobadas por biólogo"
          delay={60}
        />
        <KpiCard
          label="Turnos pendientes"
          value={data?.turnosPendientes}
          icon={Layers}
          color="blue"
          loading={loading}
          error={error}
          delay={120}
        />
        <KpiCard
          label="Productores activos"
          value={data?.productoresActivos}
          icon={Users}
          color="violet"
          loading={loading}
          error={error}
          delay={180}
        />
      </div>

      {/* Detalle de producción */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetShell
          title="Ciclo productivo"
          icon={Fish}
          color="text-teal-600"
          loading={loading}
          error={error}
          onRetry={onRetry}
        >
          <div className="space-y-0">
            <FilaDetalle
              label="Total siembras históricas"
              value={data?.totalSiembras}
              color="text-gray-700"
            />
            <FilaDetalle
              label="Alevinos en estanques"
              value={data?.alevinosTotalesActivos?.toLocaleString('es-CO')}
              color="text-teal-600"
            />
            <FilaDetalle
              label="Estanques activos"
              value={data?.estanquesActivos}
              color="text-blue-600"
            />
            <FilaDetalle
              label="Turnos realizados (histórico)"
              value={data?.turnosRealizados}
              color="text-gray-600"
            />
          </div>
        </WidgetShell>

        <WidgetShell
          title="Estado de seguimientos"
          icon={AlertTriangle}
          color="text-amber-500"
          loading={loading}
          error={error}
          onRetry={onRetry}
        >
          <div className="space-y-0">
            <FilaDetalle
              label="Sin visita del biólogo"
              value={data?.siembrasSinSeguimiento}
              color={data?.siembrasSinSeguimiento > 0 ? 'text-red-500 font-semibold' : 'text-gray-600'}
            />
            <FilaDetalle
              label="Turnos de emergencia activos"
              value={data?.turnosEmergencia}
              color={data?.turnosEmergencia > 0 ? 'text-red-500 font-semibold' : 'text-gray-600'}
            />
            <FilaDetalle
              label="Peso promedio último seguimiento"
              value={data?.pesoPromedioUltimoSeguimiento
                ? Number(data.pesoPromedioUltimoSeguimiento).toLocaleString('es-CO', {
                    minimumFractionDigits: 2, maximumFractionDigits: 2
                  }) + ' kg'
                : '—'}
              color="text-gray-700"
            />
          </div>
        </WidgetShell>
      </div>
    </section>
  )
}

function FilaDetalle({ label, value, color = 'text-gray-700' }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>
        {value ?? '—'}
      </span>
    </div>
  )
}

export default ProduccionWidget
