import { useState, useEffect } from 'react'
import { Truck, Plus, MapPin } from 'lucide-react'
import api from '../../services/api'
 
const ESTADOS_ENVIO = {
  PREPARADO: { label: 'Preparado', class: 'bg-yellow-100 text-yellow-700' },
  EN_CAMINO: { label: 'En Camino', class: 'bg-blue-100 text-blue-700' },
  ENTREGADO: { label: 'Entregado', class: 'bg-green-100 text-green-700' },
}
 
function Logistica() {
  const [envios, setEnvios] = useState([])
  const [clientes, setClientes] = useState([])
  const [puntos, setPuntos] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [form, setForm] = useState({
    fechaEnvio: '', destinoCiudad: '', tipoDestino: 'CLIENTE',
    estado: 'PREPARADO', observaciones: '', idCliente: '', idPunto: ''
  })
 
  useEffect(() => {
    Promise.all([cargarEnvios(), cargarClientes(), cargarPuntos()])
  }, [])
 
  const cargarEnvios = async () => {
    try { const res = await api.get('/envios'); setEnvios(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }
 
  const cargarClientes = async () => {
    try { const res = await api.get('/clientes'); setClientes(res.data) }
    catch (err) { console.error(err) }
  }
 
  const cargarPuntos = async () => {
    try { const res = await api.get('/puntos-venta/activos'); setPuntos(res.data) }
    catch (err) { console.error(err) }
  }
 
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        fechaEnvio: form.fechaEnvio + 'T00:00:00',
        idCliente: form.tipoDestino === 'CLIENTE' ? parseInt(form.idCliente) : null,
        idPunto: form.tipoDestino === 'PUNTO_VENTA' ? parseInt(form.idPunto) : null,
      }
      await api.post('/envios', payload)
      setMostrarModal(false)
      cargarEnvios()
    } catch (err) { console.error(err) }
  }
 
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/envios/${id}/estado?nuevoEstado=${nuevoEstado}`)
      cargarEnvios()
    } catch (err) { console.error(err) }
  }
 
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Logística</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona envíos y rastrea entregas a diferentes ciudades.</p>
        </div>
        <button onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors">
          <Plus size={18} /> Crear Envío
        </button>
      </div>
 
      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">Cargando envíos...</div>
      ) : envios.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Truck size={40} className="mb-2 opacity-30" />
          <p>No hay envíos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Destino</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ciudad</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {envios.map(e => (
                <tr key={e.idEnvio} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm font-medium">ENV-{String(e.idEnvio).padStart(3,'0')}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{e.nombreDestino}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin size={14} className="text-orange-400" />
                      {e.destinoCiudad}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{e.fechaEnvio?.substring(0,10)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${ESTADOS_ENVIO[e.estado]?.class}`}>
                      {ESTADOS_ENVIO[e.estado]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {e.estado === 'PREPARADO' && (
                      <button onClick={() => cambiarEstado(e.idEnvio, 'EN_CAMINO')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        Despachar
                      </button>
                    )}
                    {e.estado === 'EN_CAMINO' && (
                      <button onClick={() => cambiarEstado(e.idEnvio, 'ENTREGADO')}
                        className="text-xs text-green-600 hover:text-green-800 font-medium">
                        Confirmar entrega
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
 
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Crear Envío</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tipo destino *</label>
                  <select value={form.tipoDestino}
                    onChange={e => setForm({...form, tipoDestino: e.target.value, idCliente: '', idPunto: ''})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="CLIENTE">Cliente</option>
                    <option value="PUNTO_VENTA">Punto de Venta</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {form.tipoDestino === 'CLIENTE' ? 'Cliente *' : 'Punto de venta *'}
                  </label>
                  <select required
                    value={form.tipoDestino === 'CLIENTE' ? form.idCliente : form.idPunto}
                    onChange={e => form.tipoDestino === 'CLIENTE'
                      ? setForm({...form, idCliente: e.target.value})
                      : setForm({...form, idPunto: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="">Seleccionar...</option>
                    {form.tipoDestino === 'CLIENTE'
                      ? clientes.map(c => <option key={c.idCliente} value={c.idCliente}>{c.nombre1} {c.apellido1}</option>)
                      : puntos.map(p => <option key={p.idPunto} value={p.idPunto}>{p.nombre}</option>)
                    }
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Ciudad destino *</label>
                  <input required value={form.destinoCiudad}
                    onChange={e => setForm({...form, destinoCiudad: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha envío *</label>
                  <input type="date" required value={form.fechaEnvio}
                    onChange={e => setForm({...form, fechaEnvio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Observaciones</label>
                <textarea value={form.observaciones}
                  onChange={e => setForm({...form, observaciones: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setMostrarModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
                  Crear Envío
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
 
export default Logistica
