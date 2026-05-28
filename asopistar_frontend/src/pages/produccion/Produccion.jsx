import { useState, useEffect } from 'react'
import { Plus, Fish, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'
import api from '../../services/api'

const ESTADOS = {
  EN_CURSO: { label: 'En Curso', class: 'bg-blue-100 text-blue-700' },
  COSECHADO: { label: 'Cosechado', class: 'bg-green-100 text-green-700' },
  PERDIDO: { label: 'Perdido', class: 'bg-red-100 text-red-600' },
}

function Produccion() {
  const [siembras, setSiembras] = useState([])
  const [especies, setEspecies] = useState([])
  const [estanques, setEstanques] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarModalSeguimiento, setMostrarModalSeguimiento] = useState(false)
  const [siembraSeleccionada, setSiembraSeleccionada] = useState(null)
  const [expandido, setExpandido] = useState(null)
  const [seguimientos, setSeguimientos] = useState({})
  const [filtro, setFiltro] = useState('TODOS')

  const [form, setForm] = useState({
    fechaSiembra: '', cantidadAlevinos: '',
    promedioInicial: '', observaciones: '',
    idEspecie: '', idEstanque: '', estado: 'EN_CURSO'
  })

  const [formSeguimiento, setFormSeguimiento] = useState({
    fechaVisita: '', pesoPromedio: '', cantidadEstimada: '',
    condicionAgua: 'BUENA', estadoSalud: 'SALUDABLE',
    observaciones: '', aptoCosecha: 'N'
  })

  useEffect(() => {
    Promise.all([cargarSiembras(), cargarEspecies(), cargarEstanques()])
  }, [])

  const cargarSiembras = async () => {
    try {
      const res = await api.get('/siembras')
      setSiembras(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const cargarEspecies = async () => {
    try { const res = await api.get('/especies'); setEspecies(res.data) }
    catch (err) { console.error(err) }
  }

  const cargarEstanques = async () => {
    try { const res = await api.get('/estanques'); setEstanques(res.data) }
    catch (err) { console.error(err) }
  }

  const cargarSeguimientos = async (idSiembra) => {
    try {
      const res = await api.get(`/seguimientos/siembra/${idSiembra}`)
      setSeguimientos(prev => ({ ...prev, [idSiembra]: res.data }))
    } catch (err) { console.error(err) }
  }

  const toggleExpandir = (idSiembra) => {
    if (expandido === idSiembra) {
      setExpandido(null)
    } else {
      setExpandido(idSiembra)
      cargarSeguimientos(idSiembra)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/siembras', {
        ...form,
        cantidadAlevinos: parseInt(form.cantidadAlevinos),
        promedioInicial: parseFloat(form.promedioInicial),
        idEspecie: parseInt(form.idEspecie),
        idEstanque: parseInt(form.idEstanque),
      })
      setMostrarModal(false)
      setForm({
        fechaSiembra: '', cantidadAlevinos: '', promedioInicial: '',
        observaciones: '', idEspecie: '', idEstanque: '', estado: 'EN_CURSO'
      })
      cargarSiembras()
    } catch (err) { console.error(err) }
  }

  const handleSubmitSeguimiento = async (e) => {
    e.preventDefault()
    try {
      await api.post('/seguimientos', {
        ...formSeguimiento,
        pesoPromedio: parseFloat(formSeguimiento.pesoPromedio),
        cantidadEstimada: parseInt(formSeguimiento.cantidadEstimada),
        aptoCosecha: formSeguimiento.aptoCosecha,
        idSiembra: siembraSeleccionada.idSiembra,
      })
      setMostrarModalSeguimiento(false)
      setFormSeguimiento({
        fechaVisita: '', pesoPromedio: '', cantidadEstimada: '',
        condicionAgua: 'BUENA', estadoSalud: 'SALUDABLE',
        observaciones: '', aptoCosecha: 'N'
      })
      cargarSeguimientos(siembraSeleccionada.idSiembra)
    } catch (err) { console.error(err) }
  }

  const abrirModalSeguimiento = (siembra) => {
    setSiembraSeleccionada(siembra)
    setMostrarModalSeguimiento(true)
  }

  const siembrasFiltradas = filtro === 'TODOS'
    ? siembras
    : siembras.filter(s => s.estado === filtro)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Producción</h1>
          <p className="text-gray-500 text-sm mt-1">
            Registra siembras y seguimientos del biólogo.
          </p>
        </div>
        <button onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors">
          <Plus size={18} /> Nueva Siembra
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {['TODOS', 'EN_CURSO', 'COSECHADO', 'PERDIDO'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === f
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f === 'TODOS' ? 'Todos'
              : f === 'EN_CURSO' ? 'En Curso'
              : f === 'COSECHADO' ? 'Cosechados'
              : 'Perdidos'}
          </button>
        ))}
      </div>

      {/* Lista siembras */}
      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">
          Cargando siembras...
        </div>
      ) : siembrasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Fish size={40} className="mb-2 opacity-30" />
          <p>No hay siembras registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {siembrasFiltradas.map(s => (
            <div key={s.idSiembra}
              className="bg-white rounded-xl shadow-sm border border-gray-100">

              {/* Cabecera de la siembra */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => toggleExpandir(s.idSiembra)}>
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Fish size={20} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {s.nombreEspecie} — {s.codigoEstanque}
                    </p>
                    <p className="text-sm text-gray-500">
                      {s.cantidadAlevinos} alevinos · Siembra: {s.fechaSiembra}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Productor: {s.nombreProductor}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${ESTADOS[s.estado]?.class}`}>
                    {ESTADOS[s.estado]?.label}
                  </span>

                  {/* Botón registrar seguimiento solo para siembras EN_CURSO */}
                  {s.estado === 'EN_CURSO' && (
                    <button
                      onClick={() => abrirModalSeguimiento(s)}
                      className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      <ClipboardList size={14} />
                      Seguimiento
                    </button>
                  )}

                  <button onClick={() => toggleExpandir(s.idSiembra)}
                    className="text-gray-400 hover:text-gray-600">
                    {expandido === s.idSiembra
                      ? <ChevronUp size={18} />
                      : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Panel expandido con seguimientos */}
              {expandido === s.idSiembra && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4">

                  {/* Datos de la siembra */}
                  <div className="grid grid-cols-3 gap-4 text-sm mb-5">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Peso promedio inicial</p>
                      <p className="font-medium text-gray-800">{s.promedioInicial} g</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Estanque</p>
                      <p className="font-medium text-gray-800">{s.codigoEstanque}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Observaciones</p>
                      <p className="font-medium text-gray-800">{s.observaciones || 'Ninguna'}</p>
                    </div>
                  </div>

                  {/* Historial de seguimientos */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <ClipboardList size={16} className="text-teal-600" />
                      Historial de Seguimientos
                    </h4>

                    {!seguimientos[s.idSiembra] ? (
                      <p className="text-sm text-gray-400">Cargando...</p>
                    ) : seguimientos[s.idSiembra].length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-400">
                          No hay seguimientos registrados para esta siembra
                        </p>
                        {s.estado === 'EN_CURSO' && (
                          <button
                            onClick={() => abrirModalSeguimiento(s)}
                            className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                          >
                            + Registrar primer seguimiento
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {seguimientos[s.idSiembra].map(seg => (
                          <div key={seg.idSeguimiento}
                            className="bg-gray-50 rounded-lg p-4 border-l-4 border-teal-400">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">
                                Visita: {seg.fechaVisita}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                seg.aptoCosecha === 'Y'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {seg.aptoCosecha === 'Y'
                                  ? '✓ Apto para cosecha'
                                  : 'No apto aún'}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
                              <div>
                                <span className="text-gray-400">Peso promedio:</span>
                                <span className="ml-1 font-medium">{seg.pesoPromedio} g</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Cantidad estimada:</span>
                                <span className="ml-1 font-medium">{seg.cantidadEstimada}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Condición agua:</span>
                                <span className="ml-1 font-medium">{seg.condicionAgua}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Salud:</span>
                                <span className="ml-1 font-medium">{seg.estadoSalud}</span>
                              </div>
                              {seg.observaciones && (
                                <div className="col-span-2">
                                  <span className="text-gray-400">Obs:</span>
                                  <span className="ml-1 font-medium">{seg.observaciones}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Siembra */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Nueva Siembra</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Especie *</label>
                  <select required value={form.idEspecie}
                    onChange={e => setForm({ ...form, idEspecie: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="">Seleccionar...</option>
                    {especies.map(e => (
                      <option key={e.idEspecie} value={e.idEspecie}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Estanque *</label>
                  <select required value={form.idEstanque}
                    onChange={e => setForm({ ...form, idEstanque: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="">Seleccionar...</option>
                    {estanques.map(e => (
                      <option key={e.idEstanque} value={e.idEstanque}>
                        {e.codigo} - {e.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha siembra *</label>
                  <input type="date" required value={form.fechaSiembra}
                    onChange={e => setForm({ ...form, fechaSiembra: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Cantidad alevinos *</label>
                  <input type="number" required value={form.cantidadAlevinos}
                    onChange={e => setForm({ ...form, cantidadAlevinos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Peso promedio inicial (g) *
                </label>
                <input type="number" step="0.01" required value={form.promedioInicial}
                  onChange={e => setForm({ ...form, promedioInicial: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Observaciones</label>
                <textarea value={form.observaciones}
                  onChange={e => setForm({ ...form, observaciones: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setMostrarModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
                  Guardar Siembra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Seguimiento */}
      {mostrarModalSeguimiento && siembraSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Registrar Seguimiento</h2>
              <p className="text-sm text-gray-500 mt-1">
                Siembra: {siembraSeleccionada.nombreEspecie} — {siembraSeleccionada.codigoEstanque}
              </p>
            </div>
            <form onSubmit={handleSubmitSeguimiento} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha visita *</label>
                  <input type="date" required value={formSeguimiento.fechaVisita}
                    onChange={e => setFormSeguimiento({ ...formSeguimiento, fechaVisita: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Peso promedio (g) *</label>
                  <input type="number" step="0.01" required value={formSeguimiento.pesoPromedio}
                    onChange={e => setFormSeguimiento({ ...formSeguimiento, pesoPromedio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Cantidad estimada de peces *
                </label>
                <input type="number" required value={formSeguimiento.cantidadEstimada}
                  onChange={e => setFormSeguimiento({ ...formSeguimiento, cantidadEstimada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Condición del agua *</label>
                  <select value={formSeguimiento.condicionAgua}
                    onChange={e => setFormSeguimiento({ ...formSeguimiento, condicionAgua: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="BUENA">Buena</option>
                    <option value="REGULAR">Regular</option>
                    <option value="MALA">Mala</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Estado de salud *</label>
                  <select value={formSeguimiento.estadoSalud}
                    onChange={e => setFormSeguimiento({ ...formSeguimiento, estadoSalud: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="SALUDABLE">Saludable</option>
                    <option value="CON_SIGNOS_ENFERMEDAD">Con signos de enfermedad</option>
                    <option value="CRITICO">Crítico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Observaciones</label>
                <textarea value={formSeguimiento.observaciones}
                  onChange={e => setFormSeguimiento({ ...formSeguimiento, observaciones: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
              </div>

              {/* Apto para cosecha — decisión clave del biólogo */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-teal-800 mb-3">
                  ¿Los peces están listos para cosechar?
                </p>
                <div className="flex gap-3">
                  <button type="button"
                    onClick={() => setFormSeguimiento({ ...formSeguimiento, aptoCosecha: 'Y' })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      formSeguimiento.aptoCosecha === 'Y'
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}>
                    ✓ Sí, aptos para cosecha
                  </button>
                  <button type="button"
                    onClick={() => setFormSeguimiento({ ...formSeguimiento, aptoCosecha: 'N' })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      formSeguimiento.aptoCosecha === 'N'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}>
                    ✗ Todavía no
                  </button>
                </div>
                {formSeguimiento.aptoCosecha === 'Y' && (
                  <p className="text-xs text-green-700 mt-2">
                    ✓ Al guardar este seguimiento, se podrá asignar un turno de pesca para esta siembra.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => setMostrarModalSeguimiento(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
                  Guardar Seguimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Produccion