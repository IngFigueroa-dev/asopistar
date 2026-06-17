// src/pages/insumos/Insumos.jsx
import { useState, useEffect, useCallback } from 'react'
import {
  Package, ShoppingCart, ArrowUpDown, BarChart2,
  Plus, Edit2, XCircle, AlertTriangle, CheckCircle,
  Search, RefreshCw, X, ChevronDown, ArrowUp, ArrowDown,
  Fish, TrendingUp, DollarSign, Boxes
} from 'lucide-react'
import {
  getInsumos, createInsumo, updateInsumo, desactivarInsumo,
  getVentas, createVenta, marcarVentaPagada,
  getMovimientos, createMovimiento,
  getProductoresActivos
} from '../../services/insumoService'

// ── Constantes ─────────────────────────────────────────────────
const TABS = [
  { id: 'inventario',  label: 'Inventario',  icon: Package },
  { id: 'ventas',      label: 'Ventas',      icon: ShoppingCart },
  { id: 'movimientos', label: 'Movimientos', icon: ArrowUpDown },
  { id: 'reportes',    label: 'Reportes',    icon: BarChart2 },
]

const TIPO_COLORS = {
  ALEVINO:     { bg: '#CCFBF1', color: '#0F766E', label: 'Alevino' },
  CONCENTRADO: { bg: '#FEF3C7', color: '#92400E', label: 'Concentrado' },
  OTRO:        { bg: '#F1F5F9', color: '#475569', label: 'Otro' },
}

const ESTADO_PAGO = {
  PAGADO:    { bg: '#D1FAE5', color: '#065F46' },
  PENDIENTE: { bg: '#FEF3C7', color: '#92400E' },
  CREDITO:   { bg: '#DBEAFE', color: '#1E40AF' },
}

const MOV_STYLE = {
  ENTRADA: { bg: '#D1FAE5', color: '#065F46', icon: ArrowDown },
  SALIDA:  { bg: '#FEE2E2', color: '#991B1B', icon: ArrowUp   },
  AJUSTE:  { bg: '#EDE9FE', color: '#5B21B6', icon: ArrowUpDown },
}

const TABS_PRODUCTOR = ['inventario']

// ── Estilos reutilizables ──────────────────────────────────────
const inputBase = {
  width: '100%',
  fontSize: 13,
  border: '1.5px solid #E2E8F0',
  borderRadius: 9,
  padding: '8px 12px',
  background: '#FAFAFA',
  color: '#0F172A',
  outline: 'none',
  transition: 'all 0.2s ease',
}

