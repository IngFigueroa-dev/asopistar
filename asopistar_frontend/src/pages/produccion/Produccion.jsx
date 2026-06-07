// src/pages/produccion/Produccion.jsx
import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Fish, ChevronDown, ChevronUp, ClipboardList,
  Waves, Leaf, Calendar, AlertCircle, CheckCircle2, Clock
} from 'lucide-react'
import api from '../../services/api'

// ── Constantes de estado ──────────────────────────────────────────────────────
const ESTADOS = {
  EN_CURSO:  { label: 'En Curso',   class: 'bg-blue-100 text-blue-700' },
  COSECHADO: { label: 'Cosechado',  class: 'bg-green-100 text-green-700' },
  PERDIDO:   { label: 'Perdido',    class: 'bg-red-100 text-red-600' },
}

// ── Formularios vacíos ────────────────────────────────────────────────────────
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
const FORM_ESPECIE_INICIAL  = { nombre: '', descripcion: '' }
const FORM_TURNO_INICIAL    = {
  fechaProgramada: '', horaProgramada: '',
  tipoPrioridad: 'NORMAL', motivoEmergencia: '',
}

// ── Componente principal ──────────────────────────────────────────────────────
function Produccion() {

  // Identidad del usuario
  const rol         = localStorage.getItem('rol') || ''
  const esProductor = rol === 'ROLE_PRODUCTOR'
  const esBiologo   = rol === 'ROLE_BIOLOGO' || rol === 'ROLE_ADMINISTRADOR_GENERAL'
  const idProductor = esProductor ? parseInt(localStorage.getItem('idProductor')) : null

  // ── Estado principal ──────────────────────────────────────────────────────
  const [siembras,          setSiembras]          = useState([])
  const [especies,          setEspecies]          = useState([])
  const [estanques,         setEstanques]         = useState([])
  const [estanquesOcupados, setEstanquesOcupados] = useState([])   // idEstanque[]
  const [turnosActivos,     setTurnosActivos]     = useState([])   // turnos PENDIENTE|CONFIRMADO
  const [loading,           setLoading]           = useState(true)
  const [filtro,            setFiltro]            = useState('TODOS')
  const [expandido,         setExpandido]         = useState(null)
  const [seguimientos,      setSeguimientos]      = useState({})

  // ── Modales ───────────────────────────────────────────────────────────────
  const [mostrarModalSiembra,     setMostrarModalSiembra]     = useState(false)
  const [mostrarModalSeguimiento, setMostrarModalSeguimiento] = useState(false)
  const [mostrarModalEstanque,    setMostrarModalEstanque]    = useState(false)
  const [mostrarModalEspecie,     setMostrarModalEspecie]     = useState(false)
  const [mostrarModalTurno,       setMostrarModalTurno]       = useState(false)
  const [siembraSeleccionada,     setSiembraSeleccionada]     = useState(null)

  // ── Formularios ───────────────────────────────────────────────────────────
  const [form,             setForm]             = useState(FORM_SIEMBRA_INICIAL)
  const [formSeguimiento,  setFormSeguimiento]  = useState(FORM_SEGUIMIENTO_INICIAL)
  const [formEstanque,     setFormEstanque]     = useState(FORM_ESTANQUE_INICIAL)
  const [formEspecie,      setFormEspecie]      = useState(FORM_ESPECIE_INICIAL)
  const [formTurno,        setFormTurno]        = useState(FORM_TURNO_INICIAL)
  const [errorModal,       setErrorModal]       = useState('')

  // ── Carga de datos ────────────────────────────────────────────────────────
  const cargarSiembras = useCallback(async () => {
    try {
      const res = await api.get('/siembras')
      const todas = res.data
      if (esProductor) {
        // Solo las siembras del productor autenticado
        setSiembras(todas.filter(s => s.idProductor === idProductor))
      } else {
        setSiembras(todas)
      }
    } catch (err) { console.error('Error cargando siembras:', err) }
    finally { setLoading(false) }
  }, [esProductor, idProductor])

  const cargarEspecies = useCallback(async () => {
    try {
      const res = await api.get('/especies')
      setEspecies(res.data)
    } catch (err) { console.error('Error cargando especies:', err) }
  }, [])

  const cargarEstanques = useCallback(async () => {
    try {
      let res
      if (esProductor) {
        // Solo los estanques del productor autenticado
        res = await api.get(`/estanques/productor/${idProductor}`)
      } else {
        res = await api.get('/estanques')
      }
      setEstanques(res.data)
    } catch (err) { console.error('Error cargando estanques:', err) }
  }, [esProductor, idProductor])

  const cargarEstanquesOcupados = useCallback(async () => {
    if (!esProductor) return
    try {
      const res = await api.get('/siembras/activas')
      // Extraer los idEstanque de las siembras activas del productor
      const ocupados = res.data
        .filter(s => s.idProductor === idProductor)
        .map(s => s.idEstanque)
      setEstanquesOcupados(ocupados)
    } catch (err) { console.error('Error cargando estanques ocupados:', err) }
  }, [esProductor, idProductor])

  const cargarTurnosActivos = useCallback(async () => {
    try {
      let res
      if (esProductor) {
        res = await api.get(`/turnos-pesca/productor/${idProductor}`)
      } else {
        res = await api.get('/turnos-pesca/ordenados')
      }
      // Guardar solo los PENDIENTE o CONFIRMADO
      const activos = res.data.filter(t =>
        t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'
      )
      setTurnosActivos(activos)
    } catch (err) { console.error('Error cargando turnos activos:', err) }
  }, [esProductor, idProductor])

  const cargarSeguimientos = async (idSiembra) => {
    try {
      const res = await api.get(`/seguimientos/siembra/${idSiembra}`)
      setSeguimientos(prev => ({ ...prev, [idSiembra]: res.data }))
    } catch (err) { console.error('Error cargando seguimientos:', err) }
  }

  // Carga inicial
  useEffect(() => {
    Promise.all([
      cargarSiembras(),
      cargarEspecies(),
      cargarEstanques(),
      cargarEstanquesOcupados(),
      cargarTurnosActivos(),
    ])
  }, [cargarSiembras, cargarEspecies, cargarEstanques,
      cargarEstanquesOcupados, cargarTurnosActivos])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const tieneTurnoActivo = (idSiembra) =>
    turnosActivos.some(t => t.idSiembra === idSiembra)

  const siembraEsAptaParaCosecha = (idSiembra) => {
    const segs = seguimientos[idSiembra]
    if (!segs || segs.length === 0) return false
    // El último seguimiento (el más reciente) define si es apto
    return segs[0]?.aptoCosecha === 'Y'
  }

  const toggleExpandir = (idSiembra) => {
    if (expandido === idSiembra) {
      setExpandido(null)
    } else {
      setExpandido(idSiembra)
      cargarSeguimientos(idSiembra)
    }
  }

  // ── Handlers de submit ────────────────────────────────────────────────────

  // Nueva siembra
  const handleSubmitSiembra = async (e) => {
    e.preventDefault()
    setErrorModal('')
    try {
      await api.post('/siembras', {
        ...form,
        cantidadAlevinos: parseInt(form.cantidadAlevinos),
        promedioInicial:  parseFloat(form.promedioInicial),
        idEspecie:        parseInt(form.idEspecie),
        idEstanque:       parseInt(form.idEstanque),
      })
      setMostrarModalSiembra(false)
      setForm(FORM_SIEMBRA_INICIAL)
      await Promise.all([cargarSiembras(), cargarEstanquesOcupados()])
    } catch (err) {
      const msg = err.response?.data?.mensaje
        || err.response?.data?.message
        || 'Error al guardar la siembra. Verifica los datos.'
      setErrorModal(msg)
    }
  }

  // Nuevo seguimiento (solo biólogo)
  const handleSubmitSeguimiento = async (e) => {
    e.preventDefault()
    setErrorModal('')
    try {
      await api.post('/seguimientos', {
        ...formSeguimiento,
        pesoPromedio:     parseFloat(formSeguimiento.pesoPromedio),
        cantidadEstimada: parseInt(formSeguimiento.cantidadEstimada),
        aptoCosecha:      formSeguimiento.aptoCosecha,
        idSiembra:        siembraSeleccionada.idSiembra,
      })
      setMostrarModalSeguimiento(false)
      setFormSeguimiento(FORM_SEGUIMIENTO_INICIAL)
      await Promise.all([
        cargarSeguimientos(siembraSeleccionada.idSiembra),
        cargarTurnosActivos(),
      ])
    } catch (err) {
      const msg = err.response?.data?.mensaje
        || err.response?.data?.message
        || 'Error al guardar el seguimiento.'
      setErrorModal(msg)
    }
  }

  // Nuevo estanque (solo productor)
  const handleSubmitEstanque = async (e) => {
    e.preventDefault()
    setErrorModal('')
    try {
      await api.post('/estanques', {
        ...formEstanque,
        capacidad:   parseFloat(formEstanque.capacidad),
        idProductor: idProductor,
      })
      setMostrarModalEstanque(false)
      setFormEstanque(FORM_ESTANQUE_INICIAL)
      await cargarEstanques()
    } catch (err) {
      const msg = err.response?.data?.mensaje
        || err.response?.data?.message
        || 'Error al guardar el estanque. Verifica que el código sea único.'
      setErrorModal(msg)
    }
  }

  // Nueva especie (solo productor)
  const handleSubmitEspecie = async (e) => {
    e.preventDefault()
    setErrorModal('')
    try {
      await api.post('/especies', formEspecie)
      setMostrarModalEspecie(false)
      setFormEspecie(FORM_ESPECIE_INICIAL)
      await cargarEspecies()
    } catch (err) {
      const msg = err.response?.data?.mensaje
        || err.response?.data?.message
        || 'Error al guardar la especie.'
      setErrorModal(msg)
    }
  }

  // Reservar turno (solo productor)
  const handleSubmitTurno = async (e) => {
    e.preventDefault()
    setErrorModal('')
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
      setMostrarModalTurno(false)
      setFormTurno(FORM_TURNO_INICIAL)
      setSiembraSeleccionada(null)
      await cargarTurnosActivos()
    } catch (err) {
      const msg = err.response?.data?.mensaje
        || err.response?.data?.message
        || 'Error al reservar el turno. Verifica que la siembra esté aprobada.'
      setErrorModal(msg)
    }
  }

  // Abrir modal seguimiento (biólogo)
  const abrirModalSeguimiento = (siembra) => {
    setSiembraSeleccionada(siembra)
    setErrorModal('')
    setMostrarModalSeguimiento(true)
  }

  // Abrir modal reservar turno (productor)
  const abrirModalTurno = (siembra) => {
    setSiembraSeleccionada(siembra)
    setErrorModal('')
    setFormTurno(FORM_TURNO_INICIAL)
    setMostrarModalTurno(true)
  }

  // ── Filtrado de siembras ──────────────────────────────────────────────────
  const siembrasFiltradas = filtro === 'TODOS'
    ? siembras
    : siembras.filter(s => s.estado === filtro)

  // ── Render del botón de acción en cada siembra ────────────────────────────
  const renderBotonAccion = (s) => {
    // ── Vista PRODUCTOR ──────────────────────────────────────────────────
    if (esProductor) {
      if (s.estado !== 'EN_CURSO') return null

      if (tieneTurnoActivo(s.idSiembra)) {
        return (
          <span className="flex items-center gap-1.5 text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg font-medium">
            <CheckCircle2 size={14} />
            Turno asignado
          </span>
        )
      }

      // Verificar si tiene seguimientos cargados y si el último es apto
      const segsActuales = seguimientos[s.idSiembra]
      if (segsActuales !== undefined) {
        // Seguimientos ya cargados — verificar aptitud
        if (siembraEsAptaParaCosecha(s.idSiembra)) {
          return (
            <button
              onClick={(e) => { e.stopPropagation(); abrirModalTurno(s) }}
              className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              🎣 Reservar Turno
            </button>
          )
        } else {
          return (
            <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-medium">
              <Clock size={14} />
              Pendiente biólogo
            </span>
          )
        }
      }

      // Seguimientos no cargados aún — mostrar badge neutral
      return (
        <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-medium">
          <Clock size={14} />
          Ver seguimientos
        </span>
      )
    }

    // ── Vista BIÓLOGO / otros roles ──────────────────────────────────────
    if (s.estado !== 'EN_CURSO') return null

    if (tieneTurnoActivo(s.idSiembra)) {
      return (
        <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium">
          🎣 Listo para cosecha
        </span>
      )
    }

    if (esBiologo) {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); abrirModalSeguimiento(s) }}
          className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <ClipboardList size={14} />
          Seguimiento
        </button>
      )
    }

    return null
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {esProductor ? 'Mi Producción' : 'Producción'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {esProductor
              ? 'Gestiona tus estanques, especies y siembras.'
              : 'Registra siembras y seguimientos del biólogo.'}
          </p>
        </div>

        {/* Botones de acción según rol */}
        <div className="flex items-center gap-2 flex-wrap">
          {esProductor && (
            <>
              <button
                onClick={() => { setErrorModal(''); setMostrarModalEspecie(true) }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                <Leaf size={16} /> Nueva Especie
              </button>
              <button
                onClick={() => { setErrorModal(''); setMostrarModalEstanque(true) }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                <Waves size={16} /> Nuevo Estanque
              </button>
            </>
          )}
          <button
            onClick={() => { setErrorModal(''); setMostrarModalSiembra(true) }}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            <Plus size={18} /> Nueva Siembra
          </button>
        </div>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 flex-wrap">
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

      {/* ── Lista de siembras ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">
          Cargando siembras...
        </div>
      ) : siembrasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Fish size={40} className="mb-2 opacity-30" />
          <p>
            {esProductor
              ? 'Aún no tienes siembras registradas. ¡Crea tu primera siembra!'
              : 'No hay siembras registradas'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {siembrasFiltradas.map(s => (
            <div key={s.idSiembra}
              className="bg-white rounded-xl shadow-sm border border-gray-100">

              {/* Cabecera de la siembra */}
              <div className="p-5 flex items-center justify-between">
                <div
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => toggleExpandir(s.idSiembra)}
                >
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
                    {!esProductor && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Productor: {s.nombreProductor}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-end">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${ESTADOS[s.estado]?.class}`}>
                    {ESTADOS[s.estado]?.label}
                  </span>

                  {renderBotonAccion(s)}

                  <button
                    onClick={() => toggleExpandir(s.idSiembra)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandido === s.idSiembra
                      ? <ChevronUp size={18} />
                      : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Panel expandido */}
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
                        {/* Solo el biólogo ve el botón de primer seguimiento */}
                        {s.estado === 'EN_CURSO' && esBiologo && !tieneTurnoActivo(s.idSiembra) && (
                          <button
                            onClick={() => abrirModalSeguimiento(s)}
                            className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                          >
                            + Registrar primer seguimiento
                          </button>
                        )}
                        {esProductor && (
                          <p className="mt-2 text-xs text-gray-400 italic">
                            El biólogo registrará los seguimientos de tu siembra.
                          </p>
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

                    {/* Botón reservar turno desde el panel expandido (si es apto y sin turno) */}
                    {esProductor &&
                      s.estado === 'EN_CURSO' &&
                      seguimientos[s.idSiembra]?.length > 0 &&
                      siembraEsAptaParaCosecha(s.idSiembra) &&
                      !tieneTurnoActivo(s.idSiembra) && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-green-800">
                                ✅ Tus peces están listos para cosechar
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                El biólogo aprobó esta siembra. Puedes reservar tu turno.
                              </p>
                            </div>
                            <button
                              onClick={() => abrirModalTurno(s)}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors ml-4 shrink-0"
                            >
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

      {/* ════════════════════════════════════════════════════════════════════
          MODALES
          ════════════════════════════════════════════════════════════════════ */}

      {/* ── Modal Nueva Siembra ─────────────────────────────────────────── */}
      {mostrarModalSiembra && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Nueva Siembra</h2>
            </div>
            <form onSubmit={handleSubmitSiembra} className="p-6 flex flex-col gap-4">
              {errorModal && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {errorModal}
                </div>
              )}
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
                    {estanques.map(e => {
                      const ocupado = estanquesOcupados.includes(e.idEstanque)
                      return (
                        <option key={e.idEstanque} value={e.idEstanque} disabled={ocupado}>
                          {e.codigo} - {e.nombre}{ocupado ? ' (Ocupado)' : ''}
                        </option>
                      )
                    })}
                  </select>
                  {esProductor && estanques.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      No tienes estanques registrados. Crea uno primero.
                    </p>
                  )}
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
                  <input type="number" min="1" required value={form.cantidadAlevinos}
                    onChange={e => setForm({ ...form, cantidadAlevinos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Peso promedio inicial (g) *
                </label>
                <input type="number" step="0.01" min="0" required value={form.promedioInicial}
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
                <button type="button"
                  onClick={() => { setMostrarModalSiembra(false); setErrorModal('') }}
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

      {/* ── Modal Nuevo Estanque (solo productor) ───────────────────────── */}
      {mostrarModalEstanque && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Nuevo Estanque</h2>
              <p className="text-sm text-gray-500 mt-1">
                El estanque quedará registrado a tu nombre.
              </p>
            </div>
            <form onSubmit={handleSubmitEstanque} className="p-6 flex flex-col gap-4">
              {errorModal && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {errorModal}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Código * <span className="text-gray-400 font-normal">(ej: EST-001)</span>
                  </label>
                  <input type="text" required maxLength={10} value={formEstanque.codigo}
                    onChange={e => setFormEstanque({ ...formEstanque, codigo: e.target.value })}
                    placeholder="EST-001"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nombre *</label>
                  <input type="text" required maxLength={20} value={formEstanque.nombre}
                    onChange={e => setFormEstanque({ ...formEstanque, nombre: e.target.value })}
                    placeholder="Estanque Principal"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Capacidad *
                  </label>
                  <input type="number" step="0.01" min="0.01" required value={formEstanque.capacidad}
                    onChange={e => setFormEstanque({ ...formEstanque, capacidad: e.target.value })}
                    placeholder="50.00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Estado *</label>
                  <select value={formEstanque.estadoEstanque}
                    onChange={e => setFormEstanque({ ...formEstanque, estadoEstanque: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="ACTIVO">Activo</option>
                    <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Ubicación *</label>
                <input type="text" required maxLength={100} value={formEstanque.ubicacion}
                  onChange={e => setFormEstanque({ ...formEstanque, ubicacion: e.target.value })}
                  placeholder="Vereda La Esperanza, finca El Porvenir"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setMostrarModalEstanque(false); setErrorModal('') }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
                  Guardar Estanque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Nueva Especie (solo productor) ────────────────────────── */}
      {mostrarModalEspecie && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Nueva Especie</h2>
              <p className="text-sm text-gray-500 mt-1">
                La especie quedará disponible para todos los productores.
              </p>
            </div>
            <form onSubmit={handleSubmitEspecie} className="p-6 flex flex-col gap-4">
              {errorModal && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {errorModal}
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Nombre de la especie *
                </label>
                <input type="text" required maxLength={20} value={formEspecie.nombre}
                  onChange={e => setFormEspecie({ ...formEspecie, nombre: e.target.value })}
                  placeholder="Cachama blanca"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Descripción *</label>
                <textarea required maxLength={100} value={formEspecie.descripcion}
                  onChange={e => setFormEspecie({ ...formEspecie, descripcion: e.target.value })}
                  rows={3}
                  placeholder="Especie de agua dulce, ciclo de 6 meses..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setMostrarModalEspecie(false); setErrorModal('') }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
                  Guardar Especie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Reservar Turno (solo productor) ──────────────────────── */}
      {mostrarModalTurno && siembraSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Reservar Turno de Pesca</h2>
              <p className="text-sm text-gray-500 mt-1">
                Siembra aprobada para cosecha
              </p>
            </div>
            <form onSubmit={handleSubmitTurno} className="p-6 flex flex-col gap-4">
              {errorModal && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {errorModal}
                </div>
              )}

              {/* Siembra y productor (solo informativo, no editable) */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-teal-600 text-xs font-medium mb-1">Siembra</p>
                    <p className="font-semibold text-teal-900">
                      {siembraSeleccionada.nombreEspecie} — {siembraSeleccionada.codigoEstanque}
                    </p>
                  </div>
                  <div>
                    <p className="text-teal-600 text-xs font-medium mb-1">Productor</p>
                    <p className="font-semibold text-teal-900">
                      {siembraSeleccionada.nombreProductor}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha deseada *</label>
                  <input type="date" required
                    min={new Date().toISOString().split('T')[0]}
                    value={formTurno.fechaProgramada}
                    onChange={e => setFormTurno({ ...formTurno, fechaProgramada: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Hora deseada *</label>
                  <input type="time" required
                    value={formTurno.horaProgramada}
                    onChange={e => setFormTurno({ ...formTurno, horaProgramada: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Tipo de solicitud</label>
                <select value={formTurno.tipoPrioridad}
                  onChange={e => setFormTurno({ ...formTurno, tipoPrioridad: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                  <option value="NORMAL">Normal</option>
                  <option value="EMERGENCIA">Emergencia</option>
                </select>
              </div>

              {formTurno.tipoPrioridad === 'EMERGENCIA' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Motivo de emergencia *
                  </label>
                  <textarea required
                    value={formTurno.motivoEmergencia}
                    onChange={e => setFormTurno({ ...formTurno, motivoEmergencia: e.target.value })}
                    rows={3}
                    placeholder="Describe el motivo de la emergencia..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none" />
                </div>
              )}

              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                ℹ️ El gerente de planta confirmará tu turno. Recibirás el turno en el orden 
                que corresponda según la prioridad y la fecha de tu siembra.
              </p>

              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setMostrarModalTurno(false); setErrorModal(''); setSiembraSeleccionada(null) }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
                  Reservar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Seguimiento (solo biólogo) ───────────────────────────── */}
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
              {errorModal && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {errorModal}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha visita *</label>
                  <input type="date" required value={formSeguimiento.fechaVisita}
                    onChange={e => setFormSeguimiento({ ...formSeguimiento, fechaVisita: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Peso promedio (g) *</label>
                  <input type="number" step="0.01" min="0" required value={formSeguimiento.pesoPromedio}
                    onChange={e => setFormSeguimiento({ ...formSeguimiento, pesoPromedio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Cantidad estimada de peces *
                </label>
                <input type="number" min="1" required value={formSeguimiento.cantidadEstimada}
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

              {/* Decisión clave: apto para cosecha */}
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
                    ✓ Al guardar, el productor podrá reservar un turno de pesca para esta siembra.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setMostrarModalSeguimiento(false); setErrorModal('') }}
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
