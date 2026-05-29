import { useState, useEffect } from 'react'
import {
  Snowflake, Package, CheckCircle, XCircle,
  AlertTriangle, Truck, Clock, ChevronRight
} from 'lucide-react'
import api from '../../services/api'

const CAPACIDAD_MAX_KG = 500

// ── Helpers ──────────────────────────────────────────────────────────────────

const estadoBadge = (decision) => {
  switch (decision) {
    case 'PENDIENTE_DECISION':
      return { label: 'Pendiente decisión', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
    case 'ALMACENADO':
      return { label: 'Almacenado',         cls: 'bg-teal-50 text-teal-700 border-teal-200'     }
    case 'DESPACHADO':
      return { label: 'Despachado',          cls: 'bg-gray-50 text-gray-500 border-gray-200'     }
    default:
      return { label: decision,             cls: 'bg-gray-50 text-gray-400 border-gray-200'     }
  }
}

function Almacenamiento() {
  const [lotes,       setLotes]       = useState([])
  const [clientes,    setClientes]    = useState([])
  const [puntos,      setPuntos]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loteModal,   setLoteModal]   = useState(null)   // lote con PENDIENTE_DECISION
  const [paso,        setPaso]        = useState(1)       // 1=decisión, 2=destino
  const [decision,    setDecision]    = useState('')      // ALMACENAR | DESPACHAR
  const [form,        setForm]        = useState({
    tipoDestino: '', idCliente: '', idPunto: '',
    destinoCiudad: '', observaciones: '',
  })
  const [error,       setError]       = useState('')
  const [guardando,   setGuardando]   = useState(false)

  useEffect(() => {
    cargarTodo()
  }, [])

  const cargarTodo = async () => {
    try {
      setLoading(true)
      const [lotesRes, clientesRes, puntosRes] = await Promise.all([
        api.get('/lotes-cuarto-frio'),
        api.get('/clientes').catch(() => ({ data: [] })),
        api.get('/puntos-venta').catch(() => ({ data: [] })),
      ])
      setLotes(lotesRes.data)
      setClientes(clientesRes.data)
      setPuntos(puntosRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  // ── Métricas ──────────────────────────────────────────────────────────────
  const almacenados       = lotes.filter(l => l.estadoDecision === 'ALMACENADO')
  const pendientes        = lotes.filter(l => l.estadoDecision === 'PENDIENTE_DECISION')
  const despachados       = lotes.filter(l => l.estadoDecision === 'DESPACHADO')
  const kilosStock        = almacenados.reduce((a, l) => a + (parseFloat(l.kilos) || 0), 0)
  const kilosPendientes   = pendientes.reduce((a, l) => a + (parseFloat(l.kilos) || 0), 0)
  const pct               = Math.min(((kilosStock + kilosPendientes) / CAPACIDAD_MAX_KG) * 100, 100)
  const kilosLibres       = Math.max(CAPACIDAD_MAX_KG - kilosStock - kilosPendientes, 0)

  const barraColor = pct >= 90 ? 'bg-red-500'
                   : pct >= 70 ? 'bg-orange-400'
                                : 'bg-teal-500'

  // ── Abrir modal de decisión ───────────────────────────────────────────────
  const abrirDecision = (lote) => {
    setLoteModal(lote)
    setDecision('')
    setPaso(1)
    setForm({ tipoDestino: '', idCliente: '', idPunto: '', destinoCiudad: '', observaciones: '' })
    setError('')
  }

  // ── Confirmar decisión ────────────────────────────────────────────────────
  const handleConfirmar = async () => {
    setError('')

    if (!decision) { setError('Selecciona una opción.'); return }

    if (decision === 'ALMACENAR') {
      // Verificar espacio
      if (parseFloat(loteModal.kilos) > kilosLibres + kilosPendientes) {
        setError(`Sin espacio suficiente. Disponible: ${kilosLibres.toFixed(1)} kg`)
        return
      }
      await enviarDecision({ decision: 'ALMACENAR' })
      return
    }

    // DESPACHAR: avanzar al paso 2 de destino
    if (paso === 1) { setPaso(2); return }

    // Paso 2: validar destino
    if (!form.tipoDestino)    { setError('Selecciona el tipo de destino.'); return }
    if (!form.destinoCiudad)  { setError('Ingresa la ciudad de destino.'); return }
    if (form.tipoDestino === 'CLIENTE'     && !form.idCliente) { setError('Selecciona un cliente.'); return }
    if (form.tipoDestino === 'PUNTO_VENTA' && !form.idPunto)   { setError('Selecciona un punto de venta.'); return }

    await enviarDecision({
      decision:      'DESPACHAR',
      tipoDestino:   form.tipoDestino,
      idCliente:     form.idCliente   ? parseInt(form.idCliente)  : null,
      idPunto:       form.idPunto     ? parseInt(form.idPunto)    : null,
      destinoCiudad: form.destinoCiudad,
      observaciones: form.observaciones,
    })
  }

  const enviarDecision = async (payload) => {
    setGuardando(true)
    try {
      await api.patch(`/lotes-cuarto-frio/${loteModal.idLote}/decision`, payload)
      setLoteModal(null)
      cargarTodo()
    } catch (err) {
      setError('Error al procesar la decisión. Intenta de nuevo.')
      console.error(err)
    } finally { setGuardando(false) }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Almacenamiento</h1>
        <p className="text-gray-500 text-sm mt-1">
          Los lotes llegan desde Procesamiento. Decide si se almacenan en el
          Cuarto Frío o se despachan de inmediato.
        </p>
      </div>

      {/* Alerta de lotes pendientes de decisión */}
      {pendientes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              {pendientes.length} lote{pendientes.length > 1 ? 's' : ''} esperando decisión
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Estos lotes acaban de salir de Procesamiento. Define si se almacenan o se despachan.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={15} className="text-yellow-500" />
            <p className="text-xs text-gray-500">Pendientes decisión</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{pendientes.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-teal-100">
          <div className="flex items-center gap-2 mb-1">
            <Snowflake size={15} className="text-teal-500" />
            <p className="text-xs text-gray-500">En Cuarto Frío</p>
          </div>
          <p className="text-2xl font-bold text-teal-700">{almacenados.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Package size={15} className="text-gray-400" />
            <p className="text-xs text-gray-500">Stock actual</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">{kilosStock.toFixed(1)} <span className="text-sm text-gray-400">kg</span></p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Truck size={15} className="text-gray-400" />
            <p className="text-xs text-gray-500">Despachados</p>
          </div>
          <p className="text-2xl font-bold text-gray-500">{despachados.length}</p>
        </div>
      </div>

      {/* Barra de capacidad */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Snowflake size={16} className="text-teal-500" />
            <span className="text-sm font-semibold text-gray-700">Capacidad del Cuarto Frío</span>
          </div>
          <span className="text-sm font-bold text-gray-700">
            {(kilosStock + kilosPendientes).toFixed(1)} / {CAPACIDAD_MAX_KG} kg ({pct.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          {/* Barra de almacenados */}
          <div className="h-4 rounded-full flex overflow-hidden transition-all duration-500" style={{ width: `${pct}%` }}>
            <div className={`h-full ${barraColor} flex-1`} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Almacenado: {kilosStock.toFixed(1)} kg</span>
          <span>Libre: {kilosLibres.toFixed(1)} kg</span>
        </div>
        {pct >= 90 && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-xs">
            <AlertTriangle size={13} />
            <span className="font-medium">¡Cuarto frío casi lleno! Solo quedan {kilosLibres.toFixed(1)} kg disponibles.</span>
          </div>
        )}
        {pct >= 70 && pct < 90 && (
          <div className="mt-2 flex items-center gap-2 text-orange-500 text-xs">
            <AlertTriangle size={13} />
            <span>Capacidad alta. Considera despachar lotes almacenados.</span>
          </div>
        )}
      </div>

      {/* Tabla de lotes */}
      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">Cargando lotes...</div>
      ) : lotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Package size={40} className="mb-2 opacity-30" />
          <p>No hay lotes registrados</p>
          <p className="text-xs mt-1">Los lotes se crean al completar el Congelamiento en Procesamiento</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Código', 'Productor', 'Kilos', 'Fecha ingreso', 'Estado', 'Acción'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lotes.map(l => {
                const badge = estadoBadge(l.estadoDecision)
                return (
                  <tr key={l.idLote} className={`hover:bg-gray-50 ${l.estadoDecision === 'PENDIENTE_DECISION' ? 'bg-yellow-50/40' : ''}`}>
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-800">
                      {l.codigoLote}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                          {l.nombreProductor?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{l.nombreProductor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                      {parseFloat(l.kilos).toFixed(1)} kg
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {l.fechaIngreso?.replace('T', ' ').substring(0, 16)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {l.estadoDecision === 'PENDIENTE_DECISION' ? (
                        <button
                          onClick={() => abrirDecision(l)}
                          className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
                        >
                          Decidir destino
                        </button>
                      ) : l.estadoDecision === 'ALMACENADO' ? (
                        <div className="flex items-center gap-1 text-teal-600">
                          <CheckCircle size={14} />
                          <span className="text-xs">En cuarto frío</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <XCircle size={14} />
                          <span className="text-xs">Enviado (#{l.idEnvio})</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal de decisión ───────────────────────────────────────────────── */}
      {loteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">

            {/* Header modal */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                {paso === 1
                  ? <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Paso 1 de 2 — Decisión</span>
                  : <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Paso 2 de 2 — Destino</span>
                }
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                {paso === 1 ? '¿Qué hacemos con este lote?' : 'Datos del despacho'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-mono font-semibold">{loteModal.codigoLote}</span>
                {' '}· {loteModal.nombreProductor} · {parseFloat(loteModal.kilos).toFixed(1)} kg
              </p>
            </div>

            <div className="p-6 flex flex-col gap-4">

              {/* ── Paso 1: elegir decisión ────────────────────────────────── */}
              {paso === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Opción: Almacenar */}
                  <button
                    onClick={() => setDecision('ALMACENAR')}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                      decision === 'ALMACENAR'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${decision === 'ALMACENAR' ? 'bg-teal-100' : 'bg-gray-100'}`}>
                      <Snowflake size={22} className={decision === 'ALMACENAR' ? 'text-teal-600' : 'text-gray-400'} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${decision === 'ALMACENAR' ? 'text-teal-700' : 'text-gray-700'}`}>
                        Almacenar
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Guardar en el Cuarto Frío hasta que haya despacho
                      </p>
                    </div>
                    {kilosLibres < parseFloat(loteModal.kilos) && (
                      <span className="text-xs text-red-500 font-medium">
                        ⚠ Espacio insuficiente ({kilosLibres.toFixed(1)} kg libres)
                      </span>
                    )}
                  </button>

                  {/* Opción: Despachar */}
                  <button
                    onClick={() => setDecision('DESPACHAR')}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                      decision === 'DESPACHAR'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${decision === 'DESPACHAR' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Truck size={22} className={decision === 'DESPACHAR' ? 'text-blue-600' : 'text-gray-400'} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${decision === 'DESPACHAR' ? 'text-blue-700' : 'text-gray-700'}`}>
                        Despachar ahora
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        El carro está disponible, enviar directamente
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {/* ── Paso 2: datos del despacho ─────────────────────────────── */}
              {paso === 2 && decision === 'DESPACHAR' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Tipo de destino *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['CLIENTE', 'PUNTO_VENTA'].map(tipo => (
                        <button key={tipo}
                          onClick={() => setForm({ ...form, tipoDestino: tipo, idCliente: '', idPunto: '' })}
                          className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                            form.tipoDestino === tipo
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-600 hover:border-blue-200'
                          }`}
                        >
                          {tipo === 'CLIENTE' ? '👤 Cliente' : '🏪 Punto de venta'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.tipoDestino === 'CLIENTE' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Cliente *</label>
                      <select value={form.idCliente}
                        onChange={e => setForm({ ...form, idCliente: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                        <option value="">Seleccionar cliente...</option>
                        {clientes.map(c => (
                          <option key={c.idCliente} value={c.idCliente}>
                            {c.nombre1} {c.apellido1} — {c.ciudad}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {form.tipoDestino === 'PUNTO_VENTA' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Punto de venta *</label>
                      <select value={form.idPunto}
                        onChange={e => setForm({ ...form, idPunto: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                        <option value="">Seleccionar punto de venta...</option>
                        {puntos.map(p => (
                          <option key={p.idPunto} value={p.idPunto}>
                            {p.nombre} — {p.ciudadd}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Ciudad de destino *</label>
                    <input type="text" value={form.destinoCiudad}
                      onChange={e => setForm({ ...form, destinoCiudad: e.target.value })}
                      placeholder="Ej: Cúcuta, Ocaña..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Observaciones</label>
                    <textarea value={form.observaciones}
                      onChange={e => setForm({ ...form, observaciones: e.target.value })}
                      rows={2} placeholder="Condiciones del despacho, novedades..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Resumen del despacho */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
                    🚛 Se creará un envío en estado <strong>EN_CAMINO</strong> en el módulo de Logística.
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => paso === 2 ? setPaso(1) : setLoteModal(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {paso === 2 ? '← Volver' : 'Cancelar'}
                </button>
                <button
                  onClick={handleConfirmar}
                  disabled={guardando || !decision}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors ${
                    decision === 'DESPACHAR'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {guardando ? 'Procesando...'
                    : paso === 1 && decision === 'DESPACHAR' ? 'Continuar →'
                    : paso === 1 && decision === 'ALMACENAR' ? 'Confirmar almacenamiento'
                    : 'Confirmar despacho'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Almacenamiento
