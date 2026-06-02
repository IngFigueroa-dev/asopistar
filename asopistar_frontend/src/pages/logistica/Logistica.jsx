// src/pages/logistica/Logistica.jsx
import { useState, useEffect, useMemo } from 'react'
import {
  Truck, Package, MapPin, CheckCircle, Clock, ChevronRight,
  Plus, X, Filter, Search, Snowflake, ArrowRight, Eye,
  User, Phone, Building2, Calendar, FileText, AlertTriangle,
  Navigation, Hash, Store, Ban
} from 'lucide-react'
import api from '../../services/api'

// ── Constantes ────────────────────────────────────────────────────────────────

const DESTINOS = [
  'El Tarra (Sede)', 'El Tarra (Veredas)', 'Punto Físico El Tarra',
  'Punto Físico Cúcuta', 'Ocaña', 'Ábrego', 'Cúcuta', 'Bucaramanga',
]

const TIPOS_VEHICULO = [
  'Camioneta', 'Camión refrigerado', 'Furgón', 'Motocicleta', 'Van', 'Otro',
]

const ESTADO_CONFIG = {
  PREPARADO:  { label: 'Preparado',  dot: 'bg-yellow-400', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', step: 0 },
  EN_CAMINO:  { label: 'En camino',  dot: 'bg-blue-400',   cls: 'bg-blue-50 text-blue-700 border-blue-200',       step: 1 },
  ENTREGADO:  { label: 'Entregado',  dot: 'bg-green-400',  cls: 'bg-green-50 text-green-700 border-green-200',    step: 2 },
  CANCELADO:  { label: 'Cancelado',  dot: 'bg-red-400',    cls: 'bg-red-50 text-red-600 border-red-200',          step: -1 },
}

const SIGUIENTE_ESTADO = { PREPARADO: 'EN_CAMINO', EN_CAMINO: 'ENTREGADO' }
const SIGUIENTE_LABEL  = { PREPARADO: 'Marcar en camino', EN_CAMINO: 'Marcar entregado' }

// ── Componentes reutilizables ─────────────────────────────────────────────────

const Badge = ({ estado }) => {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.PREPARADO
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-black text-gray-800">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
)

const fmt = (dt) => dt ? String(dt).replace('T', ' ').substring(0, 16) : '—'
const fmtDate = (d) => d ? String(d).substring(0, 10) : '—'

// ── LÍNEA DE TIEMPO DE SEGUIMIENTO ───────────────────────────────────────────

function LineaTiempo({ envio }) {
  const pasos = [
    { key: 'PREPARADO', label: 'Preparado',  fecha: envio.fechaPreparacion, icon: Package   },
    { key: 'EN_CAMINO', label: 'En camino',  fecha: envio.fechaSalida,      icon: Truck     },
    { key: 'ENTREGADO', label: 'Entregado',  fecha: envio.fechaEntregaReal, icon: CheckCircle },
  ]
  const stepActual = ESTADO_CONFIG[envio.estado]?.step ?? 0

  return (
    <div className="flex items-center gap-0 w-full">
      {pasos.map((p, i) => {
        const activo   = stepActual >= p.step || (envio.estado === p.key)
        const esActual = envio.estado === p.key
        const Icon = p.icon
        return (
          <div key={p.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                activo
                  ? esActual
                    ? 'bg-teal-600 border-teal-600 shadow-md shadow-teal-200'
                    : 'bg-teal-100 border-teal-400'
                  : 'bg-gray-100 border-gray-200'
              }`}>
                <Icon size={15} className={activo ? (esActual ? 'text-white' : 'text-teal-600') : 'text-gray-400'} />
              </div>
              <p className={`text-xs font-semibold mt-1 ${activo ? 'text-teal-700' : 'text-gray-400'}`}>
                {p.label}
              </p>
              <p className="text-xs text-gray-400 text-center leading-tight">
                {p.fecha ? fmt(p.fecha) : '—'}
              </p>
            </div>
            {i < pasos.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 -mt-5 rounded ${
                stepActual > i ? 'bg-teal-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── MODAL DETALLE DEL ENVÍO ───────────────────────────────────────────────────

function ModalDetalle({ envio, onClose, onAvanzarEstado, onCancelar, avanzando }) {
  const [tab,              setTab]              = useState('resumen')
  const [editTransporte,   setEditTransporte]   = useState(false)
  const [transporte,       setTransporte]       = useState({
    empresaTransportadora: envio.empresaTransportadora || '',
    nombreConductor:       envio.nombreConductor       || '',
    telefonoConductor:     envio.telefonoConductor     || '',
    placaVehiculo:         envio.placaVehiculo         || '',
    tipoVehiculo:          envio.tipoVehiculo          || '',
    fechaEntregaEstimada:  envio.fechaEntregaEstimada  || '',
  })
  const [guardandoTransporte, setGuardandoTransporte] = useState(false)
  const [errorTransporte,     setErrorTransporte]     = useState('')

  const puedeAvanzar  = !!SIGUIENTE_ESTADO[envio.estado]
  const puedeCancelar = envio.estado !== 'ENTREGADO' && envio.estado !== 'CANCELADO'

  const handleGuardarTransporte = async () => {
    setErrorTransporte('')
    setGuardandoTransporte(true)
    try {
      await api.patch(`/envios/${envio.idEnvio}/transporte`, transporte)
      setEditTransporte(false)
      onClose(true) // true = recargar
    } catch {
      setErrorTransporte('Error al guardar el transporte.')
    } finally { setGuardandoTransporte(false) }
  }

  const dest = envio.tipoDestino === 'CLIENTE' ? envio.clienteInfo : envio.puntoVentaInfo

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                  {envio.codigoGuia || `#${envio.idEnvio}`}
                </span>
                <Badge estado={envio.estado} />
              </div>
              <h2 className="text-lg font-black text-gray-800">
                {envio.tipoDestino === 'CLIENTE'
                  ? (envio.nombreCliente || envio.clienteInfo?.razonSocial || '—')
                  : (envio.nombrePunto   || envio.puntoVentaInfo?.nombre   || '—')}
              </h2>
              <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin size={12} />
                {envio.destinoCiudad}
                <span className="mx-1">·</span>
                {envio.tipoDestino === 'CLIENTE' ? '👤 Cliente' : '🏪 Punto de venta'}
              </p>
            </div>
            <button onClick={() => onClose(false)} className="p-2 rounded-lg hover:bg-gray-100">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Línea de tiempo */}
          {envio.estado !== 'CANCELADO' && (
            <div className="mt-4">
              <LineaTiempo envio={envio} />
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {[
              { key: 'resumen',   label: 'Resumen'    },
              { key: 'lotes',     label: `Lotes (${envio.totalLotes || 0})` },
              { key: 'transporte',label: 'Transporte' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === t.key
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Tab: Resumen ── */}
          {tab === 'resumen' && (
            <div className="space-y-4">

              {/* Destino info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                  {envio.tipoDestino === 'CLIENTE' ? 'Cliente' : 'Punto de venta'}
                </p>
                {dest ? (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Nombre</p>
                      <p className="font-semibold text-gray-700">
                        {dest.razonSocial || dest.nombre}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Ciudad</p>
                      <p className="font-medium text-gray-600">{dest.ciudad || '—'}</p>
                    </div>
                    {dest.telefono && (
                      <div>
                        <p className="text-xs text-gray-400">Teléfono</p>
                        <p className="font-medium text-gray-600">{dest.telefono}</p>
                      </div>
                    )}
                    {(dest.email || dest.responsable) && (
                      <div>
                        <p className="text-xs text-gray-400">{dest.email ? 'Correo' : 'Responsable'}</p>
                        <p className="font-medium text-gray-600 text-xs truncate">
                          {dest.email || dest.responsable}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Sin información adicional.</p>
                )}
              </div>

              {/* Totales */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-teal-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-teal-600 font-semibold">Total kilos</p>
                  <p className="text-2xl font-black text-teal-700">
                    {parseFloat(envio.totalKilos || 0).toFixed(1)}
                    <span className="text-sm font-normal ml-1">kg</span>
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-blue-600 font-semibold">Total lotes</p>
                  <p className="text-2xl font-black text-blue-700">{envio.totalLotes || 0}</p>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Preparación',        val: fmt(envio.fechaPreparacion)      },
                  { label: 'Salida',             val: fmt(envio.fechaSalida)           },
                  { label: 'Entrega estimada',   val: fmtDate(envio.fechaEntregaEstimada) },
                  { label: 'Entrega real',       val: fmt(envio.fechaEntregaReal)      },
                ].map(f => (
                  <div key={f.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">{f.label}</p>
                    <p className="font-medium text-gray-700">{f.val}</p>
                  </div>
                ))}
              </div>

              {/* Observaciones */}
              {envio.observaciones && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Observaciones</p>
                  <p className="text-sm text-amber-800">{envio.observaciones}</p>
                </div>
              )}

              {/* Evidencia entrega */}
              {envio.estado === 'ENTREGADO' && (envio.nombreReceptor || envio.observacionEntrega) && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-green-700 uppercase mb-2">Evidencia de entrega</p>
                  {envio.nombreReceptor && (
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Recibido por: </span>{envio.nombreReceptor}
                    </p>
                  )}
                  {envio.observacionEntrega && (
                    <p className="text-sm text-green-700 mt-1">{envio.observacionEntrega}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Lotes ── */}
          {tab === 'lotes' && (
            <div>
              {envio.lotes?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Sin lotes asociados.</p>
              ) : (
                <div className="space-y-2">
                  {envio.lotes?.map(lote => (
                    <div key={lote.idLote}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                        <Snowflake size={15} className="text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold font-mono text-gray-800">{lote.codigoLote}</p>
                        <p className="text-xs text-gray-500">{lote.nombreProductor}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-teal-700">
                          {parseFloat(lote.kilos).toFixed(1)} kg
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 px-1">
                    <p className="text-xs font-semibold text-gray-500">Total</p>
                    <p className="text-sm font-black text-teal-700">
                      {parseFloat(envio.totalKilos || 0).toFixed(1)} kg
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Transporte ── */}
          {tab === 'transporte' && (
            <div>
              {!editTransporte ? (
                <div className="space-y-3">
                  {[
                    { label: 'Empresa transportadora', val: envio.empresaTransportadora, icon: Building2 },
                    { label: 'Conductor',              val: envio.nombreConductor,       icon: User      },
                    { label: 'Teléfono conductor',     val: envio.telefonoConductor,     icon: Phone     },
                    { label: 'Placa del vehículo',     val: envio.placaVehiculo,         icon: Hash      },
                    { label: 'Tipo de vehículo',       val: envio.tipoVehiculo,          icon: Truck     },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
                        <f.icon size={14} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{f.label}</p>
                        <p className={`text-sm font-medium ${f.val ? 'text-gray-700' : 'text-gray-300'}`}>
                          {f.val || 'Sin registrar'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {envio.estado !== 'ENTREGADO' && envio.estado !== 'CANCELADO' && (
                    <button onClick={() => setEditTransporte(true)}
                      className="w-full mt-2 py-2.5 border-2 border-dashed border-teal-200 text-teal-600 rounded-xl text-sm font-semibold hover:border-teal-400 hover:bg-teal-50 transition-all">
                      {envio.empresaTransportadora ? 'Actualizar transporte' : '+ Registrar transporte'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { key: 'empresaTransportadora', label: 'Empresa transportadora', placeholder: 'Transportes Catatumbo' },
                    { key: 'nombreConductor',       label: 'Nombre del conductor',   placeholder: 'Carlos Pérez'          },
                    { key: 'telefonoConductor',     label: 'Teléfono conductor',      placeholder: '3101234567'            },
                    { key: 'placaVehiculo',         label: 'Placa del vehículo',      placeholder: 'ABC-123'               },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">{f.label}</label>
                      <input
                        value={transporte[f.key]}
                        onChange={e => setTransporte(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Tipo de vehículo</label>
                    <select
                      value={transporte.tipoVehiculo}
                      onChange={e => setTransporte(prev => ({ ...prev, tipoVehiculo: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                      <option value="">Seleccionar...</option>
                      {TIPOS_VEHICULO.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Fecha estimada de entrega</label>
                    <input type="date"
                      value={transporte.fechaEntregaEstimada}
                      onChange={e => setTransporte(prev => ({ ...prev, fechaEntregaEstimada: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {errorTransporte && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                      {errorTransporte}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setEditTransporte(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                      Cancelar
                    </button>
                    <button onClick={handleGuardarTransporte} disabled={guardandoTransporte}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                      {guardandoTransporte ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button onClick={() => onClose(false)}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cerrar
          </button>
          {puedeCancelar && (
            <button
              onClick={() => onCancelar(envio)}
              className="px-4 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-1.5">
              <Ban size={14} />
              Cancelar envío
            </button>
          )}
          {puedeAvanzar && (
            <button
              onClick={() => onAvanzarEstado(envio)}
              disabled={avanzando === envio.idEnvio}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
              {avanzando === envio.idEnvio ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight size={15} />
              )}
              {SIGUIENTE_LABEL[envio.estado]}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MODAL CREAR ENVÍO ─────────────────────────────────────────────────────────

function ModalCrear({ lotesDisponibles, clientes, puntos, onClose, onCreado }) {
  const [form, setForm] = useState({
    destinoCiudad: '', tipoDestino: '', idCliente: '', idPunto: '',
    observaciones: '', lotesSeleccionados: [],
    empresaTransportadora: '', nombreConductor: '',
    telefonoConductor: '', placaVehiculo: '', tipoVehiculo: '',
    fechaEntregaEstimada: '',
  })
  const [paso,     setPaso]     = useState(1) // 1=lotes+destino, 2=transporte(opcional)
  const [error,    setError]    = useState('')
  const [guardando,setGuardando]= useState(false)

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const toggleLote = (id) => setForm(prev => ({
    ...prev,
    lotesSeleccionados: prev.lotesSeleccionados.includes(id)
      ? prev.lotesSeleccionados.filter(x => x !== id)
      : [...prev.lotesSeleccionados, id],
  }))

  const kilosSeleccionados = form.lotesSeleccionados.reduce((acc, id) => {
    const lote = lotesDisponibles.find(l => l.idLote === id)
    return acc + (parseFloat(lote?.kilos) || 0)
  }, 0)

  const validarPaso1 = () => {
    if (!form.destinoCiudad)                                    { setError('Selecciona la ciudad de destino.');   return false }
    if (!form.tipoDestino)                                      { setError('Selecciona el tipo de destino.');     return false }
    if (form.tipoDestino === 'CLIENTE'     && !form.idCliente)  { setError('Selecciona un cliente.');             return false }
    if (form.tipoDestino === 'PUNTO_VENTA' && !form.idPunto)    { setError('Selecciona un punto de venta.');      return false }
    if (form.lotesSeleccionados.length === 0)                   { setError('Selecciona al menos un lote.');       return false }
    return true
  }

  const handleCrear = async () => {
    setError('')
    setGuardando(true)
    try {
      await api.post('/envios', {
        destinoCiudad:         form.destinoCiudad,
        tipoDestino:           form.tipoDestino,
        idCliente:             form.idCliente  ? parseInt(form.idCliente)  : null,
        idPunto:               form.idPunto    ? parseInt(form.idPunto)    : null,
        observaciones:         form.observaciones,
        idLotes:               form.lotesSeleccionados,
        empresaTransportadora: form.empresaTransportadora || null,
        nombreConductor:       form.nombreConductor       || null,
        telefonoConductor:     form.telefonoConductor     || null,
        placaVehiculo:         form.placaVehiculo         || null,
        tipoVehiculo:          form.tipoVehiculo          || null,
        fechaEntregaEstimada:  form.fechaEntregaEstimada  || null,
      })
      onCreado()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data
      setError(typeof msg === 'string' ? msg : 'Error al crear el envío.')
      setPaso(1)
    } finally { setGuardando(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Nuevo Envío</h2>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2].map(p => (
                <div key={p} className="flex items-center gap-1">
                  <div className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                    paso >= p ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>{p}</div>
                  <span className={`text-xs ${paso >= p ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>
                    {p === 1 ? 'Destino y lotes' : 'Transporte (opcional)'}
                  </span>
                  {p < 2 && <ArrowRight size={10} className="text-gray-300 ml-1" />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Paso 1 ── */}
          {paso === 1 && (
            <>
              {/* Lotes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Lotes disponibles en Cuarto Frío *
                  </label>
                  {form.lotesSeleccionados.length > 0 && (
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                      {form.lotesSeleccionados.length} selec. · {kilosSeleccionados.toFixed(1)} kg
                    </span>
                  )}
                </div>
                {lotesDisponibles.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
                    No hay lotes disponibles en el Cuarto Frío.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                    {lotesDisponibles.map(lote => {
                      const sel = form.lotesSeleccionados.includes(lote.idLote)
                      return (
                        <button key={lote.idLote} onClick={() => toggleLote(lote.idLote)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            sel ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-200 hover:bg-teal-50/30'
                          }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sel ? 'bg-teal-200' : 'bg-gray-100'}`}>
                            <Snowflake size={14} className={sel ? 'text-teal-700' : 'text-gray-400'} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold font-mono text-gray-800 truncate">{lote.codigoLote}</p>
                            <p className="text-xs text-gray-500">{parseFloat(lote.kilos).toFixed(1)} kg</p>
                            <p className="text-xs text-gray-400 truncate">{lote.nombreProductor}</p>
                          </div>
                          {sel && <CheckCircle size={16} className="text-teal-600 shrink-0 ml-auto" />}
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
                    <button key={d} onClick={() => setF('destinoCiudad', d)}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium text-left transition-all ${
                        form.destinoCiudad === d
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-600 hover:border-teal-200'
                      }`}>
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
                      onClick={() => setForm(prev => ({ ...prev, tipoDestino: t.val, idCliente: '', idPunto: '' }))}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.tipoDestino === t.val ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-200'
                      }`}>
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
                    Cliente * {clientes.length === 0 && <span className="text-red-400 text-xs font-normal">(Sin datos)</span>}
                  </label>
                  <select value={form.idCliente} onChange={e => setF('idCliente', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c => (
                      <option key={c.idCliente} value={c.idCliente}>
                        {c.razonSocial || `${c.nombre1} ${c.apellido1}`} — {c.ciudad}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Punto de venta */}
              {form.tipoDestino === 'PUNTO_VENTA' && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Punto de venta * {puntos.length === 0 && <span className="text-red-400 text-xs font-normal">(Sin datos)</span>}
                  </label>
                  <select value={form.idPunto} onChange={e => setF('idPunto', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="">Seleccionar punto de venta...</option>
                    {puntos.map(p => (
                      <option key={p.idPunto} value={p.idPunto}>
                        {p.nombre} — {p.ciudad}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Observaciones */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setF('observaciones', e.target.value)}
                  rows={2} placeholder="Condiciones de transporte, novedades..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              {/* Resumen */}
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
            </>
          )}

          {/* ── Paso 2: Transporte ── */}
          {paso === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700 font-medium">
                  ℹ️ La información de transporte es opcional. Puedes completarla ahora o después desde el detalle del envío.
                </p>
              </div>
              {[
                { key: 'empresaTransportadora', label: 'Empresa transportadora', placeholder: 'Transportes Catatumbo' },
                { key: 'nombreConductor',       label: 'Nombre del conductor',   placeholder: 'Carlos Pérez'          },
                { key: 'telefonoConductor',     label: 'Teléfono del conductor', placeholder: '3101234567'            },
                { key: 'placaVehiculo',         label: 'Placa del vehículo',     placeholder: 'ABC-123'               },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">{f.label}</label>
                  <input value={form[f.key]} onChange={e => setF(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Tipo de vehículo</label>
                <select value={form.tipoVehiculo} onChange={e => setF('tipoVehiculo', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                  <option value="">Seleccionar...</option>
                  {TIPOS_VEHICULO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Fecha estimada de entrega</label>
                <input type="date" value={form.fechaEntregaEstimada}
                  onChange={e => setF('fechaEntregaEstimada', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          {paso === 1 ? (
            <>
              <button onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => { setError(''); if (validarPaso1()) setPaso(2) }}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                Siguiente <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setError(''); setPaso(1) }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                Atrás
              </button>
              <button onClick={handleCrear} disabled={guardando}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                {guardando ? 'Creando envío...' : 'Crear envío'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

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
  const [toastMsg,         setToastMsg]         = useState('')

  useEffect(() => { cargarTodo() }, [])

  const cargarTodo = async () => {
    try {
      setLoading(true)
      const enviosRes = await api.get('/envios')
      setEnvios(enviosRes.data)

      const lotesRes = await api.get('/lotes-cuarto-frio')
      setLotesDisponibles(lotesRes.data.filter(l => l.estadoDecision === 'ALMACENADO'))

      try { setClientes((await api.get('/clientes')).data)    } catch { setClientes([]) }
      try { setPuntos((await api.get('/puntos-venta')).data)  } catch { setPuntos([])  }
    } catch (err) {
      console.error('Error cargando logística:', err)
    } finally { setLoading(false) }
  }

  const mostrarToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const stats = useMemo(() => ({
    total:      envios.length,
    preparado:  envios.filter(e => e.estado === 'PREPARADO').length,
    enCamino:   envios.filter(e => e.estado === 'EN_CAMINO').length,
    entregado:  envios.filter(e => e.estado === 'ENTREGADO').length,
    cancelado:  envios.filter(e => e.estado === 'CANCELADO').length,
    kilosTotal: envios.reduce((a, e) => a + (parseFloat(e.totalKilos) || 0), 0),
  }), [envios])

  const enviosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return envios
      .filter(e => filtroEstado === 'TODOS' || e.estado === filtroEstado)
      .filter(e => !q
        || String(e.idEnvio).includes(q)
        || e.codigoGuia?.toLowerCase().includes(q)
        || e.destinoCiudad?.toLowerCase().includes(q)
        || e.nombreCliente?.toLowerCase().includes(q)
        || e.nombrePunto?.toLowerCase().includes(q)
        || e.nombreConductor?.toLowerCase().includes(q)
        || e.lotes?.some(l => l.codigoLote?.toLowerCase().includes(q))
      )
  }, [envios, filtroEstado, busqueda])

  const handleAvanzarEstado = async (envio) => {
    const siguiente = SIGUIENTE_ESTADO[envio.estado]
    if (!siguiente) return
    setAvanzando(envio.idEnvio)
    try {
      const res = await api.patch(`/envios/${envio.idEnvio}/estado`, { estado: siguiente })
      setEnvios(prev => prev.map(e => e.idEnvio === envio.idEnvio ? res.data : e))
      if (envioDetalle?.idEnvio === envio.idEnvio) setEnvioDetalle(res.data)
      mostrarToast(`Envío ${envio.codigoGuia || '#' + envio.idEnvio} → ${ESTADO_CONFIG[siguiente]?.label}`)
    } catch (err) { console.error(err) }
    finally { setAvanzando(null) }
  }

  const handleCancelar = async (envio) => {
    if (!window.confirm(`¿Cancelar el envío ${envio.codigoGuia || '#' + envio.idEnvio}?`)) return
    try {
      const res = await api.patch(`/envios/${envio.idEnvio}/estado`, { estado: 'CANCELADO' })
      setEnvios(prev => prev.map(e => e.idEnvio === envio.idEnvio ? res.data : e))
      setEnvioDetalle(null)
      mostrarToast(`Envío ${envio.codigoGuia || '#' + envio.idEnvio} cancelado.`)
    } catch (err) { console.error(err) }
  }

  const handleCerrarDetalle = (recargar) => {
    setEnvioDetalle(null)
    if (recargar) cargarTodo()
  }

  return (
    <div className="relative">

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle size={16} className="text-teal-400" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Logística y Distribución</h1>
          <p className="text-gray-500 text-sm mt-1">
            {stats.enCamino > 0
              ? `${stats.enCamino} envío${stats.enCamino > 1 ? 's' : ''} en camino · ${stats.kilosTotal.toFixed(0)} kg distribuidos`
              : `${stats.total} envíos registrados · ${stats.kilosTotal.toFixed(0)} kg distribuidos`}
          </p>
        </div>
        <button onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={16} />
          Nuevo envío
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Clock}       label="Preparados"  value={stats.preparado} color="bg-yellow-400" sub={`${stats.cancelado} cancelado${stats.cancelado !== 1 ? 's' : ''}`} />
        <StatCard icon={Truck}       label="En camino"   value={stats.enCamino}  color="bg-blue-500"   />
        <StatCard icon={CheckCircle} label="Entregados"  value={stats.entregado} color="bg-green-500"  sub={`${stats.total} total`} />
        <StatCard icon={Package}     label="Kilos total" value={stats.kilosTotal.toFixed(0)} color="bg-teal-600" sub="kg distribuidos" />
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por guía, ciudad, cliente, punto de venta, lote..."
              className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {['TODOS', 'PREPARADO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'].map(e => (
              <button key={e} onClick={() => setFiltroEstado(e)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  filtroEstado === e
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'border-gray-200 text-gray-500 hover:border-teal-200'
                }`}>
                {e === 'TODOS' ? 'Todos' : ESTADO_CONFIG[e]?.label}
                {e !== 'TODOS' && (
                  <span className="ml-1 opacity-70">
                    {envios.filter(x => x.estado === e).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Cargando envíos...</span>
          </div>
        ) : enviosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Truck size={36} className="text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">
              {envios.length === 0 ? 'No hay envíos registrados.' : 'Sin resultados para la búsqueda.'}
            </p>
          </div>
        ) : (
          <>
            {/* Header tabla */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide">
              <div className="col-span-2">Guía</div>
              <div className="col-span-3">Destino</div>
              <div className="col-span-2">Fecha</div>
              <div className="col-span-2">Transporte</div>
              <div className="col-span-1">Kilos</div>
              <div className="col-span-1">Estado</div>
              <div className="col-span-1 text-right">Acción</div>
            </div>

            <div className="divide-y divide-gray-50">
              {enviosFiltrados.map(envio => (
                <div key={envio.idEnvio}
                  className="grid grid-cols-12 gap-3 px-5 py-4 hover:bg-gray-50/70 transition-colors items-center cursor-pointer"
                  onClick={() => setEnvioDetalle(envio)}>

                  {/* Guía */}
                  <div className="col-span-12 md:col-span-2">
                    <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                      {envio.codigoGuia || `#${envio.idEnvio}`}
                    </span>
                  </div>

                  {/* Destino */}
                  <div className="col-span-12 md:col-span-3">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {envio.tipoDestino === 'CLIENTE'
                        ? (envio.nombreCliente || '—')
                        : (envio.nombrePunto   || '—')}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="shrink-0" />
                      {envio.destinoCiudad}
                      <span className="ml-1 opacity-60">
                        {envio.tipoDestino === 'CLIENTE' ? '· Cliente' : '· Punto de venta'}
                      </span>
                    </p>
                  </div>

                  {/* Fecha */}
                  <div className="col-span-6 md:col-span-2">
                    <p className="text-xs text-gray-700">{fmt(envio.fechaPreparacion || envio.fechaEnvio)}</p>
                    {envio.fechaEntregaEstimada && (
                      <p className="text-xs text-gray-400">Est: {fmtDate(envio.fechaEntregaEstimada)}</p>
                    )}
                  </div>

                  {/* Transporte */}
                  <div className="col-span-6 md:col-span-2">
                    {envio.nombreConductor ? (
                      <>
                        <p className="text-xs font-medium text-gray-700 truncate">{envio.nombreConductor}</p>
                        {envio.placaVehiculo && (
                          <p className="text-xs text-gray-400 font-mono">{envio.placaVehiculo}</p>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-300">Sin asignar</span>
                    )}
                  </div>

                  {/* Kilos */}
                  <div className="col-span-4 md:col-span-1">
                    <p className="text-sm font-bold text-teal-700">
                      {parseFloat(envio.totalKilos || 0).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {envio.totalLotes} lote{envio.totalLotes !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Estado */}
                  <div className="col-span-5 md:col-span-1">
                    <Badge estado={envio.estado} />
                  </div>

                  {/* Acción */}
                  <div className="col-span-3 md:col-span-1 flex justify-end gap-1"
                    onClick={e => e.stopPropagation()}>
                    {SIGUIENTE_ESTADO[envio.estado] && (
                      <button
                        onClick={() => handleAvanzarEstado(envio)}
                        disabled={avanzando === envio.idEnvio}
                        className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 transition-colors disabled:opacity-50"
                        title={SIGUIENTE_LABEL[envio.estado]}>
                        {avanzando === envio.idEnvio
                          ? <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin block" />
                          : <ArrowRight size={15} />}
                      </button>
                    )}
                    <button onClick={() => setEnvioDetalle(envio)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                      title="Ver detalle">
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal crear */}
      {mostrarModal && (
        <ModalCrear
          lotesDisponibles={lotesDisponibles}
          clientes={clientes}
          puntos={puntos}
          onClose={() => setMostrarModal(false)}
          onCreado={() => { setMostrarModal(false); cargarTodo(); mostrarToast('Envío creado correctamente.') }}
        />
      )}

      {/* Modal detalle */}
      {envioDetalle && (
        <ModalDetalle
          envio={envioDetalle}
          onClose={handleCerrarDetalle}
          onAvanzarEstado={handleAvanzarEstado}
          onCancelar={handleCancelar}
          avanzando={avanzando}
        />
      )}
    </div>
  )
}