// ── Componente principal ───────────────────────────────────────
export default function Insumos() {
  const rol         = localStorage.getItem('rol') || ''
  const esProductor = rol === 'ROLE_PRODUCTOR'
  const esContadora = rol === 'ROLE_CONTADORA'
  const soloLectura = esProductor || esContadora

  const [tab, setTab]                     = useState('inventario')
  const [insumos, setInsumos]             = useState([])
  const [ventas, setVentas]               = useState([])
  const [movimientos, setMovimientos]     = useState([])
  const [productores, setProductores]     = useState([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [busqueda, setBusqueda]           = useState('')
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
        const ins = await getInsumos()
        setInsumos(ins.data)
        setVentas([])
        setMovimientos([])
        setProductores([])
      } else if (esContadora) {
        const [ins, vts, movs] = await Promise.all([
          getInsumos(), getVentas(), getMovimientos()
        ])
        setInsumos(ins.data)
        setVentas(vts.data)
        setMovimientos(movs.data)
        setProductores([])
      } else {
        const [ins, vts, movs, prods] = await Promise.all([
          getInsumos(), getVentas(), getMovimientos(), getProductoresActivos(),
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

  const tabsVisibles = esProductor
    ? TABS.filter(t => TABS_PRODUCTOR.includes(t.id))
    : TABS

  const tabActivo = esProductor && !TABS_PRODUCTOR.includes(tab) ? 'inventario' : tab

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100%' }}>
      <style>{`
        @keyframes ins-fade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ins-modal-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ins-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .ins-card {
          animation: ins-fade 0.22s ease both;
          transition: all 0.2s ease;
        }
        .ins-card:hover {
          border-color: rgba(20,184,166,0.35) !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.07);
          transform: translateY(-2px);
        }
        .ins-btn-primary {
          background: linear-gradient(135deg, #14B8A6, #06B6D4);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(20,184,166,0.25);
        }
        .ins-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(20,184,166,0.4);
        }
        .ins-btn-outline {
          background: transparent;
          color: #64748B;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ins-btn-outline:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }
        .ins-input:focus {
          border-color: #14B8A6 !important;
          box-shadow: 0 0 0 3px rgba(20,184,166,0.12) !important;
          background: #fff !important;
        }
        .ins-tab-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          position: relative;
        }
        .ins-row:hover { background: #F8FAFC; }
        .ins-skeleton {
          animation: ins-pulse 1.4s ease infinite;
          background: #F1F5F9;
          border-radius: 6px;
        }
      `}</style>

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC, #EFF6FF)',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        animation: 'ins-fade 0.3s ease both',
      }}>
        {/* burbujas decorativas */}
        {[
          { w: 120, h: 120, top: -30, right: 60, opacity: 0.07 },
          { w: 80,  h: 80,  top: 20,  right: 20, opacity: 0.05 },
          { w: 50,  h: 50,  top: 60,  right: 160, opacity: 0.06 },
        ].map((b, i) => (
          <div key={i} aria-hidden style={{
            position: 'absolute', top: b.top, right: b.right,
            width: b.w, height: b.h, borderRadius: '50%',
            background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
            opacity: b.opacity, pointerEvents: 'none',
          }} />
        ))}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
              boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Package size={22} color="#fff" aria-hidden />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Módulo de Insumos
              </h1>
              <p style={{ fontSize: 13, color: '#64748B', margin: '3px 0 0', lineHeight: 1.4 }}>
                {esProductor
                  ? `${insumos.filter(i => i.estado === 'ACTIVO').length} insumos disponibles para consulta`
                  : `${insumos.length} insumos registrados · ${ventas.length} ventas · ${movimientos.length} movimientos`
                }
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={cargarDatos}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', fontSize: 13, fontWeight: 600,
                color: '#64748B', border: '1.5px solid #E2E8F0',
                borderRadius: 10, background: '#fff', cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden />
              Actualizar
            </button>
            {!soloLectura && (
              <button className="ins-btn-primary" onClick={() => setModalInsumo('crear')}>
                <Plus size={15} aria-hidden /> Nuevo Insumo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── ALERTA BAJO STOCK ───────────────────────────────── */}
      {bajoStock.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 18px',
          background: 'linear-gradient(135deg, #FFFBEB, #FFF7ED)',
          border: '1px solid #FED7AA',
          borderRadius: 12, marginBottom: 20,
          animation: 'ins-fade 0.25s ease both',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={16} color="#D97706" aria-hidden />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#92400E', margin: 0 }}>
              {bajoStock.length} insumo{bajoStock.length > 1 ? 's' : ''} con stock bajo — requieren reabastecimiento
            </p>
            <p style={{ fontSize: 12, color: '#B45309', margin: '3px 0 0' }}>
              {bajoStock.map(i => i.nombre).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: '#FEF2F2',
          border: '1px solid #FECACA', borderRadius: 12,
          fontSize: 13, color: '#991B1B', marginBottom: 20,
        }}>
          <XCircle size={15} aria-hidden /> {error}
        </div>
      )}

      {/* ── TABS ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 4,
        background: '#F1F5F9', padding: 4, borderRadius: 12,
        width: 'fit-content', marginBottom: 24,
      }}>
        {tabsVisibles.map(({ id, label, icon: Icon }) => {
          const activo = tabActivo === id
          return (
            <button
              key={id}
              className="ins-tab-btn"
              onClick={() => { setTab(id); setBusqueda('') }}
              style={{
                background: activo ? '#fff' : 'transparent',
                color: activo ? '#0F766E' : '#64748B',
                boxShadow: activo ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                fontWeight: activo ? 700 : 500,
              }}
            >
              <Icon size={14} aria-hidden />
              {label}
              {id === 'inventario' && bajoStock.length > 0 && (
                <span style={{
                  background: '#F59E0B', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  borderRadius: 999, width: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {bajoStock.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── CONTENIDO POR TAB ───────────────────────────────── */}
      {tabActivo === 'inventario' && (
        <TabInventario
          insumos={insumos}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          onCrear={soloLectura ? null : () => setModalInsumo('crear')}
          onEditar={soloLectura ? null : (ins) => setModalInsumo(ins)}
          onDesactivar={soloLectura ? null : (ins) => setConfirmDesactivar(ins)}
          loading={loading}
          soloLectura={soloLectura}
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

      {/* ── MODALES ─────────────────────────────────────────── */}
      {!soloLectura && modalInsumo !== null && (
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
      {!soloLectura && modalVenta && (
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
      {!soloLectura && modalMovimiento && (
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
      {!soloLectura && confirmDesactivar && (
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
function TabInventario({ insumos, busqueda, setBusqueda, onCrear, onEditar, onDesactivar, loading, soloLectura }) {
  const filtrados = insumos.filter(i =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (i.codigo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    i.tipo.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading) return <SkeletonInventario />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Barra de búsqueda */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color="#94A3B8" aria-hidden style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="ins-input"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código o tipo…"
            style={{ ...inputBase, paddingLeft: 36, width: 280 }}
          />
        </div>
        {!soloLectura && onCrear && (
          <button className="ins-btn-primary" onClick={onCrear}>
            <Plus size={14} aria-hidden /> Nuevo Insumo
          </button>
        )}
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icono={<Package size={28} color="#14B8A6" />}
          titulo="No hay insumos registrados"
          subtitulo="Agrega el primer insumo para comenzar a gestionar el inventario"
          accion={!soloLectura && onCrear ? { label: '+ Nuevo Insumo', onClick: onCrear } : null}
        />
      ) : (
        <>
          {/* Grid de cards de insumos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}>
            {filtrados.map((ins, idx) => {
              const tipo = TIPO_COLORS[ins.tipo] || TIPO_COLORS.OTRO
              const pct = ins.stockMinimo > 0
                ? Math.min(100, Math.round((ins.stockActual / ins.stockMinimo) * 100))
                : 100
              const barColor = pct < 50 ? '#EF4444' : pct <= 100 ? '#F59E0B' : '#10B981'
              return (
                <div
                  key={ins.idInsumo}
                  className="ins-card"
                  style={{
                    background: '#fff',
                    border: `1px solid ${ins.bajoStock ? '#FCA5A5' : '#F1F5F9'}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                    animationDelay: `${idx * 0.04}s`,
                  }}
                >
                  {/* borde top */}
                  <div style={{
                    height: 3,
                    background: ins.bajoStock
                      ? 'linear-gradient(90deg, #EF4444, #F97316)'
                      : 'linear-gradient(90deg, #14B8A6, #06B6D4)',
                  }} />

                  <div style={{ padding: '14px 16px' }}>
                    {/* header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#94A3B8', margin: 0 }}>
                          {ins.codigo || '—'}
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '2px 0 0', lineHeight: 1.3 }}>
                          {ins.nombre}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 8px',
                          borderRadius: 999, background: tipo.bg, color: tipo.color,
                        }}>
                          {tipo.label}
                        </span>
                      </div>
                    </div>

                    {/* métrica principal: stock */}
                    <div style={{
                      background: ins.bajoStock ? '#FEF2F2' : '#F0FDFA',
                      borderRadius: 10, padding: '10px 12px', marginBottom: 10,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>Stock actual</p>
                          <p style={{ fontSize: 22, fontWeight: 900, color: ins.bajoStock ? '#EF4444' : '#14B8A6', margin: '1px 0 0', lineHeight: 1 }}>
                            {Number(ins.stockActual).toLocaleString('es-CO')}
                            <span style={{ fontSize: 12, fontWeight: 400, color: '#94A3B8', marginLeft: 4 }}>{ins.unidadMedida}</span>
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>Precio unit.</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '1px 0 0' }}>
                            ${Number(ins.precioUnitario).toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>

                      {/* barra de stock */}
                      <div style={{ marginTop: 8 }}>
                        <div style={{ height: 6, background: '#E2E8F0', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${Math.min(pct, 100)}%`,
                            background: barColor, borderRadius: 999,
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                          <span style={{ fontSize: 10, color: '#94A3B8' }}>Mín: {Number(ins.stockMinimo).toLocaleString('es-CO')}</span>
                          {ins.bajoStock && (
                            <span style={{ fontSize: 10, color: '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <AlertTriangle size={9} aria-hidden /> Bajo stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
                        background: ins.estado === 'ACTIVO' ? '#D1FAE5' : '#F1F5F9',
                        color: ins.estado === 'ACTIVO' ? '#065F46' : '#64748B',
                      }}>
                        {ins.estado === 'ACTIVO' ? '● Activo' : '○ Inactivo'}
                      </span>

                      {!soloLectura && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => onEditar(ins)}
                            title="Editar"
                            style={{
                              width: 30, height: 30, borderRadius: 8, border: '1.5px solid #E2E8F0',
                              background: '#fff', cursor: 'pointer', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s ease', color: '#64748B',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#14B8A6'; e.currentTarget.style.color = '#14B8A6' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
                          >
                            <Edit2 size={13} aria-hidden />
                          </button>
                          {ins.estado === 'ACTIVO' && (
                            <button
                              onClick={() => onDesactivar(ins)}
                              title="Desactivar"
                              style={{
                                width: 30, height: 30, borderRadius: 8, border: '1.5px solid #E2E8F0',
                                background: '#fff', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s ease', color: '#64748B',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
                            >
                              <XCircle size={13} aria-hidden />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'right' }}>{filtrados.length} insumo(s)</p>
        </>
      )}
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

  if (loading) return <SkeletonCards n={4} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color="#94A3B8" aria-hidden style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="ins-input"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por productor o número…"
            style={{ ...inputBase, paddingLeft: 36, width: 280 }}
          />
        </div>
        {onNuevaVenta && (
          <button className="ins-btn-primary" onClick={onNuevaVenta}>
            <Plus size={14} aria-hidden /> Nueva Venta
          </button>
        )}
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          icono={<ShoppingCart size={28} color="#14B8A6" />}
          titulo="No hay ventas registradas"
          subtitulo="Las ventas de insumos a productores aparecerán aquí"
          accion={onNuevaVenta ? { label: '+ Nueva Venta', onClick: onNuevaVenta } : null}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtradas.map((v, idx) => {
            const pago = ESTADO_PAGO[v.estadoPagado] || ESTADO_PAGO.PENDIENTE
            const abierto = expandido === v.idVentaInsumo
            return (
              <div
                key={v.idVentaInsumo}
                className="ins-card"
                style={{
                  background: '#fff',
                  border: '1px solid #F1F5F9',
                  borderRadius: 14,
                  overflow: 'hidden',
                  animationDelay: `${idx * 0.05}s`,
                }}
              >
                <div style={{ height: 3, background: 'linear-gradient(90deg, #14B8A6, #06B6D4)' }} />
                <div style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#0F766E',
                    }}>
                      {(v.nombreProductor || 'P')[0].toUpperCase()}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>{v.nombreProductor}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
                        #{v.idVentaInsumo} · {formatFecha(v.fecha)}
                      </p>
                    </div>
                    {/* Total */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                        ${Number(v.total).toLocaleString('es-CO')}
                      </p>
                      <p style={{ fontSize: 10, color: '#94A3B8', margin: '2px 0 0' }}>COP</p>
                    </div>
                    {/* Estado pago */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 10px',
                        borderRadius: 999, background: pago.bg, color: pago.color,
                      }}>
                        {v.estadoPagado}
                      </span>
                      {v.estadoPagado !== 'PAGADO' && onMarcarPagado && (
                        <button
                          onClick={() => onMarcarPagado(v.idVentaInsumo)}
                          style={{ fontSize: 11, color: '#14B8A6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Marcar pagado →
                        </button>
                      )}
                    </div>
                    {/* Toggle detalle */}
                    <button
                      onClick={() => setExpandido(abierto ? null : v.idVentaInsumo)}
                      style={{
                        width: 30, height: 30, borderRadius: 8, border: '1.5px solid #E2E8F0',
                        background: abierto ? '#F0FDFA' : '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: abierto ? '#14B8A6' : '#94A3B8', transition: 'all 0.2s ease',
                      }}
                    >
                      <ChevronDown size={14} aria-hidden style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                    </button>
                  </div>

                  {/* Detalle expandido */}
                  {abierto && v.items && (
                    <div style={{
                      marginTop: 14, borderTop: '1px solid #F1F5F9', paddingTop: 12,
                      animation: 'ins-fade 0.18s ease both',
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        Detalle de la venta
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {v.items.map((it, i) => {
                          const tipo = TIPO_COLORS[it.tipo] || TIPO_COLORS.OTRO
                          return (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              background: '#FAFBFC', borderRadius: 8, padding: '8px 12px',
                            }}>
                              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{it.nombreInsumo}</span>
                              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: tipo.bg, color: tipo.color }}>{it.tipo}</span>
                              <span style={{ fontSize: 12, color: '#64748B' }}>{it.cantidad} {it.unidadMedida}</span>
                              <span style={{ fontSize: 12, color: '#64748B' }}>${Number(it.precioUnitario).toLocaleString('es-CO')}/u</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', minWidth: 80, textAlign: 'right' }}>
                                ${Number(it.subtotal).toLocaleString('es-CO')}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
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

  if (loading) return <SkeletonCards n={5} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color="#94A3B8" aria-hidden style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="ins-input"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por insumo, tipo o motivo…"
            style={{ ...inputBase, paddingLeft: 36, width: 280 }}
          />
        </div>
        {onNuevoMovimiento && (
          <button className="ins-btn-primary" onClick={onNuevoMovimiento}>
            <Plus size={14} aria-hidden /> Nuevo Movimiento
          </button>
        )}
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icono={<ArrowUpDown size={28} color="#14B8A6" />}
          titulo="No hay movimientos registrados"
          subtitulo="Las entradas, salidas y ajustes de inventario aparecerán aquí"
          accion={onNuevoMovimiento ? { label: '+ Nuevo Movimiento', onClick: onNuevoMovimiento } : null}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtrados.map((m, idx) => {
            const mov = MOV_STYLE[m.tipoMovimiento] || MOV_STYLE.AJUSTE
            const MovIco = mov.icon
            return (
              <div
                key={m.idMovimiento}
                className="ins-card"
                style={{
                  background: '#fff',
                  border: '1px solid #F1F5F9',
                  borderRadius: 12, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                  animationDelay: `${idx * 0.03}s`,
                }}
              >
                {/* Tipo badge */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: mov.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MovIco size={16} color={mov.color} aria-hidden />
                </div>
                {/* Insumo y tipo */}
                <div style={{ flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{m.nombreInsumo}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{m.motivo}</p>
                </div>
                {/* Cantidad */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 16, fontWeight: 900, color: mov.color, margin: 0 }}>
                    {m.tipoMovimiento === 'ENTRADA' ? '+' : m.tipoMovimiento === 'SALIDA' ? '-' : ''}
                    {Number(m.cantidad).toLocaleString('es-CO')}
                  </p>
                  <p style={{ fontSize: 10, color: '#94A3B8', margin: '2px 0 0' }}>unidades</p>
                </div>
                {/* Antes / Después */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#94A3B8', background: '#F1F5F9', padding: '3px 8px', borderRadius: 6 }}>
                    {Number(m.stockAntes).toLocaleString('es-CO')}
                  </span>
                  <ArrowRight />
                  <span style={{ fontSize: 11, color: '#0F766E', background: '#CCFBF1', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                    {Number(m.stockDespues).toLocaleString('es-CO')}
                  </span>
                </div>
                {/* Fecha y usuario */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>{m.nombreUsuario}</p>
                  <p style={{ fontSize: 10, color: '#94A3B8', margin: '2px 0 0' }}>{formatFecha(m.fecha)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── TAB: REPORTES ─────────────────────────────────────────────
function TabReportes({ insumos, ventas, movimientos }) {
  const activos          = insumos.filter(i => i.estado === 'ACTIVO')
  const bajoStockList    = activos.filter(i => i.bajoStock)
  const totalVentas      = ventas.reduce((s, v) => s + Number(v.total), 0)
  const ventasPendientes = ventas.filter(v => v.estadoPagado !== 'PAGADO').length
  const entradas         = movimientos.filter(m => m.tipoMovimiento === 'ENTRADA').length
  const salidas          = movimientos.filter(m => m.tipoMovimiento === 'SALIDA').length

  const kpis = [
    { label: 'Insumos activos',    valor: activos.length,
      sub: `${insumos.length} totales`,
      bg: '#F0FDFA', color: '#0F766E', icono: Boxes },
    { label: 'Bajo stock mínimo',  valor: bajoStockList.length,
      sub: bajoStockList.length > 0 ? 'Requieren reabastecimiento' : '✓ Todo en orden',
      bg: bajoStockList.length > 0 ? '#FEF2F2' : '#F0FDF4',
      color: bajoStockList.length > 0 ? '#991B1B' : '#065F46', icono: AlertTriangle },
    { label: 'Ventas totales',     valor: `$${totalVentas.toLocaleString('es-CO')}`,
      sub: `${ventas.length} transacciones`,
      bg: '#EFF6FF', color: '#1E40AF', icono: DollarSign },
    { label: 'Pagos pendientes',   valor: ventasPendientes,
      sub: ventasPendientes > 0 ? 'Pendiente de cobro' : 'Todo cobrado',
      bg: ventasPendientes > 0 ? '#FFFBEB' : '#F0FDF4',
      color: ventasPendientes > 0 ? '#92400E' : '#065F46', icono: ShoppingCart },
    { label: 'Entradas registradas', valor: entradas,
      sub: 'Movimientos de entrada',
      bg: '#F0FDF4', color: '#065F46', icono: ArrowDown },
    { label: 'Salidas registradas',  valor: salidas,
      sub: 'Movimientos de salida',
      bg: '#FDF4FF', color: '#6B21A8', icono: TrendingUp },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {bajoStockList.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 18px',
          background: 'linear-gradient(135deg, #FEF2F2, #FFF1F2)',
          border: '1px solid #FECDD3', borderRadius: 12,
          animation: 'ins-fade 0.25s ease both',
        }}>
          <AlertTriangle size={18} color="#EF4444" aria-hidden />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#991B1B', margin: 0 }}>
              {bajoStockList.length} insumo{bajoStockList.length > 1 ? 's' : ''} bajo stock mínimo
            </p>
            <p style={{ fontSize: 12, color: '#B91C1C', margin: '3px 0 0' }}>
              {bajoStockList.map(i => i.nombre).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {kpis.map(({ label, valor, sub, bg, color, icono: Ic }, idx) => (
          <div
            key={label}
            className="ins-card"
            style={{
              background: bg, border: '1px solid #F1F5F9', borderRadius: 14,
              padding: '16px 18px', animationDelay: `${idx * 0.05}s`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Ic size={14} color={color} aria-hidden />
              <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
              </span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{valor}</p>
            <p style={{ fontSize: 11, color: '#64748B', margin: '6px 0 0' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabla estado inventario */}
      <div style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid #F1F5F9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Fish size={15} color="#14B8A6" aria-hidden />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Estado actual del inventario</span>
          </div>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>{activos.length} insumos activos</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAFBFC' }}>
                {['Insumo', 'Tipo', 'Stock actual', 'Mínimo', 'Cobertura', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Insumo' || h === 'Tipo' ? 'left' : h === 'Cobertura' ? 'left' : 'right', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F1F5F9' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activos.sort((a, b) => (a.bajoStock ? -1 : 1) - (b.bajoStock ? -1 : 1)).map(i => {
                const pct = i.stockMinimo > 0 ? Math.min(100, Math.round((i.stockActual / i.stockMinimo) * 100)) : 100
                const tipo = TIPO_COLORS[i.tipo] || TIPO_COLORS.OTRO
                return (
                  <tr key={i.idInsumo} className="ins-row" style={{ borderBottom: '1px solid #F8FAFC', background: i.bajoStock ? '#FEF2F2' : '#fff' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <p style={{ fontWeight: 700, color: '#0F172A', margin: 0 }}>{i.nombre}</p>
                      {i.codigo && <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0', fontFamily: 'monospace' }}>{i.codigo}</p>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: tipo.bg, color: tipo.color }}>
                        {tipo.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: i.bajoStock ? '#EF4444' : '#0F172A' }}>
                      {Number(i.stockActual).toLocaleString('es-CO')}
                      <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8', marginLeft: 4 }}>{i.unidadMedida}</span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748B' }}>
                      {Number(i.stockMinimo).toLocaleString('es-CO')}
                    </td>
                    <td style={{ padding: '10px 14px', minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(pct, 100)}%`,
                            background: pct < 50 ? '#EF4444' : pct <= 100 ? '#F59E0B' : '#10B981',
                            borderRadius: 999, transition: 'width 0.6s ease',
                          }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: pct < 50 ? '#EF4444' : pct <= 100 ? '#D97706' : '#059669', width: 32, textAlign: 'right' }}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      {i.bajoStock
                        ? <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#FEE2E2', color: '#991B1B', display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={10} /> Bajo stock</span>
                        : <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#D1FAE5', color: '#065F46', display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={10} /> OK</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {activos.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              Sin insumos activos registrados
            </div>
          )}
        </div>
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
    try { await onSave(form) }
    catch (e) { setErr(e.response?.data?.mensaje || 'Error al guardar el insumo.') }
    finally { setSaving(false) }
  }

  return (
    <ModalWrapper
      titulo={insumo ? 'Editar Insumo' : 'Nuevo Insumo'}
      subtitulo={insumo ? 'Modifica los datos del insumo' : 'Agrega un nuevo insumo al inventario'}
      icono={<Package size={20} color="#fff" />}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {err && (
          <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, fontSize: 13, color: '#991B1B' }}>
            {err}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Código (opcional)">
            <input className="ins-input" style={inputBase} value={form.codigo}
              onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="ALE-001" />
          </Field>
          <Field label="Tipo *">
            <select className="ins-input" style={inputBase} value={form.tipo}
              onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              <option value="ALEVINO">ALEVINO</option>
              <option value="CONCENTRADO">CONCENTRADO</option>
              <option value="OTRO">OTRO</option>
            </select>
          </Field>
        </div>

        <Field label="Nombre *">
          <input className="ins-input" style={inputBase} value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Cachama, Purina 40%…" />
        </Field>

        <Field label="Descripción">
          <input className="ins-input" style={inputBase} value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="Precio unitario (COP) *">
            <input type="number" className="ins-input" style={inputBase} value={form.precioUnitario}
              onChange={e => setForm(f => ({ ...f, precioUnitario: e.target.value }))} />
          </Field>
          <Field label={`Stock actual(${form.tipo === 'CONCENTRADO' ? 'bultos' : 'unidades'})*`}>
            <input type="number" className="ins-input" style={inputBase} value={form.stockActual}
              onChange={e => setForm(f => ({ ...f, stockActual: e.target.value }))} />
          </Field>
          <Field label="Stock mínimo *">
            <input type="number" className="ins-input" style={inputBase} value={form.stockMinimo}
              onChange={e => setForm(f => ({ ...f, stockMinimo: e.target.value }))} />
          </Field>
        </div>

        {insumo && (
          <Field label="Estado">
            <select className="ins-input" style={inputBase} value={form.estado}
              onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </Field>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
          <button className="ins-btn-outline" onClick={onClose}>Cancelar</button>
          <button className="ins-btn-primary" onClick={handleSubmit} disabled={saving}
            style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Guardando…' : 'Guardar insumo'}
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
    setSaving(true); setErr(null)
    try {
      await onSave({
        idProductor: Number(idProductor),
        estadoPagado,
        items: items.map(it => ({ idInsumo: Number(it.idInsumo), cantidad: Number(it.cantidad) }))
      })
    } catch (e) {
      setErr(e.response?.data?.mensaje || 'Error al registrar la venta.')
    } finally { setSaving(false) }
  }

  return (
    <ModalWrapper
      titulo="Nueva Venta de Insumos"
      subtitulo="Registra la venta de insumos a un productor"
      icono={<ShoppingCart size={20} color="#fff" />}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {err && <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, fontSize: 13, color: '#991B1B' }}>{err}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Productor *">
            <select className="ins-input" style={inputBase} value={idProductor} onChange={e => setIdProductor(e.target.value)}>
              <option value="">Seleccionar…</option>
              {productores.map(p => (
                <option key={p.idProductor} value={p.idProductor}>{p.nombre1} {p.apellido1}</option>
              ))}
            </select>
          </Field>
          <Field label="Estado de pago *">
            <select className="ins-input" style={inputBase} value={estadoPagado} onChange={e => setEstadoPagado(e.target.value)}>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="CREDITO">CRÉDITO</option>
              <option value="PAGADO">PAGADO</option>
            </select>
          </Field>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Insumos
            </label>
            <button onClick={addItem} style={{ fontSize: 12, color: '#14B8A6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={12} aria-hidden /> Agregar ítem
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, i) => {
              const ins = insumos.find(x => String(x.idInsumo) === String(item.idInsumo))
              const subtotal = ins ? Number(ins.precioUnitario) * Number(item.cantidad || 0) : 0
              return (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#FAFBFC', borderRadius: 10, padding: '8px 10px', border: '1px solid #F1F5F9' }}>
                  <select
                    className="ins-input"
                    style={{ ...inputBase, flex: 1, fontSize: 12 }}
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
                    className="ins-input"
                    style={{ ...inputBase, width: 72, textAlign: 'right' }}
                  />
                  <span style={{ fontSize: 12, color: '#64748B', width: 90, textAlign: 'right', flexShrink: 0 }}>
                    ${subtotal.toLocaleString('es-CO')}
                  </span>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                      <X size={14} aria-hidden />
                    </button>
                  )}
                </div>
              )
            })}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', paddingTop: 6,
              borderTop: '1px solid #F1F5F9',
            }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>
                Total: ${total.toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
          <button className="ins-btn-outline" onClick={onClose}>Cancelar</button>
          <button
            className="ins-btn-primary"
            onClick={handleSave}
            disabled={saving || !idProductor || items.some(it => !it.idInsumo)}
            style={{ opacity: (saving || !idProductor || items.some(it => !it.idInsumo)) ? 0.5 : 1 }}
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
  const [form, setForm] = useState({ idInsumo: '', tipoMovimiento: 'ENTRADA', motivo: 'COMPRA', cantidad: '', observacion: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)

  const motivos = form.tipoMovimiento === 'SALIDA' ? MOTIVOS_SALIDA : MOTIVOS_ENTRADA

  const handleSave = async () => {
    setSaving(true); setErr(null)
    try {
      await onSave({ ...form, idInsumo: Number(form.idInsumo), cantidad: Number(form.cantidad) })
    } catch (e) {
      setErr(e.response?.data?.mensaje || 'Error al registrar el movimiento.')
    } finally { setSaving(false) }
  }

  return (
    <ModalWrapper
      titulo="Registrar Movimiento"
      subtitulo="Entrada, salida o ajuste de inventario"
      icono={<ArrowUpDown size={20} color="#fff" />}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {err && <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, fontSize: 13, color: '#991B1B' }}>{err}</div>}

        <Field label="Insumo *">
          <select className="ins-input" style={inputBase} value={form.idInsumo}
            onChange={e => setForm(f => ({ ...f, idInsumo: e.target.value }))}>
            <option value="">Seleccionar…</option>
            {insumos.map(i => (
              <option key={i.idInsumo} value={i.idInsumo}>
                {i.nombre} — Stock: {i.stockActual} {i.unidadMedida}
              </option>
            ))}
          </select>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Tipo de movimiento *">
            <select className="ins-input" style={inputBase} value={form.tipoMovimiento}
              onChange={e => setForm(f => ({ ...f, tipoMovimiento: e.target.value, motivo: '' }))}>
              <option value="ENTRADA">ENTRADA</option>
              <option value="SALIDA">SALIDA</option>
              <option value="AJUSTE">AJUSTE</option>
            </select>
          </Field>
          <Field label="Motivo *">
            <select className="ins-input" style={inputBase} value={form.motivo}
              onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}>
              <option value="">Seleccionar…</option>
              {motivos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        </div>

        <Field label={form.tipoMovimiento === 'AJUSTE' ? 'Nuevo stock total *' : 'Cantidad *'}>
          <input type="number" min={0.01} step={0.01} className="ins-input" style={inputBase}
            value={form.cantidad}
            onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
        </Field>

        <Field label="Observación">
          <input className="ins-input" style={inputBase} value={form.observacion}
            onChange={e => setForm(f => ({ ...f, observacion: e.target.value }))} />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
          <button className="ins-btn-outline" onClick={onClose}>Cancelar</button>
          <button
            className="ins-btn-primary"
            onClick={handleSave}
            disabled={saving || !form.idInsumo || !form.motivo || !form.cantidad}
            style={{ opacity: (saving || !form.idInsumo || !form.motivo || !form.cantidad) ? 0.5 : 1 }}
          >
            {saving ? 'Registrando…' : 'Registrar'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ── COMPONENTES AUXILIARES ────────────────────────────────────
function ModalWrapper({ titulo, subtitulo, icono, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      background: 'rgba(15,23,42,0.45)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20,
        width: '100%', maxWidth: 560,
        maxHeight: '92vh', overflowY: 'auto',
        animation: 'ins-modal-in 0.2s ease both',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '20px 24px', borderBottom: '1px solid #F1F5F9',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
            boxShadow: '0 3px 10px rgba(20,184,166,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icono}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>{titulo}</h2>
            {subtitulo && <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>{subtitulo}</p>}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E2E8F0',
              background: '#fff', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#94A3B8',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#94A3B8' }}
          >
            <X size={15} aria-hidden />
          </button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

function ModalConfirm({ mensaje, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 28, maxWidth: 420, width: '100%',
        animation: 'ins-modal-in 0.2s ease both',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={18} color="#D97706" aria-hidden />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Confirmar acción</p>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5 }}>{mensaje}</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="ins-btn-outline" onClick={onCancel}>Cancelar</button>
          <button
            onClick={onConfirm}
            style={{
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Desactivar
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function EmptyState({ icono, titulo, subtitulo, accion }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px',
      background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14,
      animation: 'ins-fade 0.3s ease both',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, marginBottom: 16,
        background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icono}
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 6px', textAlign: 'center' }}>{titulo}</p>
      <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 18px', textAlign: 'center', maxWidth: 320, lineHeight: 1.5 }}>{subtitulo}</p>
      {accion && (
        <button className="ins-btn-primary" onClick={accion.onClick}>{accion.label}</button>
      )}
    </div>
  )
}

function SkeletonInventario() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, overflow: 'hidden', animationDelay: `${i * 0.06}s` }}>
          <div className="ins-skeleton" style={{ height: 3 }} />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="ins-skeleton" style={{ width: 40, height: 10 }} />
              <div className="ins-skeleton" style={{ width: 60, height: 18, borderRadius: 999 }} />
            </div>
            <div className="ins-skeleton" style={{ width: '70%', height: 14 }} />
            <div className="ins-skeleton" style={{ height: 70, borderRadius: 10 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="ins-skeleton" style={{ width: 60, height: 18, borderRadius: 999 }} />
              <div className="ins-skeleton" style={{ width: 50, height: 24, borderRadius: 8 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonCards({ n = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[...Array(n)].map((_, i) => (
        <div key={i} style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="ins-skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="ins-skeleton" style={{ width: '50%', height: 12 }} />
            <div className="ins-skeleton" style={{ width: '30%', height: 10 }} />
          </div>
          <div className="ins-skeleton" style={{ width: 80, height: 20 }} />
        </div>
      ))}
    </div>
  )
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function formatFecha(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
