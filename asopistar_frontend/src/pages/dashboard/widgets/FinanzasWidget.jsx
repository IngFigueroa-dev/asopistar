// src/pages/dashboard/widgets/FinanzasWidget.jsx
import { DollarSign, TrendingUp, AlertCircle, CreditCard } from 'lucide-react'
import KpiCard from '../../../components/ui/KpiCard'
import WidgetShell from '../../../components/ui/WidgetShell'

const fmt = (val) =>
  val !== null && val !== undefined
    ? '$' + Number(val).toLocaleString('es-CO', { maximumFractionDigits: 0 })
    : '—'

function FinanzasWidget({ data, loading, error, onRetry }) {
  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard
          label="Ingresos este mes"
          value={data?.ingresosMes}
          icon={TrendingUp}
          color="green"
          loading={loading}
          error={error}
          formato="moneda"
          delay={0}
        />
        <KpiCard
          label="Ingresos totales"
          value={data?.ingresosTotal}
          icon={TrendingUp}
          color="teal"
          loading={loading}
          error={error}
          formato="moneda"
          delay={60}
        />
        <KpiCard
          label="Cartera pendiente"
          value={data?.carteraPendiente}
          icon={AlertCircle}
          color="orange"
          loading={loading}
          error={error}
          formato="moneda"
          subtexto={`${data?.ingresosConSaldo ?? 0} ingresos con saldo`}
          delay={120}
        />
        <KpiCard
          label="Pagos pendientes"
          value={data?.cantidadPendientes}
          icon={CreditCard}
          color="red"
          loading={loading}
          error={error}
          subtexto={data?.totalPendiente ? `${fmt(data.totalPendiente)} por pagar` : undefined}
          delay={180}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetShell
          title="Pagos a productores"
          icon={CreditCard}
          color="text-teal-600"
          loading={loading}
          error={error}
          onRetry={onRetry}
        >
          <div className="space-y-0">
            <FilaDetalle label="Total pagado"          value={fmt(data?.totalPagado)}    color="text-green-600" />
            <FilaDetalle label="Total pendiente"       value={fmt(data?.totalPendiente)} color={data?.totalPendiente > 0 ? 'text-red-500' : 'text-gray-600'} />
            <FilaDetalle label="Pagos completados"     value={data?.cantidadPagados} />
            <FilaDetalle
              label="Pagos pendientes"
              value={data?.cantidadPendientes}
              color={data?.cantidadPendientes > 0 ? 'text-red-500 font-semibold' : 'text-gray-600'}
            />
            <FilaDetalle label="Pagados este mes"      value={fmt(data?.pagadosMes)}     color="text-teal-600" />
          </div>
        </WidgetShell>

        <WidgetShell
          title="Ingresos de ASOPISTAR"
          icon={TrendingUp}
          color="text-green-600"
          loading={loading}
          error={error}
          onRetry={onRetry}
        >
          <div className="space-y-0">
            <FilaDetalle label="Ingresos del mes"             value={fmt(data?.ingresosMes)}         color="text-green-600" />
            <FilaDetalle label="Ingresos totales"             value={fmt(data?.ingresosTotal)} />
            <FilaDetalle label="Venta de pescado (mes)"       value={fmt(data?.ingresosPescadoMes)}  color="text-teal-600" />
            <FilaDetalle label="Venta de insumos (mes)"       value={fmt(data?.ingresosInsumosMes)}  color="text-blue-600" />
            <FilaDetalle
              label="Cartera por cobrar"
              value={fmt(data?.carteraPendiente)}
              color={data?.carteraPendiente > 0 ? 'text-orange-500' : 'text-gray-600'}
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
      <span className={`text-sm font-semibold ${color}`}>{value ?? '—'}</span>
    </div>
  )
}

export default FinanzasWidget
