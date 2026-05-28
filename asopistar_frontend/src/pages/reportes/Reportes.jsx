import { useState, useEffect } from 'react'
import { BarChart2, Download, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../../services/api'
 
function Reportes() {
  const [ingresos, setIngresos] = useState([])
  const [siembras, setSiembras] = useState([])
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    Promise.all([cargarIngresos(), cargarSiembras()])
  }, [])
 
  const cargarIngresos = async () => {
    try { const res = await api.get('/ingresos'); setIngresos(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }
 
  const cargarSiembras = async () => {
    try { const res = await api.get('/siembras'); setSiembras(res.data) }
    catch (err) { console.error(err) }
  }
 
  // Agrupar ingresos por mes
  const ingresosPorMes = ingresos.reduce((acc, ing) => {
    const mes = ing.fecha?.substring(0, 7)
    if (!mes) return acc
    const existing = acc.find(a => a.mes === mes)
    if (existing) existing.total += ing.monto || 0
    else acc.push({ mes, total: ing.monto || 0 })
    return acc
  }, []).sort((a, b) => a.mes.localeCompare(b.mes))
 
  // Contar siembras por estado
  const siembrasPorEstado = [
    { estado: 'En Curso', cantidad: siembras.filter(s => s.estado === 'EN_CURSO').length, color: '#0d9488' },
    { estado: 'Cosechado', cantidad: siembras.filter(s => s.estado === 'COSECHADO').length, color: '#10b981' },
    { estado: 'Perdido', cantidad: siembras.filter(s => s.estado === 'PERDIDO').length, color: '#ef4444' },
  ]
 
  const totalIngresos = ingresos.reduce((acc, i) => acc + (i.monto || 0), 0)
 
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <p className="text-gray-500 text-sm mt-1">Visualiza el rendimiento de ASOPISTAR.</p>
      </div>
 
      {/* Stat total */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-teal-100">
          <p className="text-sm text-gray-500 mb-1">Total Ingresos</p>
          <p className="text-2xl font-bold text-teal-600">${totalIngresos.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
          <p className="text-sm text-gray-500 mb-1">Total Siembras</p>
          <p className="text-2xl font-bold text-blue-600">{siembras.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100">
          <p className="text-sm text-gray-500 mb-1">Siembras Cosechadas</p>
          <p className="text-2xl font-bold text-green-600">
            {siembras.filter(s => s.estado === 'COSECHADO').length}
          </p>
        </div>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos por mes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-teal-600" />
            <h2 className="font-semibold text-gray-800">Ingresos por Mes</h2>
          </div>
          {ingresosPorMes.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Sin datos de ingresos aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ingresosPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Ingresos']} />
                <Bar dataKey="total" fill="#0d9488" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
 
        {/* Siembras por estado */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-teal-600" />
            <h2 className="font-semibold text-gray-800">Siembras por Estado</h2>
          </div>
          {siembras.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Sin datos de siembras aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={siembrasPorEstado}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="estado" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="cantidad" radius={[4,4,0,0]}>
                  {siembrasPorEstado.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
 
export default Reportes
