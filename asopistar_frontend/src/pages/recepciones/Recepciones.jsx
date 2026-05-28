import { useState, useEffect } from 'react'
import { Plus, ClipboardCheck, Clock } from 'lucide-react'
import api from '../../services/api'

function Recepciones() {
  const [recepciones, setRecepciones] = useState([])
  const [turnos, setTurnos] = useState([])
  const [productores, setProductores] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fechaHora: '',
    kilosRecibidos: '',
    observaciones: '',
    idProductor: '',
    idTurno: '',
  })

  useEffect(() => {
    Promise.all([cargarRecepciones(), cargarTurnos(), cargarProductores()])
  }, [])

  const cargarRecepciones = async () => {
    try {
      const res = await api.get('/recepciones')
      setRecepciones(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const cargarTurnos = async () => {
    try {
        const [pendientes, confirmados] = await Promise.all([
            api.get('/turnos-pesca/pendientes'),
            api.get('/turnos-pesca')
        ])
        const turnosActivos = confirmados.data.filter(t =>
            t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'
        )
        setTurnos(turnosActivos)
    } catch (err) { console.error(err) }
  }

  const cargarProductores = async () => {
    try {
      const res = await api.get('/productores/activos')
      setProductores(res.data)
    } catch (err) { console.error(err) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/recepciones', {
        ...form,
        kilosRecibidos: parseFloat(form.kilosRecibidos),
        idProductor: parseInt(form.idProductor),
        idTurno: parseInt(form.idTurno),
        fechaHora: form.fechaHora + ':00',
      })
      setMostrarModal(false)
      setForm({
        fechaHora: '', kilosRecibidos: '',
        observaciones: '', idProductor: '', idTurno: '',
      })
      cargarRecepciones()
      cargarTurnos()
    } catch (err) {
      setError('Error al registrar la recepción. Verifica los datos.')
      console.error(err)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Recepciones</h1>
          <p className="text-gray-500 text-sm mt-1">
            Registra la entrada de pescado a la planta.
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <Plus size={18} /> Nueva Recepción
        </button>
      </div>

      {/* Turnos confirmados pendientes de recepción */}
      {turnos.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-yellow-800 mb-2">
            ⏳ Turnos pendientes de recepción ({turnos.length})
          </p>
          <div className="space-y-2">
            {turnos.slice(0, 3).map(t => (
              <div key={t.idTurno}
                className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-yellow-100">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-yellow-600" />
                  <span className="text-sm text-gray-700 font-medium">
                    {t.nombreProductor}
                  </span>
                  <span className="text-xs text-gray-400">
                    — {t.fechaProgramada}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      idTurno: t.idTurno,
                      idProductor: t.idProductor,
                    }))
                    setMostrarModal(true)
                  }}
                  className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700 font-medium"
                >
                  Registrar entrada
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista recepciones */}
      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">
          Cargando recepciones...
        </div>
      ) : recepciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <ClipboardCheck size={40} className="mb-2 opacity-30" />
          <p>No hay recepciones registradas</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Productor</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Kilos Recibidos</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha y Hora</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recepciones.map(r => (
                <tr key={r.idRecepcion} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">
                    #{r.idRecepcion}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                        {r.nombreProductor?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {r.nombreProductor}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-800">
                      {r.kilosRecibidos} kg
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {r.fechaHora?.replace('T', ' ').substring(0, 16)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {r.observaciones || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Nueva Recepción</h2>
              <p className="text-sm text-gray-500 mt-1">
                Registra la entrada de pescado a la planta
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Turno de pesca *
                </label>
                <select required value={form.idTurno}
                  onChange={e => {
                    const turno = turnos.find(t => t.idTurno === parseInt(e.target.value))
                    setForm({
                      ...form,
                      idTurno: e.target.value,
                      idProductor: turno?.idProductor || form.idProductor,
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                  <option value="">Seleccionar turno pendiente...</option>
                  {turnos.map(t => (
                    <option key={t.idTurno} value={t.idTurno}>
                      {t.nombreProductor} — {t.fechaProgramada}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Productor *
                </label>
                <select required value={form.idProductor}
                  onChange={e => setForm({ ...form, idProductor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                  <option value="">Seleccionar productor...</option>
                  {productores.map(p => (
                    <option key={p.idProductor} value={p.idProductor}>
                      {p.nombre1} {p.apellido1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Fecha y hora *
                  </label>
                  <input
                    type="datetime-local" required value={form.fechaHora}
                    onChange={e => setForm({ ...form, fechaHora: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Kilos recibidos *
                  </label>
                  <input
                    type="number" step="0.01" required value={form.kilosRecibidos}
                    onChange={e => setForm({ ...form, kilosRecibidos: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Observaciones
                </label>
                <textarea value={form.observaciones}
                  onChange={e => setForm({ ...form, observaciones: e.target.value })}
                  rows={3} placeholder="Estado del pescado, condiciones de entrega..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setMostrarModal(false); setError('') }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
                  Registrar Recepción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Recepciones