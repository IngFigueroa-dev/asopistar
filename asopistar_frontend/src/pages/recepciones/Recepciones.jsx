import { useState, useEffect } from 'react'
import { Plus, ClipboardCheck, Clock, Fish } from 'lucide-react'
import api from '../../services/api'

function Recepciones() {
  const [recepciones, setRecepciones] = useState([])
  const [turnos,      setTurnos]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [error,       setError]       = useState('')
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null)
  const [capacidad,         setCapacidad]         = useState(null)
  const [form, setForm] = useState({
    fechaHora: '', kilosRecibidos: '',
    observaciones: '', idProductor: '', idTurno: '',
  })

  useEffect(() => {
    Promise.all([cargarRecepciones(), cargarTurnos(), cargarCapacidad()])
  }, [])

  const cargarRecepciones = async () => {
    try {
      const res = await api.get('/recepciones')
      setRecepciones(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const cargarCapacidad = async () => {
    try {
      const res = await api.get('/capacidad-cuarto-frio')
      setCapacidad(res.data)
    } catch { /* si no tiene acceso, silencioso */ }
  }

  const cargarTurnos = async () => {
    try {
      const res = await api.get('/turnos-pesca')
      setTurnos(res.data.filter(t => t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'))
    } catch (err) { console.error(err) }
  }

  // Al seleccionar un turno: fijar productor automáticamente y cargar siembra
  const handleTurnoChange = async (idTurno) => {
    if (!idTurno) {
      setTurnoSeleccionado(null)
      setForm(prev => ({ ...prev, idTurno: '', idProductor: '' }))
      return
    }
    const turno = turnos.find(t => t.idTurno === parseInt(idTurno))
    setForm(prev => ({
      ...prev,
      idTurno: idTurno,
      idProductor: turno?.idProductor || '',
    }))
    // Cargar datos de la siembra para mostrar kilos estimados
    if (turno?.idSiembra) {
      try {
        const res = await api.get(`/seguimientos/siembra/${turno.idSiembra}/ultimo`)
        setTurnoSeleccionado({ ...turno, cantidadEstimada: res.data.cantidadEstimada, pesoPromedio: res.data.pesoPromedio })
      } catch {
        setTurnoSeleccionado(turno)
      }
    } else {
      setTurnoSeleccionado(turno)
    }
  }

  const abrirModal = (turnoPreseleccionado = null) => {
    setError('')
    setTurnoSeleccionado(null)
    setForm({ fechaHora: '', kilosRecibidos: '', observaciones: '', idProductor: '', idTurno: '' })
    setMostrarModal(true)
    if (turnoPreseleccionado) {
      // Precargar el turno desde el banner
      setTimeout(() => handleTurnoChange(String(turnoPreseleccionado.idTurno)), 0)
    }
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setError('')
    setTurnoSeleccionado(null)
    setForm({ fechaHora: '', kilosRecibidos: '', observaciones: '', idProductor: '', idTurno: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/recepciones', {
        ...form,
        kilosRecibidos: parseFloat(form.kilosRecibidos),
        idProductor:    parseInt(form.idProductor),
        idTurno:        parseInt(form.idTurno),
        fechaHora:      form.fechaHora + ':00',
      })
      cerrarModal()
      await Promise.all([cargarRecepciones(), cargarTurnos()])
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message
        || 'Error al registrar la recepción. Verifica los datos.'
      setError(msg)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Recepciones</h1>
          <p className="text-gray-500 text-sm mt-1">Registra la entrada de pescado a la planta.</p>
        </div>
        <button onClick={() => abrirModal()}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors">
          <Plus size={18} /> Nueva Recepción
        </button>
      </div>

      {/* Banner de turnos pendientes */}
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
                  <span className="text-sm text-gray-700 font-medium">{t.nombreProductor}</span>
                  <span className="text-xs text-gray-400">— {t.fechaProgramada}</span>
                </div>
                <button
                  onClick={() => abrirModal(t)}
                  className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700 font-medium">
                  Registrar entrada
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de recepciones */}
      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">Cargando recepciones...</div>
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
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">#{r.idRecepcion}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                        {r.nombreProductor?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{r.nombreProductor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-800">{r.kilosRecibidos} kg</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {r.fechaHora?.replace('T', ' ').substring(0, 16)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.observaciones || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-800">Nueva Recepción</h2>
              <p className="text-sm text-gray-500 mt-1">Registra la entrada de pescado a la planta</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">

              {/* Turno de pesca */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Turno de pesca *</label>
                <select required value={form.idTurno}
                  onChange={e => handleTurnoChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                  <option value="">Seleccionar turno pendiente...</option>
                  {turnos.map(t => (
                    <option key={t.idTurno} value={t.idTurno}>
                      {t.nombreProductor} — {t.fechaProgramada}
                    </option>
                  ))}
                </select>
              </div>

              {/* Productor — se rellena automático al elegir turno, no editable */}
              {form.idTurno && turnoSeleccionado && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
                    Información del turno
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-teal-600 mb-0.5">Productor</p>
                      <p className="font-semibold text-teal-900">{turnoSeleccionado.nombreProductor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-teal-600 mb-0.5">Estanque</p>
                      <p className="font-semibold text-teal-900">{turnoSeleccionado.codigoEstanque || '—'}</p>
                    </div>
                    {turnoSeleccionado.cantidadEstimada && (
                      <div>
                        <p className="text-xs text-teal-600 mb-0.5">Peces estimados</p>
                        <p className="font-semibold text-teal-900">
                          {turnoSeleccionado.cantidadEstimada?.toLocaleString()} unid.
                        </p>
                      </div>
                    )}
                    {turnoSeleccionado.pesoPromedio && (
                      <div>
                        <p className="text-xs text-teal-600 mb-0.5">Peso promedio</p>
                        <p className="font-semibold text-teal-900">{turnoSeleccionado.pesoPromedio} g/pez</p>
                      </div>
                    )}
                  </div>
                  {turnoSeleccionado.cantidadEstimada && turnoSeleccionado.pesoPromedio && (
                    <div className="mt-1 pt-2 border-t border-teal-200">
                      <p className="text-xs text-teal-600 mb-0.5">Kilos estimados de cosecha</p>
                      <p className="text-base font-bold text-teal-900">
                        ≈ {((turnoSeleccionado.cantidadEstimada * turnoSeleccionado.pesoPromedio) / 1000).toFixed(1)} kg
                      </p>
                      <p className="text-xs text-teal-500 mt-0.5">
                        Referencia para validar los kilos recibidos
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Fecha/hora y kilos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha y hora *</label>
                  <input type="datetime-local" required value={form.fechaHora}
                    onChange={e => setForm({ ...form, fechaHora: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Kilos recibidos *</label>
                  <input type="number" step="0.01" min="0.01" required value={form.kilosRecibidos}
                    onChange={e => setForm({ ...form, kilosRecibidos: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Observaciones</label>
                <textarea value={form.observaciones}
                  onChange={e => setForm({ ...form, observaciones: e.target.value })}
                  rows={3} placeholder="Estado del pescado, condiciones de entrega..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
              </div>

              {/* Panel de capacidad del cuarto frío */}
              {capacidad && (
                <div className={`rounded-xl border p-4 ${
                  capacidad.porcentajeOcupacion >= 90
                    ? 'bg-red-50 border-red-200'
                    : capacidad.porcentajeOcupacion >= 70
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-teal-50 border-teal-200'
                }`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                    capacidad.porcentajeOcupacion >= 90 ? 'text-red-700'
                    : capacidad.porcentajeOcupacion >= 70 ? 'text-amber-700'
                    : 'text-teal-700'
                  }`}>❄️ Capacidad cuarto frío</p>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Disponible:</span>
                    <span className="font-bold">{Number(capacidad.kilosDisponibles).toLocaleString('es-CO')} kg</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Ocupado:</span>
                    <span className="font-semibold">{Number(capacidad.kilosActuales).toLocaleString('es-CO')} kg de {Number(capacidad.capacidadMaxKg).toLocaleString('es-CO')} kg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${
                      capacidad.porcentajeOcupacion >= 90 ? 'bg-red-500'
                      : capacidad.porcentajeOcupacion >= 70 ? 'bg-amber-400'
                      : 'bg-teal-500'
                    }`} style={{ width: `${Math.min(capacidad.porcentajeOcupacion, 100)}%` }} />
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">{capacidad.porcentajeOcupacion}% ocupado</p>
                  {form.kilosRecibidos && Number(form.kilosRecibidos) > Number(capacidad.kilosDisponibles) && (
                    <p className="text-xs text-red-600 font-semibold mt-2">
                      ⚠️ Los kilos a recibir ({Number(form.kilosRecibidos).toLocaleString('es-CO')} kg) superan el espacio disponible.
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={cerrarModal}
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
