import { useState, useCallback } from 'react'
import {
  FileText, Filter, Download, Printer, Search,
  ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight,
  ChevronLeft, ChevronRight, X, RefreshCw, FileSpreadsheet,
  ClipboardList, BarChart2, Package, Truck, DollarSign, Calendar,
  AlertTriangle
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

const BADGE_STYLE = {
  EN_CURSO:    { background: '#DBEAFE', color: '#1E40AF' },
  COSECHADO:   { background: '#D1FAE5', color: '#065F46' },
  PERDIDO:     { background: '#FEE2E2', color: '#991B1B' },
  DISPONIBLE:  { background: '#CCFBF1', color: '#0F766E' },
  DESPACHADO:  { background: '#F1F5F9', color: '#475569' },
  PREPARADO:   { background: '#FEF3C7', color: '#92400E' },
  EN_CAMINO:   { background: '#DBEAFE', color: '#1E40AF' },
  ENTREGADO:   { background: '#D1FAE5', color: '#065F46' },
  PENDIENTE:   { background: '#FFEDD5', color: '#9A3412' },
  PAGADO:      { background: '#D1FAE5', color: '#065F46' },
  CONFIRMADO:  { background: '#CCFBF1', color: '#0F766E' },
  REALIZADO:   { background: '#D1FAE5', color: '#065F46' },
  CANCELADO:   { background: '#FEE2E2', color: '#991B1B' },
  EMERGENCIA:  { background: '#FEE2E2', color: '#991B1B' },
  NORMAL:      { background: '#F1F5F9', color: '#475569' },
  CLIENTE:     { background: '#F3E8FF', color: '#6B21A8' },
  PUNTO_VENTA: { background: '#CFFAFE', color: '#164E63' },
  Y:           { background: '#D1FAE5', color: '#065F46' },
  N:           { background: '#FEE2E2', color: '#991B1B' },
}

// Color del módulo → tokens del design system
const COLOR_MAP = {
  teal:    { grad: 'linear-gradient(135deg, #14B8A6, #06B6D4)', bg: '#F0FDFA', color: '#0F766E', border: '#CCFBF1', solid: '#14B8A6' },
  blue:    { grad: 'linear-gradient(135deg, #3B82F6, #6366F1)', bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE', solid: '#3B82F6' },
  cyan:    { grad: 'linear-gradient(135deg, #06B6D4, #0EA5E9)', bg: '#ECFEFF', color: '#155E75', border: '#A5F3FC', solid: '#06B6D4' },
  violet:  { grad: 'linear-gradient(135deg, #8B5CF6, #A855F7)', bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE', solid: '#8B5CF6' },
  emerald: { grad: 'linear-gradient(135deg, #10B981, #059669)', bg: '#F0FDF4', color: '#065F46', border: '#A7F3D0', solid: '#10B981' },
  amber:   { grad: 'linear-gradient(135deg, #F59E0B, #EF4444)', bg: '#FFFBEB', color: '#92400E', border: '#FED7AA', solid: '#F59E0B' },
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

// ─── ANIMACIONES GLOBALES ────────────────────────────────────────────────────
const GLOBAL_STYLES = `
@keyframes rep-fade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rep-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
`

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

const ITEMS_POR_PAGINA = 15

function Reportes() {
  const rol = localStorage.getItem('rol') || ''

  // Reportes permitidos por rol
  const REPORTES_POR_ROL = {
    ROLE_GERENTE_PLANTA:    ['recepciones', 'produccion', 'lotes', 'envios', 'turnos'],
    ROLE_GERENTE_COMERCIAL: ['produccion', 'lotes', 'envios', 'turnos'],
    ROLE_CONTADORA:         ['recepciones', 'pagos'],
    ROLE_SECRETARIA:        ['recepciones', 'produccion', 'envios', 'turnos'],
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
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '24px' }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC, #EFF6FF)',
        border: '1px solid #E2E8F0', borderRadius: 16,
        padding: '24px 28px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16
      }}>
        <div style={{ position: 'absolute', top: -20, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(20,184,166,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 10, right: 30, width: 60, height: 60, borderRadius: '50%', background: 'rgba(6,182,212,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -15, right: 140, width: 80, height: 80, borderRadius: '50%', background: 'rgba(20,184,166,0.05)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
            boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={24} color="#fff" aria-hidden />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>Reportes</h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
              Consulta, filtra y exporta información operativa de ASOPISTAR
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
          <Calendar size={13} aria-hidden />
          <span>{new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}</span>
        </div>
      </div>

      {/* ── Tabs de reportes ────────────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14,
        padding: 8, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 6
      }}>
        {Object.entries(reportesVisibles).map(([key, cfg]) => {
          const Icon = cfg.icon
          const cols = COLOR_MAP[cfg.color]
          const activo = reporteActivo === key
          return (
            <button
              key={key}
              onClick={() => cambiarReporte(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 10,
                fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activo ? cols.grad : 'transparent',
                color: activo ? '#fff' : '#64748B',
                boxShadow: activo ? `0 4px 12px ${cols.solid}40` : 'none',
              }}
              onMouseEnter={e => { if (!activo) e.currentTarget.style.background = '#F8FAFC' }}
              onMouseLeave={e => { if (!activo) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={15} aria-hidden />
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* ── Panel de filtros ────────────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14,
        padding: '20px 22px', marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Filter size={15} color={colors.solid} aria-hidden />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Filtros</span>
          {Object.values(filtros).some(v => v) && (
            <button
              onClick={limpiarFiltros}
              style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 12, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#EF4444' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
            >
              <X size={13} aria-hidden /> Limpiar filtros
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {config.filtros.map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
                {f.label}
              </label>
              {f.type === 'select' ? (
                <select
                  value={filtros[f.key] || ''}
                  onChange={e => setFiltros(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '9px 12px', boxSizing: 'border-box',
                    border: '1.5px solid #E2E8F0', borderRadius: 9, background: '#FAFAFA',
                    fontSize: 13, color: '#0F172A', outline: 'none', cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
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
                  style={{
                    width: '100%', padding: '9px 12px', boxSizing: 'border-box',
                    border: '1.5px solid #E2E8F0', borderRadius: 9, background: '#FAFAFA',
                    fontSize: 13, color: '#0F172A', outline: 'none', transition: 'all 0.2s ease'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 18, paddingTop: 16, borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 12
        }}>
          <button
            onClick={consultar}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 10, border: 'none',
              fontSize: 13, fontWeight: 700, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
              background: colors.grad, opacity: loading ? 0.7 : 1,
              boxShadow: `0 4px 12px ${colors.solid}40`, transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {loading ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} aria-hidden /> : <Search size={15} aria-hidden />}
            {loading ? 'Consultando...' : 'Consultar'}
          </button>

          {consultado && datos.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => exportCSV(datosFiltrados, config.columnas, config.label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                  border: '1.5px solid #E2E8F0', background: '#FAFAFA', color: '#64748B',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#14B8A6'; e.currentTarget.style.color = '#14B8A6' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
              >
                <FileSpreadsheet size={14} aria-hidden /> CSV
              </button>
              <button
                onClick={() => exportPrint(datosFiltrados, config.columnas, config.label, filtros)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                  border: '1.5px solid #E2E8F0', background: '#FAFAFA', color: '#64748B',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#14B8A6'; e.currentTarget.style.color = '#14B8A6' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
              >
                <Printer size={14} aria-hidden /> Imprimir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14,
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20
        }}>
          <AlertTriangle size={17} color="#EF4444" aria-hidden />
          <span style={{ fontSize: 13, color: '#991B1B' }}>{error}</span>
        </div>
      )}

      {/* Estado vacío antes de consultar */}
      {!consultado && !loading && (
        <div style={{
          background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14,
          padding: '64px 24px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={28} color="#14B8A6" aria-hidden />
          </div>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0, maxWidth: 360 }}>
            Aplica filtros y pulsa <span style={{ fontWeight: 700, color: '#0F172A' }}>Consultar</span> para generar el reporte
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ height: 14, width: 140, background: '#F1F5F9', borderRadius: 6, animation: 'rep-pulse 1.4s ease infinite' }} />
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #F8FAFC', display: 'flex', gap: 16 }}>
              {[...Array(5)].map((_, j) => (
                <div key={j} style={{ height: 12, flex: 1, background: '#F1F5F9', borderRadius: 6, animation: 'rep-pulse 1.4s ease infinite', animationDelay: `${(i + j) * 0.04}s` }} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Tabla de resultados */}
      {consultado && !loading && (
        <div style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, overflow: 'hidden' }}>

          {/* Barra superior de tabla */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
                background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`
              }}>
                {datosFiltrados.length} registros
              </span>
              {total !== null && (
                <span style={{ fontSize: 12, color: '#64748B' }}>
                  {config.totalLabel}:
                  <span style={{ fontWeight: 700, color: '#0F172A', marginLeft: 4 }}>
                    {config.totalFormat === 'currency'
                      ? `$${total.toLocaleString('es-CO')}`
                      : total.toLocaleString('es-CO')}
                  </span>
                </span>
              )}
            </div>

            {/* Búsqueda rápida */}
            <div style={{ position: 'relative' }}>
              <Search size={13} color="#94A3B8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} aria-hidden />
              <input
                type="text"
                value={busqueda}
                onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
                placeholder="Buscar en resultados..."
                style={{
                  paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                  fontSize: 12, border: '1.5px solid #E2E8F0', borderRadius: 9,
                  background: '#FAFAFA', outline: 'none', width: 208, boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
                onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          {/* Tabla */}
          <div style={{ overflowX: 'auto' }}>
            {datosPagina.length === 0 ? (
              <div style={{
                padding: '60px 24px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 10
              }}>
                <FileText size={30} color="#CBD5E1" aria-hidden />
                <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>Sin resultados para los filtros aplicados</p>
              </div>
            ) : (
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAFBFC' }}>
                    {config.columnas.map(col => (
                      <th
                        key={col.key}
                        onClick={() => col.sortable && toggleOrden(col.key)}
                        style={{
                          padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                          color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em',
                          whiteSpace: 'nowrap', cursor: col.sortable ? 'pointer' : 'default',
                          userSelect: 'none', borderBottom: '1px solid #F1F5F9'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {col.label}
                          {col.sortable && ordenCol === col.key && (
                            ordenDir === 'asc' ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datosPagina.map((row, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: '1px solid #F8FAFC', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FAFBFC' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      {config.columnas.map(col => {
                        const val = row[col.key]
                        if (col.format === 'badge') {
                          const label = val === 'Y' ? 'Sí' : val === 'N' ? 'No' : (val || '—').toString().replace(/_/g, ' ')
                          const bs = BADGE_STYLE[val] || { background: '#F1F5F9', color: '#475569' }
                          return (
                            <td key={col.key} style={{ padding: '11px 16px' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '3px 10px', borderRadius: 99,
                                fontSize: 11, fontWeight: 700, ...bs
                              }}>
                                {label}
                              </span>
                            </td>
                          )
                        }
                        return (
                          <td key={col.key} style={{
                            padding: '11px 16px', color: '#334155', whiteSpace: 'nowrap',
                            maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis'
                          }}>
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
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 10
            }}>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>
                Página {pagina} de {totalPaginas}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <PagBtn onClick={() => setPagina(1)} disabled={pagina === 1}><ChevronsLeft size={14} aria-hidden /></PagBtn>
                <PagBtn onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}><ChevronLeft size={14} aria-hidden /></PagBtn>
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  const start = Math.max(1, Math.min(pagina - 2, totalPaginas - 4))
                  const p = start + i
                  const activo = p === pagina
                  return (
                    <button
                      key={p}
                      onClick={() => setPagina(p)}
                      style={{
                        width: 28, height: 28, borderRadius: 8, fontSize: 12, fontWeight: 700,
                        border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                        background: activo ? colors.grad : 'transparent',
                        color: activo ? '#fff' : '#64748B'
                      }}
                      onMouseEnter={e => { if (!activo) e.currentTarget.style.background = '#F1F5F9' }}
                      onMouseLeave={e => { if (!activo) e.currentTarget.style.background = 'transparent' }}
                    >
                      {p}
                    </button>
                  )
                })}
                <PagBtn onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}><ChevronRight size={14} aria-hidden /></PagBtn>
                <PagBtn onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}><ChevronsRight size={14} aria-hidden /></PagBtn>
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
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 28, height: 28, borderRadius: 8, border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#64748B', background: hov && !disabled ? '#F1F5F9' : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1, transition: 'all 0.2s ease'
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  )
}

export default Reportes
