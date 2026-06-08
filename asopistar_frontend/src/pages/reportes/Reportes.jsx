import { useState, useCallback } from 'react'
import {
  FileText, Filter, Download, Printer, Search,
  ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight,
  ChevronLeft, ChevronRight, X, RefreshCw, FileSpreadsheet,
  ClipboardList, BarChart2, Package, Truck, DollarSign, Calendar
} from 'lucide-react'
import api from '../../services/api'

// ─── CONFIGURACIÓN DE REPORTES ───────────────────────────────────────────────

const REPORTES_CONFIG = {
  recepciones: {
    label: 'Recepciones',
    icon: ClipboardList,
    endpoint: '/reportes/recepciones',
    color: 'teal',
    columnas: [
      { key: 'idRecepcion', label: '#', sortable: true },
      { key: 'fechaHora', label: 'Fecha y Hora', sortable: true, format: 'datetime' },
      { key: 'nombreProductor', label: 'Productor', sortable: true },
      { key: 'documentoProductor', label: 'Documento', sortable: false },
      { key: 'kilosRecibidos', label: 'Kg Recibidos', sortable: true, format: 'number' },
      { key: 'codigoLote', label: 'Lote', sortable: true },
      { key: 'observaciones', label: 'Observaciones', sortable: false },
    ],
    filtros: [
      { key: 'fechaInicio', label: 'Fecha inicio', type: 'date' },
      { key: 'fechaFin', label: 'Fecha fin', type: 'date' },
      { key: 'nombreProductor', label: 'Productor', type: 'text', placeholder: 'Buscar productor...' },
    ],
    totalKey: 'kilosRecibidos',
    totalLabel: 'Total Kg'
  },
  produccion: {
    label: 'Producción',
    icon: BarChart2,
    endpoint: '/reportes/produccion',
    color: 'blue',
    columnas: [
      { key: 'idSiembra', label: '#', sortable: true },
      { key: 'fechaSiembra', label: 'Fecha Siembra', sortable: true, format: 'date' },
      { key: 'nombreProductor', label: 'Productor', sortable: true },
      { key: 'nombreEspecie', label: 'Especie', sortable: true },
      { key: 'codigoEstanque', label: 'Estanque', sortable: true },
      { key: 'cantidadAlevinos', label: 'Alevinos', sortable: true, format: 'number' },
      { key: 'estado', label: 'Estado', sortable: true, format: 'badge' },
      { key: 'totalSeguimientos', label: 'Seguimientos', sortable: true },
      { key: 'aptoCosecha', label: 'Apto Cosecha', sortable: false, format: 'badge' },
    ],
    filtros: [
      { key: 'fechaInicio', label: 'Fecha inicio', type: 'date' },
      { key: 'fechaFin', label: 'Fecha fin', type: 'date' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['EN_CURSO', 'COSECHADO', 'PERDIDO'] },
      { key: 'nombreEspecie', label: 'Especie', type: 'text', placeholder: 'Nombre especie...' },
    ],
    totalKey: 'cantidadAlevinos',
    totalLabel: 'Total Alevinos'
  },
  lotes: {
    label: 'Lotes Cuarto Frío',
    icon: Package,
    endpoint: '/reportes/lotes',
    color: 'cyan',
    columnas: [
      { key: 'idLote', label: '#', sortable: true },
      { key: 'codigoLote', label: 'Código Lote', sortable: true },
      { key: 'fechaIngreso', label: 'Fecha Ingreso', sortable: true, format: 'datetime' },
      { key: 'nombreProductor', label: 'Productor', sortable: true },
      { key: 'kilos', label: 'Kilos', sortable: true, format: 'number' },
      { key: 'estadoLabel', label: 'Estado', sortable: true, format: 'badge' },
    ],
    filtros: [
      { key: 'fechaInicio', label: 'Fecha inicio', type: 'date' },
      { key: 'fechaFin', label: 'Fecha fin', type: 'date' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['DISPONIBLE', 'DESPACHADO'] },
    ],
    totalKey: 'kilos',
    totalLabel: 'Total Kg'
  },
  envios: {
    label: 'Envíos',
    icon: Truck,
    endpoint: '/reportes/envios',
    color: 'violet',
    columnas: [
      { key: 'idEnvio', label: '#', sortable: true },
      { key: 'fechaEnvio', label: 'Fecha', sortable: true, format: 'datetime' },
      { key: 'destinoNombre', label: 'Destino', sortable: true },
      { key: 'destinoCiudad', label: 'Ciudad', sortable: true },
      { key: 'tipoDestino', label: 'Tipo', sortable: true, format: 'badge' },
      { key: 'estado', label: 'Estado', sortable: true, format: 'badge' },
      { key: 'observaciones', label: 'Observaciones', sortable: false },
    ],
    filtros: [
      { key: 'fechaInicio', label: 'Fecha inicio', type: 'date' },
      { key: 'fechaFin', label: 'Fecha fin', type: 'date' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['PREPARADO', 'EN_CAMINO', 'ENTREGADO'] },
      { key: 'tipoDestino', label: 'Tipo destino', type: 'select', options: ['CLIENTE', 'PUNTO_VENTA'] },
    ],
    totalKey: null,
    totalLabel: null
  },
  pagos: {
    label: 'Pagos a Productores',
    icon: DollarSign,
    endpoint: '/reportes/pagos',
    color: 'emerald',
    columnas: [
      { key: 'idPago', label: '#', sortable: true },
      { key: 'fechaPago', label: 'Fecha', sortable: true, format: 'datetime' },
      { key: 'nombreProductor', label: 'Productor', sortable: true },
      { key: 'kilosPagados', label: 'Kg Pagados', sortable: true, format: 'number' },
      { key: 'precioKg', label: '$/Kg', sortable: true, format: 'currency' },
      { key: 'monto', label: 'Monto Total', sortable: true, format: 'currency' },
      { key: 'metodoPago', label: 'Método', sortable: true },
      { key: 'estado', label: 'Estado', sortable: true, format: 'badge' },
    ],
    filtros: [
      { key: 'fechaInicio', label: 'Fecha inicio', type: 'date' },
      { key: 'fechaFin', label: 'Fecha fin', type: 'date' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['PENDIENTE', 'PAGADO'] },
      { key: 'nombreProductor', label: 'Productor', type: 'text', placeholder: 'Buscar productor...' },
    ],
    totalKey: 'monto',
    totalLabel: 'Total Pagado',
    totalFormat: 'currency'
  },
  turnos: {
    label: 'Turnos de Pesca',
    icon: Calendar,
    endpoint: '/reportes/turnos',
    color: 'amber',
    columnas: [
      { key: 'idTurno', label: '#', sortable: true },
      { key: 'fechaProgramada', label: 'Fecha', sortable: true, format: 'date' },
      { key: 'nombreProductor', label: 'Productor', sortable: true },
      { key: 'codigoEstanque', label: 'Estanque', sortable: true },
      { key: 'cantidadAlevinos', label: 'Alevinos', sortable: true, format: 'number' },
      { key: 'tipoPrioridad', label: 'Prioridad', sortable: true, format: 'badge' },
      { key: 'estado', label: 'Estado', sortable: true, format: 'badge' },
    ],
    filtros: [
      { key: 'fechaInicio', label: 'Fecha inicio', type: 'date' },
      { key: 'fechaFin', label: 'Fecha fin', type: 'date' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['PENDIENTE', 'CONFIRMADO', 'REALIZADO', 'CANCELADO'] },
      { key: 'tipoPrioridad', label: 'Prioridad', type: 'select', options: ['NORMAL', 'EMERGENCIA'] },
    ],
    totalKey: null,
    totalLabel: null
  },
}

