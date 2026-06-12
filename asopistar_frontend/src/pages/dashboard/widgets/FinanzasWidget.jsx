// src/pages/dashboard/widgets/FinanzasWidget.jsx
import { DollarSign, TrendingUp, AlertCircle, CreditCard } from 'lucide-react'
import KpiCard    from '../../../components/ui/KpiCard'
import WidgetShell from '../../../components/ui/WidgetShell'

const fmt = (val) =>
  val != null ? '$' + Number(val).toLocaleString('es-CO', { maximumFractionDigits: 0 }) : '—'

function PrediccionFinanzas({ data }) {
  if (!data) return null
  const alertas = []

  const cartera    = Number(data.carteraPendiente ?? 0)
  const ingresosMes = Number(data.ingresosMes ?? 0)
  const pendientes = data.cantidadPendientes ?? 0
  const totalPendiente = Number(data.totalPendiente ?? 0)

  if (cartera > 0 && ingresosMes > 0) {
    const meses = (cartera / ingresosMes).toFixed(1)
    alertas.push({
      icono: '💰',
      titulo: `Cartera se liquidaría en ~${meses} mes(es)`,
      desc:  `Con ${fmt(cartera)} pendientes y un ingreso promedio de ${fmt(ingresosMes)}/mes, la cartera se recuperaría en aproximadamente ${meses} meses al ritmo actual.`,
      color: parseFloat(meses) > 3
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-amber-50 border-amber-200 text-amber-800',
    })
  }

  if (pendientes > 0) {
    alertas.push({
      icono: '⚠️',
      titulo: `${pendientes} pago(s) a productores sin completar`,
      desc:  `${fmt(totalPendiente)} pendientes por liquidar. Priorizar el pago para mantener la confianza de los productores asociados.`,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
    })
  }

  const pescado = Number(data.ingresosPescadoMes ?? 0)
  const insumos = Number(data.ingresosInsumosMes ?? 0)
  if (ingresosMes > 0) {
    const pctPescado = Math.round((pescado / ingresosMes) * 100)
    alertas.push({
      icono: '📈',
      titulo: `${pctPescado}% de ingresos del mes proviene de venta de pescado`,
      desc:  `Venta pescado: ${fmt(pescado)} · Venta insumos: ${fmt(insumos)}. ${
        pctPescado < 60
          ? 'La venta de insumos está tomando mayor peso — revisar si hay oportunidad de aumentar envíos de pescado.'
          : 'La venta de pescado es el motor principal de ingresos este mes.'
      }`,
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

function FinanzasWidget({ data, loading, error, onRetry }) {
  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Ingresos este mes"  value={data?.ingresosMes}        icon={TrendingUp}  color="green"  loading={loading} error={error} formato="moneda" delay={0}   />
        <KpiCard label="Ingresos totales"   value={data?.ingresosTotal}      icon={TrendingUp}  color="teal"   loading={loading} error={error} formato="moneda" delay={60}  />
        <KpiCard label="Cartera pendiente"  value={data?.carteraPendiente}   icon={AlertCircle} color="orange" loading={loading} error={error} formato="moneda" subtexto={`${data?.ingresosConSaldo ?? 0} ingresos con saldo`} delay={120} />
        <KpiCard label="Pagos pendientes"   value={data?.cantidadPendientes} icon={CreditCard}  color="red"    loading={loading} error={error} subtexto={data?.totalPendiente ? `${fmt(data.totalPendiente)} por pagar` : undefined} delay={180} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetShell title="Pagos a productores" icon={CreditCard} color="text-teal-600" loading={loading} error={error} onRetry={onRetry}>
          <div className="space-y-0">
            <FilaDetalle label="Total pagado"      value={fmt(data?.totalPagado)}    color="text-green-600" />
            <FilaDetalle label="Total pendiente"   value={fmt(data?.totalPendiente)} color={data?.totalPendiente > 0 ? 'text-red-500' : 'text-gray-600'} />
            <FilaDetalle label="Pagos completados" value={data?.cantidadPagados} />
            <FilaDetalle label="Pagos pendientes"  value={data?.cantidadPendientes}  color={data?.cantidadPendientes > 0 ? 'text-red-500 font-semibold' : 'text-gray-600'} />
            <FilaDetalle label="Pagados este mes"  value={fmt(data?.pagadosMes)}     color="text-teal-600" />
          </div>
        </WidgetShell>
        <WidgetShell title="Ingresos de ASOPISTAR" icon={TrendingUp} color="text-green-600" loading={loading} error={error} onRetry={onRetry}>
          <div className="space-y-0">
            <FilaDetalle label="Ingresos del mes"       value={fmt(data?.ingresosMes)}        color="text-green-600" />
            <FilaDetalle label="Ingresos totales"       value={fmt(data?.ingresosTotal)} />
            <FilaDetalle label="Venta de pescado (mes)" value={fmt(data?.ingresosPescadoMes)} color="text-teal-600" />
            <FilaDetalle label="Venta de insumos (mes)" value={fmt(data?.ingresosInsumosMes)} color="text-blue-600" />
            <FilaDetalle label="Cartera por cobrar"     value={fmt(data?.carteraPendiente)}   color={data?.carteraPendiente > 0 ? 'text-orange-500' : 'text-gray-600'} />
          </div>
          {!loading && !error && <PrediccionFinanzas data={data} />}
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
