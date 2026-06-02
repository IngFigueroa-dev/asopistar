// src/pages/clientes/Clientes.jsx
import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import {
  Building2, Plus, Search, Filter, X, Eye, Pencil,
  ChevronDown, ChevronUp, CheckCircle, XCircle, ShieldAlert,
  Phone, Mail, MapPin, CreditCard, User, Star, RefreshCw,
  TrendingUp, Users, AlertTriangle
} from 'lucide-react'

// ── Constantes de dominio ────────────────────────────────────────
const TIPOS_CLIENTE = ['DISTRIBUIDOR', 'PUNTO_DE_VENTA', 'EMPRESA', 'COMERCIALIZADORA', 'OTRO']
const TIPOS_DOCUMENTO = ['NIT', 'CC', 'CE', 'PASAPORTE']
const CLASIFICACIONES = ['PREFERENCIAL', 'ACTIVO', 'INACTIVO', 'BLOQUEADO']
const ESTADOS = ['ACTIVO', 'INACTIVO', 'BLOQUEADO']

const DEPARTAMENTOS_COL = [
  'Amazonas','Antioquia','Arauca','Atlántico','Bolívar','Boyacá','Caldas',
  'Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca',
  'Guainía','Guaviare','Huila','La Guajira','Magdalena','Meta','Nariño',
  'Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés y Providencia',
  'Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada'
]

// ── Helpers de presentación ──────────────────────────────────────
const TIPO_LABEL = {
  DISTRIBUIDOR: 'Distribuidor', PUNTO_DE_VENTA: 'Punto de Venta',
  EMPRESA: 'Empresa', COMERCIALIZADORA: 'Comercializadora', OTRO: 'Otro'
}
const TIPO_COLOR = {
  DISTRIBUIDOR:    'bg-blue-100 text-blue-700',
  PUNTO_DE_VENTA:  'bg-purple-100 text-purple-700',
  EMPRESA:         'bg-indigo-100 text-indigo-700',
  COMERCIALIZADORA:'bg-cyan-100 text-cyan-700',
  OTRO:            'bg-gray-100 text-gray-600'
}
const CLASI_COLOR = {
  PREFERENCIAL: 'bg-amber-100 text-amber-700',
  ACTIVO:       'bg-emerald-100 text-emerald-700',
  INACTIVO:     'bg-gray-100 text-gray-500',
  BLOQUEADO:    'bg-red-100 text-red-600'
}
const ESTADO_COLOR = {
  ACTIVO:   'bg-emerald-100 text-emerald-700',
  INACTIVO: 'bg-gray-100 text-gray-500',
  BLOQUEADO:'bg-red-100 text-red-600'
}
const ESTADO_ICON = {
  ACTIVO:   <CheckCircle size={12} />,
  INACTIVO: <XCircle size={12} />,
  BLOQUEADO:<ShieldAlert size={12} />
}

const fmtMoneda = (v) => v != null
  ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
  : '$0'

const fmtFecha = (s) => s
  ? new Date(s).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—'

// ── Formulario vacío ─────────────────────────────────────────────
const FORM_VACIO = {
  tipoDocumento: 'NIT', numeroDocumento: '', nit: '', razonSocial: '',
  tipoCliente: '', clasificacionComercial: 'ACTIVO',
  nombreContacto: '', cargoContacto: '',
  telefono: '', telefonoSecundario: '',
  correo: '', correoSecundario: '',
  direccion: '', ciudad: '', departamento: '',
  limiteCredito: '', observaciones: ''
}

