// src/pages/calendario/Calendario.jsx
import { useState, useEffect, useCallback } from 'react'
import { Calendar, Plus, Clock, Fish, AlertTriangle, Loader2 } from 'lucide-react'
import api from '../../services/api'

const ESTADOS_TURNO = {
  PENDIENTE:  { label: 'Pendiente',  class: 'bg-yellow-100 text-yellow-700' },
  CONFIRMADO: { label: 'Confirmado', class: 'bg-blue-100 text-blue-700'    },
  REALIZADO:  { label: 'Realizado',  class: 'bg-green-100 text-green-700'  },
  CANCELADO:  { label: 'Cancelado',  class: 'bg-red-100 text-red-600'      },
}

const FORM_INICIAL = {
  fechaProgramada: '', horaProgramada: '',
  tipoPrioridad: 'NORMAL', motivoEmergencia: '',
  estado: 'PENDIENTE', idSiembra: '', idProductor: '',
}

const hoy = () => new Date().toISOString().split('T')[0]

const horaActual = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function Calendario() {
  const rol         = localStorage.getItem('rol') || ''
  const esProductor = rol === 'ROLE_PRODUCTOR'
  const idProductor = esProductor ? parseInt(localStorage.getItem('idProductor')) : null

  const [turnos,       setTurnos]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filtro,       setFiltro]       = useState('TODOS')
  const [mostrarModal, setMostrarModal] = useState(false)

  // ── Estado del modal ──────────────────────────────────────────────────────
  const [form,              setForm]              = useState(FORM_INICIAL)
  const [loadingModal,      setLoadingModal]      = useState(false)
  const [siembrasSinTurno,  setSiembrasSinTurno]  = useState([])
  const [productoresModal,  setProductoresModal]  = useState([])
  const [errorModal,        setErrorModal]        = useState('')
  const [guardando,         setGuardando]         = useState(false)

  // ── Carga de turnos ───────────────────────────────────────────────────────
  const cargarTurnos = useCallback(async () => {
    try {
      const res = esProductor
        ? await api.get(`/turnos-pesca/productor/${idProductor}`)
        : await api.get('/turnos-pesca/ordenados')
      setTurnos(res.data)
    } catch (err) { console.error('Error cargando turnos:', err) }
    finally { setLoading(false) }
  }, [esProductor, idProductor])

  useEffect(() => { cargarTurnos() }, [cargarTurnos])

  // ── Abrir modal: cargar siembras disponibles frescos ─────────────────────
  const abrirModal = async () => {
    setMostrarModal(true)
    setForm(FORM_INICIAL)
    setErrorModal('')
    setSiembrasSinTurno([])
    setProductoresModal([])
    setLoadingModal(true)
    try {
      const [resSiembras, resTurnos] = await Promise.all([
        api.get('/siembras/listas-para-cosechar'),
        api.get('/turnos-pesca/ordenados'),
      ])
      const turnosActivos = resTurnos.data.filter(
        t => t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'
      )
      const disponibles = resSiembras.data.filter(
        s => !turnosActivos.some(t => t.idSiembra === s.idSiembra)
      )
      setSiembrasSinTurno(disponibles)

      // Productores únicos con al menos una siembra disponible
      const mapaProductores = new Map()
      for (const s of disponibles) {
        if (!mapaProductores.has(s.idProductor)) {
          mapaProductores.set(s.idProductor, {
            idProductor:     s.idProductor,
            nombreProductor: s.nombreProductor,
          })
        }
      }
      setProductoresModal([...mapaProductores.values()])
    } catch (err) {
      console.error('Error cargando datos del modal:', err)
      setErrorModal('Error al cargar los datos. Intenta de nuevo.')
    } finally {
      setLoadingModal(false)
    }
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setForm(FORM_INICIAL)
    setErrorModal('')
  }

  // ── Siembras filtradas por productor seleccionado ─────────────────────────
  const siembrasFiltradas = form.idProductor
    ? siembrasSinTurno.filter(s => s.idProductor === parseInt(form.idProductor))
    : []

  // ── Validación de hora cuando la fecha es hoy ─────────────────────────────
  const minHora = form.fechaProgramada === hoy() ? horaActual() : undefined

  // ── Cambiar productor → limpiar siembra ───────────────────────────────────
  const handleProductorChange = (e) => {
    setForm({ ...form, idProductor: e.target.value, idSiembra: '' })
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorModal('')

    // Validación extra de hora
    if (form.fechaProgramada === hoy() && form.horaProgramada < horaActual()) {
      setErrorModal('La hora no puede ser anterior a la hora actual.')
      return
    }

    setGuardando(true)
    try {
      const horaCombinada = form.fechaProgramada + 'T' + form.horaProgramada + ':00'
      await api.post('/turnos-pesca', {
        ...form,
        horaProgramada: horaCombinada,
        idSiembra:      parseInt(form.idSiembra),
        idProductor:    parseInt(form.idProductor),
      })
      cerrarModal()
      await cargarTurnos()
    } catch (err) {
      const msg = err.response?.data?.mensaje
        || err.response?.data?.message
        || 'Error al guardar el turno. Verifica los datos.'
      setErrorModal(msg)
    } finally {
      setGuardando(false)
    }
  }

  // ── Cambiar estado ────────────────────────────────────────────────────────
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/turnos-pesca/${id}/estado?nuevoEstado=${nuevoEstado}`)
      await cargarTurnos()
    } catch (err) { console.error('Error cambiando estado:', err) }
  }

  const turnosFiltrados = filtro === 'TODOS'
    ? turnos
    : turnos.filter(t => t.estado === filtro)

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {esProductor ? 'Mis Turnos de Pesca' : 'Calendario de Pesca'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {esProductor
              ? 'Consulta el estado de tus turnos de cosecha.'
              : 'Planifica y gestiona los turnos de pesca.'}
          </p>
        </div>
        {!esProductor && (
          <button onClick={abrirModal}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors">
            <Plus size={18} /> Agregar Turno
          </button>
        )}
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['TODOS', 'PENDIENTE', 'CONFIRMADO', 'REALIZADO', 'CANCELADO'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === f
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f === 'TODOS' ? 'Todos' : ESTADOS_TURNO[f]?.label}
          </button>
        ))}
      </div>

      {/* ── Contenido principal ─────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">
          Cargando turnos...
        </div>
      ) : turnosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 text-gray-400">
          <Calendar size={40} className="mb-3 opacity-30" />
          {esProductor ? (
            <div className="text-center">
              <p className="font-medium text-gray-500 mb-2">No tienes turnos registrados</p>
              <p className="text-sm text-gray-400 max-w-sm">
                Cuando una siembra esté lista para cosechar, podrás reservar tu turno
                desde el módulo <strong className="text-teal-600">Mi Producción</strong>.
              </p>
            </div>
          ) : (
            <p>No hay turnos registrados</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {!esProductor && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">
                Los turnos se organizan automáticamente:
                <span className="font-medium text-gray-700"> emergencias primero</span>,
                luego por menor cantidad de peces y fecha de siembra más antigua.
              </p>
            </div>
          )}
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                {!esProductor && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Productor</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estanque</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                {!esProductor && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Acción</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {turnosFiltrados.map((t, index) => (
                <tr key={t.idTurno} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-teal-600 text-white'
                      : index === 1 ? 'bg-teal-100 text-teal-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  {!esProductor && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                          {t.nombreProductor?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{t.nombreProductor}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Fish size={14} className="text-teal-500 shrink-0" />
                      <span className="font-medium">{t.codigoEstanque}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock size={14} />
                      {t.fechaProgramada}
                    </div>
                  </td>
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
                        <span className="text-xs text-red-500 max-w-32 truncate">{t.motivoEmergencia}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${ESTADOS_TURNO[t.estado]?.class}`}>
                      {ESTADOS_TURNO[t.estado]?.label}
                    </span>
                  </td>
                  {!esProductor && (
                    <td className="px-6 py-4">
                      {t.estado === 'PENDIENTE' && (
                        <button onClick={() => cambiarEstado(t.idTurno, 'CONFIRMADO')}
                          className="text-xs text-teal-600 hover:text-teal-800 font-medium">
                          Confirmar
                        </button>
                      )}
                      {t.estado === 'CONFIRMADO' && (
                        <span className="text-xs text-gray-400">Esperando recepción</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal Agregar Turno ──────────────────────────────────────────── */}
      {mostrarModal && !esProductor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Agregar Turno de Pesca</h2>
              <p className="text-sm text-gray-500 mt-1">
                Solo se muestran productores con siembras aprobadas y sin turno asignado.
              </p>
            </div>

            {/* ── Cargando datos del modal ── */}
            {loadingModal ? (
              <div className="p-10 flex flex-col items-center gap-3 text-gray-400">
                <Loader2 size={28} className="animate-spin text-teal-500" />
                <p className="text-sm">Cargando siembras disponibles...</p>
              </div>

            /* ── Sin siembras disponibles ── */
            ) : siembrasSinTurno.length === 0 ? (
              <div className="p-8 flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                  <Fish size={26} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    No hay siembras disponibles
                  </p>
                  <p className="text-xs text-gray-500 max-w-xs">
                    No existen siembras aprobadas por el biólogo sin turno de pesca asignado.
                  </p>
                </div>
                <button onClick={cerrarModal}
                  className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cerrar
                </button>
              </div>

            /* ── Formulario ── */
            ) : (
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

                {errorModal && (
                  <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                    {errorModal}
                  </div>
                )}

                {/* Productor */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Productor *
                  </label>
                  <select required value={form.idProductor}
                    onChange={handleProductorChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="">Seleccionar productor...</option>
                    {productoresModal.map(p => (
                      <option key={p.idProductor} value={p.idProductor}>
                        {p.nombreProductor}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {productoresModal.length} productor{productoresModal.length !== 1 ? 'es' : ''} con siembra{productoresModal.length !== 1 ? 's' : ''} lista{productoresModal.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Siembra — solo se activa al elegir productor */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Siembra *
                  </label>
                  <select required value={form.idSiembra}
                    disabled={!form.idProductor}
                    onChange={e => setForm({ ...form, idSiembra: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed">
                    <option value="">
                      {form.idProductor ? 'Seleccionar siembra...' : 'Selecciona un productor primero'}
                    </option>
                    {siembrasFiltradas.map(s => (
                      <option key={s.idSiembra} value={s.idSiembra}>
                        {s.nombreEspecie} — {s.codigoEstanque} (Siembra: {s.fechaSiembra})
                      </option>
                    ))}
                  </select>
                  {form.idProductor && siembrasFiltradas.length === 0 && (
                    <p className="text-xs text-orange-500 mt-1">
                      Este productor no tiene siembras disponibles.
                    </p>
                  )}
                </div>

                {/* Fecha y hora */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Fecha *</label>
                    <input type="date" required
                      min={hoy()}
                      value={form.fechaProgramada}
                      onChange={e => setForm({ ...form, fechaProgramada: e.target.value, horaProgramada: '' })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Hora *</label>
                    <input type="time" required
                      min={minHora}
                      value={form.horaProgramada}
                      onChange={e => setForm({ ...form, horaProgramada: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                    {form.fechaProgramada === hoy() && (
                      <p className="text-xs text-gray-400 mt-1">Mínimo: {horaActual()} (hora actual)</p>
                    )}
                  </div>
                </div>

                {/* Prioridad */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tipo de prioridad</label>
                  <select value={form.tipoPrioridad}
                    onChange={e => setForm({ ...form, tipoPrioridad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="NORMAL">Normal</option>
                    <option value="EMERGENCIA">Emergencia</option>
                  </select>
                </div>

                {form.tipoPrioridad === 'EMERGENCIA' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Motivo de emergencia *
                    </label>
                    <textarea required rows={2}
                      value={form.motivoEmergencia}
                      onChange={e => setForm({ ...form, motivoEmergencia: e.target.value })}
                      placeholder="Describe el motivo de la emergencia..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={cerrarModal}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button type="submit" disabled={guardando}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                    {guardando ? 'Guardando...' : 'Guardar Turno'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default Calendario
