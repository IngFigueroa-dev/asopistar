// src/pages/produccion/Produccion.jsx
import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Fish, ChevronDown, ChevronUp, ClipboardList,
  Waves, Leaf, CheckCircle2, Clock, Search, RefreshCw,
  User, Activity, AlertTriangle, Calendar, Droplets,
  Heart, Lock, RefreshCcw
} from 'lucide-react'
import api from '../../services/api'

// ════════════════════════════════════════════════════════════════════════════
// VISTA ORIGINAL — Productor / Admin / Gerente de Planta / otros roles
// ════════════════════════════════════════════════════════════════════════════

const ESTADOS = {
  EN_CURSO:  { label: 'En Curso',  class: 'bg-blue-100 text-blue-700'  },
  COSECHADO: { label: 'Cosechado', class: 'bg-green-100 text-green-700' },
  PERDIDO:   { label: 'Perdido',   class: 'bg-red-100 text-red-600'    },
}

const FORM_SIEMBRA_INICIAL = {
  fechaSiembra: '', cantidadAlevinos: '', promedioInicial: '',
  observaciones: '', idEspecie: '', idEstanque: '', estado: 'EN_CURSO',
}
const FORM_SEGUIMIENTO_INICIAL = {
  fechaVisita: '', pesoPromedio: '', cantidadEstimada: '',
  condicionAgua: 'BUENA', estadoSalud: 'SALUDABLE',
  observaciones: '', aptoCosecha: 'N',
}
const FORM_ESTANQUE_INICIAL = {
  codigo: '', nombre: '', capacidad: '', ubicacion: '', estadoEstanque: 'ACTIVO',
}
const FORM_ESPECIE_INICIAL = { nombre: '', descripcion: '' }
const FORM_TURNO_INICIAL   = {
  fechaProgramada: '', horaProgramada: '',
  tipoPrioridad: 'NORMAL', motivoEmergencia: '',
}

