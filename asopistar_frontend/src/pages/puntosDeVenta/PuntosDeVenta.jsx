// src/pages/puntosDeVenta/PuntosDeVenta.jsx
import { useState, useEffect, useMemo } from 'react'
import {
  Store, Plus, Search, X, MapPin, Phone, Mail,
  User, Edit3, ToggleLeft, ToggleRight, Eye,
  ChevronRight, Building2, Star, Clock, CheckCircle,
  AlertTriangle, Filter, BarChart2, Calendar
} from 'lucide-react'
import api from '../../services/api'

// ── Constantes ────────────────────────────────────────────────────────────────

const TIPOS = ['PROPIO', 'ALIADO', 'TEMPORAL']
const ESTADOS = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO']

const TIPO_CONFIG = {
  PROPIO:   { label: 'Propio',   cls: 'bg-teal-50 text-teal-700 border-teal-200',    dot: 'bg-teal-500'   },
  ALIADO:   { label: 'Aliado',   cls: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500'   },
  TEMPORAL: { label: 'Temporal', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500'  },
}

const ESTADO_CONFIG = {
  ACTIVO:     { label: 'Activo',     cls: 'bg-green-50 text-green-700 border-green-200',   dot: 'bg-green-500',  icon: CheckCircle  },
  INACTIVO:   { label: 'Inactivo',   cls: 'bg-gray-50 text-gray-500 border-gray-200',      dot: 'bg-gray-400',   icon: ToggleLeft   },
  SUSPENDIDO: { label: 'Suspendido', cls: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-500',    icon: AlertTriangle },
}

const DEPARTAMENTOS_CO = [
  'Amazonas','Antioquia','Arauca','Atlántico','Bolívar','Boyacá','Caldas','Caquetá',
  'Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca','Guainía','Guaviare',
  'Huila','La Guajira','Magdalena','Meta','Nariño','Norte de Santander','Putumayo',
  'Quindío','Risaralda','San Andrés y Providencia','Santander','Sucre','Tolima',
  'Valle del Cauca','Vaupés','Vichada',
]

// ── Sub-componentes ───────────────────────────────────────────────────────────

const BadgeTipo = ({ tipo }) => {
  const cfg = TIPO_CONFIG[tipo] || TIPO_CONFIG.PROPIO
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

const BadgeEstado = ({ estado }) => {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.INACTIVO
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

const StatCard = ({ label, value, sub, color }) => (
  <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm`}>
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
)

// ── FORMULARIO (crear / editar) ───────────────────────────────────────────────

function ModalFormulario({ punto, onClose, onGuardado }) {
  const editando = Boolean(punto)
  const [form, setForm] = useState({
    codigo:           punto?.codigo          || '',
    nombre:           punto?.nombre          || '',
    tipo:             punto?.tipo            || 'PROPIO',
    direccion:        punto?.direccion       || '',
    ciudad:           punto?.ciudad          || '',
    departamento:     punto?.departamento    || 'Norte de Santander',
    responsable:      punto?.responsable     || '',
    cargoResponsable: punto?.cargoResponsable|| '',
    telefono:         punto?.telefono        || '',
    correo:           punto?.correo          || '',
    fechaApertura:    punto?.fechaApertura   || '',
    observaciones:    punto?.observaciones   || '',
  })
  const [error,     setError]     = useState('')
  const [guardando, setGuardando] = useState(false)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleGuardar = async () => {
    setError('')
    if (!form.codigo)    { setError('El código es obligatorio.');             return }
    if (!form.nombre)    { setError('El nombre es obligatorio.');             return }
    if (!form.tipo)      { setError('Selecciona el tipo de punto de venta.'); return }
    if (!form.direccion) { setError('La dirección es obligatoria.');          return }
    if (!form.ciudad)    { setError('La ciudad es obligatoria.');             return }

    setGuardando(true)
    try {
      const payload = {
        ...form,
        codigo: form.codigo.toUpperCase(),
        fechaApertura: form.fechaApertura || null,
      }
      if (editando) {
        await api.put(`/puntos-venta/${punto.idPunto}`, payload)
      } else {
        await api.post('/puntos-venta', payload)
      }
      onGuardado()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Error al guardar.'
      setError(typeof msg === 'string' ? msg : 'Error al guardar.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {editando ? 'Editar Punto de Venta' : 'Nuevo Punto de Venta'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {editando ? `Editando: ${punto.nombre}` : 'Completa la información del nuevo punto.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Sección: Identificación */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Identificación
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Código <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.codigo}
                  onChange={e => set('codigo', e.target.value)}
                  placeholder="PV-001"
                  maxLength={15}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.nombre}
                  onChange={e => set('nombre', e.target.value)}
                  placeholder="Punto Centro El Tarra"
                  maxLength={40}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                />
              </div>
            </div>

            {/* Tipo */}
            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Tipo <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIPOS.map(t => {
                  const cfg = TIPO_CONFIG[t]
                  return (
                    <button key={t} onClick={() => set('tipo', t)}
                      className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        form.tipo === t
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-600 hover:border-teal-200 hover:bg-gray-50'
                      }`}>
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sección: Ubicación */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Ubicación
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.direccion}
                  onChange={e => set('direccion', e.target.value)}
                  placeholder="Calle 5 # 10-20, Barrio Centro"
                  maxLength={50}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Ciudad <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.ciudad}
                    onChange={e => set('ciudad', e.target.value)}
                    placeholder="El Tarra"
                    maxLength={30}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Departamento</label>
                  <select
                    value={form.departamento}
                    onChange={e => set('departamento', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200">
                    <option value="">Seleccionar...</option>
                    {DEPARTAMENTOS_CO.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Contacto */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Información de Contacto
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Responsable</label>
                <input
                  value={form.responsable}
                  onChange={e => set('responsable', e.target.value)}
                  placeholder="Nombre completo"
                  maxLength={60}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Cargo</label>
                <input
                  value={form.cargoResponsable}
                  onChange={e => set('cargoResponsable', e.target.value)}
                  placeholder="Administrador, Vendedor..."
                  maxLength={50}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={e => set('telefono', e.target.value)}
                  placeholder="300 000 0000"
                  maxLength={15}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Correo</label>
                <input
                  type="email"
                  value={form.correo}
                  onChange={e => set('correo', e.target.value)}
                  placeholder="punto@asopistar.com"
                  maxLength={60}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                />
              </div>
            </div>
          </div>

          {/* Sección: Operativo */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Información Operativa
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Fecha de apertura</label>
                <input
                  type="date"
                  value={form.fechaApertura}
                  onChange={e => set('fechaApertura', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Observaciones</label>
                <textarea
                  value={form.observaciones}
                  onChange={e => set('observaciones', e.target.value)}
                  rows={2}
                  maxLength={200}
                  placeholder="Notas adicionales sobre el punto de venta..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">{form.observaciones.length}/200</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={guardando}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors">
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear punto de venta'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MODAL DETALLE ─────────────────────────────────────────────────────────────

function ModalDetalle({ punto, onClose, onEditar, onCambiarEstado }) {
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  const handleEstado = async (nuevoEstado) => {
    setCambiandoEstado(true)
    try {
      await onCambiarEstado(punto.idPunto, nuevoEstado)
      onClose()
    } finally {
      setCambiandoEstado(false)
    }
  }

  const estadosCambiables = ESTADOS.filter(e => e !== punto.estado)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">

        {/* Header con color según tipo */}
        <div className={`px-6 py-5 rounded-t-2xl border-b ${
          punto.tipo === 'PROPIO' ? 'bg-teal-50 border-teal-100' :
          punto.tipo === 'ALIADO' ? 'bg-blue-50 border-blue-100' :
          'bg-amber-50 border-amber-100'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BadgeTipo tipo={punto.tipo} />
                <BadgeEstado estado={punto.estado} />
              </div>
              <h2 className="text-xl font-black text-gray-800">{punto.nombre}</h2>
              <p className="text-sm font-mono text-gray-500 mt-0.5">{punto.codigo}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/60 transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Ubicación */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={15} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Ubicación</p>
              <p className="text-sm text-gray-700 font-medium">{punto.direccion}</p>
              <p className="text-sm text-gray-500">
                {punto.ciudad}{punto.departamento ? `, ${punto.departamento}` : ''}
              </p>
            </div>
          </div>

          {/* Responsable */}
          {punto.responsable && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <User size={15} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Responsable</p>
                <p className="text-sm text-gray-700 font-medium">{punto.responsable}</p>
                {punto.cargoResponsable && (
                  <p className="text-sm text-gray-500">{punto.cargoResponsable}</p>
                )}
              </div>
            </div>
          )}

          {/* Contacto */}
          {(punto.telefono || punto.correo) && (
            <div className="grid grid-cols-2 gap-3">
              {punto.telefono && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                  <Phone size={14} className="text-teal-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Teléfono</p>
                    <p className="text-sm font-medium text-gray-700">{punto.telefono}</p>
                  </div>
                </div>
              )}
              {punto.correo && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                  <Mail size={14} className="text-teal-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Correo</p>
                    <p className="text-xs font-medium text-gray-700 truncate">{punto.correo}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fecha apertura */}
          {punto.fechaApertura && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <Calendar size={15} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Fecha de apertura</p>
                <p className="text-sm text-gray-700">{punto.fechaApertura}</p>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {punto.observaciones && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Observaciones</p>
              <p className="text-sm text-gray-600">{punto.observaciones}</p>
            </div>
          )}

          {/* Cambiar estado */}
          {estadosCambiables.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Cambiar estado</p>
              <div className="flex gap-2">
                {estadosCambiables.map(e => {
                  const cfg = ESTADO_CONFIG[e]
                  return (
                    <button key={e} onClick={() => handleEstado(e)} disabled={cambiandoEstado}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all disabled:opacity-50 ${cfg.cls}`}>
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cerrar
          </button>
          <button onClick={() => { onClose(); onEditar(punto) }}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            <Edit3 size={15} />
            Editar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export default function PuntosDeVenta() {
  const [puntos,        setPuntos]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [busqueda,      setBusqueda]      = useState('')
  const [filtroEstado,  setFiltroEstado]  = useState('TODOS')
  const [filtroTipo,    setFiltroTipo]    = useState('TODOS')
  const [modalForm,     setModalForm]     = useState(false)
  const [editando,      setEditando]      = useState(null)   // punto a editar
  const [detalle,       setDetalle]       = useState(null)   // punto en detalle
  const [toastMsg,      setToastMsg]      = useState('')

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      setLoading(true)
      const res = await api.get('/puntos-venta')
      setPuntos(res.data)
    } catch (err) {
      console.error('Error cargando puntos de venta:', err)
    } finally {
      setLoading(false)
    }
  }

  const mostrarToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleGuardado = () => {
    setModalForm(false)
    setEditando(null)
    cargar()
    mostrarToast(editando ? 'Punto de venta actualizado.' : 'Punto de venta creado correctamente.')
  }

  const handleCambiarEstado = async (id, nuevoEstado) => {
    await api.patch(`/puntos-venta/${id}/estado`, { estado: nuevoEstado })
    cargar()
    mostrarToast(`Estado cambiado a ${ESTADO_CONFIG[nuevoEstado]?.label}.`)
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      puntos.length,
    activos:    puntos.filter(p => p.estado === 'ACTIVO').length,
    propios:    puntos.filter(p => p.tipo === 'PROPIO').length,
    aliados:    puntos.filter(p => p.tipo === 'ALIADO').length,
    temporales: puntos.filter(p => p.tipo === 'TEMPORAL').length,
  }), [puntos])

  // ── Filtrado ───────────────────────────────────────────────────────────────
  const puntosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return puntos.filter(p => {
      const matchBusqueda = !q
        || p.nombre?.toLowerCase().includes(q)
        || p.codigo?.toLowerCase().includes(q)
        || p.ciudad?.toLowerCase().includes(q)
        || p.responsable?.toLowerCase().includes(q)
      const matchEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado
      const matchTipo   = filtroTipo   === 'TODOS' || p.tipo   === filtroTipo
      return matchBusqueda && matchEstado && matchTipo
    })
  }, [puntos, busqueda, filtroEstado, filtroTipo])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative">

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle size={16} className="text-teal-400" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Puntos de Venta</h1>
          <p className="text-gray-500 text-sm mt-1">
            Red comercial de ASOPISTAR — {stats.activos} activo{stats.activos !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditando(null); setModalForm(true) }}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nuevo punto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total"     value={stats.total}      color="text-gray-800" />
        <StatCard label="Activos"   value={stats.activos}    color="text-green-600"
          sub={`${stats.total - stats.activos} inactivo${stats.total - stats.activos !== 1 ? 's' : ''}`}
        />
        <StatCard label="Propios"   value={stats.propios}    color="text-teal-600" />
        <StatCard label="Aliados"   value={stats.aliados}    color="text-blue-600"
          sub={`${stats.temporales} temporal${stats.temporales !== 1 ? 'es' : ''}`}
        />
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, código, ciudad o responsable..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtro estado */}
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-gray-600">
            <option value="TODOS">Todos los estados</option>
            {ESTADOS.map(e => (
              <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>
            ))}
          </select>

          {/* Filtro tipo */}
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-gray-600">
            <option value="TODOS">Todos los tipos</option>
            {TIPOS.map(t => (
              <option key={t} value={t}>{TIPO_CONFIG[t].label}</option>
            ))}
          </select>
        </div>

        {(busqueda || filtroEstado !== 'TODOS' || filtroTipo !== 'TODOS') && (
          <p className="text-xs text-gray-400 mt-2 pl-1">
            Mostrando {puntosFiltrados.length} de {puntos.length} resultado{puntos.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Lista / tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Cargando puntos de venta...</span>
          </div>
        ) : puntosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Store size={36} className="text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">
              {puntos.length === 0 ? 'No hay puntos de venta registrados.' : 'Sin resultados para la búsqueda.'}
            </p>
            {puntos.length === 0 && (
              <button onClick={() => setModalForm(true)}
                className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-semibold">
                + Crear el primero
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Header tabla */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide">
              <div className="col-span-1">Código</div>
              <div className="col-span-3">Nombre</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-2">Ciudad</div>
              <div className="col-span-2">Responsable</div>
              <div className="col-span-1">Estado</div>
              <div className="col-span-1 text-right">Acción</div>
            </div>

            {/* Filas */}
            <div className="divide-y divide-gray-50">
              {puntosFiltrados.map(p => (
                <div key={p.idPunto}
                  className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors items-center cursor-pointer"
                  onClick={() => setDetalle(p)}>

                  {/* Código */}
                  <div className="col-span-12 md:col-span-1">
                    <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {p.codigo || '—'}
                    </span>
                  </div>

                  {/* Nombre */}
                  <div className="col-span-12 md:col-span-3">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{p.nombre}</p>
                    {p.direccion && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin size={10} className="shrink-0" />
                        {p.direccion}
                      </p>
                    )}
                  </div>

                  {/* Tipo */}
                  <div className="col-span-6 md:col-span-2">
                    <BadgeTipo tipo={p.tipo} />
                  </div>

                  {/* Ciudad */}
                  <div className="col-span-6 md:col-span-2">
                    <p className="text-sm text-gray-600">{p.ciudad}</p>
                    {p.departamento && (
                      <p className="text-xs text-gray-400">{p.departamento}</p>
                    )}
                  </div>

                  {/* Responsable */}
                  <div className="col-span-6 md:col-span-2">
                    {p.responsable ? (
                      <>
                        <p className="text-sm text-gray-700 font-medium">{p.responsable}</p>
                        {p.cargoResponsable && (
                          <p className="text-xs text-gray-400">{p.cargoResponsable}</p>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-300">Sin asignar</span>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="col-span-4 md:col-span-1">
                    <BadgeEstado estado={p.estado} />
                  </div>

                  {/* Acciones */}
                  <div className="col-span-2 md:col-span-1 flex justify-end gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); setEditando(p); setModalForm(true) }}
                      className="p-1.5 rounded-lg hover:bg-teal-50 hover:text-teal-600 text-gray-400 transition-colors"
                      title="Editar">
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setDetalle(p) }}
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

      {/* Modales */}
      {modalForm && (
        <ModalFormulario
          punto={editando}
          onClose={() => { setModalForm(false); setEditando(null) }}
          onGuardado={handleGuardado}
        />
      )}

      {detalle && (
        <ModalDetalle
          punto={detalle}
          onClose={() => setDetalle(null)}
          onEditar={(p) => { setEditando(p); setModalForm(true) }}
          onCambiarEstado={handleCambiarEstado}
        />
      )}
    </div>
  )
}