// ─── HELPERS DE FORMATO ──────────────────────────────────────────────────────

const formatValue = (value, format) => {
  if (value === null || value === undefined) return '—'
  switch (format) {
    case 'datetime':
      return new Date(value).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
    case 'date':
      return new Date(value + 'T00:00:00').toLocaleDateString('es-CO')
    case 'number':
      return Number(value).toLocaleString('es-CO')
    case 'decimal':
      return Number(value).toFixed(3)
    case 'currency':
      return `$${Number(value).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`
    default:
      return value
  }
}

const BADGE_STYLES = {
  EN_CURSO: 'bg-blue-100 text-blue-700',
  COSECHADO: 'bg-green-100 text-green-700',
  PERDIDO: 'bg-red-100 text-red-700',
  DISPONIBLE: 'bg-teal-100 text-teal-700',
  DESPACHADO: 'bg-gray-100 text-gray-600',
  PREPARADO: 'bg-yellow-100 text-yellow-700',
  EN_CAMINO: 'bg-blue-100 text-blue-700',
  ENTREGADO: 'bg-green-100 text-green-700',
  PENDIENTE: 'bg-orange-100 text-orange-700',
  PAGADO: 'bg-green-100 text-green-700',
  CONFIRMADO: 'bg-teal-100 text-teal-700',
  REALIZADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
  EMERGENCIA: 'bg-red-100 text-red-700',
  NORMAL: 'bg-gray-100 text-gray-600',
  CLIENTE: 'bg-violet-100 text-violet-700',
  PUNTO_VENTA: 'bg-cyan-100 text-cyan-700',
  Y: 'bg-green-100 text-green-700',
  N: 'bg-red-100 text-red-700',
}

