// src/pages/insumos/Insumos.jsx
import { useState, useEffect, useCallback } from 'react'
import {
  Package, ShoppingCart, ArrowUpDown, BarChart2,
  Plus, Edit2, XCircle, AlertTriangle, CheckCircle,
  Search, RefreshCw, X, ChevronDown, ArrowUp, ArrowDown
} from 'lucide-react'
import {
  getInsumos, createInsumo, updateInsumo, desactivarInsumo,
  getVentas, createVenta, marcarVentaPagada,
  getMovimientos, createMovimiento,
  getProductoresActivos
} from '../../services/insumoService'

// ── Constantes ────────────────────────────────────────────────
const TABS = [
  { id: 'inventario',   label: 'Inventario',   icon: Package },
  { id: 'ventas',       label: 'Ventas',       icon: ShoppingCart },
  { id: 'movimientos',  label: 'Movimientos',  icon: ArrowUpDown },
  { id: 'reportes',     label: 'Reportes',     icon: BarChart2 },
]

const TIPO_COLORS = {
  ALEVINO:     'bg-teal-100 text-teal-800',
  CONCENTRADO: 'bg-amber-100 text-amber-800',
  OTRO:        'bg-gray-100 text-gray-700',
}

const ESTADO_PAGO_COLORS = {
  PAGADO:    'bg-green-100 text-green-800',
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CREDITO:   'bg-blue-100 text-blue-800',
}

const MOV_COLORS = {
  ENTRADA: 'bg-green-100 text-green-800',
  SALIDA:  'bg-red-100 text-red-800',
  AJUSTE:  'bg-purple-100 text-purple-800',
}

// ── Rol del usuario ───────────────────────────────────────────
// El productor solo puede VER insumos — no crear, editar, vender ni mover.
// Tabs visibles para el productor: inventario y reportes (solo lectura).
const TABS_PRODUCTOR = ['inventario']