function ProduccionGeneral() {

  const rol          = localStorage.getItem('rol') || ''
  const esProductor  = rol === 'ROLE_PRODUCTOR'
  const esSecretaria = rol === 'ROLE_SECRETARIA'
  const esBiologo    = false   // nunca llega aquí el biólogo
  // La secretaria tiene acceso de solo lectura: no puede crear ni modificar nada
  const soloLectura  = esSecretaria
  const idProductor  = esProductor ? parseInt(localStorage.getItem('idProductor')) : null

  const [siembras,          setSiembras]          = useState([])
  const [especies,          setEspecies]          = useState([])
  const [estanques,         setEstanques]         = useState([])
  const [estanquesOcupados, setEstanquesOcupados] = useState([])
  const [turnosActivos,     setTurnosActivos]     = useState([])
  const [loading,           setLoading]           = useState(true)
  const [filtro,            setFiltro]            = useState('TODOS')
  const [expandido,         setExpandido]         = useState(null)
  const [seguimientos,      setSeguimientos]      = useState({})

  const [mostrarModalSiembra,     setMostrarModalSiembra]     = useState(false)
  const [mostrarModalSeguimiento, setMostrarModalSeguimiento] = useState(false)
  const [mostrarModalEstanque,    setMostrarModalEstanque]    = useState(false)
  const [mostrarModalEspecie,     setMostrarModalEspecie]     = useState(false)
  const [mostrarModalTurno,       setMostrarModalTurno]       = useState(false)
  const [siembraSeleccionada,     setSiembraSeleccionada]     = useState(null)

  const [form,            setForm]            = useState(FORM_SIEMBRA_INICIAL)
  const [formSeguimiento, setFormSeguimiento] = useState(FORM_SEGUIMIENTO_INICIAL)
  const [formEstanque,    setFormEstanque]    = useState(FORM_ESTANQUE_INICIAL)
  const [formEspecie,     setFormEspecie]     = useState(FORM_ESPECIE_INICIAL)
  const [formTurno,       setFormTurno]       = useState(FORM_TURNO_INICIAL)
  const [errorModal,      setErrorModal]      = useState('')

  const cargarSiembras = useCallback(async () => {
    try {
      const res = await api.get('/siembras')
      const todas = res.data
      const misSiembras = esProductor ? todas.filter(s => s.idProductor === idProductor) : todas
      setSiembras(misSiembras)

      // Si es productor, precargar seguimientos de sus siembras EN_CURSO
      // para que los badges (Reservar Turno / Pendiente biólogo) sean correctos
      // sin necesidad de expandir cada siembra primero.
      if (esProductor) {
        const activas = misSiembras.filter(s => s.estado === 'EN_CURSO')
        const resultados = await Promise.all(
          activas.map(s =>
            api.get(`/seguimientos/siembra/${s.idSiembra}`)
              .then(r => ({ id: s.idSiembra, data: r.data }))
              .catch(() => ({ id: s.idSiembra, data: [] }))
          )
        )
        setSeguimientos(prev => {
          const next = { ...prev }
          for (const { id, data } of resultados) next[id] = data
          return next
        })
      }
    } catch (err) { console.error('Error cargando siembras:', err) }
    finally { setLoading(false) }
  }, [esProductor, idProductor])

  const cargarEspecies = useCallback(async () => {
    try { const res = await api.get('/especies'); setEspecies(res.data) }
    catch (err) { console.error('Error cargando especies:', err) }
  }, [])

  const cargarEstanques = useCallback(async () => {
    try {
      const res = esProductor
        ? await api.get(`/estanques/productor/${idProductor}`)
        : await api.get('/estanques')
      setEstanques(res.data)
    } catch (err) { console.error('Error cargando estanques:', err) }
  }, [esProductor, idProductor])

  const cargarEstanquesOcupados = useCallback(async () => {
    if (!esProductor) return
    try {
      const res = await api.get('/siembras/activas')
      setEstanquesOcupados(
        res.data.filter(s => s.idProductor === idProductor).map(s => s.idEstanque)
      )
    } catch (err) { console.error('Error cargando estanques ocupados:', err) }
  }, [esProductor, idProductor])

  const cargarTurnosActivos = useCallback(async () => {
    try {
      const res = esProductor
        ? await api.get(`/turnos-pesca/productor/${idProductor}`)
        : await api.get('/turnos-pesca/ordenados')
      setTurnosActivos(res.data.filter(t => t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'))
    } catch (err) { console.error('Error cargando turnos activos:', err) }
  }, [esProductor, idProductor])

  const cargarSeguimientos = async (idSiembra) => {
    try {
      const res = await api.get(`/seguimientos/siembra/${idSiembra}`)
      setSeguimientos(prev => ({ ...prev, [idSiembra]: res.data }))
    } catch (err) { console.error('Error cargando seguimientos:', err) }
  }

  useEffect(() => {
    Promise.all([
      cargarSiembras(), cargarEspecies(), cargarEstanques(),
      cargarEstanquesOcupados(), cargarTurnosActivos(),
    ])
  }, [cargarSiembras, cargarEspecies, cargarEstanques,
      cargarEstanquesOcupados, cargarTurnosActivos])

  const tieneTurnoActivo = (idSiembra) =>
    turnosActivos.some(t => t.idSiembra === idSiembra)

  const siembraEsAptaParaCosecha = (idSiembra) => {
    const segs = seguimientos[idSiembra]
    if (!segs || segs.length === 0) return false
    return segs[0]?.aptoCosecha === 'Y'
  }

  const toggleExpandir = (idSiembra) => {
    if (expandido === idSiembra) { setExpandido(null) }
    else { setExpandido(idSiembra); cargarSeguimientos(idSiembra) }
  }

  const handleSubmitSiembra = async (e) => {
    e.preventDefault(); setErrorModal('')
    try {
      await api.post('/siembras', {
        ...form,
        cantidadAlevinos: parseInt(form.cantidadAlevinos),
        promedioInicial:  parseFloat(form.promedioInicial),
        idEspecie:        parseInt(form.idEspecie),
        idEstanque:       parseInt(form.idEstanque),
      })
      setMostrarModalSiembra(false); setForm(FORM_SIEMBRA_INICIAL)
      await Promise.all([cargarSiembras(), cargarEstanquesOcupados()])
    } catch (err) {
      setErrorModal(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar la siembra.')
    }
  }

  const handleSubmitSeguimiento = async (e) => {
    e.preventDefault(); setErrorModal('')
    try {
      await api.post('/seguimientos', {
        ...formSeguimiento,
        pesoPromedio:     parseFloat(formSeguimiento.pesoPromedio),
        cantidadEstimada: parseInt(formSeguimiento.cantidadEstimada),
        aptoCosecha:      formSeguimiento.aptoCosecha,
        idSiembra:        siembraSeleccionada.idSiembra,
      })
      setMostrarModalSeguimiento(false); setFormSeguimiento(FORM_SEGUIMIENTO_INICIAL)
      await Promise.all([cargarSeguimientos(siembraSeleccionada.idSiembra), cargarTurnosActivos()])
    } catch (err) {
      setErrorModal(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar el seguimiento.')
    }
  }

  const handleSubmitEstanque = async (e) => {
    e.preventDefault(); setErrorModal('')
    try {
      await api.post('/estanques', { ...formEstanque, capacidad: parseFloat(formEstanque.capacidad), idProductor })
      setMostrarModalEstanque(false); setFormEstanque(FORM_ESTANQUE_INICIAL)
      await cargarEstanques()
    } catch (err) {
      setErrorModal(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar el estanque.')
    }
  }

  const handleSubmitEspecie = async (e) => {
    e.preventDefault(); setErrorModal('')
    try {
      await api.post('/especies', formEspecie)
      setMostrarModalEspecie(false); setFormEspecie(FORM_ESPECIE_INICIAL)
      await cargarEspecies()
    } catch (err) {
      setErrorModal(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar la especie.')
    }
  }

  const handleSubmitTurno = async (e) => {
    e.preventDefault(); setErrorModal('')
    try {
      const horaCombinada = formTurno.fechaProgramada + 'T' + formTurno.horaProgramada + ':00'
      await api.post('/turnos-pesca', {
        fechaProgramada:  formTurno.fechaProgramada,
        horaProgramada:   horaCombinada,
        tipoPrioridad:    formTurno.tipoPrioridad,
        motivoEmergencia: formTurno.motivoEmergencia || null,
        estado:           'PENDIENTE',
        idSiembra:        siembraSeleccionada.idSiembra,
        idProductor:      idProductor,
      })
      setMostrarModalTurno(false); setFormTurno(FORM_TURNO_INICIAL); setSiembraSeleccionada(null)
      await cargarTurnosActivos()
    } catch (err) {
      setErrorModal(err.response?.data?.mensaje || err.response?.data?.message || 'Error al reservar el turno.')
    }
  }

  const abrirModalSeguimiento = (siembra) => {
    setSiembraSeleccionada(siembra); setErrorModal(''); setMostrarModalSeguimiento(true)
  }
  const abrirModalTurno = (siembra) => {
    setSiembraSeleccionada(siembra); setErrorModal(''); setFormTurno(FORM_TURNO_INICIAL); setMostrarModalTurno(true)
  }

  const siembrasFiltradas = filtro === 'TODOS' ? siembras : siembras.filter(s => s.estado === filtro)

  const renderBotonAccion = (s) => {
    if (esProductor) {
      if (s.estado !== 'EN_CURSO') return null
      if (tieneTurnoActivo(s.idSiembra)) {
        return (
          <span className="flex items-center gap-1.5 text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg font-medium">
            <CheckCircle2 size={14} /> Turno asignado
          </span>
        )
      }
      const segsActuales = seguimientos[s.idSiembra]
      if (segsActuales !== undefined) {
        if (siembraEsAptaParaCosecha(s.idSiembra)) {
          return (
            <button onClick={(e) => { e.stopPropagation(); abrirModalTurno(s) }}
              className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
              🎣 Reservar Turno
            </button>
          )
        }
        return (
          <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-medium">
            <Clock size={14} /> Pendiente biólogo
          </span>
        )
      }
      return (
        <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-medium">
          <Clock size={14} /> Ver seguimientos
        </span>
      )
    }
    if (s.estado !== 'EN_CURSO') return null
    if (tieneTurnoActivo(s.idSiembra)) {
      return (
        <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium">
          🎣 Listo para cosecha
        </span>
      )
    }
    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {esProductor ? 'Mi Producción' : 'Producción'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {esProductor ? 'Gestiona tus estanques, especies y siembras.' : 'Registra siembras y seguimientos del biólogo.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {esProductor && (
            <>
              <button onClick={() => { setErrorModal(''); setMostrarModalEspecie(true) }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                <Leaf size={16} /> Nueva Especie
              </button>
              <button onClick={() => { setErrorModal(''); setMostrarModalEstanque(true) }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                <Waves size={16} /> Nuevo Estanque
              </button>
            </>
          )}
          {!soloLectura && (
            <button onClick={() => { setErrorModal(''); setMostrarModalSiembra(true) }}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors">
              <Plus size={18} /> Nueva Siembra
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['TODOS', 'EN_CURSO', 'COSECHADO', 'PERDIDO'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === f ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f === 'TODOS' ? 'Todos' : f === 'EN_CURSO' ? 'En Curso' : f === 'COSECHADO' ? 'Cosechados' : 'Perdidos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">Cargando siembras...</div>
      ) : siembrasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Fish size={40} className="mb-2 opacity-30" />
          <p>{esProductor ? 'Aún no tienes siembras registradas. ¡Crea tu primera siembra!' : 'No hay siembras registradas'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {siembrasFiltradas.map(s => (
            <div key={s.idSiembra} className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleExpandir(s.idSiembra)}>
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Fish size={20} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{s.nombreEspecie} — {s.codigoEstanque}</p>
                    <p className="text-sm text-gray-500">{s.cantidadAlevinos} alevinos · Siembra: {s.fechaSiembra}</p>
                    {!esProductor && (
                      <p className="text-xs text-gray-400 mt-0.5">Productor: {s.nombreProductor}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${ESTADOS[s.estado]?.class}`}>
                    {ESTADOS[s.estado]?.label}
                  </span>
                  {renderBotonAccion(s)}
                  <button onClick={() => toggleExpandir(s.idSiembra)} className="text-gray-400 hover:text-gray-600">
                    {expandido === s.idSiembra ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {expandido === s.idSiembra && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4">
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

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <ClipboardList size={16} className="text-teal-600" /> Historial de Seguimientos
                    </h4>
                    {!seguimientos[s.idSiembra] ? (
                      <p className="text-sm text-gray-400">Cargando...</p>
                    ) : seguimientos[s.idSiembra].length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-400">No hay seguimientos registrados para esta siembra</p>
                        {esProductor && (
                          <p className="mt-2 text-xs text-gray-400 italic">El biólogo registrará los seguimientos de tu siembra.</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {seguimientos[s.idSiembra].map(seg => (
                          <div key={seg.idSeguimiento} className="bg-gray-50 rounded-lg p-4 border-l-4 border-teal-400">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">Visita: {seg.fechaVisita}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                seg.aptoCosecha === 'Y' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {seg.aptoCosecha === 'Y' ? '✓ Apto para cosecha' : 'No apto aún'}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
                              <div><span className="text-gray-400">Peso promedio:</span><span className="ml-1 font-medium">{seg.pesoPromedio} g</span></div>
                              <div><span className="text-gray-400">Cantidad estimada:</span><span className="ml-1 font-medium">{seg.cantidadEstimada}</span></div>
                              <div><span className="text-gray-400">Condición agua:</span><span className="ml-1 font-medium">{seg.condicionAgua}</span></div>
                              <div><span className="text-gray-400">Salud:</span><span className="ml-1 font-medium">{seg.estadoSalud}</span></div>
                              {seg.observaciones && (
                                <div className="col-span-2"><span className="text-gray-400">Obs:</span><span className="ml-1 font-medium">{seg.observaciones}</span></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {esProductor &&
                      s.estado === 'EN_CURSO' &&
                      seguimientos[s.idSiembra]?.length > 0 &&
                      siembraEsAptaParaCosecha(s.idSiembra) &&
                      !tieneTurnoActivo(s.idSiembra) && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-green-800">✅ Tus peces están listos para cosechar</p>
                              <p className="text-xs text-green-600 mt-1">El biólogo aprobó esta siembra. Puedes reservar tu turno.</p>
                            </div>
                            <button onClick={() => abrirModalTurno(s)}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors ml-4 shrink-0">
                              🎣 Reservar Turno
                            </button>
                          </div>
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Nueva Siembra ─────────────────────────────────────────── */}
      {mostrarModalSiembra && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Nueva Siembra</h2>
            </div>
            <form onSubmit={handleSubmitSiembra} className="p-6 flex flex-col gap-4">
              {errorModal && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{errorModal}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Especie *</label>
                  <select required value={form.idEspecie} onChange={e => setForm({ ...form, idEspecie: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="">Seleccionar...</option>
                    {especies.map(e => <option key={e.idEspecie} value={e.idEspecie}>{e.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Estanque *</label>
                  <select required value={form.idEstanque} onChange={e => setForm({ ...form, idEstanque: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="">Seleccionar...</option>
                    {estanques.map(e => {
                      const ocupado = estanquesOcupados.includes(e.idEstanque)
                      return <option key={e.idEstanque} value={e.idEstanque} disabled={ocupado}>{e.codigo} - {e.nombre}{ocupado ? ' (Ocupado)' : ''}</option>
                    })}
                  </select>
                  {esProductor && estanques.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">No tienes estanques registrados. Crea uno primero.</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha siembra *</label>
                  <input type="date" required value={form.fechaSiembra} onChange={e => setForm({ ...form, fechaSiembra: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Cantidad alevinos *</label>
                  <input type="number" min="1" required value={form.cantidadAlevinos} onChange={e => setForm({ ...form, cantidadAlevinos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Peso promedio inicial (g) *</label>
                <input type="number" step="0.01" min="0" required value={form.promedioInicial} onChange={e => setForm({ ...form, promedioInicial: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setMostrarModalSiembra(false); setErrorModal('') }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">Guardar Siembra</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Nuevo Estanque ─────────────────────────────────────────── */}
      {mostrarModalEstanque && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Nuevo Estanque</h2>
              <p className="text-sm text-gray-500 mt-1">El estanque quedará registrado a tu nombre.</p>
            </div>
            <form onSubmit={handleSubmitEstanque} className="p-6 flex flex-col gap-4">
              {errorModal && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{errorModal}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Código * <span className="text-gray-400 font-normal">(ej: EST-001)</span></label>
                  <input type="text" required maxLength={10} value={formEstanque.codigo} onChange={e => setFormEstanque({ ...formEstanque, codigo: e.target.value })}
                    placeholder="EST-001" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nombre *</label>
                  <input type="text" required maxLength={20} value={formEstanque.nombre} onChange={e => setFormEstanque({ ...formEstanque, nombre: e.target.value })}
                    placeholder="Estanque Principal" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Capacidad *</label>
                  <input type="number" step="0.01" min="0.01" required value={formEstanque.capacidad} onChange={e => setFormEstanque({ ...formEstanque, capacidad: e.target.value })}
                    placeholder="50.00" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Estado *</label>
                  <select value={formEstanque.estadoEstanque} onChange={e => setFormEstanque({ ...formEstanque, estadoEstanque: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="ACTIVO">Activo</option>
                    <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Ubicación *</label>
                <input type="text" required maxLength={100} value={formEstanque.ubicacion} onChange={e => setFormEstanque({ ...formEstanque, ubicacion: e.target.value })}
                  placeholder="Vereda La Esperanza, finca El Porvenir" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setMostrarModalEstanque(false); setErrorModal('') }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">Guardar Estanque</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Nueva Especie ──────────────────────────────────────────── */}
      {mostrarModalEspecie && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Nueva Especie</h2>
              <p className="text-sm text-gray-500 mt-1">La especie quedará disponible para todos los productores.</p>
            </div>
            <form onSubmit={handleSubmitEspecie} className="p-6 flex flex-col gap-4">
              {errorModal && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{errorModal}</div>}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nombre de la especie *</label>
                <input type="text" required maxLength={20} value={formEspecie.nombre} onChange={e => setFormEspecie({ ...formEspecie, nombre: e.target.value })}
                  placeholder="Cachama blanca" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Descripción *</label>
                <textarea required maxLength={100} value={formEspecie.descripcion} onChange={e => setFormEspecie({ ...formEspecie, descripcion: e.target.value })}
                  rows={3} placeholder="Especie de agua dulce, ciclo de 6 meses..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setMostrarModalEspecie(false); setErrorModal('') }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">Guardar Especie</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Reservar Turno ─────────────────────────────────────────── */}
      {mostrarModalTurno && siembraSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Reservar Turno de Pesca</h2>
              <p className="text-sm text-gray-500 mt-1">Siembra aprobada para cosecha</p>
            </div>
            <form onSubmit={handleSubmitTurno} className="p-6 flex flex-col gap-4">
              {errorModal && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{errorModal}</div>}
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-teal-600 text-xs font-medium mb-1">Siembra</p>
                    <p className="font-semibold text-teal-900">{siembraSeleccionada.nombreEspecie} — {siembraSeleccionada.codigoEstanque}</p>
                  </div>
                  <div>
                    <p className="text-teal-600 text-xs font-medium mb-1">Productor</p>
                    <p className="font-semibold text-teal-900">{siembraSeleccionada.nombreProductor}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha deseada *</label>
                  <input type="date" required min={new Date().toISOString().split('T')[0]}
                    value={formTurno.fechaProgramada} onChange={e => setFormTurno({ ...formTurno, fechaProgramada: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Hora deseada *</label>
                  <input type="time" required value={formTurno.horaProgramada} onChange={e => setFormTurno({ ...formTurno, horaProgramada: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Tipo de solicitud</label>
                <select value={formTurno.tipoPrioridad} onChange={e => setFormTurno({ ...formTurno, tipoPrioridad: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                  <option value="NORMAL">Normal</option>
                  <option value="EMERGENCIA">Emergencia</option>
                </select>
              </div>
              {formTurno.tipoPrioridad === 'EMERGENCIA' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Motivo de emergencia *</label>
                  <textarea required value={formTurno.motivoEmergencia} onChange={e => setFormTurno({ ...formTurno, motivoEmergencia: e.target.value })}
                    rows={3} placeholder="Describe el motivo de la emergencia..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
                </div>
              )}
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                ℹ️ El gerente de planta confirmará tu turno. Recibirás el turno en el orden que corresponda según la prioridad y la fecha de tu siembra.
              </p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setMostrarModalTurno(false); setErrorModal(''); setSiembraSeleccionada(null) }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">Reservar Turno</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Seguimiento (admin/gerente que también pueden ver) ──────── */}
      {mostrarModalSeguimiento && siembraSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Registrar Seguimiento</h2>
              <p className="text-sm text-gray-500 mt-1">Siembra: {siembraSeleccionada.nombreEspecie} — {siembraSeleccionada.codigoEstanque}</p>
            </div>
            <form onSubmit={handleSubmitSeguimiento} className="p-6 flex flex-col gap-4">
              {errorModal && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{errorModal}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha visita *</label>
                  <input type="date" required value={formSeguimiento.fechaVisita} onChange={e => setFormSeguimiento({ ...formSeguimiento, fechaVisita: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Peso promedio (g) *</label>
                  <input type="number" step="0.01" min="0" required value={formSeguimiento.pesoPromedio} onChange={e => setFormSeguimiento({ ...formSeguimiento, pesoPromedio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Cantidad estimada de peces *</label>
                <input type="number" min="1" required value={formSeguimiento.cantidadEstimada} onChange={e => setFormSeguimiento({ ...formSeguimiento, cantidadEstimada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Condición del agua *</label>
                  <select value={formSeguimiento.condicionAgua} onChange={e => setFormSeguimiento({ ...formSeguimiento, condicionAgua: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="BUENA">Buena</option>
                    <option value="REGULAR">Regular</option>
                    <option value="MALA">Mala</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Estado de salud *</label>
                  <select value={formSeguimiento.estadoSalud} onChange={e => setFormSeguimiento({ ...formSeguimiento, estadoSalud: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="SALUDABLE">Saludable</option>
                    <option value="CON_SIGNOS_ENFERMEDAD">Con signos de enfermedad</option>
                    <option value="CRITICO">Crítico</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Observaciones</label>
                <textarea value={formSeguimiento.observaciones} onChange={e => setFormSeguimiento({ ...formSeguimiento, observaciones: e.target.value })}
                  rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-teal-800 mb-3">¿Los peces están listos para cosechar?</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setFormSeguimiento({ ...formSeguimiento, aptoCosecha: 'Y' })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${formSeguimiento.aptoCosecha === 'Y' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    ✓ Sí, aptos para cosecha
                  </button>
                  <button type="button" onClick={() => setFormSeguimiento({ ...formSeguimiento, aptoCosecha: 'N' })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${formSeguimiento.aptoCosecha === 'N' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    ✗ Todavía no
                  </button>
                </div>
                {formSeguimiento.aptoCosecha === 'Y' && (
                  <p className="text-xs text-green-700 mt-2">✓ Al guardar, el productor podrá reservar un turno de pesca para esta siembra.</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setMostrarModalSeguimiento(false); setErrorModal('') }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">Guardar Seguimiento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// VISTA BIÓLOGO — Consola de monitoreo agrupada por productor
// ════════════════════════════════════════════════════════════════════════════

const FORM_SEG_INICIAL = {
  fechaVisita: '', pesoPromedio: '', cantidadEstimada: '',
  condicionAgua: 'BUENA', estadoSalud: 'SALUDABLE',
  observaciones: '', aptoCosecha: 'N',
}

const nombreCompleto = (p) =>
  [p.nombre1, p.nombre2, p.apellido1, p.apellido2].filter(Boolean).join(' ')

const formatFecha = (f) => {
  if (!f) return '—'
  const [y, m, d] = f.toString().split('-')
  return `${d}/${m}/${y}`
}

const diasDesde = (fecha) => {
  if (!fecha) return null
  return Math.floor((new Date() - new Date(fecha)) / 86400000)
}

const estaAprobada = (segs) =>
  segs && segs.length > 0 && segs[0]?.aptoCosecha === 'Y'

const estadoSanitarioProductor = (siembras, seguimientosPorSiembra) => {
  const activas = siembras.filter(s => s.estado === 'EN_CURSO')
  if (activas.length === 0) return 'SIN_ACTIVAS'
  let critico = false, requiere = false
  for (const s of activas) {
    const segs = seguimientosPorSiembra[s.idSiembra]
    if (!segs || segs.length === 0) { requiere = true; continue }
    const u = segs[0]
    if (u.estadoSalud === 'CRITICO' || u.condicionAgua === 'MALA') { critico = true; break }
    if (u.estadoSalud === 'CON_SIGNOS_ENFERMEDAD' || u.condicionAgua === 'REGULAR') requiere = true
    if (diasDesde(u.fechaVisita) > 15) requiere = true
  }
  if (critico) return 'CRITICO'
  if (requiere) return 'REQUIERE'
  return 'SALUDABLE'
}

const SAN_CONFIG = {
  SALUDABLE:   { label: 'Saludable',           dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REQUIERE:    { label: 'Requiere seguimiento', dot: 'bg-amber-400',  badge: 'bg-amber-50  text-amber-700  border-amber-200'  },
  CRITICO:     { label: 'Crítico',             dot: 'bg-red-500',    badge: 'bg-red-50    text-red-700    border-red-200'    },
  SIN_ACTIVAS: { label: 'Sin siembras activas', dot: 'bg-gray-300',  badge: 'bg-gray-50   text-gray-500   border-gray-200'  },
}

const SIEM_EST = {
  EN_CURSO:  { label: 'En Curso',  class: 'bg-blue-100 text-blue-700'   },
  COSECHADO: { label: 'Cosechado', class: 'bg-green-100 text-green-700' },
  PERDIDO:   { label: 'Perdido',   class: 'bg-red-100 text-red-600'     },
}

const AGUA_CONFIG = {
  BUENA:   { label: 'Buena',   class: 'text-emerald-600' },
  REGULAR: { label: 'Regular', class: 'text-amber-600'   },
  MALA:    { label: 'Mala',    class: 'text-red-600'     },
}

const SALUD_CONFIG = {
  SALUDABLE:             { label: 'Saludable',               class: 'text-emerald-600' },
  CON_SIGNOS_ENFERMEDAD: { label: 'Con signos de enfermedad', class: 'text-amber-600'  },
  CRITICO:               { label: 'Crítico',                 class: 'text-red-600'    },
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
}

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function BadgeSiembra({ siembra, seguimientos: segs }) {
  const aprobada = estaAprobada(segs)
  if (aprobada) return (
    <span className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold">
      <CheckCircle2 size={13} /> Apta para cosecha
    </span>
  )
  if (siembra.estado !== 'EN_CURSO') return null
  if (!segs || segs.length === 0) return (
    <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-medium">
      <Clock size={13} /> Sin seguimientos
    </span>
  )
  const dias = diasDesde(segs[0].fechaVisita)
  if (dias !== null && dias > 15) return (
    <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg font-medium">
      <AlertTriangle size={13} /> Sin visita {dias}d
    </span>
  )
  return (
    <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium">
      <Activity size={13} /> En seguimiento
    </span>
  )
}

function PanelSiembra({ siembra, seguimientos: segs, loadingSegs, onRegistrar }) {
  const aprobada = estaAprobada(segs)
  const bloqueada = aprobada || siembra.estado !== 'EN_CURSO'

  return (
    <div className="border-t border-gray-100 px-5 pb-5 pt-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          ['Peso inicial', `${siembra.promedioInicial} g`],
          ['Estanque', siembra.codigoEstanque],
          ['Alevinos', siembra.cantidadAlevinos?.toLocaleString()],
          ['Observaciones', siembra.observaciones || '—'],
        ].map(([lbl, val]) => (
          <div key={lbl} className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-0.5">{lbl}</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{val}</p>
          </div>
        ))}
      </div>

      {bloqueada && (
        <div className={`flex items-start gap-3 rounded-xl p-4 mb-5 border ${aprobada ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
          {aprobada
            ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            : <Lock size={18} className="text-gray-400 shrink-0 mt-0.5" />
          }
          <div>
            {aprobada ? (
              <>
                <p className="text-sm font-semibold text-emerald-800">Ciclo biológico cerrado</p>
                <p className="text-xs text-emerald-700 mt-0.5">Esta siembra fue aprobada para cosecha. El productor debe agendar su turno de pesca. No se permiten nuevos seguimientos.</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-700">Siembra {siembra.estado.toLowerCase()}</p>
                <p className="text-xs text-gray-500 mt-0.5">El ciclo productivo de esta siembra ha finalizado.</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <ClipboardList size={15} className="text-teal-600" /> Historial de seguimientos
        </h4>
        {!bloqueada && (
          <button onClick={() => onRegistrar(siembra)}
            className="flex items-center gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors">
            <Plus size={13} /> Registrar seguimiento
          </button>
        )}
      </div>

      {loadingSegs ? (
        <div className="space-y-2"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
      ) : !segs || segs.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-5 text-center">
          <ClipboardList size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No hay seguimientos registrados</p>
          {!bloqueada && (
            <button onClick={() => onRegistrar(siembra)} className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-semibold">
              + Registrar primer seguimiento
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {segs.map((seg, idx) => (
            <div key={seg.idSeguimiento}
              className={`rounded-xl border p-4 ${seg.aptoCosecha === 'Y' ? 'bg-emerald-50 border-emerald-200' : idx === 0 ? 'bg-white border-teal-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-800">Visita: {formatFecha(seg.fechaVisita)}</span>
                  {idx === 0 && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Último</span>}
                </div>
                {seg.aptoCosecha === 'Y'
                  ? <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold"><CheckCircle2 size={13} /> Apto para cosecha</span>
                  : <span className="text-xs text-gray-400 font-medium">No apto aún</span>
                }
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><p className="text-gray-400 mb-0.5">Peso promedio</p><p className="font-semibold text-gray-700">{seg.pesoPromedio} g</p></div>
                <div><p className="text-gray-400 mb-0.5">Cantidad estimada</p><p className="font-semibold text-gray-700">{seg.cantidadEstimada?.toLocaleString()}</p></div>
                <div>
                  <p className="text-gray-400 mb-0.5 flex items-center gap-1"><Droplets size={11} /> Agua</p>
                  <p className={`font-semibold ${AGUA_CONFIG[seg.condicionAgua]?.class}`}>{AGUA_CONFIG[seg.condicionAgua]?.label}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5 flex items-center gap-1"><Heart size={11} /> Salud</p>
                  <p className={`font-semibold ${SALUD_CONFIG[seg.estadoSalud]?.class}`}>{SALUD_CONFIG[seg.estadoSalud]?.label}</p>
                </div>
              </div>
              {seg.observaciones && (
                <p className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2">Obs: {seg.observaciones}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProduccionBiologo() {
  const [productores,  setProductores]  = useState([])
  const [siembras,     setSiembras]     = useState([])
  const [seguimientos, setSeguimientos] = useState({})
  const [loadingSegs,  setLoadingSegs]  = useState({})
  const [loading,      setLoading]      = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [busqueda,     setBusqueda]     = useState('')
  const [productorOpen, setProductorOpen] = useState(null)
  const [siembraOpen,   setSiembraOpen]   = useState(null)
  const [modalSeg,      setModalSeg]      = useState(false)
  const [siembraSeleccionada, setSiembraSeleccionada] = useState(null)
  const [formSeg,   setFormSeg]   = useState(FORM_SEG_INICIAL)
  const [errorModal, setErrorModal] = useState('')
  const [guardando,  setGuardando]  = useState(false)

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      const [resProd, resSiem] = await Promise.all([
        api.get('/productores/activos'),
        api.get('/siembras'),
      ])
      setProductores(resProd.data)
      const todasSiembras = resSiem.data
      setSiembras(todasSiembras)
      // Precargar seguimientos de todas las siembras EN_CURSO
      const activas = todasSiembras.filter(s => s.estado === 'EN_CURSO')
      const resultados = await Promise.all(
        activas.map(s =>
          api.get(`/seguimientos/siembra/${s.idSiembra}`)
            .then(r => ({ id: s.idSiembra, data: r.data }))
            .catch(() => ({ id: s.idSiembra, data: [] }))
        )
      )
      setSeguimientos(prev => {
        const next = { ...prev }
        for (const { id, data } of resultados) next[id] = data
        return next
      })
    } catch (err) { console.error('Error cargando datos:', err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  const recargarSeguimientos = async (idSiembra) => {
    setLoadingSegs(prev => ({ ...prev, [idSiembra]: true }))
    try {
      const res = await api.get(`/seguimientos/siembra/${idSiembra}`)
      setSeguimientos(prev => ({ ...prev, [idSiembra]: res.data }))
    } catch (err) {
      setSeguimientos(prev => ({ ...prev, [idSiembra]: [] }))
    } finally {
      setLoadingSegs(prev => ({ ...prev, [idSiembra]: false }))
    }
  }

  const cargarSeguimientos = async (idSiembra) => {
    if (seguimientos[idSiembra] !== undefined) return
    await recargarSeguimientos(idSiembra)
  }

  const toggleProductor = (id) => {
    setProductorOpen(prev => prev === id ? null : id)
    setSiembraOpen(null)
  }
  const toggleSiembra = (id) => {
    if (siembraOpen === id) { setSiembraOpen(null) }
    else { setSiembraOpen(id); cargarSeguimientos(id) }
  }

  const abrirModalSeguimiento = (siembra) => {
    setSiembraSeleccionada(siembra); setFormSeg(FORM_SEG_INICIAL); setErrorModal(''); setModalSeg(true)
  }

  const handleSubmitSeguimiento = async (e) => {
    e.preventDefault(); setErrorModal(''); setGuardando(true)
    try {
      await api.post('/seguimientos', {
        fechaVisita:      formSeg.fechaVisita,
        pesoPromedio:     parseFloat(formSeg.pesoPromedio),
        cantidadEstimada: parseInt(formSeg.cantidadEstimada),
        condicionAgua:    formSeg.condicionAgua,
        estadoSalud:      formSeg.estadoSalud,
        observaciones:    formSeg.observaciones || null,
        aptoCosecha:      formSeg.aptoCosecha,
        idSiembra:        siembraSeleccionada.idSiembra,
      })
      setModalSeg(false)
      await recargarSeguimientos(siembraSeleccionada.idSiembra)
    } catch (err) {
      setErrorModal(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar el seguimiento.')
    } finally { setGuardando(false) }
  }

  const siembrasFiltradas = siembras.filter(s => filtroEstado === 'TODOS' || s.estado === filtroEstado)
  const siembrasPorProductor = {}
  for (const s of siembrasFiltradas) {
    if (!siembrasPorProductor[s.idProductor]) siembrasPorProductor[s.idProductor] = []
    siembrasPorProductor[s.idProductor].push(s)
  }
  const productoresFiltrados = productores.filter(p => {
    if (!siembrasPorProductor[p.idProductor]) return false
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      return nombreCompleto(p).toLowerCase().includes(q) || p.documento?.toLowerCase().includes(q)
    }
    return true
  })

  const siembrasActivas = siembras.filter(s => s.estado === 'EN_CURSO')
  const siembrasAptas   = siembrasActivas.filter(s => estaAprobada(seguimientos[s.idSiembra]))
  const seguimientosMes = Object.values(seguimientos).flat().filter(seg => {
    if (!seg?.fechaVisita) return false
    const hoy = new Date(), vis = new Date(seg.fechaVisita)
    return vis.getFullYear() === hoy.getFullYear() && vis.getMonth() === hoy.getMonth()
  }).length

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Consola de Monitoreo</h1>
          <p className="text-gray-500 text-sm mt-1">Supervisión técnica de siembras por productor</p>
        </div>
        <button onClick={cargarDatos}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 border border-gray-200 hover:border-teal-300 px-3 py-2 rounded-lg transition-colors">
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <KpiCard icon={User}         label="Productores activos"   value={productores.length}     color="bg-teal-500"    />
          <KpiCard icon={Fish}         label="Siembras activas"      value={siembrasActivas.length} color="bg-blue-500"    />
          <KpiCard icon={CheckCircle2} label="Aptas para cosecha"    value={siembrasAptas.length}   color="bg-emerald-500" />
          <KpiCard icon={Activity}     label="Seguimientos este mes" value={seguimientosMes}        color="bg-purple-500"  />
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar productor..." value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['TODOS','Todas'],['EN_CURSO','En Curso'],['COSECHADO','Cosechadas'],['PERDIDO','Perdidas']].map(([key, label]) => (
            <button key={key} onClick={() => setFiltroEstado(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtroEstado === key ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : productoresFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <Fish size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No hay productores con siembras en este filtro</p>
        </div>
      ) : (
        <div className="space-y-4">
          {productoresFiltrados.map(productor => {
            const siembrasProd = siembrasPorProductor[productor.idProductor] || []
            const activasProd  = siembrasProd.filter(s => s.estado === 'EN_CURSO')
            const estadoSan    = estadoSanitarioProductor(siembrasProd, seguimientos)
            const sanConf      = SAN_CONFIG[estadoSan]
            const isOpen       = productorOpen === productor.idProductor
            const ultimaVisita = Object.entries(seguimientos)
              .filter(([id]) => siembrasProd.some(s => s.idSiembra === parseInt(id)))
              .flatMap(([, segs]) => segs)
              .sort((a, b) => new Date(b.fechaVisita) - new Date(a.fechaVisita))[0]?.fechaVisita

            return (
              <div key={productor.idProductor} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleProductor(productor.idProductor)}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-teal-600 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-base">{productor.nombre1?.charAt(0)}{productor.apellido1?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-base">{nombreCompleto(productor)}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400">Doc: {productor.documento}</span>
                        <span className="text-xs text-gray-400">{productor.telefono}</span>
                        {ultimaVisita && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={11} /> Última visita: {formatFecha(ultimaVisita)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${sanConf.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sanConf.dot}`} />
                      {sanConf.label}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium border border-blue-100">
                      {activasProd.length} activa{activasProd.length !== 1 ? 's' : ''}
                    </span>
                    <div className="text-gray-400">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                    {siembrasProd.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">Sin siembras en este filtro</p>
                    ) : siembrasProd.map(siembra => {
                      const segsS   = seguimientos[siembra.idSiembra]
                      const aprobadaS = estaAprobada(segsS)
                      const isSOpen   = siembraOpen === siembra.idSiembra
                      const estConf   = SIEM_EST[siembra.estado] || {}

                      return (
                        <div key={siembra.idSiembra}
                          className={`bg-white rounded-xl border overflow-hidden ${aprobadaS ? 'border-emerald-200' : siembra.estado === 'EN_CURSO' ? 'border-gray-200' : 'border-gray-100 opacity-75'}`}>
                          <div className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleSiembra(siembra.idSiembra)}>
                            <div className="flex items-center gap-3">
                              <div className={`w-1 h-10 rounded-full shrink-0 ${aprobadaS ? 'bg-emerald-500' : siembra.estado === 'EN_CURSO' ? 'bg-teal-500' : siembra.estado === 'COSECHADO' ? 'bg-green-400' : 'bg-red-400'}`} />
                              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                                <Fish size={16} className="text-teal-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{siembra.nombreEspecie} — {siembra.codigoEstanque}</p>
                                <p className="text-xs text-gray-400">{siembra.cantidadAlevinos?.toLocaleString()} alevinos · Siembra: {formatFecha(siembra.fechaSiembra)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${estConf.class}`}>{estConf.label}</span>
                              <BadgeSiembra siembra={siembra} seguimientos={segsS} />
                              <div className="text-gray-400 ml-1">
                                {isSOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </div>
                          {isSOpen && (
                            <PanelSiembra
                              siembra={siembra}
                              seguimientos={segsS}
                              loadingSegs={!!loadingSegs[siembra.idSiembra]}
                              onRegistrar={abrirModalSeguimiento}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal Seguimiento ────────────────────────────────────────────── */}
      {modalSeg && siembraSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Registrar Seguimiento</h2>
              <p className="text-sm text-gray-500 mt-1">
                {siembraSeleccionada.nombreEspecie} — {siembraSeleccionada.codigoEstanque} · {siembraSeleccionada.nombreProductor}
              </p>
            </div>
            <form onSubmit={handleSubmitSeguimiento} className="p-6 flex flex-col gap-4">
              {errorModal && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{errorModal}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha visita *</label>
                  <input type="date" required value={formSeg.fechaVisita} onChange={e => setFormSeg({ ...formSeg, fechaVisita: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Peso promedio (g) *</label>
                  <input type="number" step="0.01" min="0" required value={formSeg.pesoPromedio} onChange={e => setFormSeg({ ...formSeg, pesoPromedio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Cantidad estimada de peces *</label>
                <input type="number" min="1" required value={formSeg.cantidadEstimada} onChange={e => setFormSeg({ ...formSeg, cantidadEstimada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Condición del agua *</label>
                  <select value={formSeg.condicionAgua} onChange={e => setFormSeg({ ...formSeg, condicionAgua: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="BUENA">Buena</option>
                    <option value="REGULAR">Regular</option>
                    <option value="MALA">Mala</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Estado de salud *</label>
                  <select value={formSeg.estadoSalud} onChange={e => setFormSeg({ ...formSeg, estadoSalud: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="SALUDABLE">Saludable</option>
                    <option value="CON_SIGNOS_ENFERMEDAD">Con signos de enfermedad</option>
                    <option value="CRITICO">Crítico</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Observaciones</label>
                <textarea rows={3} value={formSeg.observaciones} onChange={e => setFormSeg({ ...formSeg, observaciones: e.target.value })}
                  placeholder="Recomendaciones, tratamientos, notas técnicas..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-teal-800 mb-1">¿Los peces están listos para cosechar?</p>
                <p className="text-xs text-teal-600 mb-3">Al marcar como apto, el ciclo biológico se cierra y no se podrán registrar más seguimientos.</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setFormSeg({ ...formSeg, aptoCosecha: 'Y' })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${formSeg.aptoCosecha === 'Y' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    ✓ Sí, aptos para cosecha
                  </button>
                  <button type="button" onClick={() => setFormSeg({ ...formSeg, aptoCosecha: 'N' })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${formSeg.aptoCosecha === 'N' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    ✗ Todavía no
                  </button>
                </div>
                {formSeg.aptoCosecha === 'Y' && (
                  <p className="text-xs text-emerald-700 mt-2 font-medium">⚠ Esta acción es irreversible. El productor podrá agendar su turno de pesca.</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModalSeg(false); setErrorModal('') }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={guardando}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  {guardando ? 'Guardando...' : 'Guardar Seguimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE RAÍZ — enruta al componente correcto según el rol
// ════════════════════════════════════════════════════════════════════════════
function Produccion() {
  const rol = localStorage.getItem('rol') || ''
  if (rol === 'ROLE_BIOLOGO') return <ProduccionBiologo />
  return <ProduccionGeneral />
}
// Nota: ROLE_SECRETARIA usa ProduccionGeneral con esSecretaria=true,
// que oculta todos los botones de escritura y muestra solo lectura.

export default Produccion
