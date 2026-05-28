import { useState, useEffect } from 'react'
import { DollarSign, CheckCircle, Clock } from 'lucide-react'
import api from '../../services/api'
 
function Pagos() {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('TODOS')
 
  useEffect(() => { cargarPagos() }, [])
 
  const cargarPagos = async () => {
    try { const res = await api.get('/pagos-productor'); setPagos(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }
 
  const marcarPagado = async (id) => {
    try {
      await api.patch(`/pagos-productor/${id}/marcar-pagado`)
      cargarPagos()
    } catch (err) { console.error(err) }
  }
 
  const totalPagado = pagos.filter(p => p.estado === 'PAGADO').reduce((acc, p) => acc + (p.monto || 0), 0)
  const totalPendiente = pagos.filter(p => p.estado === 'PENDIENTE').reduce((acc, p) => acc + (p.monto || 0), 0)
  const pagosFiltrados = filtro === 'TODOS' ? pagos : pagos.filter(p => p.estado === filtro)
 
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pagos</h1>
        <p className="text-gray-500 text-sm mt-1">Rastrea y gestiona los pagos a productores.</p>
      </div>
 
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle size={20} className="text-green-500" />
            <p className="text-sm text-gray-500">Total Pagado</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">${totalPagado.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-red-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-red-500" />
            <p className="text-sm text-gray-500">Total Pendiente</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">${totalPendiente.toLocaleString()}</p>
        </div>
      </div>
 
      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {['TODOS', 'PENDIENTE', 'PAGADO'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === f ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f === 'TODOS' ? 'Todos' : f === 'PENDIENTE' ? 'Pendientes' : 'Pagados'}
          </button>
        ))}
      </div>
 
      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">Cargando pagos...</div>
      ) : pagosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <DollarSign size={40} className="mb-2 opacity-30" />
          <p>No hay pagos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Productor</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Monto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Kilos</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pagosFiltrados.map(p => (
                <tr key={p.idPago} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                        {p.nombreProductor?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{p.nombreProductor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">${p.monto?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.kilosPagados} kg</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.fechaPago?.substring(0,10)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      p.estado === 'PAGADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {p.estado === 'PAGADO' ? '✓ Pagado' : '⏳ Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.estado === 'PENDIENTE' && (
                      <button onClick={() => marcarPagado(p.idPago)}
                        className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700 font-medium">
                        Marcar pagado
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
 
export default Pagos