// ── Componente principal ──────────────────────────────────────
export default function Insumos() {
  // ── Identidad del usuario ───────────────────────────────────
  const rol         = localStorage.getItem('rol') || ''
  const esProductor = rol === 'ROLE_PRODUCTOR'
  const esContadora = rol === 'ROLE_CONTADORA'
  // La contadora solo puede ver — no crear, editar, vender ni mover
  const soloLectura = esProductor || esContadora

  const [tab, setTab]               = useState('inventario')
  const [insumos, setInsumos]       = useState([])
  const [ventas, setVentas]         = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [productores, setProductores] = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [busqueda, setBusqueda]     = useState('')

  // Modales (solo roles con permisos de escritura)
  const [modalInsumo, setModalInsumo]     = useState(null)
  const [modalVenta, setModalVenta]       = useState(false)
  const [modalMovimiento, setModalMovimiento] = useState(false)
  const [confirmDesactivar, setConfirmDesactivar] = useState(null)

  const bajoStock = insumos.filter(i => i.bajoStock && i.estado === 'ACTIVO')

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (esProductor) {
        // ── PRODUCTOR: solo carga insumos ───────────────────────────────
        const ins = await getInsumos()
        setInsumos(ins.data)
        setVentas([])
        setMovimientos([])
        setProductores([])
      } else if (esContadora) {
        // ── CONTADORA: carga insumos, ventas y movimientos (solo lectura)
        const [ins, vts, movs] = await Promise.all([
          getInsumos(), getVentas(), getMovimientos()
        ])
        setInsumos(ins.data)
        setVentas(vts.data)
        setMovimientos(movs.data)
        setProductores([])
      } else {
        // ── Resto de roles: carga todo en paralelo ───────────────────────
        const [ins, vts, movs, prods] = await Promise.all([
          getInsumos(),
          getVentas(),
          getMovimientos(),
          getProductoresActivos(),
        ])
        setInsumos(ins.data)
        setVentas(vts.data)
        setMovimientos(movs.data)
        setProductores(prods.data)
      }
    } catch {
      setError('No se pudo cargar la información. Verifica que el servidor esté activo.')
    } finally {
      setLoading(false)
    }
  }, [esProductor])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // Tabs visibles según rol
  const tabsVisibles = esProductor
    ? TABS.filter(t => TABS_PRODUCTOR.includes(t.id))
    : TABS

  // Si el tab activo no está disponible para el rol, resetear a inventario
  const tabActivo = esProductor && !TABS_PRODUCTOR.includes(tab) ? 'inventario' : tab

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo de Insumos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {esProductor
              ? 'Consulta el catálogo de insumos disponibles'
              : 'Inventario · Ventas · Movimientos · Reportes'}
          </p>
        </div>
        <button
          onClick={cargarDatos}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Alerta bajo stock — visible para todos */}
      {bajoStock.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {bajoStock.length} insumo{bajoStock.length > 1 ? 's' : ''} con stock bajo
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {bajoStock.map(i => i.nombre).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <XCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs — filtradas según rol */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabsVisibles.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tabActivo === id
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
            {id === 'inventario' && bajoStock.length > 0 && (
              <span className="bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {bajoStock.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido por tab */}
      {tabActivo === 'inventario' && (
        <TabInventario
          insumos={insumos}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          onCrear={soloLectura ? null : () => setModalInsumo('crear')}
          onEditar={soloLectura ? null : (ins) => setModalInsumo(ins)}
          onDesactivar={soloLectura ? null : (ins) => setConfirmDesactivar(ins)}
          loading={loading}
          esProductor={soloLectura}
        />
      )}
      {tabActivo === 'ventas' && !esProductor && (
        <TabVentas
          ventas={ventas}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          onNuevaVenta={esContadora ? null : () => setModalVenta(true)}
          onMarcarPagado={esContadora ? null : async (id) => {
            await marcarVentaPagada(id)
            cargarDatos()
          }}
          loading={loading}
        />
      )}
      {tabActivo === 'movimientos' && !esProductor && (
        <TabMovimientos
          movimientos={movimientos}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          onNuevoMovimiento={esContadora ? null : () => setModalMovimiento(true)}
          loading={loading}
        />
      )}
      {tabActivo === 'reportes' && (
        <TabReportes insumos={insumos} ventas={ventas} movimientos={movimientos} />
      )}

      {/* Modales — solo para roles con permisos */}
      {!esProductor && modalInsumo !== null && (
        <ModalInsumo
          insumo={modalInsumo === 'crear' ? null : modalInsumo}
          onClose={() => setModalInsumo(null)}
          onSave={async (data) => {
            if (modalInsumo === 'crear') await createInsumo(data)
            else await updateInsumo(modalInsumo.idInsumo, data)
            setModalInsumo(null)
            cargarDatos()
          }}
        />
      )}
      {!esProductor && modalVenta && (
        <ModalVenta
          insumos={insumos.filter(i => i.estado === 'ACTIVO')}
          productores={productores}
          onClose={() => setModalVenta(false)}
          onSave={async (data) => {
            await createVenta(data)
            setModalVenta(false)
            cargarDatos()
          }}
        />
      )}
      {!esProductor && modalMovimiento && (
        <ModalMovimiento
          insumos={insumos.filter(i => i.estado === 'ACTIVO')}
          onClose={() => setModalMovimiento(false)}
          onSave={async (data) => {
            await createMovimiento(data)
            setModalMovimiento(false)
            cargarDatos()
          }}
        />
      )}
      {!esProductor && confirmDesactivar && (
        <ModalConfirm
          mensaje={`¿Desactivar el insumo "${confirmDesactivar.nombre}"? No se eliminará, pero no estará disponible para ventas.`}
          onConfirm={async () => {
            await desactivarInsumo(confirmDesactivar.idInsumo)
            setConfirmDesactivar(null)
            cargarDatos()
          }}
          onCancel={() => setConfirmDesactivar(null)}
        />
      )}
    </div>
  )
}

// ── TAB: INVENTARIO ───────────────────────────────────────────
// esProductor: oculta botones de acción (crear, editar, desactivar)
function TabInventario({ insumos, busqueda, setBusqueda, onCrear, onEditar, onDesactivar, loading, esProductor }) {
  const filtrados = insumos.filter(i =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (i.codigo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    i.tipo.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código o tipo..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        {/* Botón "Nuevo Insumo" — oculto para el productor */}
        {!esProductor && onCrear && (
          <button
            onClick={onCrear}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={15} /> Nuevo Insumo
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonTable cols={esProductor ? 6 : 7} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Código</th>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-right px-4 py-3">Precio</th>
                <th className="text-right px-4 py-3">Stock</th>
                <th className="text-right px-4 py-3">Mín.</th>
                <th className="text-left px-4 py-3">Estado</th>
                {/* Columna de acciones — oculta para el productor */}
                {!esProductor && <th className="text-center px-4 py-3">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={esProductor ? 7 : 8} className="py-10 text-center text-gray-400 text-sm">
                    No hay insumos registrados
                  </td>
                </tr>
              ) : filtrados.map(ins => (
                <tr key={ins.idInsumo} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{ins.codigo || '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{ins.nombre}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${TIPO_COLORS[ins.tipo] || 'bg-gray-100 text-gray-700'}`}>
                      {ins.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    ${Number(ins.precioUnitario).toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${ins.bajoStock ? 'text-red-600' : 'text-gray-900'}`}>
                      {Number(ins.stockActual).toLocaleString('es-CO')}
                    </span>
                    {ins.bajoStock && <AlertTriangle size={12} className="inline ml-1 text-red-500" />}
                    <span className="text-gray-400 text-xs ml-1">{ins.unidadMedida}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs">
                    {Number(ins.stockMinimo).toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      ins.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {ins.estado}
                    </span>
                  </td>
                  {/* Acciones — ocultas para el productor */}
                  {!esProductor && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEditar(ins)}
                          className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        {ins.estado === 'ACTIVO' && (
                          <button
                            onClick={() => onDesactivar(ins)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Desactivar"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400 text-right">{filtrados.length} insumo(s)</p>
    </div>
  )
}

// ── TAB: VENTAS ───────────────────────────────────────────────
function TabVentas({ ventas, busqueda, setBusqueda, onNuevaVenta, onMarcarPagado, loading }) {
  const [expandido, setExpandido] = useState(null)

  const filtradas = ventas.filter(v =>
    (v.nombreProductor || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    String(v.idVentaInsumo).includes(busqueda)
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por productor o número..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        {onNuevaVenta && (
          <button
            onClick={onNuevaVenta}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={15} /> Nueva Venta
          </button>
        )}
      </div>

      {loading ? <SkeletonTable cols={5} /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Productor</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Pago</th>
                <th className="text-center px-4 py-3">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400 text-sm">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : filtradas.map(v => (
                <>
                  <tr key={v.idVentaInsumo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">#{v.idVentaInsumo}</td>
                    <td className="px-4 py-3 text-gray-700">{formatFecha(v.fecha)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{v.nombreProductor}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ${Number(v.total).toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADO_PAGO_COLORS[v.estadoPagado] || ''}`}>
                          {v.estadoPagado}
                        </span>
                        {v.estadoPagado !== 'PAGADO' && (
                          <button
                            onClick={() => onMarcarPagado(v.idVentaInsumo)}
                            className="text-xs text-teal-600 hover:underline"
                          >
                            Marcar pagado
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setExpandido(expandido === v.idVentaInsumo ? null : v.idVentaInsumo)}
                        className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        <ChevronDown size={14} className={`transition-transform ${expandido === v.idVentaInsumo ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>
                  {expandido === v.idVentaInsumo && v.items && (
                    <tr key={`exp-${v.idVentaInsumo}`}>
                      <td colSpan={6} className="px-4 pb-3 bg-gray-50">
                        <div className="rounded-lg border border-gray-200 overflow-hidden mt-1">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-gray-100 text-gray-500 uppercase">
                                <th className="text-left px-3 py-2">Insumo</th>
                                <th className="text-left px-3 py-2">Tipo</th>
                                <th className="text-right px-3 py-2">Cantidad</th>
                                <th className="text-right px-3 py-2">Precio unit.</th>
                                <th className="text-right px-3 py-2">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {v.items.map((it, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-2">{it.nombreInsumo}</td>
                                  <td className="px-3 py-2">
                                    <span className={`px-1.5 py-0.5 rounded text-xs ${TIPO_COLORS[it.tipo] || ''}`}>{it.tipo}</span>
                                  </td>
                                  <td className="px-3 py-2 text-right">{it.cantidad} {it.unidadMedida}</td>
                                  <td className="px-3 py-2 text-right">${Number(it.precioUnitario).toLocaleString('es-CO')}</td>
                                  <td className="px-3 py-2 text-right font-semibold">${Number(it.subtotal).toLocaleString('es-CO')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── TAB: MOVIMIENTOS ──────────────────────────────────────────
function TabMovimientos({ movimientos, busqueda, setBusqueda, onNuevoMovimiento, loading }) {
  const filtrados = movimientos.filter(m =>
    (m.nombreInsumo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    m.tipoMovimiento.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.motivo.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por insumo, tipo o motivo..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        {onNuevoMovimiento && (
          <button
            onClick={onNuevoMovimiento}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={15} /> Nuevo Movimiento
          </button>
        )}
      </div>

      {loading ? <SkeletonTable cols={7} /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-left px-4 py-3">Motivo</th>
                <th className="text-left px-4 py-3">Insumo</th>
                <th className="text-right px-4 py-3">Cantidad</th>
                <th className="text-right px-4 py-3">Stock antes</th>
                <th className="text-right px-4 py-3">Stock después</th>
                <th className="text-left px-4 py-3">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400 text-sm">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : filtrados.map(m => (
                <tr key={m.idMovimiento} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatFecha(m.fecha)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${MOV_COLORS[m.tipoMovimiento] || ''}`}>
                      {m.tipoMovimiento === 'ENTRADA' ? <ArrowDown size={11} /> : m.tipoMovimiento === 'SALIDA' ? <ArrowUp size={11} /> : null}
                      {m.tipoMovimiento}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{m.motivo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{m.nombreInsumo}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {Number(m.cantidad).toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {Number(m.stockAntes).toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {Number(m.stockDespues).toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{m.nombreUsuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── TAB: REPORTES ─────────────────────────────────────────────
function TabReportes({ insumos, ventas, movimientos }) {
  const activos         = insumos.filter(i => i.estado === 'ACTIVO')
  const bajoStockList   = activos.filter(i => i.bajoStock)
  const totalVentas     = ventas.reduce((s, v) => s + Number(v.total), 0)
  const ventasPendientes = ventas.filter(v => v.estadoPagado !== 'PAGADO').length
  const entradas        = movimientos.filter(m => m.tipoMovimiento === 'ENTRADA').length
  const salidas         = movimientos.filter(m => m.tipoMovimiento === 'SALIDA').length

  const cards = [
    { label: 'Insumos activos',        valor: activos.length,       sub: `${insumos.length} totales`,        color: 'border-teal-200 bg-teal-50',   texto: 'text-teal-700',   icono: Package,       alerta: false },
    { label: 'Bajo stock mínimo',      valor: bajoStockList.length, sub: bajoStockList.length > 0 ? '⚠ Requieren reabastecimiento' : '✓ Todo en orden', color: bajoStockList.length > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50', texto: bajoStockList.length > 0 ? 'text-red-700' : 'text-green-700', icono: AlertTriangle, alerta: bajoStockList.length > 0 },
    { label: 'Total ventas (COP)',      valor: `$${totalVentas.toLocaleString('es-CO')}`, sub: `${ventas.length} transacciones`, color: 'border-blue-200 bg-blue-50',   texto: 'text-blue-700',  icono: ShoppingCart,  alerta: false },
    { label: 'Ventas pendientes pago', valor: ventasPendientes,     sub: ventasPendientes > 0 ? 'Pendiente de cobro' : 'Todo cobrado', color: ventasPendientes > 0 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50', texto: ventasPendientes > 0 ? 'text-amber-700' : 'text-green-700', icono: XCircle, alerta: ventasPendientes > 0 },
    { label: 'Entradas al inventario', valor: entradas,             sub: 'Movimientos de entrada',           color: 'border-green-200 bg-green-50',  texto: 'text-green-700', icono: ArrowDown,     alerta: false },
    { label: 'Salidas del inventario', valor: salidas,              sub: 'Movimientos de salida',            color: 'border-purple-200 bg-purple-50', texto: 'text-purple-700', icono: ArrowUp,      alerta: false },
  ]

  return (
    <div className="space-y-6">

      {/* Alerta prominente si hay bajo stock */}
      {bajoStockList.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {bajoStockList.length} insumo{bajoStockList.length > 1 ? 's' : ''} bajo stock mínimo
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {bajoStockList.map(i => i.nombre).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* 6 tarjetas de indicadores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map(({ label, valor, sub, color, texto, icono: Ic, alerta }) => (
          <div key={label} className={`rounded-xl p-4 border ${color}`}>
            <div className={`flex items-center gap-2 mb-2 ${texto}`}>
              <Ic size={15} />
              <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${texto}`}>{valor}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabla de estado del inventario */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Estado actual del inventario</h3>
          <span className="text-xs text-gray-400">{activos.length} insumos activos</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3">Insumo</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-right px-4 py-3">Stock actual</th>
              <th className="text-right px-4 py-3">Mínimo</th>
              <th className="text-left px-4 py-3 w-32">Cobertura</th>
              <th className="text-left px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activos
              .sort((a, b) => (a.bajoStock ? -1 : 1) - (b.bajoStock ? -1 : 1))
              .map(i => {
                const pct = i.stockMinimo > 0
                  ? Math.min(100, Math.round((i.stockActual / i.stockMinimo) * 100))
                  : 100
                const critico = pct < 50
                const advertencia = pct >= 50 && pct <= 100
                return (
                  <tr key={i.idInsumo} className={i.bajoStock ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{i.nombre}</p>
                      {i.codigo && <p className="text-xs text-gray-400">{i.codigo}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_COLORS[i.tipo] || ''}`}>{i.tipo}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {Number(i.stockActual).toLocaleString('es-CO')}
                      <span className="text-gray-400 text-xs ml-1 font-normal">{i.unidadMedida}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {Number(i.stockMinimo).toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${critico ? 'bg-red-500' : advertencia ? 'bg-amber-400' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold w-8 text-right ${critico ? 'text-red-600' : advertencia ? 'text-amber-600' : 'text-green-600'}`}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {i.bajoStock
                        ? <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold"><AlertTriangle size={11} /> Bajo stock</span>
                        : <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold"><CheckCircle size={11} /> OK</span>
                      }
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
        {activos.length === 0 && (
          <div className="py-10 text-center text-gray-400 text-sm">Sin insumos activos registrados</div>
        )}
      </div>
    </div>
  )
}

// ── MODAL: CREAR / EDITAR INSUMO ──────────────────────────────
function ModalInsumo({ insumo, onClose, onSave }) {
  const [form, setForm] = useState({
    codigo:         insumo?.codigo         || '',
    nombre:         insumo?.nombre         || '',
    tipo:           insumo?.tipo           || 'ALEVINO',
    descripcion:    insumo?.descripcion    || '',
    precioUnitario: insumo?.precioUnitario || '',
    stockActual:    insumo?.stockActual    || '',
    stockMinimo:    insumo?.stockMinimo    || '',
    estado:         insumo?.estado         || 'ACTIVO',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)

  const handleSubmit = async () => {
    setSaving(true)
    setErr(null)
    try {
      await onSave(form)
    } catch (e) {
      setErr(e.response?.data?.mensaje || 'Error al guardar el insumo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper title={insumo ? 'Editar Insumo' : 'Nuevo Insumo'} onClose={onClose}>
      <div className="space-y-4">
        {err && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{err}</p>}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Código (opcional)">
            <input className={INPUT_CLS} value={form.codigo}
              onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="ALE-001" />
          </Field>
          <Field label="Tipo *">
            <select className={INPUT_CLS} value={form.tipo}
              onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              <option value="ALEVINO">ALEVINO</option>
              <option value="CONCENTRADO">CONCENTRADO</option>
              <option value="OTRO">OTRO</option>
            </select>
          </Field>
        </div>

        <Field label="Nombre *">
          <input className={INPUT_CLS} value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Cachama, Purina 40%…" />
        </Field>

        <Field label="Descripción">
          <input className={INPUT_CLS} value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Precio unitario (COP) *">
            <input type="number" className={INPUT_CLS} value={form.precioUnitario}
              onChange={e => setForm(f => ({ ...f, precioUnitario: e.target.value }))} />
          </Field>
          <Field label={`Stock actual (${form.tipo === 'CONCENTRADO' ? 'bultos' : 'unidades'}) *`}>
            <input type="number" className={INPUT_CLS} value={form.stockActual}
              onChange={e => setForm(f => ({ ...f, stockActual: e.target.value }))} />
          </Field>
          <Field label="Stock mínimo *">
            <input type="number" className={INPUT_CLS} value={form.stockMinimo}
              onChange={e => setForm(f => ({ ...f, stockMinimo: e.target.value }))} />
          </Field>
        </div>

        {insumo && (
          <Field label="Estado">
            <select className={INPUT_CLS} value={form.estado}
              onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </Field>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ── MODAL: NUEVA VENTA ────────────────────────────────────────
function ModalVenta({ insumos, productores, onClose, onSave }) {
  const [idProductor, setIdProductor] = useState('')
  const [estadoPagado, setEstadoPagado] = useState('PENDIENTE')
  const [items, setItems]             = useState([{ idInsumo: '', cantidad: 1 }])
  const [saving, setSaving]           = useState(false)
  const [err, setErr]                 = useState(null)

  const addItem    = () => setItems(it => [...it, { idInsumo: '', cantidad: 1 }])
  const removeItem = (i) => setItems(it => it.filter((_, idx) => idx !== i))
  const updateItem = (i, key, val) =>
    setItems(it => it.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const total = items.reduce((sum, it) => {
    const ins = insumos.find(i => String(i.idInsumo) === String(it.idInsumo))
    return sum + (ins ? Number(ins.precioUnitario) * Number(it.cantidad || 0) : 0)
  }, 0)

  const handleSave = async () => {
    setSaving(true)
    setErr(null)
    try {
      await onSave({
        idProductor: Number(idProductor),
        estadoPagado,
        items: items.map(it => ({ idInsumo: Number(it.idInsumo), cantidad: Number(it.cantidad) }))
      })
    } catch (e) {
      setErr(e.response?.data?.mensaje || 'Error al registrar la venta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper title="Nueva Venta de Insumos" onClose={onClose}>
      <div className="space-y-4">
        {err && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{err}</p>}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Productor *">
            <select className={INPUT_CLS} value={idProductor} onChange={e => setIdProductor(e.target.value)}>
              <option value="">Seleccionar…</option>
              {productores.map(p => (
                <option key={p.idProductor} value={p.idProductor}>
                  {p.nombre1} {p.apellido1}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estado de pago *">
            <select className={INPUT_CLS} value={estadoPagado} onChange={e => setEstadoPagado(e.target.value)}>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="CREDITO">CRÉDITO</option>
              <option value="PAGADO">PAGADO</option>
            </select>
          </Field>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Insumos</label>
            <button onClick={addItem} className="text-xs text-teal-600 hover:underline flex items-center gap-1">
              <Plus size={12} /> Agregar ítem
            </button>
          </div>
          {items.map((item, i) => {
            const ins = insumos.find(x => String(x.idInsumo) === String(item.idInsumo))
            const subtotal = ins ? Number(ins.precioUnitario) * Number(item.cantidad || 0) : 0
            return (
              <div key={i} className="flex gap-2 items-center bg-gray-50 rounded-lg p-2">
                <select
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  value={item.idInsumo}
                  onChange={e => updateItem(i, 'idInsumo', e.target.value)}
                >
                  <option value="">Seleccionar insumo…</option>
                  {insumos.map(ins => (
                    <option key={ins.idInsumo} value={ins.idInsumo}>
                      {ins.nombre} ({ins.tipo}) — Stock: {ins.stockActual} {ins.unidadMedida}
                    </option>
                  ))}
                </select>
                <input
                  type="number" min={1}
                  value={item.cantidad}
                  onChange={e => updateItem(i, 'cantidad', e.target.value)}
                  className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-xs text-gray-500 w-28 text-right">
                  ${subtotal.toLocaleString('es-CO')}
                </span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            )
          })}
          <div className="flex justify-end pt-1">
            <span className="text-sm font-semibold text-gray-900">
              Total: ${total.toLocaleString('es-CO')} COP
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !idProductor || items.some(it => !it.idInsumo)}
            className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? 'Registrando…' : 'Registrar Venta'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ── MODAL: NUEVO MOVIMIENTO ───────────────────────────────────
const MOTIVOS_ENTRADA = ['COMPRA', 'DONACION', 'AJUSTE_ADMIN', 'CORRECCION']
const MOTIVOS_SALIDA  = ['PERDIDA', 'DANO', 'AJUSTE_ADMIN']

function ModalMovimiento({ insumos, onClose, onSave }) {
  const [form, setForm] = useState({
    idInsumo: '', tipoMovimiento: 'ENTRADA', motivo: 'COMPRA', cantidad: '', observacion: ''
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)

  const motivos = form.tipoMovimiento === 'SALIDA' ? MOTIVOS_SALIDA : MOTIVOS_ENTRADA

  const handleSave = async () => {
    setSaving(true)
    setErr(null)
    try {
      await onSave({ ...form, idInsumo: Number(form.idInsumo), cantidad: Number(form.cantidad) })
    } catch (e) {
      setErr(e.response?.data?.mensaje || 'Error al registrar el movimiento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper title="Registrar Movimiento" onClose={onClose}>
      <div className="space-y-4">
        {err && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{err}</p>}

        <Field label="Insumo *">
          <select className={INPUT_CLS} value={form.idInsumo}
            onChange={e => setForm(f => ({ ...f, idInsumo: e.target.value }))}>
            <option value="">Seleccionar…</option>
            {insumos.map(i => (
              <option key={i.idInsumo} value={i.idInsumo}>
                {i.nombre} — Stock: {i.stockActual} {i.unidadMedida}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo de movimiento *">
            <select className={INPUT_CLS} value={form.tipoMovimiento}
              onChange={e => setForm(f => ({ ...f, tipoMovimiento: e.target.value, motivo: '' }))}>
              <option value="ENTRADA">ENTRADA</option>
              <option value="SALIDA">SALIDA</option>
              <option value="AJUSTE">AJUSTE</option>
            </select>
          </Field>
          <Field label="Motivo *">
            <select className={INPUT_CLS} value={form.motivo}
              onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}>
              <option value="">Seleccionar…</option>
              {motivos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        </div>

        <Field label={form.tipoMovimiento === 'AJUSTE' ? 'Nuevo stock total *' : 'Cantidad *'}>
          <input type="number" min={0.01} step={0.01} className={INPUT_CLS}
            value={form.cantidad}
            onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
        </Field>

        <Field label="Observación">
          <input className={INPUT_CLS} value={form.observacion}
            onChange={e => setForm(f => ({ ...f, observacion: e.target.value }))} />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.idInsumo || !form.motivo || !form.cantidad}
            className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? 'Registrando…' : 'Registrar'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ── COMPONENTES AUXILIARES ────────────────────────────────────
function ModalWrapper({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function ModalConfirm({ mensaje, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle size={22} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">{mensaje}</p>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onCancel} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}

function SkeletonTable({ cols }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-10 bg-gray-50 border-b border-gray-100" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-50">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-4 bg-gray-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

function formatFecha(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const INPUT_CLS = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white'
