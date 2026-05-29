import { useState, useEffect, useMemo } from 'react'
import {
  Truck, Package, MapPin, CheckCircle, Clock, ChevronRight,
  Plus, X, Filter, Search, Eye, ArrowRight, Snowflake
} from 'lucide-react'
import api from '../../services/api'

const DESTINOS = [
  'El Tarra (Sede)',
  'El Tarra (Veredas)',
  'Punto Físico El Tarra',
  'Punto Físico Cúcuta',
  'Ocaña',
  'Ábrego',
  'Cúcuta',
  'Bucaramanga',
]

const ESTADO_CONFIG = {
  PREPARADO:  { label: 'Preparado',  dot: 'bg-yellow-400', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200'  },
  EN_CAMINO:  { label: 'En camino',  dot: 'bg-blue-400',   cls: 'bg-blue-50 text-blue-700 border-blue-200'        },
  ENTREGADO:  { label: 'Entregado',  dot: 'bg-green-400',  cls: 'bg-green-50 text-green-700 border-green-200'     },
}

const SIGUIENTE_ESTADO = { PREPARADO: 'EN_CAMINO', EN_CAMINO: 'ENTREGADO' }
const SIGUIENTE_LABEL  = { PREPARADO: 'Marcar en camino', EN_CAMINO: 'Marcar entregado' }

const Badge = ({ estado }) => {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.PREPARADO
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

const fmt = (dt) => dt ? dt.replace('T', ' ').substring(0, 16) : '—'

export default function Logistica() {
  const [envios,           setEnvios]           = useState([])
  const [lotesDisponibles, setLotesDisponibles] = useState([])
  const [clientes,         setClientes]         = useState([])
  const [puntos,           setPuntos]           = useState([])
  const [loading,          setLoading]          = useState(true)
  const [filtroEstado,     setFiltroEstado]     = useState('TODOS')
  const [busqueda,         setBusqueda]         = useState('')
  const [envioDetalle,     setEnvioDetalle]     = useState(null)
  const [mostrarModal,     setMostrarModal]     = useState(false)
  const [avanzando,        setAvanzando]        = useState(null)
  const [form, setForm] = useState({
    destinoCiudad: '', tipoDestino: '',
    idCliente: '', idPunto: '',
    observaciones: '', lotesSeleccionados: [],
  })
  const [errorForm, setErrorForm] = useState('')
  const [guardando,  setGuardando] = useState(false)

  useEffect(() => { cargarTodo() }, [])

  const cargarTodo = async () => {
    try {
      setLoading(true)
      // Peticiones separadas con manejo de error individual para debug
      const enviosRes = await api.get('/envios')
      setEnvios(enviosRes.data)

      const lotesRes = await api.get('/lotes-cuarto-frio')
      setLotesDisponibles(lotesRes.data.filter(l => l.estadoDecision === 'ALMACENADO'))

      try {
        const clientesRes = await api.get('/clientes')
        setClientes(clientesRes.data)
      } catch (e) {
        console.error('Error cargando clientes:', e.response?.status, e.response?.data)
        setClientes([])
      }

      try {
        const puntosRes = await api.get('/puntos-venta')
        setPuntos(puntosRes.data)
      } catch (e) {
        console.error('Error cargando puntos de venta:', e.response?.status, e.response?.data)
        setPuntos([])
      }

    } catch (err) {
      console.error('Error cargando logística:', err)
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => ({
    total:      envios.length,
    preparado:  envios.filter(e => e.estado === 'PREPARADO').length,
    enCamino:   envios.filter(e => e.estado === 'EN_CAMINO').length,
    entregado:  envios.filter(e => e.estado === 'ENTREGADO').length,
    kilosTotal: envios.reduce((a, e) => a + (parseFloat(e.totalKilos) || 0), 0),
  }), [envios])

  const enviosFiltrados = useMemo(() => {
    return envios
      .filter(e => filtroEstado === 'TODOS' || e.estado === filtroEstado)
      .filter(e => {
        const q = busqueda.toLowerCase()
        return !q || String(e.idEnvio).includes(q)
          || e.destinoCiudad?.toLowerCase().includes(q)
          || e.nombreCliente?.toLowerCase().includes(q)
          || e.nombrePunto?.toLowerCase().includes(q)
          || e.lotes?.some(l => l.codigoLote?.toLowerCase().includes(q))
      })
  }, [envios, filtroEstado, busqueda])

  const handleAvanzarEstado = async (envio) => {
    const siguiente = SIGUIENTE_ESTADO[envio.estado]
    if (!siguiente) return
    setAvanzando(envio.idEnvio)
    try {
      const res = await api.patch(`/envios/${envio.idEnvio}/estado`, { estado: siguiente })
      setEnvios(prev => prev.map(e => e.idEnvio === envio.idEnvio ? res.data : e))
      if (envioDetalle?.idEnvio === envio.idEnvio) setEnvioDetalle(res.data)
    } catch (err) { console.error(err) }
    finally { setAvanzando(null) }
  }

  const toggleLote = (idLote) => {
    setForm(prev => ({
      ...prev,
      lotesSeleccionados: prev.lotesSeleccionados.includes(idLote)
        ? prev.lotesSeleccionados.filter(id => id !== idLote)
        : [...prev.lotesSeleccionados, idLote],
    }))
  }

  const kilosSeleccionados = form.lotesSeleccionados.reduce((acc, id) => {
    const lote = lotesDisponibles.find(l => l.idLote === id)
    return acc + (parseFloat(lote?.kilos) || 0)
  }, 0)

  const handleCrear = async () => {
    setErrorForm('')
    if (!form.destinoCiudad)               { setErrorForm('Selecciona la ciudad de destino.');   return }
    if (!form.tipoDestino)                 { setErrorForm('Selecciona el tipo de destino.');     return }
    if (form.tipoDestino === 'CLIENTE'     && !form.idCliente) { setErrorForm('Selecciona un cliente.');        return }
    if (form.tipoDestino === 'PUNTO_VENTA' && !form.idPunto)   { setErrorForm('Selecciona un punto de venta.'); return }
    if (form.lotesSeleccionados.length === 0) { setErrorForm('Selecciona al menos un lote.');   return }

    setGuardando(true)
    try {
      await api.post('/envios', {
        destinoCiudad: form.destinoCiudad,
        tipoDestino:   form.tipoDestino,
        idCliente:     form.idCliente ? parseInt(form.idCliente)  : null,
        idPunto:       form.idPunto   ? parseInt(form.idPunto)    : null,
        observaciones: form.observaciones,
        idLotes:       form.lotesSeleccionados,
      })
      setMostrarModal(false)
      setForm({ destinoCiudad:'', tipoDestino:'', idCliente:'', idPunto:'', observaciones:'', lotesSeleccionados:[] })
      cargarTodo()
    } catch (err) {
      setErrorForm('Error al crear el envío. Intenta de nuevo.')
      console.error(err)
    } finally { setGuardando(false) }
  }

  return (
    <div className="relative">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Logística y Distribución</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestiona los envíos desde el Cuarto Frío hacia clientes y puntos de venta.
          </p>
        </div>
        <button onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm">
          <Plus size={17} /> Nuevo envío
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total envíos',   value: stats.total,                      color: 'text-gray-800',   border: 'border-gray-100'   },
          { label: 'Preparados',     value: stats.preparado,                   color: 'text-yellow-600', border: 'border-yellow-100' },
          { label: 'En camino',      value: stats.enCamino,                    color: 'text-blue-600',   border: 'border-blue-100'   },
          { label: 'Entregados',     value: stats.entregado,                   color: 'text-green-600',  border: 'border-green-100'  },
          { label: 'Kg despachados', value: `${stats.kilosTotal.toFixed(1)}`,  color: 'text-teal-700',   border: 'border-teal-100'   },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl p-4 shadow-sm border ${s.border}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por #ID, ciudad, cliente, lote..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          {['TODOS', 'PREPARADO', 'EN_CAMINO', 'ENTREGADO'].map(f => (
            <button key={f} onClick={() => setFiltroEstado(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filtroEstado === f
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'
              }`}>
              {f === 'TODOS' ? 'Todos' : ESTADO_CONFIG[f]?.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-gray-400">Cargando envíos...</div>
      ) : enviosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <Truck size={40} className="mb-2 opacity-30" />
          <p>{busqueda || filtroEstado !== 'TODOS' ? 'Sin resultados para este filtro' : 'No hay envíos registrados'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enviosFiltrados.map(envio => (
            <EnvioCard key={envio.idEnvio} envio={envio}
              onDetalle={() => setEnvioDetalle(envio)}
              onAvanzar={() => handleAvanzarEstado(envio)}
              avanzando={avanzando === envio.idEnvio}
            />
          ))}
        </div>
      )}

      {envioDetalle && (
        <DrawerDetalle
          envio={envioDetalle}
          onClose={() => setEnvioDetalle(null)}
          onAvanzar={() => handleAvanzarEstado(envioDetalle)}
          avanzando={avanzando === envioDetalle.idEnvio}
        />
      )}

      {mostrarModal && (
        <ModalNuevoEnvio
          lotesDisponibles={lotesDisponibles}
          clientes={clientes}
          puntos={puntos}
          form={form}
          setForm={setForm}
          error={errorForm}
          guardando={guardando}
          kilosSeleccionados={kilosSeleccionados}
          toggleLote={toggleLote}
          onConfirmar={handleCrear}
          onClose={() => { setMostrarModal(false); setErrorForm('') }}
        />
      )}
    </div>
  )
}

function EnvioCard({ envio, onDetalle, onAvanzar, avanzando }) {
  const siguiente = SIGUIENTE_ESTADO[envio.estado]
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
            envio.estado === 'ENTREGADO' ? 'bg-green-100' :
            envio.estado === 'EN_CAMINO' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
            <Truck size={20} className={
              envio.estado === 'ENTREGADO' ? 'text-green-600' :
              envio.estado === 'EN_CAMINO' ? 'text-blue-600' : 'text-yellow-600'} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-gray-800 text-sm">Envío #{envio.idEnvio}</span>
              <Badge estado={envio.estado} />
              <span className="text-xs text-gray-400">{fmt(envio.fechaEnvio)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-700 mb-2">
              <MapPin size={13} className="text-teal-500 flex-shrink-0" />
              <span className="font-medium">{envio.destinoCiudad}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 text-xs">
                {envio.tipoDestino === 'CLIENTE'
                  ? `Cliente: ${envio.nombreCliente || '—'}`
                  : `Punto: ${envio.nombrePunto || '—'}`}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Package size={13} className="text-gray-400" />
              {(envio.lotes || []).map(l => (
                <span key={l.idLote}
                  className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full font-mono font-medium">
                  {l.codigoLote} · {parseFloat(l.kilos).toFixed(1)} kg
                </span>
              ))}
              {(!envio.lotes || envio.lotes.length === 0) && (
                <span className="text-xs text-gray-400">Sin lotes registrados</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800">
              {parseFloat(envio.totalKilos || 0).toFixed(1)} <span className="text-sm text-gray-400">kg</span>
            </p>
            <p className="text-xs text-gray-400">{envio.totalLotes} lote{envio.totalLotes !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onDetalle}
              className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-50 transition-colors">
              <Eye size={13} /> Ver detalle
            </button>
            {siguiente && (
              <button onClick={onAvanzar} disabled={avanzando}
                className="flex items-center gap-1 text-xs text-white font-medium px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {avanzando ? '...' : <><ArrowRight size={13} /> {SIGUIENTE_LABEL[envio.estado]}</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DrawerDetalle({ envio, onClose, onAvanzar, avanzando }) {
  const siguiente = SIGUIENTE_ESTADO[envio.estado]
  const pasos = ['PREPARADO', 'EN_CAMINO', 'ENTREGADO']
  const idxActual = pasos.indexOf(envio.estado)
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Envío #{envio.idEnvio}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{fmt(envio.fechaEnvio)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Estado del envío</p>
            <div className="flex items-center gap-1">
              {pasos.map((paso, i) => {
                const completado = i <= idxActual
                const activo = i === idxActual
                return (
                  <div key={paso} className="flex items-center gap-1 flex-1">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        completado
                          ? activo ? 'bg-blue-500 border-blue-500' : 'bg-green-500 border-green-500'
                          : 'bg-gray-100 border-gray-200'}`}>
                        {completado && !activo
                          ? <CheckCircle size={14} className="text-white" />
                          : activo ? <Clock size={14} className="text-white" />
                          : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                      </div>
                      <span className={`text-xs font-medium text-center leading-tight ${
                        completado ? (activo ? 'text-blue-600' : 'text-green-600') : 'text-gray-400'}`}>
                        {ESTADO_CONFIG[paso]?.label}
                      </span>
                    </div>
                    {i < pasos.length - 1 && (
                      <ChevronRight size={14} className={`flex-shrink-0 mb-4 ${i < idxActual ? 'text-green-400' : 'text-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Destino</p>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-teal-500" />
              <div>
                <p className="text-sm font-bold text-gray-800">{envio.destinoCiudad}</p>
                <p className="text-xs text-gray-500">
                  {envio.tipoDestino === 'CLIENTE'
                    ? `Cliente: ${envio.nombreCliente || '—'}`
                    : `Punto de venta: ${envio.nombrePunto || '—'}`}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-teal-50 rounded-xl p-4">
              <p className="text-xs text-teal-600 mb-1">Total kg</p>
              <p className="text-2xl font-bold text-teal-700">{parseFloat(envio.totalKilos || 0).toFixed(1)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 mb-1">Lotes</p>
              <p className="text-2xl font-bold text-blue-700">{envio.totalLotes}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Lotes incluidos ({envio.lotes?.length || 0})
            </p>
            <div className="space-y-2">
              {(envio.lotes || []).map(l => (
                <div key={l.idLote}
                  className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Snowflake size={14} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold font-mono text-gray-800">{l.codigoLote}</p>
                      <p className="text-xs text-gray-500">{l.nombreProductor}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{parseFloat(l.kilos).toFixed(1)} kg</span>
                </div>
              ))}
            </div>
          </div>
          {envio.observaciones && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Observaciones</p>
              <p className="text-sm text-gray-700">{envio.observaciones}</p>
            </div>
          )}
        </div>
        {siguiente && (
          <div className="px-6 py-4 border-t border-gray-100">
            <button onClick={onAvanzar} disabled={avanzando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
              {avanzando ? 'Actualizando...' : <><ArrowRight size={16} /> {SIGUIENTE_LABEL[envio.estado]}</>}
            </button>
          </div>
        )}
        {envio.estado === 'ENTREGADO' && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-green-600 py-2">
              <CheckCircle size={18} />
              <span className="text-sm font-semibold">Envío completado y entregado</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function ModalNuevoEnvio({
  lotesDisponibles, clientes, puntos,
  form, setForm, error, guardando,
  kilosSeleccionados, toggleLote,
  onConfirmar, onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Nuevo Envío</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Selecciona los lotes disponibles en el Cuarto Frío y define el destino.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Lotes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Lotes disponibles en Cuarto Frío *
              </label>
              {form.lotesSeleccionados.length > 0 && (
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                  {form.lotesSeleccionados.length} seleccionado{form.lotesSeleccionados.length > 1 ? 's' : ''} · {kilosSeleccionados.toFixed(1)} kg
                </span>
              )}
            </div>
            {lotesDisponibles.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
                No hay lotes disponibles en el Cuarto Frío.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {lotesDisponibles.map(lote => {
                  const sel = form.lotesSeleccionados.includes(lote.idLote)
                  return (
                    <button key={lote.idLote} onClick={() => toggleLote(lote.idLote)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        sel ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-200 hover:bg-teal-50/30'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${sel ? 'bg-teal-200' : 'bg-gray-100'}`}>
                        <Snowflake size={14} className={sel ? 'text-teal-700' : 'text-gray-400'} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold font-mono text-gray-800 truncate">{lote.codigoLote}</p>
                        <p className="text-xs text-gray-500">{parseFloat(lote.kilos).toFixed(1)} kg</p>
                        <p className="text-xs text-gray-400 truncate">{lote.nombreProductor}</p>
                      </div>
                      {sel && <CheckCircle size={16} className="text-teal-600 flex-shrink-0 ml-auto" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Ciudad */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Ciudad / Destino *</label>
            <div className="grid grid-cols-2 gap-2">
              {DESTINOS.map(d => (
                <button key={d} onClick={() => setForm({ ...form, destinoCiudad: d })}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium text-left transition-all ${
                    form.destinoCiudad === d
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-teal-200'}`}>
                  <MapPin size={11} className="inline mr-1 opacity-60" />{d}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo destino */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Tipo de destino *</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: 'CLIENTE',     label: '👤 Cliente',        desc: 'Comprador mayorista o minorista' },
                { val: 'PUNTO_VENTA', label: '🏪 Punto de venta', desc: 'Punto físico de ASOPISTAR'       },
              ].map(t => (
                <button key={t.val}
                  onClick={() => setForm({ ...form, tipoDestino: t.val, idCliente: '', idPunto: '' })}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    form.tipoDestino === t.val ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-200'}`}>
                  <p className="text-sm font-semibold text-gray-700">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cliente */}
          {form.tipoDestino === 'CLIENTE' && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Cliente * {clientes.length === 0 && <span className="text-red-500 text-xs font-normal">(Sin acceso o sin datos)</span>}
              </label>
              <select value={form.idCliente}
                onChange={e => setForm({ ...form, idCliente: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => (
                  <option key={c.idCliente} value={c.idCliente}>
                    {c.nombre1} {c.apellido1} — {c.ciudad} ({c.tipo})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Punto de venta */}
          {form.tipoDestino === 'PUNTO_VENTA' && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Punto de venta * {puntos.length === 0 && <span className="text-red-500 text-xs font-normal">(Sin acceso o sin datos)</span>}
              </label>
              <select value={form.idPunto}
                onChange={e => setForm({ ...form, idPunto: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                <option value="">Seleccionar punto de venta...</option>
                {puntos.map(p => (
                  <option key={p.idPunto} value={p.idPunto}>
                    {p.nombre} — {p.ciudadd}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Observaciones</label>
            <textarea value={form.observaciones}
              onChange={e => setForm({ ...form, observaciones: e.target.value })}
              rows={2} placeholder="Condiciones de transporte, novedades..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          {form.lotesSeleccionados.length > 0 && form.destinoCiudad && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-teal-700 uppercase mb-2">Resumen del envío</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-teal-800">
                  {form.lotesSeleccionados.length} lote{form.lotesSeleccionados.length > 1 ? 's' : ''} → <strong>{form.destinoCiudad}</strong>
                </span>
                <span className="font-bold text-teal-700 text-base">{kilosSeleccionados.toFixed(1)} kg</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={onConfirmar} disabled={guardando}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors">
            {guardando ? 'Creando envío...' : 'Crear envío'}
          </button>
        </div>
      </div>
    </div>
  )
}
