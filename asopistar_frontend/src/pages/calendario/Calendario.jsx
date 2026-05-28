import { useState, useEffect } from 'react'
import { Calendar, Plus, Clock, AlertTriangle } from 'lucide-react'
import api from '../../services/api'
 
const ESTADOS_TURNO = {
  PENDIENTE: { label: 'Pendiente', class: 'bg-yellow-100 text-yellow-700' },
  CONFIRMADO: { label: 'Confirmado', class: 'bg-blue-100 text-blue-700' },
  REALIZADO: { label: 'Realizado', class: 'bg-green-100 text-green-700' },
  CANCELADO: { label: 'Cancelado', class: 'bg-red-100 text-red-600' },
}
 
function Calendario() {
  const [turnos, setTurnos] = useState([])
  const [siembras, setSiembras] = useState([])
  const [productores, setProductores] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [filtro, setFiltro] = useState('TODOS')
  const [form, setForm] = useState({
    fechaProgramada: '', horaProgramada: '',
    tipoPrioridad: 'NORMAL', motivoEmergencia: '',
    estado: 'PENDIENTE', idSiembra: '', idProductor: ''
  })
 
  useEffect(() => {
    Promise.all([cargarTurnos(), cargarSiembras(), cargarProductores()])
  }, [])
 
  const cargarTurnos = async () => {
    try {
      const res = await api.get('/turnos-pesca/ordenados')
      setTurnos(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }
 
  const cargarSiembras = async () => {
    try { const res = await api.get('/siembras/activas'); setSiembras(res.data) }
    catch (err) { console.error(err) }
  }
 
  const cargarProductores = async () => {
    try { const res = await api.get('/productores/activos'); setProductores(res.data) }
    catch (err) { console.error(err) }
  }
 
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const horaCombinada = form.fechaProgramada + 'T' + form.horaProgramada + ':00'
      await api.post('/turnos-pesca', {
        ...form,
        horaProgramada: horaCombinada,
        idSiembra: parseInt(form.idSiembra),
        idProductor: parseInt(form.idProductor),
      })
      setMostrarModal(false)
      cargarTurnos()
    } catch (err) { console.error(err) }
  }
 
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/turnos-pesca/${id}/estado?nuevoEstado=${nuevoEstado}`)
      cargarTurnos()
    } catch (err) { console.error(err) }
  }
 
  const turnosFiltrados = filtro === 'TODOS' ? turnos : turnos.filter(t => t.estado === filtro)
 
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendario de Pesca</h1>
          <p className="text-gray-500 text-sm mt-1">Planifica y gestiona los turnos de pesca.</p>
        </div>
        <button onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors">
          <Plus size={18} /> Agregar Turno
        </button>
      </div>
 
      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['TODOS', 'PENDIENTE', 'CONFIRMADO', 'REALIZADO', 'CANCELADO'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === f ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f === 'TODOS' ? 'Todos' : ESTADOS_TURNO[f]?.label}
          </button>
        ))}
      </div>
 
      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">Cargando turnos...</div>
      ) : turnosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Calendar size={40} className="mb-2 opacity-30" />
          <p>No hay turnos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              Los turnos se organizan automáticamente: 
              <span className="font-medium text-gray-700"> emergencias primero</span>, 
              luego por menor cantidad de peces y fecha de siembra más antigua.
            </p>
          </div>
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Turno
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Productor
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Fecha programada
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Prioridad
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Estado
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {turnosFiltrados.map((t, index) => (
                <tr key={t.idTurno} className="hover:bg-gray-50">

                  {/* Número de turno */}
                  <td className="px-6 py-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? 'bg-teal-600 text-white'
                        : index === 1
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </td>

                  {/* Productor */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                        {t.nombreProductor?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {t.nombreProductor}
                      </span>
                    </div>
                  </td>

                  {/* Fecha */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock size={14} />
                      {t.fechaProgramada}
                    </div>
                  </td>

                  {/* Prioridad con razón */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium w-fit ${
                        t.tipoPrioridad === 'EMERGENCIA'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {t.tipoPrioridad === 'EMERGENCIA' ? '🚨 Emergencia' : 'Normal'}
                      </span>
                      {t.motivoEmergencia && (
                        <span className="text-xs text-red-500 max-w-32 truncate">
                          {t.motivoEmergencia}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      ESTADOS_TURNO[t.estado]?.class
                    }`}>
                      {ESTADOS_TURNO[t.estado]?.label}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 flex gap-2">
                    {t.estado === 'PENDIENTE' && (
                      <button
                        onClick={() => cambiarEstado(t.idTurno, 'CONFIRMADO')}
                        className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                      >
                        Confirmar
                      </button>
                    )}
                    {t.estado === 'CONFIRMADO' && (
                      <span className="text-xs text-gray-400">
                        Esperando recepción
                      </span>
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
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Agregar Turno de Pesca</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Productor *</label>
                <select required value={form.idProductor}
                  onChange={e => setForm({...form, idProductor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                  <option value="">Seleccionar productor...</option>
                  {productores.map(p => <option key={p.idProductor} value={p.idProductor}>{p.nombre1} {p.apellido1}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Siembra *</label>
                <select required value={form.idSiembra}
                  onChange={e => setForm({...form, idSiembra: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                  <option value="">Seleccionar siembra...</option>
                  {siembras.map(s => <option key={s.idSiembra} value={s.idSiembra}>{s.nombreEspecie} - {s.codigoEstanque}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha *</label>
                  <input type="date" required value={form.fechaProgramada}
                    onChange={e => setForm({...form, fechaProgramada: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Hora *</label>
                  <input type="time" required value={form.horaProgramada}
                    onChange={e => setForm({...form, horaProgramada: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Tipo de prioridad</label>
                <select value={form.tipoPrioridad}
                  onChange={e => setForm({...form, tipoPrioridad: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                  <option value="NORMAL">Normal</option>
                  <option value="EMERGENCIA">Emergencia</option>
                </select>
              </div>
              {form.tipoPrioridad === 'EMERGENCIA' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Motivo de emergencia *</label>
                  <textarea value={form.motivoEmergencia}
                    onChange={e => setForm({...form, motivoEmergencia: e.target.value})}
                    rows={2} required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setMostrarModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
                  Guardar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
 
export default Calendario