import { useState, useEffect } from 'react'
import { CheckCircle, ChevronRight, Fish, Snowflake, Scissors, Scale } from 'lucide-react'
import api from '../../services/api'

const ETAPAS = ['PESAJE', 'EVISCERADO', 'LIMPIEZA', 'CONGELAMIENTO']

const ETAPA_CONFIG = {
  PESAJE:        { label: 'Pesaje',        icon: Scale,     color: 'blue'   },
  EVISCERADO:    { label: 'Eviscerado',    icon: Fish,      color: 'orange' },
  LIMPIEZA:      { label: 'Limpieza',      icon: Scissors,  color: 'purple' },
  CONGELAMIENTO: { label: 'Congelamiento', icon: Snowflake, color: 'teal'   },
}

const COL = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300',   icon: 'text-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-200'     },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', icon: 'text-orange-500', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', icon: 'text-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  teal:   { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-300',   icon: 'text-teal-500',   badge: 'bg-teal-50 text-teal-700 border-teal-200'     },
}

function Procesamiento() {
  const [procesamientos, setProcesamientos] = useState([])
  const [loading, setLoading]               = useState(true)
  const [modalData, setModalData]           = useState(null)
  const [form, setForm]                     = useState({ responsable: '', observaciones: '' })
  const [error, setError]                   = useState('')
  const [guardando, setGuardando]           = useState(false)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      setLoading(true)
      const res = await api.get('/procesamientos')
      setProcesamientos(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  // Agrupar etapas por recepción
  const grupos = procesamientos.reduce((acc, p) => {
    const key = p.idRecepcion
    if (!acc[key]) acc[key] = {
      idRecepcion:     p.idRecepcion,
      kilosRecibidos:  p.kilosRecibidos,
      nombreProductor: p.nombreProductor,
      etapas:          [],
    }
    acc[key].etapas.push(p)
    return acc
  }, {})

  const grupos_arr = Object.values(grupos)

  // Activos: tienen alguna etapa EN_PROCESO
  const activos   = grupos_arr.filter(g => g.etapas.some(e => e.estado === 'EN_PROCESO'))
  // Completos: CONGELAMIENTO completado → lote ya en cuarto frío
  const completos = grupos_arr.filter(g =>
    g.etapas.some(e => e.etapa === 'CONGELAMIENTO' && e.estado === 'COMPLETADO')
  )

  const etapaActual = (g) => g.etapas.find(e => e.estado === 'EN_PROCESO')

  const abrirModal = (etapa) => {
    setModalData(etapa)
    setForm({ responsable: '', observaciones: '' })
    setError('')
  }

  const handleAvanzar = async (e) => {
    e.preventDefault()
    if (!form.responsable.trim()) { setError('El responsable es obligatorio.'); return }
    setGuardando(true); setError('')
    try {
      await api.patch(`/procesamientos/${modalData.idProcesamiento}/avanzar`, {
        idRecepcion:  modalData.idRecepcion,
        responsable:  form.responsable,
        observaciones: form.observaciones,
      })
      setModalData(null)
      cargar()
    } catch (err) {
      setError('Error al avanzar la etapa. Intenta de nuevo.')
      console.error(err)
    } finally { setGuardando(false) }
  }

  const esUltimaEtapa = (etapa) => etapa === 'CONGELAMIENTO'

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Procesamiento</h1>
        <p className="text-gray-500 text-sm mt-1">
          Sigue las etapas de cada lote. Al completar{' '}
          <span className="font-semibold text-teal-700">Congelamiento</span>, el
          lote pasa automáticamente al Cuarto Frío.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'En proceso',       value: activos.length,                                              color: 'text-orange-500' },
          { label: 'En cuarto frío',   value: completos.length,                                            color: 'text-teal-600'   },
          { label: 'Total',            value: grupos_arr.length,                                           color: 'text-gray-800'   },
          { label: 'Etapas activas',   value: procesamientos.filter(p => p.estado === 'EN_PROCESO').length, color: 'text-blue-600'   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Flujo informativo */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-teal-700">Flujo:</span>
          {ETAPAS.map((e, i) => (
            <span key={e} className="flex items-center gap-1">
              <span className="text-xs bg-white border border-teal-200 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                {ETAPA_CONFIG[e].label}
              </span>
              {i < ETAPAS.length - 1 && <ChevronRight size={12} className="text-teal-400" />}
            </span>
          ))}
          <ChevronRight size={12} className="text-teal-400" />
          <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full font-medium">
            📦 Cuarto Frío (Almacenamiento)
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">Cargando...</div>
      ) : grupos_arr.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <Fish size={40} className="mb-2 opacity-30" />
          <p>No hay procesamientos activos</p>
          <p className="text-xs mt-1">Se crean automáticamente al registrar una recepción</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activos.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                En proceso ({activos.length})
              </p>
              {activos.map(g => (
                <GrupoCard key={g.idRecepcion} grupo={g}
                  etapaActual={etapaActual(g)}
                  onAvanzar={abrirModal}
                  esUltimaEtapa={esUltimaEtapa} />
              ))}
            </>
          )}
          {completos.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4">
                Congelamiento completado — en Cuarto Frío ({completos.length})
              </p>
              {completos.map(g => (
                <GrupoCard key={g.idRecepcion} grupo={g}
                  etapaActual={null}
                  onAvanzar={abrirModal}
                  esUltimaEtapa={esUltimaEtapa}
                  completado />
              ))}
            </>
          )}
        </div>
      )}

      {/* Modal avanzar etapa */}
      {modalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                Completar: {ETAPA_CONFIG[modalData.etapa]?.label}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Recepción #{modalData.idRecepcion} · {modalData.nombreProductor} · {modalData.kilosRecibidos?.toFixed(1)} kg
              </p>
            </div>
            <form onSubmit={handleAvanzar} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Responsable *
                </label>
                <input type="text" value={form.responsable}
                  onChange={e => setForm({ ...form, responsable: e.target.value })}
                  placeholder="Nombre del encargado de esta etapa"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Observaciones
                </label>
                <textarea value={form.observaciones}
                  onChange={e => setForm({ ...form, observaciones: e.target.value })}
                  rows={3} placeholder="Condiciones, novedades de esta etapa..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              {/* Indicador de qué sigue */}
              {esUltimaEtapa(modalData.etapa) ? (
                <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 text-sm text-teal-800">
                  <p className="font-semibold mb-0.5">🧊 Última etapa de procesamiento</p>
                  <p>Al completar, el sistema creará automáticamente un lote en el{' '}
                    <strong>Cuarto Frío</strong> disponible para despacho desde Almacenamiento.</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
                  → Siguiente etapa:{' '}
                  <strong>
                    {ETAPA_CONFIG[ETAPAS[ETAPAS.indexOf(modalData.etapa) + 1]]?.label}
                  </strong>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalData(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
                  {guardando ? 'Guardando...' : esUltimaEtapa(modalData.etapa) ? 'Completar y enviar a Cuarto Frío' : 'Completar etapa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tarjeta por recepción ────────────────────────────────────────────────────

function GrupoCard({ grupo, etapaActual, onAvanzar, esUltimaEtapa, completado }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 ${completado ? 'border-teal-100' : 'border-gray-100'}`}>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${completado ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700'}`}>
            {grupo.nombreProductor?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">
                Recepción #{grupo.idRecepcion}
              </span>
              {completado && (
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                  📦 En Cuarto Frío
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {grupo.nombreProductor} · {grupo.kilosRecibidos?.toFixed(1)} kg
            </p>
          </div>
        </div>
        {etapaActual && (
          <button onClick={() => onAvanzar(etapaActual)}
            className={`text-sm text-white px-4 py-2 rounded-lg font-semibold transition-colors ${
              esUltimaEtapa(etapaActual.etapa)
                ? 'bg-teal-600 hover:bg-teal-700'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}>
            {esUltimaEtapa(etapaActual.etapa) ? '🧊 Completar y congelar' : 'Avanzar etapa'}
          </button>
        )}
      </div>

      {/* Pipeline */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {ETAPAS.map((etapa, idx) => {
          const cfg   = ETAPA_CONFIG[etapa]
          const Icono = cfg.icon
          const col   = COL[cfg.color]
          const reg   = grupo.etapas.find(e => e.etapa === etapa)
          const hecho  = reg?.estado === 'COMPLETADO'
          const activa = reg?.estado === 'EN_PROCESO'

          return (
            <div key={etapa} className="flex items-center gap-1 flex-shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                  ${hecho  ? 'bg-green-100 border-green-400' :
                    activa ? `${col.bg} ${col.border} ring-2 ring-offset-1 ${col.text}` :
                             'bg-gray-50 border-gray-200'}`}>
                  {hecho
                    ? <CheckCircle size={18} className="text-green-600" />
                    : <Icono size={18} className={activa ? col.icon : 'text-gray-300'} />}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap
                  ${hecho ? 'text-green-600' : activa ? col.text : 'text-gray-300'}`}>
                  {cfg.label}
                </span>
                {activa && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${col.badge}`}>
                    Activa
                  </span>
                )}
                {hecho && reg?.responsable && (
                  <span className="text-xs text-gray-400 max-w-[70px] text-center leading-tight">
                    {reg.responsable.split(' ')[0]}
                  </span>
                )}
              </div>

              {idx < ETAPAS.length - 1 ? (
                <ChevronRight size={14} className={`flex-shrink-0 mb-5 ${hecho ? 'text-green-400' : 'text-gray-200'}`} />
              ) : (
                // Flecha final hacia Cuarto Frío
                <div className="flex items-center gap-1 flex-shrink-0 mb-5">
                  <ChevronRight size={14} className={hecho ? 'text-teal-400' : 'text-gray-200'} />
                  <div className={`flex flex-col items-center gap-1`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      hecho ? 'bg-teal-100 border-teal-400' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <span className={`text-lg ${hecho ? '' : 'opacity-20'}`}>📦</span>
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${hecho ? 'text-teal-600' : 'text-gray-300'}`}>
                      Cuarto Frío
                    </span>
                    {hecho && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full border font-medium bg-teal-50 text-teal-700 border-teal-200">
                        Lote creado
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Procesamiento
