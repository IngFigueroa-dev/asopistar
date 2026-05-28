import { useState, useEffect } from 'react'
import { Fish, Snowflake, Truck, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../../services/api'
 
function Dashboard() {
  const [stats, setStats] = useState({
    siembrasActivas: 0,
    lotesDisponibles: 0,
    enviosPendientes: 0,
    pagosPendientes: 0,
  })
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    cargarStats()
  }, [])
 
  const cargarStats = async () => {
    try {
      const [siembras, lotes, envios, pagos] = await Promise.allSettled([
        api.get('/siembras/activas'),
        api.get('/lotes-cuarto-frio'),
        api.get('/envios'),
        api.get('/pagos-productor/pendientes'),
      ])
      setStats({
        siembrasActivas: siembras.value?.data?.length || 0,
        lotesDisponibles: lotes.value?.data?.length || 0,
        enviosPendientes: envios.value?.data?.filter(e => e.estado === 'PREPARADO')?.length || 0,
        pagosPendientes: pagos.value?.data?.length || 0,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
 
  const statCards = [
    { label: 'Siembras Activas', value: stats.siembrasActivas, icon: Fish, color: 'bg-teal-50 text-teal-600', border: 'border-teal-200' },
    { label: 'Lotes en Cuarto Frío', value: stats.lotesDisponibles, icon: Snowflake, color: 'bg-blue-50 text-blue-600', border: 'border-blue-200' },
    { label: 'Envíos Pendientes', value: stats.enviosPendientes, icon: Truck, color: 'bg-orange-50 text-orange-600', border: 'border-orange-200' },
    { label: 'Pagos Pendientes', value: stats.pagosPendientes, icon: DollarSign, color: 'bg-red-50 text-red-600', border: 'border-red-200' },
  ]
 
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panel Principal</h1>
        <p className="text-gray-500 text-sm mt-1">¡Bienvenido! Esto es lo que está pasando hoy en ASOPISTAR.</p>
      </div>
 
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white rounded-xl p-5 shadow-sm border ${border}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 font-medium">{label}</p>
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {loading ? '...' : value}
            </p>
          </div>
        ))}
      </div>
 
      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-teal-600" />
            <h2 className="font-semibold text-gray-800">Resumen del Sistema</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Siembras en curso</span>
              <span className="font-semibold text-teal-600">{stats.siembrasActivas}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Lotes almacenados</span>
              <span className="font-semibold text-blue-600">{stats.lotesDisponibles}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Envíos por salir</span>
              <span className="font-semibold text-orange-600">{stats.enviosPendientes}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Pagos por realizar</span>
              <span className="font-semibold text-red-600">{stats.pagosPendientes}</span>
            </div>
          </div>
        </div>
 
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-500" />
            <h2 className="font-semibold text-gray-800">Alertas</h2>
          </div>
          <div className="space-y-3">
            {stats.pagosPendientes > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">Pagos pendientes</p>
                  <p className="text-xs text-red-500">Hay {stats.pagosPendientes} pago(s) sin realizar</p>
                </div>
              </div>
            )}
            {stats.enviosPendientes > 0 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-700">Envíos preparados</p>
                  <p className="text-xs text-orange-500">{stats.enviosPendientes} envío(s) listos para despachar</p>
                </div>
              </div>
            )}
            {stats.pagosPendientes === 0 && stats.enviosPendientes === 0 && (
              <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
                ✅ Todo al día, sin alertas pendientes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
 
export default Dashboard