// ════════════════════════════════════════════════════════════════
export default function Clientes() {
  const [clientes, setClientes]         = useState([])
  const [cargando, setCargando]         = useState(true)
  const [error, setError]               = useState(null)

  // Búsqueda y filtros
  const [busqueda, setBusqueda]         = useState('')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [filtros, setFiltros]           = useState({
    tipoCliente: '', estado: '', clasificacion: '', ciudad: ''
  })

  // Modales
  const [modalForm, setModalForm]       = useState(false)
  const [modalDetalle, setModalDetalle] = useState(null)
  const [clienteEdit, setClienteEdit]   = useState(null)

  // Formulario
  const [form, setForm]                 = useState(FORM_VACIO)
  const [erroresForm, setErroresForm]   = useState({})
  const [guardando, setGuardando]       = useState(false)

  // Estadísticas
  const [stats, setStats]               = useState(null)

  // ── Carga de datos ─────────────────────────────────────────────
  const cargarClientes = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await api.get('/clientes')
      setClientes(res.data)
    } catch {
      setError('No se pudieron cargar los clientes.')
    } finally {
      setCargando(false)
    }
  }, [])

  const cargarStats = useCallback(async () => {
    try {
      const res = await api.get('/clientes/resumen')
      setStats(res.data)
    } catch { /* silencioso */ }
  }, [])

  useEffect(() => {
    cargarClientes()
    cargarStats()
  }, [cargarClientes, cargarStats])

  // ── Filtrado en frontend ───────────────────────────────────────
  const clientesFiltrados = clientes.filter(c => {
    const q = busqueda.toLowerCase()
    const coincideBusqueda = !q ||
      c.razonSocial?.toLowerCase().includes(q) ||
      c.nit?.toLowerCase().includes(q) ||
      c.correo?.toLowerCase().includes(q) ||
      c.telefono?.includes(q) ||
      c.nombreContacto?.toLowerCase().includes(q)

    const coincideTipo   = !filtros.tipoCliente   || c.tipoCliente === filtros.tipoCliente
    const coincideEstado = !filtros.estado         || c.estado === filtros.estado
    const coincideClasi  = !filtros.clasificacion  || c.clasificacionComercial === filtros.clasificacion
    const coincideCiudad = !filtros.ciudad         ||
      c.ciudad?.toLowerCase().includes(filtros.ciudad.toLowerCase())

    return coincideBusqueda && coincideTipo && coincideEstado && coincideClasi && coincideCiudad
  })

  const hayFiltros = Object.values(filtros).some(Boolean)

  // ── Abrir formulario ───────────────────────────────────────────
  const abrirCrear = () => {
    setClienteEdit(null)
    setForm(FORM_VACIO)
    setErroresForm({})
    setModalForm(true)
  }

  const abrirEditar = (c) => {
    setClienteEdit(c)
    setForm({
      tipoDocumento:         c.tipoDocumento || 'NIT',
      numeroDocumento:       c.numeroDocumento || '',
      nit:                   c.nit || '',
      razonSocial:           c.razonSocial || '',
      tipoCliente:           c.tipoCliente || '',
      clasificacionComercial:c.clasificacionComercial || 'ACTIVO',
      nombreContacto:        c.nombreContacto || '',
      cargoContacto:         c.cargoContacto || '',
      telefono:              c.telefono || '',
      telefonoSecundario:    c.telefonoSecundario || '',
      correo:                c.correo || '',
      correoSecundario:      c.correoSecundario || '',
      direccion:             c.direccion || '',
      ciudad:                c.ciudad || '',
      departamento:          c.departamento || '',
      limiteCredito:         c.limiteCredito ?? '',
      observaciones:         c.observaciones || ''
    })
    setErroresForm({})
    setModalForm(true)
    setModalDetalle(null)
  }

  // ── Validación ─────────────────────────────────────────────────
  const validar = () => {
    const e = {}
    if (!form.tipoDocumento)    e.tipoDocumento    = 'Requerido'
    if (!form.numeroDocumento)  e.numeroDocumento  = 'Requerido'
    if (!form.nit)              e.nit              = 'Requerido'
    if (!form.razonSocial)      e.razonSocial      = 'Requerido'
    if (!form.tipoCliente)      e.tipoCliente      = 'Requerido'
    if (!form.nombreContacto)   e.nombreContacto   = 'Requerido'
    if (!form.cargoContacto)    e.cargoContacto    = 'Requerido'
    if (!form.telefono)         e.telefono         = 'Requerido'
    if (!form.correo)           e.correo           = 'Requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = 'Correo inválido'
    if (!form.direccion)        e.direccion        = 'Requerido'
    if (!form.ciudad)           e.ciudad           = 'Requerido'
    if (!form.departamento)     e.departamento     = 'Requerido'
    setErroresForm(e)
    return Object.keys(e).length === 0
  }

  // ── Guardar ────────────────────────────────────────────────────
  const guardar = async () => {
    if (!validar()) return
    setGuardando(true)
    try {
      const payload = {
        ...form,
        limiteCredito: form.limiteCredito !== '' ? parseFloat(form.limiteCredito) : 0,
        telefonoSecundario: form.telefonoSecundario || null,
        correoSecundario:   form.correoSecundario   || null,
        observaciones:      form.observaciones       || null
      }
      if (clienteEdit) {
        await api.put(`/clientes/${clienteEdit.idCliente}`, payload)
      } else {
        await api.post('/clientes', payload)
      }
      setModalForm(false)
      await cargarClientes()
      await cargarStats()
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar. Verifica los datos.'
      setErroresForm({ _global: msg })
    } finally {
      setGuardando(false)
    }
  }

  // ── Cambiar estado ─────────────────────────────────────────────
  const cambiarEstado = async (c, nuevoEstado) => {
    try {
      await api.patch(`/clientes/${c.idCliente}/estado?estado=${nuevoEstado}`)
      await cargarClientes()
      await cargarStats()
      if (modalDetalle?.idCliente === c.idCliente) {
        const r = await api.get(`/clientes/${c.idCliente}`)
        setModalDetalle(r.data)
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cambiar estado')
    }
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Encabezado ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-teal-600" size={26} />
            Clientes Empresariales
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gestión B2B — {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      {/* ── Tarjetas de estadísticas ────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users size={20} className="text-teal-600" />}
            label="Total" valor={stats.totalClientes} color="teal" />
          <StatCard icon={<CheckCircle size={20} className="text-emerald-600" />}
            label="Activos" valor={stats.activos} color="emerald" />
          <StatCard icon={<Star size={20} className="text-amber-500" />}
            label="Preferenciales" valor={stats.preferenciales} color="amber" />
          <StatCard icon={<ShieldAlert size={20} className="text-red-500" />}
            label="Bloqueados" valor={stats.bloqueados} color="red" />
        </div>
      )}

      {/* ── Barra de búsqueda y filtros ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por razón social, NIT, correo, teléfono o contacto…"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              hayFiltros
                ? 'bg-teal-50 border-teal-300 text-teal-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={15} />
            Filtros
            {hayFiltros && <span className="bg-teal-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {Object.values(filtros).filter(Boolean).length}
            </span>}
            {filtrosAbiertos ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={() => { cargarClientes(); cargarStats() }}
            className="p-2.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors" title="Recargar">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Panel de filtros */}
        {filtrosAbiertos && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
            <Select label="Tipo de cliente" value={filtros.tipoCliente}
              onChange={v => setFiltros(f => ({ ...f, tipoCliente: v }))}
              options={TIPOS_CLIENTE.map(t => ({ value: t, label: TIPO_LABEL[t] }))} />
            <Select label="Estado" value={filtros.estado}
              onChange={v => setFiltros(f => ({ ...f, estado: v }))}
              options={ESTADOS.map(e => ({ value: e, label: e }))} />
            <Select label="Clasificación" value={filtros.clasificacion}
              onChange={v => setFiltros(f => ({ ...f, clasificacion: v }))}
              options={CLASIFICACIONES.map(c => ({ value: c, label: c }))} />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ciudad</label>
              <input value={filtros.ciudad}
                onChange={e => setFiltros(f => ({ ...f, ciudad: e.target.value }))}
                placeholder="Ej: Cúcuta"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            {hayFiltros && (
              <button onClick={() => setFiltros({ tipoCliente: '', estado: '', clasificacion: '', ciudad: '' })}
                className="col-span-full text-xs text-teal-600 hover:text-teal-800 font-medium text-left">
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Tabla ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {cargando ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw size={20} className="animate-spin mr-2" /> Cargando clientes…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500 gap-2">
            <AlertTriangle size={18} /> {error}
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Building2 size={40} className="mb-3 opacity-30" />
            <p className="font-medium">No se encontraron clientes</p>
            <p className="text-sm mt-1">Ajusta la búsqueda o crea uno nuevo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Empresa / NIT','Tipo','Contacto','Ciudad','Clasificación','Estado','Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientesFiltrados.map(c => (
                  <tr key={c.idCliente} className="hover:bg-gray-50 transition-colors">

                    {/* Empresa */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 leading-tight">{c.razonSocial}</div>
                      <div className="text-xs text-gray-400 mt-0.5">NIT: {c.nit}</div>
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_COLOR[c.tipoCliente] || 'bg-gray-100 text-gray-600'}`}>
                        {TIPO_LABEL[c.tipoCliente] || c.tipoCliente}
                      </span>
                    </td>

                    {/* Contacto */}
                    <td className="px-4 py-3">
                      <div className="text-gray-800 font-medium">{c.nombreContacto}</div>
                      <div className="text-xs text-gray-400">{c.cargoContacto}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{c.telefono}</div>
                    </td>

                    {/* Ciudad */}
                    <td className="px-4 py-3 text-gray-600">{c.ciudad}</td>

                    {/* Clasificación */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CLASI_COLOR[c.clasificacionComercial] || ''}`}>
                        {c.clasificacionComercial === 'PREFERENCIAL' && <Star size={10} />}
                        {c.clasificacionComercial}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[c.estado] || ''}`}>
                        {ESTADO_ICON[c.estado]}
                        {c.estado}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModalDetalle(c)}
                          className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Ver detalle">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => abrirEditar(c)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <Pencil size={15} />
                        </button>
                        {c.estado === 'ACTIVO' ? (
                          <button onClick={() => cambiarEstado(c, 'INACTIVO')}
                            className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Desactivar">
                            <XCircle size={15} />
                          </button>
                        ) : (
                          <button onClick={() => cambiarEstado(c, 'ACTIVO')}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Activar">
                            <CheckCircle size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 bg-gray-50">
              Mostrando {clientesFiltrados.length} de {clientes.length} clientes
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Formulario ──────────────────────────────────── */}
      {modalForm && (
        <ModalOverlay onClose={() => setModalForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={20} className="text-teal-600" />
                {clienteEdit ? 'Editar Cliente' : 'Nuevo Cliente Empresarial'}
              </h2>
              <button onClick={() => setModalForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {erroresForm._global && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {erroresForm._global}
                </div>
              )}

              {/* Sección 1: Identificación */}
              <Seccion titulo="Identificación Empresarial">
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="Tipo de documento *" error={erroresForm.tipoDocumento}>
                    <select value={form.tipoDocumento}
                      onChange={e => setForm(f => ({ ...f, tipoDocumento: e.target.value }))}
                      className={inputCls(erroresForm.tipoDocumento)}>
                      {TIPOS_DOCUMENTO.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Campo>
                  <Campo label="Número de documento *" error={erroresForm.numeroDocumento}>
                    <input value={form.numeroDocumento}
                      onChange={e => setForm(f => ({ ...f, numeroDocumento: e.target.value }))}
                      placeholder="Ej: 900123456"
                      className={inputCls(erroresForm.numeroDocumento)} />
                  </Campo>
                  <Campo label="NIT *" error={erroresForm.nit}>
                    <input value={form.nit}
                      onChange={e => setForm(f => ({ ...f, nit: e.target.value }))}
                      placeholder="Ej: 900123456-1"
                      className={inputCls(erroresForm.nit)} />
                  </Campo>
                  <Campo label="Razón social *" error={erroresForm.razonSocial}>
                    <input value={form.razonSocial}
                      onChange={e => setForm(f => ({ ...f, razonSocial: e.target.value }))}
                      placeholder="Nombre legal de la empresa"
                      className={inputCls(erroresForm.razonSocial)} />
                  </Campo>
                  <Campo label="Tipo de cliente *" error={erroresForm.tipoCliente}>
                    <select value={form.tipoCliente}
                      onChange={e => setForm(f => ({ ...f, tipoCliente: e.target.value }))}
                      className={inputCls(erroresForm.tipoCliente)}>
                      <option value="">Seleccionar…</option>
                      {TIPOS_CLIENTE.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
                    </select>
                  </Campo>
                  <Campo label="Clasificación comercial">
                    <select value={form.clasificacionComercial}
                      onChange={e => setForm(f => ({ ...f, clasificacionComercial: e.target.value }))}
                      className={inputCls()}>
                      {CLASIFICACIONES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Campo>
                </div>
              </Seccion>

              {/* Sección 2: Contacto */}
              <Seccion titulo="Contacto Principal">
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="Nombre del contacto *" error={erroresForm.nombreContacto}>
                    <input value={form.nombreContacto}
                      onChange={e => setForm(f => ({ ...f, nombreContacto: e.target.value }))}
                      placeholder="Nombre completo"
                      className={inputCls(erroresForm.nombreContacto)} />
                  </Campo>
                  <Campo label="Cargo *" error={erroresForm.cargoContacto}>
                    <input value={form.cargoContacto}
                      onChange={e => setForm(f => ({ ...f, cargoContacto: e.target.value }))}
                      placeholder="Ej: Gerente de Compras"
                      className={inputCls(erroresForm.cargoContacto)} />
                  </Campo>
                  <Campo label="Teléfono *" error={erroresForm.telefono}>
                    <input value={form.telefono}
                      onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                      placeholder="3001234567"
                      className={inputCls(erroresForm.telefono)} />
                  </Campo>
                  <Campo label="Teléfono secundario">
                    <input value={form.telefonoSecundario}
                      onChange={e => setForm(f => ({ ...f, telefonoSecundario: e.target.value }))}
                      placeholder="Opcional"
                      className={inputCls()} />
                  </Campo>
                  <Campo label="Correo electrónico *" error={erroresForm.correo}>
                    <input type="email" value={form.correo}
                      onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
                      placeholder="empresa@correo.com"
                      className={inputCls(erroresForm.correo)} />
                  </Campo>
                  <Campo label="Correo secundario">
                    <input type="email" value={form.correoSecundario}
                      onChange={e => setForm(f => ({ ...f, correoSecundario: e.target.value }))}
                      placeholder="Opcional"
                      className={inputCls()} />
                  </Campo>
                </div>
              </Seccion>

              {/* Sección 3: Ubicación */}
              <Seccion titulo="Ubicación">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Campo label="Dirección *" error={erroresForm.direccion}>
                      <input value={form.direccion}
                        onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                        placeholder="Calle, número, barrio"
                        className={inputCls(erroresForm.direccion)} />
                    </Campo>
                  </div>
                  <Campo label="Ciudad *" error={erroresForm.ciudad}>
                    <input value={form.ciudad}
                      onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))}
                      placeholder="Ej: Cúcuta"
                      className={inputCls(erroresForm.ciudad)} />
                  </Campo>
                  <Campo label="Departamento *" error={erroresForm.departamento}>
                    <select value={form.departamento}
                      onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))}
                      className={inputCls(erroresForm.departamento)}>
                      <option value="">Seleccionar…</option>
                      {DEPARTAMENTOS_COL.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </Campo>
                </div>
              </Seccion>

              {/* Sección 4: Comercial */}
              <Seccion titulo="Información Comercial">
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="Límite de crédito (COP)">
                    <input type="number" min="0" value={form.limiteCredito}
                      onChange={e => setForm(f => ({ ...f, limiteCredito: e.target.value }))}
                      placeholder="0"
                      className={inputCls()} />
                  </Campo>
                  <div className="col-span-2">
                    <Campo label="Observaciones">
                      <textarea value={form.observaciones}
                        onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                        rows={3} placeholder="Notas adicionales sobre el cliente…"
                        className={`${inputCls()} resize-none`} />
                    </Campo>
                  </div>
                </div>
              </Seccion>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setModalForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                {guardando ? <RefreshCw size={15} className="animate-spin" /> : null}
                {guardando ? 'Guardando…' : (clienteEdit ? 'Guardar cambios' : 'Crear cliente')}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── Modal Detalle ─────────────────────────────────────── */}
      {modalDetalle && (
        <ModalOverlay onClose={() => setModalDetalle(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header con color según estado */}
            <div className={`p-6 rounded-t-2xl ${
              modalDetalle.estado === 'BLOQUEADO' ? 'bg-red-50' :
              modalDetalle.clasificacionComercial === 'PREFERENCIAL' ? 'bg-amber-50' :
              'bg-teal-50'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{modalDetalle.razonSocial}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">NIT: {modalDetalle.nit}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_COLOR[modalDetalle.tipoCliente]}`}>
                      {TIPO_LABEL[modalDetalle.tipoCliente]}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CLASI_COLOR[modalDetalle.clasificacionComercial]}`}>
                      {modalDetalle.clasificacionComercial === 'PREFERENCIAL' && <Star size={10} />}
                      {modalDetalle.clasificacionComercial}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[modalDetalle.estado]}`}>
                      {ESTADO_ICON[modalDetalle.estado]} {modalDetalle.estado}
                    </span>
                  </div>
                </div>
                <button onClick={() => setModalDetalle(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Contacto */}
              <GrupoDetalle titulo="Contacto Principal">
                <DetalleItem icon={<User size={14} />}
                  label={`${modalDetalle.nombreContacto} — ${modalDetalle.cargoContacto}`} />
                <DetalleItem icon={<Phone size={14} />}
                  label={modalDetalle.telefonoSecundario
                    ? `${modalDetalle.telefono} / ${modalDetalle.telefonoSecundario}`
                    : modalDetalle.telefono} />
                <DetalleItem icon={<Mail size={14} />}
                  label={modalDetalle.correoSecundario
                    ? `${modalDetalle.correo} / ${modalDetalle.correoSecundario}`
                    : modalDetalle.correo} />
              </GrupoDetalle>

              {/* Ubicación */}
              <GrupoDetalle titulo="Ubicación">
                <DetalleItem icon={<MapPin size={14} />}
                  label={`${modalDetalle.direccion}, ${modalDetalle.ciudad}, ${modalDetalle.departamento}`} />
              </GrupoDetalle>

              {/* Comercial */}
              <GrupoDetalle titulo="Información Comercial">
                <DetalleItem icon={<CreditCard size={14} />}
                  label={`Límite de crédito: ${fmtMoneda(modalDetalle.limiteCredito)}`} />
                <DetalleItem icon={<TrendingUp size={14} />}
                  label={`Tipo de doc: ${modalDetalle.tipoDocumento} — ${modalDetalle.numeroDocumento}`} />
              </GrupoDetalle>

              {/* Historial placeholder */}
              <GrupoDetalle titulo="Historial Comercial">
                <p className="text-xs text-gray-400 italic">
                  Próximamente: envíos recibidos, total comprado y última operación.
                </p>
              </GrupoDetalle>

              {modalDetalle.observaciones && (
                <GrupoDetalle titulo="Observaciones">
                  <p className="text-sm text-gray-600">{modalDetalle.observaciones}</p>
                </GrupoDetalle>
              )}

              <p className="text-xs text-gray-400 text-right">
                Registrado el {fmtFecha(modalDetalle.fechaCreacion)}
                {modalDetalle.fechaActualizacion && ` · Actualizado ${fmtFecha(modalDetalle.fechaActualizacion)}`}
              </p>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex gap-2">
                {modalDetalle.estado === 'ACTIVO' ? (
                  <button onClick={() => cambiarEstado(modalDetalle, 'INACTIVO')}
                    className="text-xs px-3 py-1.5 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                    Desactivar
                  </button>
                ) : (
                  <button onClick={() => cambiarEstado(modalDetalle, 'ACTIVO')}
                    className="text-xs px-3 py-1.5 border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
                    Activar
                  </button>
                )}
                {modalDetalle.estado !== 'BLOQUEADO' && (
                  <button onClick={() => cambiarEstado(modalDetalle, 'BLOQUEADO')}
                    className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    Bloquear
                  </button>
                )}
              </div>
              <button onClick={() => abrirEditar(modalDetalle)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                <Pencil size={12} /> Editar
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  )
}

// ── Componentes auxiliares ───────────────────────────────────────

function ModalOverlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      {children}
    </div>
  )
}

function StatCard({ icon, label, valor, color }) {
  const colors = {
    teal:    'border-teal-200 bg-teal-50',
    emerald: 'border-emerald-200 bg-emerald-50',
    amber:   'border-amber-200 bg-amber-50',
    red:     'border-red-200 bg-red-50'
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold text-gray-900">{valor ?? '—'}</span>
      </div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">{titulo}</h3>
      {children}
    </div>
  )
}

function Campo({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function GrupoDetalle({ titulo, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{titulo}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function DetalleItem({ icon, label }) {
  return (
    <div className="flex items-start gap-2 text-sm text-gray-700">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <span className="break-all">{label}</span>
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
        <option value="">Todos</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

const inputCls = (error) =>
  `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white ${
    error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
  }`