const COLOR_MAP = {
  teal: { tab: 'bg-teal-600', badge: 'bg-teal-50 text-teal-700 border-teal-200', icon: 'text-teal-600' },
  blue: { tab: 'bg-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'text-blue-600' },
  cyan: { tab: 'bg-cyan-600', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: 'text-cyan-600' },
  violet: { tab: 'bg-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-200', icon: 'text-violet-600' },
  emerald: { tab: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'text-emerald-600' },
  amber: { tab: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'text-amber-600' },
}

// ─── EXPORT HELPERS ──────────────────────────────────────────────────────────

const exportCSV = (datos, columnas, nombreReporte) => {
  const headers = columnas.map(c => c.label).join(',')
  const rows = datos.map(row =>
    columnas.map(c => {
      const val = formatValue(row[c.key], c.format === 'badge' ? null : c.format)
      return `"${val}"`
    }).join(',')
  )
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nombreReporte}_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const exportPrint = (datos, columnas, nombreReporte, filtrosActivos) => {
  const filtroTexto = Object.entries(filtrosActivos)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' | ')

  const rows = datos.map(row =>
    `<tr>${columnas.map(c => `<td>${formatValue(row[c.key], c.format === 'badge' ? null : c.format)}</td>`).join('')}</tr>`
  ).join('')

  const html = `
    <html><head><title>${nombreReporte} - ASOPISTAR</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
      h2 { color: #0d9488; margin-bottom: 4px; }
      .meta { color: #666; font-size: 10px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #0d9488; color: white; padding: 6px 8px; text-align: left; font-size: 10px; }
      td { padding: 5px 8px; border-bottom: 1px solid #eee; }
      tr:nth-child(even) td { background: #f9fafb; }
    </style></head>
    <body>
      <h2>🐟 ASOPISTAR — ${nombreReporte}</h2>
      <p class="meta">Generado: ${new Date().toLocaleString('es-CO')} ${filtroTexto ? '| Filtros: ' + filtroTexto : ''}</p>
      <table>
        <thead><tr>${columnas.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="meta" style="margin-top:12px">Total registros: ${datos.length}</p>
    </body></html>`

  const w = window.open('', '_blank')
  w.document.write(html)
  w.document.close()
  w.print()
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

const ITEMS_POR_PAGINA = 15

function Reportes() {
  const rol = localStorage.getItem('rol') || ''

  // Reportes permitidos por rol
  const REPORTES_POR_ROL = {
    ROLE_GERENTE_PLANTA:    ['recepciones', 'produccion', 'lotes', 'envios', 'turnos'],
    ROLE_GERENTE_COMERCIAL: ['produccion', 'lotes', 'envios', 'turnos'],
  }
  const permitidos = REPORTES_POR_ROL[rol] ?? null  // null = todos (admin, contadora, etc.)

  const reportesVisibles = Object.fromEntries(
    Object.entries(REPORTES_CONFIG).filter(([key]) =>
      permitidos === null || permitidos.includes(key)
    )
  )

  const primerReporte = Object.keys(reportesVisibles)[0] || 'recepciones'
  const [reporteActivo, setReporteActivo] = useState(primerReporte)
  const [datos, setDatos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState({})
  const [busqueda, setBusqueda] = useState('')
  const [ordenCol, setOrdenCol] = useState(null)
  const [ordenDir, setOrdenDir] = useState('asc')
  const [pagina, setPagina] = useState(1)
  const [consultado, setConsultado] = useState(false)

  const config = REPORTES_CONFIG[reporteActivo]
  const colors = COLOR_MAP[config.color]

  const cambiarReporte = (key) => {
    setReporteActivo(key)
    setDatos([])
    setFiltros({})
    setBusqueda('')
    setOrdenCol(null)
    setPagina(1)
    setConsultado(false)
    setError(null)
  }

  const consultar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      )
      const res = await api.get(config.endpoint, { params })
      setDatos(res.data)
      setPagina(1)
      setConsultado(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al consultar el reporte.')
    } finally {
      setLoading(false)
    }
  }, [config.endpoint, filtros])

  const limpiarFiltros = () => {
    setFiltros({})
    setBusqueda('')
    setDatos([])
    setConsultado(false)
    setError(null)
  }

  // Filtrado por búsqueda rápida
  const datosFiltrados = datos.filter(row =>
    config.columnas.some(col => {
      const val = row[col.key]
      return val !== null && val !== undefined &&
        String(val).toLowerCase().includes(busqueda.toLowerCase())
    })
  )

  // Ordenamiento
  const datosOrdenados = [...datosFiltrados].sort((a, b) => {
    if (!ordenCol) return 0
    const va = a[ordenCol] ?? ''
    const vb = b[ordenCol] ?? ''
    if (va < vb) return ordenDir === 'asc' ? -1 : 1
    if (va > vb) return ordenDir === 'asc' ? 1 : -1
    return 0
  })

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(datosOrdenados.length / ITEMS_POR_PAGINA))
  const datosPagina = datosOrdenados.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA)

  const toggleOrden = (key) => {
    if (ordenCol === key) setOrdenDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setOrdenCol(key); setOrdenDir('asc') }
  }

  // Total
  const total = config.totalKey
    ? datosFiltrados.reduce((acc, r) => acc + (Number(r[config.totalKey]) || 0), 0)
    : null

  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
          <p className="text-gray-500 text-sm mt-0.5">Consulta, filtra y exporta información operativa de ASOPISTAR.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FileText size={14} />
          <span>{new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}</span>
        </div>
      </div>

      {/* Selector de reporte — tabs horizontales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1.5 flex flex-wrap gap-1">
        {Object.entries(reportesVisibles).map(([key, cfg]) => {
          const Icon = cfg.icon
          const cols = COLOR_MAP[cfg.color]
          const activo = reporteActivo === key
          return (
            <button
              key={key}
              onClick={() => cambiarReporte(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activo
                  ? `${cols.tab} text-white shadow-sm`
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Icon size={15} />
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Panel de filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={15} className={colors.icon} />
          <span className="text-sm font-semibold text-gray-700">Filtros</span>
          {Object.values(filtros).some(v => v) && (
            <button onClick={limpiarFiltros} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-500">
              <X size={13} /> Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {config.filtros.map(f => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
              {f.type === 'select' ? (
                <select
                  value={filtros[f.key] || ''}
                  onChange={e => setFiltros(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">Todos</option>
                  {f.options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                </select>
              ) : (
                <input
                  type={f.type}
                  value={filtros[f.key] || ''}
                  onChange={e => setFiltros(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder || ''}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <button
            onClick={consultar}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all ${colors.tab} hover:opacity-90 disabled:opacity-60`}
          >
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
            {loading ? 'Consultando...' : 'Consultar'}
          </button>

          {consultado && datos.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportCSV(datosFiltrados, config.columnas, config.label)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <FileSpreadsheet size={14} /> CSV
              </button>
              <button
                onClick={() => exportPrint(datosFiltrados, config.columnas, config.label, filtros)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <Printer size={14} /> Imprimir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center gap-2">
          <X size={16} /> {error}
        </div>
      )}

      {/* Estado vacío antes de consultar */}
      {!consultado && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
          <FileText size={40} strokeWidth={1.2} />
          <p className="text-sm font-medium">Aplica filtros y pulsa <span className="font-semibold text-gray-600">Consultar</span> para generar el reporte</p>
        </div>
      )}

      {/* Tabla de resultados */}
      {consultado && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Barra superior de tabla */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.badge}`}>
                {datosFiltrados.length} registros
              </span>
              {total !== null && (
                <span className="text-xs text-gray-500">
                  {config.totalLabel}:
                  <span className="font-semibold text-gray-800 ml-1">
                    {config.totalFormat === 'currency'
                      ? `$${total.toLocaleString('es-CO')}`
                      : total.toLocaleString('es-CO')}
                  </span>
                </span>
              )}
            </div>

            {/* Búsqueda rápida */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
                placeholder="Buscar en resultados..."
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 w-52"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            {datosPagina.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
                <FileText size={32} strokeWidth={1.2} />
                <p className="text-sm">Sin resultados para los filtros aplicados</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {config.columnas.map(col => (
                      <th
                        key={col.key}
                        onClick={() => col.sortable && toggleOrden(col.key)}
                        className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap
                          ${col.sortable ? 'cursor-pointer hover:text-gray-800 select-none' : ''}`}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.sortable && ordenCol === col.key && (
                            ordenDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {datosPagina.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      {config.columnas.map(col => {
                        const val = row[col.key]
                        if (col.format === 'badge') {
                          const label = val === 'Y' ? 'Sí' : val === 'N' ? 'No' : (val || '—').toString().replace(/_/g, ' ')
                          return (
                            <td key={col.key} className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[val] || 'bg-gray-100 text-gray-600'}`}>
                                {label}
                              </span>
                            </td>
                          )
                        }
                        return (
                          <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-xs truncate">
                            {formatValue(val, col.format)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Página {pagina} de {totalPaginas}
              </span>
              <div className="flex items-center gap-1">
                <PagBtn onClick={() => setPagina(1)} disabled={pagina === 1}><ChevronsLeft size={14} /></PagBtn>
                <PagBtn onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}><ChevronLeft size={14} /></PagBtn>
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  const start = Math.max(1, Math.min(pagina - 2, totalPaginas - 4))
                  const p = start + i
                  return (
                    <button
                      key={p}
                      onClick={() => setPagina(p)}
                      className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                        p === pagina ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
                <PagBtn onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}><ChevronRight size={14} /></PagBtn>
                <PagBtn onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}><ChevronsRight size={14} /></PagBtn>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Mini botón de paginación
function PagBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  )
}

export default Reportes
