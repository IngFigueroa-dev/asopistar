// src/pages/logistica/Logistica.jsx
import { useState, useEffect, useMemo } from 'react'
import {
  Truck, Package, MapPin, CheckCircle, Clock, ChevronRight,
  Plus, X, Search, Snowflake, ArrowRight, Eye,
  User, Phone, Building2, Calendar, AlertTriangle,
  Hash, Store, Ban, Navigation,
} from 'lucide-react'
import api from '../../services/api'

// ── Constantes ─────────────────────────────────────────────────
const DESTINOS = [
  'El Tarra (Sede)', 'El Tarra (Veredas)', 'Punto Físico El Tarra',
  'Punto Físico Cúcuta', 'Ocaña', 'Ábrego', 'Cúcuta', 'Bucaramanga',
]

const TIPOS_VEHICULO = [
  'Camioneta', 'Camión refrigerado', 'Furgón', 'Motocicleta', 'Van', 'Otro',
]

const ESTADO_CONFIG = {
  PREPARADO: { label: 'Preparado', step: 0, bg: '#FFFBEB', color: '#92400E', dot: '#F59E0B', border: '#FED7AA' },
  EN_CAMINO: { label: 'En camino', step: 1, bg: '#EFF6FF', color: '#1E40AF', dot: '#3B82F6', border: '#BFDBFE' },
  ENTREGADO: { label: 'Entregado', step: 2, bg: '#F0FDF4', color: '#065F46', dot: '#10B981', border: '#A7F3D0' },
  CANCELADO: { label: 'Cancelado', step: -1, bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444', border: '#FECACA' },
}

const SIGUIENTE_ESTADO = { PREPARADO: 'EN_CAMINO', EN_CAMINO: 'ENTREGADO' }
const SIGUIENTE_LABEL  = { PREPARADO: 'Marcar en camino', EN_CAMINO: 'Marcar entregado' }

const fmt     = (dt) => dt ? String(dt).replace('T', ' ').substring(0, 16) : '—'
const fmtDate = (d)  => d  ? String(d).substring(0, 10) : '—'

// ── Estilos base ───────────────────────────────────────────────
const inputBase = {
  width: '100%',
  fontSize: 13,
  border: '1.5px solid #E2E8F0',
  borderRadius: 9,
  padding: '9px 12px',
  background: '#FAFAFA',
  color: '#0F172A',
  outline: 'none',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
}

// ── Badge de estado ────────────────────────────────────────────
function Badge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.PREPARADO
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 999,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ── Línea de tiempo ────────────────────────────────────────────
function LineaTiempo({ envio }) {
  const pasos = [
    { key: 'PREPARADO', label: 'Preparado', fecha: envio.fechaPreparacion, icon: Package },
    { key: 'EN_CAMINO', label: 'En camino', fecha: envio.fechaSalida,      icon: Truck },
    { key: 'ENTREGADO', label: 'Entregado', fecha: envio.fechaEntregaReal, icon: CheckCircle },
  ]
  const stepActual = ESTADO_CONFIG[envio.estado]?.step ?? 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {pasos.map((p, i) => {
        const activo   = stepActual >= p.step || envio.estado === p.key
        const esActual = envio.estado === p.key
        const Icon = p.icon
        return (
          <div key={p.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${activo ? (esActual ? '#14B8A6' : '#5EEAD4') : '#E2E8F0'}`,
                background: esActual
                  ? 'linear-gradient(135deg, #14B8A6, #06B6D4)'
                  : activo ? '#CCFBF1' : '#F8FAFC',
                boxShadow: esActual ? '0 3px 10px rgba(20,184,166,0.3)' : 'none',
                transition: 'all 0.2s ease',
              }}>
                <Icon size={14} color={esActual ? '#fff' : activo ? '#0F766E' : '#CBD5E1'} />
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: activo ? '#0F766E' : '#94A3B8' }}>
                {p.label}
              </p>
              <p style={{ fontSize: 10, color: '#94A3B8', textAlign: 'center', lineHeight: 1.3 }}>
                {p.fecha ? fmt(p.fecha) : '—'}
              </p>
            </div>
            {i < pasos.length - 1 && (
              <div style={{
                height: 2, flex: 1, marginTop: -20,
                background: stepActual > i
                  ? 'linear-gradient(90deg, #14B8A6, #06B6D4)'
                  : '#F1F5F9',
                borderRadius: 999,
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Modal detalle del envío ────────────────────────────────────
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
      onClose(true)
    } catch {
      setErrorTransporte('Error al guardar el transporte.')
    } finally { setGuardandoTransporte(false) }
  }

  const dest = envio.tipoDestino === 'CLIENTE' ? envio.clienteInfo : envio.puntoVentaInfo
  const tabs = [
    { key: 'resumen',    label: 'Resumen' },
    { key: 'lotes',      label: `Lotes (${envio.totalLotes || 0})` },
    { key: 'transporte', label: 'Transporte' },
  ]

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
        width: '100%', maxWidth: 600,
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        animation: 'log-modal-in 0.2s ease both',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                  background: '#F1F5F9', color: '#64748B',
                  padding: '3px 8px', borderRadius: 6,
                }}>
                  {envio.codigoGuia || `#${envio.idEnvio}`}
                </span>
                <Badge estado={envio.estado} />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {envio.tipoDestino === 'CLIENTE'
                  ? (envio.nombreCliente || envio.clienteInfo?.razonSocial || '—')
                  : (envio.nombrePunto   || envio.puntoVentaInfo?.nombre   || '—')}
              </h2>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} aria-hidden />
                {envio.destinoCiudad}
                <span style={{ margin: '0 4px' }}>·</span>
                {envio.tipoDestino === 'CLIENTE' ? '👤 Cliente' : '🏪 Punto de venta'}
              </p>
            </div>
            <button
              onClick={() => onClose(false)}
              style={{
                width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E2E8F0',
                background: '#fff', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#94A3B8',
                transition: 'all 0.2s ease', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#94A3B8' }}
            >
              <X size={15} aria-hidden />
            </button>
          </div>

          {envio.estado !== 'CANCELADO' && (
            <div style={{ marginTop: 18 }}>
              <LineaTiempo envio={envio} />
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 16 }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                  background: tab === t.key ? 'linear-gradient(135deg, #14B8A6, #06B6D4)' : 'transparent',
                  color: tab === t.key ? '#fff' : '#64748B',
                  boxShadow: tab === t.key ? '0 2px 8px rgba(20,184,166,0.25)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Tab: Resumen */}
          {tab === 'resumen' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Info destino */}
              <div style={{
                background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC)',
                border: '1px solid #CCFBF1', borderRadius: 12, padding: '14px 16px',
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  {envio.tipoDestino === 'CLIENTE' ? 'Cliente' : 'Punto de venta'}
                </p>
                {dest ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Nombre',   val: dest.razonSocial || dest.nombre },
                      { label: 'Ciudad',   val: dest.ciudad },
                      dest.telefono && { label: 'Teléfono', val: dest.telefono },
                      (dest.email || dest.responsable) && { label: dest.email ? 'Correo' : 'Responsable', val: dest.email || dest.responsable },
                    ].filter(Boolean).map(f => (
                      <div key={f.label}>
                        <p style={{ fontSize: 10, color: '#94A3B8', margin: 0 }}>{f.label}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.val || '—'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: '#94A3B8' }}>Sin información adicional.</p>
                )}
              </div>

              {/* Métricas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: '#0F766E', fontWeight: 700, margin: 0 }}>Total kilos</p>
                  <p style={{ fontSize: 26, fontWeight: 900, color: '#14B8A6', margin: '4px 0 0', lineHeight: 1 }}>
                    {parseFloat(envio.totalKilos || 0).toFixed(1)}
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#94A3B8', marginLeft: 4 }}>kg</span>
                  </p>
                </div>
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: '#1E40AF', fontWeight: 700, margin: 0 }}>Total lotes</p>
                  <p style={{ fontSize: 26, fontWeight: 900, color: '#3B82F6', margin: '4px 0 0', lineHeight: 1 }}>
                    {envio.totalLotes || 0}
                  </p>
                </div>
              </div>

              {/* Fechas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Preparación',      val: fmt(envio.fechaPreparacion) },
                  { label: 'Salida',           val: fmt(envio.fechaSalida) },
                  { label: 'Entrega estimada', val: fmtDate(envio.fechaEntregaEstimada) },
                  { label: 'Entrega real',     val: fmt(envio.fechaEntregaReal) },
                ].map(f => (
                  <div key={f.label} style={{ background: '#FAFBFC', border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
                    <p style={{ fontSize: 10, color: '#94A3B8', margin: 0 }}>{f.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: '3px 0 0' }}>{f.val}</p>
                  </div>
                ))}
              </div>

              {envio.observaciones && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FED7AA', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Observaciones</p>
                  <p style={{ fontSize: 13, color: '#78350F', margin: 0 }}>{envio.observaciones}</p>
                </div>
              )}

              {envio.estado === 'ENTREGADO' && (envio.nombreReceptor || envio.observacionEntrega) && (
                <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Evidencia de entrega</p>
                  {envio.nombreReceptor && (
                    <p style={{ fontSize: 13, color: '#065F46', margin: 0 }}>
                      <span style={{ fontWeight: 700 }}>Recibido por: </span>{envio.nombreReceptor}
                    </p>
                  )}
                  {envio.observacionEntrega && (
                    <p style={{ fontSize: 13, color: '#14532D', margin: '4px 0 0' }}>{envio.observacionEntrega}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab: Lotes */}
          {tab === 'lotes' && (
            <div>
              {!envio.lotes?.length ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 13 }}>
                  Sin lotes asociados.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {envio.lotes.map(lote => (
                    <div key={lote.idLote} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px',
                      background: '#FAFBFC', border: '1px solid #F1F5F9',
                      borderRadius: 12,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: '#CCFBF1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Snowflake size={15} color="#0F766E" aria-hidden />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{lote.codigoLote}</p>
                        <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{lote.nombreProductor}</p>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 900, color: '#14B8A6', flexShrink: 0 }}>
                        {parseFloat(lote.kilos).toFixed(1)} <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8' }}>kg</span>
                      </p>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: 10, borderTop: '1px solid #F1F5F9', paddingLeft: 2,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Total</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#14B8A6' }}>
                      {parseFloat(envio.totalKilos || 0).toFixed(1)} kg
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Transporte */}
          {tab === 'transporte' && (
            <div>
              {!editTransporte ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Empresa transportadora', val: envio.empresaTransportadora, icon: Building2 },
                    { label: 'Conductor',              val: envio.nombreConductor,       icon: User },
                    { label: 'Teléfono conductor',     val: envio.telefonoConductor,     icon: Phone },
                    { label: 'Placa del vehículo',     val: envio.placaVehiculo,         icon: Hash },
                    { label: 'Tipo de vehículo',       val: envio.tipoVehiculo,          icon: Truck },
                  ].map(f => (
                    <div key={f.label} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', background: '#FAFBFC',
                      border: '1px solid #F1F5F9', borderRadius: 12,
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                        background: '#fff', border: '1.5px solid #E2E8F0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <f.icon size={14} color="#94A3B8" aria-hidden />
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: '#94A3B8', margin: 0 }}>{f.label}</p>
                        <p style={{ fontSize: 13, fontWeight: f.val ? 600 : 400, color: f.val ? '#0F172A' : '#CBD5E1', margin: '2px 0 0' }}>
                          {f.val || 'Sin registrar'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {envio.estado !== 'ENTREGADO' && envio.estado !== 'CANCELADO' && (
                    <button
                      onClick={() => setEditTransporte(true)}
                      style={{
                        width: '100%', marginTop: 4, padding: '12px',
                        border: '2px dashed #CCFBF1', borderRadius: 12,
                        background: 'transparent', cursor: 'pointer',
                        fontSize: 13, fontWeight: 600, color: '#14B8A6',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#14B8A6'; e.currentTarget.style.background = '#F0FDFA' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#CCFBF1'; e.currentTarget.style.background = 'transparent' }}
                    >
                      {envio.empresaTransportadora ? 'Actualizar transporte' : '+ Registrar información de transporte'}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { key: 'empresaTransportadora', label: 'Empresa transportadora', placeholder: 'Transportes Catatumbo' },
                    { key: 'nombreConductor',       label: 'Nombre del conductor',   placeholder: 'Carlos Pérez' },
                    { key: 'telefonoConductor',     label: 'Teléfono conductor',     placeholder: '3101234567' },
                    { key: 'placaVehiculo',         label: 'Placa del vehículo',     placeholder: 'ABC-123' },
                  ].map(f => (
                    <ModalField key={f.key} label={f.label}>
                      <input
                        className="log-input"
                        value={transporte[f.key]}
                        onChange={e => setTransporte(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        style={inputBase}
                      />
                    </ModalField>
                  ))}
                  <ModalField label="Tipo de vehículo">
                    <select className="log-input" style={inputBase}
                      value={transporte.tipoVehiculo}
                      onChange={e => setTransporte(prev => ({ ...prev, tipoVehiculo: e.target.value }))}>
                      <option value="">Seleccionar...</option>
                      {TIPOS_VEHICULO.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </ModalField>
                  <ModalField label="Fecha estimada de entrega">
                    <input type="date" className="log-input" style={inputBase}
                      value={transporte.fechaEntregaEstimada}
                      onChange={e => setTransporte(prev => ({ ...prev, fechaEntregaEstimada: e.target.value }))} />
                  </ModalField>

                  {errorTransporte && (
                    <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, fontSize: 13, color: '#991B1B' }}>
                      {errorTransporte}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                    <button className="log-btn-outline" onClick={() => setEditTransporte(false)} style={{ flex: 1 }}>
                      Cancelar
                    </button>
                    <button
                      onClick={handleGuardarTransporte}
                      disabled={guardandoTransporte}
                      className="log-btn-primary"
                      style={{ flex: 1, opacity: guardandoTransporte ? 0.6 : 1 }}
                    >
                      {guardandoTransporte ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 10 }}>
          <button className="log-btn-outline" onClick={() => onClose(false)} style={{ flex: 1 }}>
            Cerrar
          </button>
          {puedeCancelar && (
            <button
              onClick={() => onCancelar(envio)}
              style={{
                padding: '9px 16px', border: '1.5px solid #FECACA', borderRadius: 10,
                background: 'transparent', color: '#EF4444', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <Ban size={14} aria-hidden /> Cancelar envío
            </button>
          )}
          {puedeAvanzar && (
            <button
              className="log-btn-primary"
              onClick={() => onAvanzarEstado(envio)}
              disabled={avanzando === envio.idEnvio}
              style={{ flex: 1, opacity: avanzando === envio.idEnvio ? 0.6 : 1 }}
            >
              {avanzando === envio.idEnvio
                ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                : <ArrowRight size={14} aria-hidden />
              }
              {SIGUIENTE_LABEL[envio.estado]}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Modal crear envío ──────────────────────────────────────────
function ModalCrear({ lotesDisponibles, clientes, puntos, onClose, onCreado }) {
  const [form, setForm] = useState({
    destinoCiudad: '', tipoDestino: '', idCliente: '', idPunto: '',
    observaciones: '', lotesSeleccionados: [],
    empresaTransportadora: '', nombreConductor: '',
    telefonoConductor: '', placaVehiculo: '', tipoVehiculo: '',
    fechaEntregaEstimada: '',
  })
  const [paso,      setPaso]      = useState(1)
  const [error,     setError]     = useState('')
  const [guardando, setGuardando] = useState(false)

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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      background: 'rgba(15,23,42,0.45)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20,
        width: '100%', maxWidth: 600,
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        animation: 'log-modal-in 0.2s ease both',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                boxShadow: '0 3px 10px rgba(20,184,166,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Truck size={20} color="#fff" aria-hidden />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Nuevo Envío</h2>
                {/* Indicador de paso */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  {[1, 2].map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800,
                        background: paso >= p ? 'linear-gradient(135deg, #14B8A6, #06B6D4)' : '#F1F5F9',
                        color: paso >= p ? '#fff' : '#94A3B8',
                        boxShadow: paso >= p ? '0 2px 6px rgba(20,184,166,0.3)' : 'none',
                      }}>{p}</div>
                      <span style={{ fontSize: 11, color: paso >= p ? '#0F766E' : '#94A3B8', fontWeight: paso >= p ? 600 : 400 }}>
                        {p === 1 ? 'Destino y lotes' : 'Transporte (opcional)'}
                      </span>
                      {p < 2 && <ArrowRight size={10} color="#CBD5E1" aria-hidden />}
                    </div>
                  ))}
                </div>
              </div>
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
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Paso 1 */}
          {paso === 1 && (
            <>
              {/* Lotes */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Lotes disponibles en Cuarto Frío *
                  </label>
                  {form.lotesSeleccionados.length > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#CCFBF1', color: '#0F766E' }}>
                      {form.lotesSeleccionados.length} selec. · {kilosSeleccionados.toFixed(1)} kg
                    </span>
                  )}
                </div>
                {lotesDisponibles.length === 0 ? (
                  <div style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 12, padding: '20px', textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>
                    No hay lotes disponibles en el Cuarto Frío.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 176, overflowY: 'auto', paddingRight: 2 }}>
                    {lotesDisponibles.map(lote => {
                      const sel = form.lotesSeleccionados.includes(lote.idLote)
                      return (
                        <button
                          key={lote.idLote}
                          onClick={() => toggleLote(lote.idLote)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 12, textAlign: 'left',
                            border: `2px solid ${sel ? '#14B8A6' : '#F1F5F9'}`,
                            background: sel ? '#F0FDFA' : '#FAFBFC',
                            cursor: 'pointer', transition: 'all 0.18s ease',
                          }}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: sel ? '#CCFBF1' : '#F1F5F9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Snowflake size={14} color={sel ? '#0F766E' : '#94A3B8'} aria-hidden />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lote.codigoLote}</p>
                            <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>{parseFloat(lote.kilos).toFixed(1)} kg</p>
                            <p style={{ fontSize: 10, color: '#94A3B8', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lote.nombreProductor}</p>
                          </div>
                          {sel && <CheckCircle size={15} color="#14B8A6" style={{ flexShrink: 0 }} aria-hidden />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Ciudad */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                  Ciudad / Destino *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {DESTINOS.map(d => (
                    <button
                      key={d}
                      onClick={() => setF('destinoCiudad', d)}
                      style={{
                        padding: '8px 12px', borderRadius: 10, textAlign: 'left',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        border: `1.5px solid ${form.destinoCiudad === d ? '#14B8A6' : '#F1F5F9'}`,
                        background: form.destinoCiudad === d ? '#F0FDFA' : '#FAFBFC',
                        color: form.destinoCiudad === d ? '#0F766E' : '#64748B',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <MapPin size={10} style={{ marginRight: 5, opacity: 0.6 }} aria-hidden />{d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo destino */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                  Tipo de destino *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { val: 'CLIENTE',     label: '👤 Cliente',        desc: 'Comprador mayorista o minorista' },
                    { val: 'PUNTO_VENTA', label: '🏪 Punto de venta', desc: 'Punto físico de ASOPISTAR' },
                  ].map(t => (
                    <button
                      key={t.val}
                      onClick={() => setForm(prev => ({ ...prev, tipoDestino: t.val, idCliente: '', idPunto: '' }))}
                      style={{
                        padding: '12px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                        border: `2px solid ${form.tipoDestino === t.val ? '#14B8A6' : '#F1F5F9'}`,
                        background: form.tipoDestino === t.val ? '#F0FDFA' : '#FAFBFC',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{t.label}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', margin: '3px 0 0' }}>{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {form.tipoDestino === 'CLIENTE' && (
                <ModalField label={`Cliente *${clientes.length === 0 ? ' (Sin datos)' : ''}`}>
                  <select className="log-input" style={inputBase} value={form.idCliente} onChange={e => setF('idCliente', e.target.value)}>
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c => (
                      <option key={c.idCliente} value={c.idCliente}>
                        {c.razonSocial || `${c.nombre1} ${c.apellido1}`} — {c.ciudad}
                      </option>
                    ))}
                  </select>
                </ModalField>
              )}

              {form.tipoDestino === 'PUNTO_VENTA' && (
                <ModalField label={`Punto de venta *${puntos.length === 0 ? ' (Sin datos)' : ''}`}>
                  <select className="log-input" style={inputBase} value={form.idPunto} onChange={e => setF('idPunto', e.target.value)}>
                    <option value="">Seleccionar punto de venta...</option>
                    {puntos.map(p => (
                      <option key={p.idPunto} value={p.idPunto}>{p.nombre} — {p.ciudad}</option>
                    ))}
                  </select>
                </ModalField>
              )}

              <ModalField label="Observaciones">
                <textarea
                  className="log-input"
                  value={form.observaciones}
                  onChange={e => setF('observaciones', e.target.value)}
                  rows={2}
                  placeholder="Condiciones de transporte, novedades..."
                  style={{ ...inputBase, resize: 'none' }}
                />
              </ModalField>

              {/* Resumen */}
              {form.lotesSeleccionados.length > 0 && form.destinoCiudad && (
                <div style={{
                  background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC)',
                  border: '1px solid #CCFBF1', borderRadius: 12, padding: '14px 16px',
                }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Resumen del envío
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#0F766E' }}>
                      {form.lotesSeleccionados.length} lote{form.lotesSeleccionados.length > 1 ? 's' : ''} → <strong>{form.destinoCiudad}</strong>
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#14B8A6' }}>
                      {kilosSeleccionados.toFixed(1)} kg
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Paso 2: Transporte */}
          {paso === 2 && (
            <>
              <div style={{
                padding: '12px 14px',
                background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10,
                fontSize: 12, color: '#1E40AF',
              }}>
                ℹ️ La información de transporte es opcional. Puedes completarla ahora o después desde el detalle del envío.
              </div>
              {[
                { key: 'empresaTransportadora', label: 'Empresa transportadora', placeholder: 'Transportes Catatumbo' },
                { key: 'nombreConductor',       label: 'Nombre del conductor',   placeholder: 'Carlos Pérez' },
                { key: 'telefonoConductor',     label: 'Teléfono del conductor', placeholder: '3101234567' },
                { key: 'placaVehiculo',         label: 'Placa del vehículo',     placeholder: 'ABC-123' },
              ].map(f => (
                <ModalField key={f.key} label={f.label}>
                  <input className="log-input" value={form[f.key]} onChange={e => setF(f.key, e.target.value)} placeholder={f.placeholder} style={inputBase} />
                </ModalField>
              ))}
              <ModalField label="Tipo de vehículo">
                <select className="log-input" value={form.tipoVehiculo} onChange={e => setF('tipoVehiculo', e.target.value)} style={inputBase}>
                  <option value="">Seleccionar...</option>
                  {TIPOS_VEHICULO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </ModalField>
              <ModalField label="Fecha estimada de entrega">
                <input type="date" className="log-input" value={form.fechaEntregaEstimada} onChange={e => setF('fechaEntregaEstimada', e.target.value)} style={inputBase} />
              </ModalField>
            </>
          )}

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 14px', background: '#FEF2F2',
              border: '1px solid #FECACA', borderRadius: 10,
              fontSize: 13, color: '#991B1B',
            }}>
              <AlertTriangle size={14} aria-hidden /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 10 }}>
          {paso === 1 ? (
            <>
              <button className="log-btn-outline" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
              <button
                className="log-btn-primary"
                style={{ flex: 1 }}
                onClick={() => { setError(''); if (validarPaso1()) setPaso(2) }}
              >
                Siguiente <ArrowRight size={14} aria-hidden />
              </button>
            </>
          ) : (
            <>
              <button className="log-btn-outline" onClick={() => { setError(''); setPaso(1) }} style={{ flex: 1 }}>
                Atrás
              </button>
              <button
                className="log-btn-primary"
                onClick={handleCrear}
                disabled={guardando}
                style={{ flex: 1, opacity: guardando ? 0.6 : 1 }}
              >
                {guardando ? 'Creando envío...' : 'Crear envío'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────
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
      try { setClientes((await api.get('/clientes')).data)   } catch { setClientes([]) }
      try { setPuntos((await api.get('/puntos-venta')).data) } catch { setPuntos([])  }
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

  const kpiCards = [
    { icon: Clock,       label: 'Preparados',  value: stats.preparado, sub: `${stats.cancelado} cancelado${stats.cancelado !== 1 ? 's' : ''}`, bg: '#FFFBEB', color: '#92400E', border: '#FED7AA', iconBg: '#F59E0B' },
    { icon: Truck,       label: 'En camino',   value: stats.enCamino,  sub: 'Envíos activos en ruta',                                           bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE', iconBg: '#3B82F6' },
    { icon: CheckCircle, label: 'Entregados',  value: stats.entregado, sub: `${stats.total} total registrados`,                                  bg: '#F0FDF4', color: '#065F46', border: '#A7F3D0', iconBg: '#10B981' },
    { icon: Package,     label: 'Kilos total', value: `${stats.kilosTotal.toFixed(0)} kg`, sub: 'distribuidos en total',                         bg: '#F0FDFA', color: '#0F766E', border: '#CCFBF1', iconBg: '#14B8A6' },
  ]

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100%' }}>
      <style>{`
        @keyframes log-fade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes log-modal-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes log-toast {
          0%   { opacity: 0; transform: translateY(-10px); }
          10%  { opacity: 1; transform: translateY(0); }
          85%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes log-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .log-card {
          animation: log-fade 0.22s ease both;
          transition: all 0.2s ease;
        }
        .log-card:hover {
          border-color: rgba(20,184,166,0.3) !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }
        .log-row {
          transition: background 0.15s ease;
          cursor: pointer;
        }
        .log-row:hover {
          background: #F8FAFC !important;
        }
        .log-btn-primary {
          background: linear-gradient(135deg, #14B8A6, #06B6D4);
          color: #fff; border: none; border-radius: 10px;
          padding: 9px 18px; font-size: 13px; font-weight: 700;
          cursor: pointer; display: inline-flex; align-items: center;
          justify-content: center; gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(20,184,166,0.25);
        }
        .log-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(20,184,166,0.4);
        }
        .log-btn-outline {
          background: transparent; color: #64748B;
          border: 1.5px solid #E2E8F0; border-radius: 10px;
          padding: 9px 18px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease;
        }
        .log-btn-outline:hover {
          background: #F8FAFC; border-color: #CBD5E1;
        }
        .log-input:focus {
          border-color: #14B8A6 !important;
          box-shadow: 0 0 0 3px rgba(20,184,166,0.12) !important;
          background: #fff !important;
        }
        .log-skeleton {
          animation: log-pulse 1.4s ease infinite;
          background: #F1F5F9; border-radius: 6px;
        }
        .log-toast {
          animation: log-toast 3s ease forwards;
        }
      `}</style>

      {/* Toast */}
      {toastMsg && (
        <div className="log-toast" style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: '#0F172A', color: '#fff',
          padding: '12px 18px', borderRadius: 12,
          fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          <CheckCircle size={15} color="#14B8A6" aria-hidden />
          {toastMsg}
        </div>
      )}

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC, #EFF6FF)',
        border: '1px solid #E2E8F0', borderRadius: 16,
        padding: '24px 28px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
        animation: 'log-fade 0.3s ease both',
      }}>
        {[
          { w: 120, h: 120, top: -30, right: 60,  opacity: 0.07 },
          { w: 80,  h: 80,  top: 20,  right: 20,  opacity: 0.05 },
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
              <Truck size={22} color="#fff" aria-hidden />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Logística y Distribución
              </h1>
              <p style={{ fontSize: 13, color: '#64748B', margin: '3px 0 0' }}>
                {stats.enCamino > 0
                  ? `${stats.enCamino} envío${stats.enCamino > 1 ? 's' : ''} en camino · ${stats.kilosTotal.toFixed(0)} kg distribuidos`
                  : `${stats.total} envíos registrados · ${stats.kilosTotal.toFixed(0)} kg distribuidos`}
              </p>
            </div>
          </div>
          <button className="log-btn-primary" onClick={() => setMostrarModal(true)}>
            <Plus size={15} aria-hidden /> Nuevo envío
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {kpiCards.map(({ icon: Icon, label, value, sub, bg, color, border, iconBg }, idx) => (
          <div
            key={label}
            className="log-card"
            style={{
              background: bg, border: `1px solid ${border}`,
              borderRadius: 14, padding: '16px 18px',
              animationDelay: `${idx * 0.05}s`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={14} color="#fff" aria-hidden />
              </div>
            </div>
            <p style={{ fontSize: 26, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
            {sub && <p style={{ fontSize: 11, color: '#64748B', margin: '6px 0 0' }}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Búsqueda y filtros */}
      <div style={{
        background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14,
        padding: '14px 18px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Búsqueda */}
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={14} color="#94A3B8" aria-hidden style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="log-input"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por guía, ciudad, cliente, lote..."
              style={{ ...inputBase, paddingLeft: 36, paddingRight: busqueda ? 32 : 12 }}
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={13} aria-hidden />
              </button>
            )}
          </div>
          {/* Filtros de estado */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['TODOS', 'PREPARADO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'].map(e => {
              const activo = filtroEstado === e
              const cfg = ESTADO_CONFIG[e]
              return (
                <button
                  key={e}
                  onClick={() => setFiltroEstado(e)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    border: `1.5px solid ${activo ? '#14B8A6' : '#F1F5F9'}`,
                    background: activo ? 'linear-gradient(135deg, #14B8A6, #06B6D4)' : '#FAFBFC',
                    color: activo ? '#fff' : '#64748B',
                    cursor: 'pointer', transition: 'all 0.18s ease',
                    display: 'flex', alignItems: 'center', gap: 5,
                    boxShadow: activo ? '0 2px 8px rgba(20,184,166,0.25)' : 'none',
                  }}
                >
                  {e !== 'TODOS' && cfg && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: activo ? 'rgba(255,255,255,0.7)' : cfg.dot, flexShrink: 0 }} />
                  )}
                  {e === 'TODOS' ? 'Todos' : cfg?.label}
                  {e !== 'TODOS' && (
                    <span style={{ opacity: 0.7, marginLeft: 2 }}>
                      {envios.filter(x => x.estado === e).length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lista de envíos */}
      <div style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0' }}>
                <div className="log-skeleton" style={{ width: 60, height: 20 }} />
                <div style={{ flex: 1 }}>
                  <div className="log-skeleton" style={{ width: '50%', height: 13, marginBottom: 6 }} />
                  <div className="log-skeleton" style={{ width: '30%', height: 11 }} />
                </div>
                <div className="log-skeleton" style={{ width: 70, height: 22, borderRadius: 999 }} />
                <div className="log-skeleton" style={{ width: 28, height: 28, borderRadius: 8 }} />
              </div>
            ))}
          </div>
        ) : enviosFiltrados.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '60px 20px', gap: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Truck size={24} color="#14B8A6" aria-hidden />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              {envios.length === 0 ? 'No hay envíos registrados' : 'Sin resultados para la búsqueda'}
            </p>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
              {envios.length === 0 ? 'Crea el primer envío para comenzar la distribución' : 'Prueba con otros términos o filtros'}
            </p>
            {envios.length === 0 && (
              <button className="log-btn-primary" onClick={() => setMostrarModal(true)}>
                <Plus size={14} aria-hidden /> Nuevo envío
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Header tabla — solo desktop */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '110px 1fr 140px 130px 80px 110px 80px',
              gap: 12, padding: '10px 18px',
              background: '#FAFBFC', borderBottom: '1px solid #F1F5F9',
            }} className="hidden md:grid">
              {['Guía', 'Destino', 'Fecha', 'Transporte', 'Kilos', 'Estado', 'Acción'].map(h => (
                <p key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, textAlign: h === 'Kilos' || h === 'Acción' ? 'right' : 'left' }}>
                  {h}
                </p>
              ))}
            </div>

            <div>
              {enviosFiltrados.map((envio, idx) => {
                const cfg = ESTADO_CONFIG[envio.estado] || ESTADO_CONFIG.PREPARADO
                return (
                  <div
                    key={envio.idEnvio}
                    className="log-row log-card"
                    onClick={() => setEnvioDetalle(envio)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '110px 1fr 140px 130px 80px 110px 80px',
                      gap: 12, padding: '14px 18px',
                      borderBottom: '1px solid #F8FAFC',
                      alignItems: 'center',
                      animationDelay: `${idx * 0.03}s`,
                    }}
                  >
                    {/* Guía */}
                    <div>
                      <span style={{
                        fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                        background: '#F1F5F9', color: '#64748B',
                        padding: '3px 7px', borderRadius: 6,
                      }}>
                        {envio.codigoGuia || `#${envio.idEnvio}`}
                      </span>
                    </div>

                    {/* Destino */}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {envio.tipoDestino === 'CLIENTE' ? (envio.nombreCliente || '—') : (envio.nombrePunto || '—')}
                      </p>
                      <p style={{ fontSize: 11, color: '#94A3B8', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={9} aria-hidden />
                        {envio.destinoCiudad}
                        <span style={{ marginLeft: 3, opacity: 0.7 }}>
                          {envio.tipoDestino === 'CLIENTE' ? '· Cliente' : '· Punto de venta'}
                        </span>
                      </p>
                    </div>

                    {/* Fecha */}
                    <div>
                      <p style={{ fontSize: 12, color: '#0F172A', margin: 0 }}>{fmt(envio.fechaPreparacion || envio.fechaEnvio)}</p>
                      {envio.fechaEntregaEstimada && (
                        <p style={{ fontSize: 10, color: '#94A3B8', margin: '2px 0 0' }}>Est: {fmtDate(envio.fechaEntregaEstimada)}</p>
                      )}
                    </div>

                    {/* Transporte */}
                    <div style={{ minWidth: 0 }}>
                      {envio.nombreConductor ? (
                        <>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{envio.nombreConductor}</p>
                          {envio.placaVehiculo && (
                            <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#94A3B8', margin: '2px 0 0' }}>{envio.placaVehiculo}</p>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: 11, color: '#CBD5E1' }}>Sin asignar</span>
                      )}
                    </div>

                    {/* Kilos */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#14B8A6', margin: 0 }}>
                        {parseFloat(envio.totalKilos || 0).toFixed(1)}
                      </p>
                      <p style={{ fontSize: 10, color: '#94A3B8', margin: '2px 0 0' }}>
                        {envio.totalLotes} lote{envio.totalLotes !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Estado */}
                    <div>
                      <Badge estado={envio.estado} />
                    </div>

                    {/* Acciones */}
                    <div
                      style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}
                      onClick={e => e.stopPropagation()}
                    >
                      {SIGUIENTE_ESTADO[envio.estado] && (
                        <button
                          onClick={() => handleAvanzarEstado(envio)}
                          disabled={avanzando === envio.idEnvio}
                          title={SIGUIENTE_LABEL[envio.estado]}
                          style={{
                            width: 30, height: 30, borderRadius: 8, border: 'none',
                            background: '#F0FDFA', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#14B8A6', transition: 'all 0.2s ease',
                            opacity: avanzando === envio.idEnvio ? 0.5 : 1,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#CCFBF1' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#F0FDFA' }}
                        >
                          {avanzando === envio.idEnvio
                            ? <span style={{ width: 12, height: 12, border: '2px solid #14B8A6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'block' }} />
                            : <ArrowRight size={13} aria-hidden />
                          }
                        </button>
                      )}
                      <button
                        onClick={() => setEnvioDetalle(envio)}
                        title="Ver detalle"
                        style={{
                          width: 30, height: 30, borderRadius: 8, border: '1.5px solid #F1F5F9',
                          background: '#FAFBFC', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#94A3B8', transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#14B8A6'; e.currentTarget.style.color = '#14B8A6' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#F1F5F9'; e.currentTarget.style.color = '#94A3B8' }}
                      >
                        <ChevronRight size={13} aria-hidden />
                      </button>
                    </div>
                  </div>
                )
              })}
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

// ── Auxiliares ─────────────────────────────────────────────────
function ModalField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
