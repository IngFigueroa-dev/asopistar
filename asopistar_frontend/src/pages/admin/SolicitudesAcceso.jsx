// src/pages/admin/SolicitudesAcceso.jsx
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, RefreshCw, Clock,
         Filter, Send, ShieldCheck, AlertTriangle, X, User,
         Mail, Phone, MapPin, Calendar, Briefcase, FileText } from 'lucide-react'
import api from '../../services/api'

const ROLES_DISPONIBLES = [
  { id: null,  nombre: '-- Selecciona un rol --' },
  { id: 3,  nombre: 'Productor' },
  { id: 4,  nombre: 'Biólogo' },
  { id: 5,  nombre: 'Gerente de Planta' },
  { id: 6,  nombre: 'Personal Cuarto Frío' },
  { id: 7,  nombre: 'Contadora' },
  { id: 8,  nombre: 'Secretaria' },
  { id: 9,  nombre: 'Gerente Comercial' },
  { id: 10, nombre: 'Vendedor de Insumos' },
]

const ESTADO_BADGE = {
  PENDIENTE_VERIFICACION: { label: 'Pendiente verificación', style: { background: '#FEF3C7', color: '#92400E' } },
  ERROR_ENVIO_CORREO:     { label: 'Error envío correo',     style: { background: '#FEE2E2', color: '#991B1B' } },
  PENDIENTE_APROBACION:   { label: 'Pendiente aprobación',   style: { background: '#DBEAFE', color: '#1E40AF' } },
  ACTIVO:                 { label: 'Aprobado',               style: { background: '#D1FAE5', color: '#065F46' } },
  RECHAZADO:              { label: 'Rechazado',              style: { background: '#FEE2E2', color: '#991B1B' } },
  SUSPENDIDO:             { label: 'Suspendido',             style: { background: '#FFEDD5', color: '#9A3412' } },
  INACTIVO:               { label: 'Inactivo',               style: { background: '#F1F5F9', color: '#64748B' } },
}

const FILTROS = [
  { valor: 'PENDIENTE_APROBACION',   label: 'Pendiente aprobación' },
  { valor: 'PENDIENTE_VERIFICACION', label: 'Pendiente verificación' },
  { valor: 'ERROR_ENVIO_CORREO',     label: 'Error correo' },
  { valor: 'ACTIVO',                 label: 'Aprobado' },
  { valor: 'RECHAZADO',              label: 'Rechazado' },
  { valor: 'TODOS',                  label: 'Todos' },
]

// ── Tokens por tipo de modal/acción ──────────────────────────────────────────
const ACCION_TOKEN = {
  detalle:                 { grad: 'linear-gradient(135deg, #3B82F6, #6366F1)', bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE', solid: '#3B82F6' },
  aprobar:                 { grad: 'linear-gradient(135deg, #10B981, #059669)', bg: '#F0FDF4', color: '#065F46', border: '#A7F3D0', solid: '#10B981' },
  rechazar:                { grad: 'linear-gradient(135deg, #EF4444, #DC2626)', bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', solid: '#EF4444' },
  reenviar:                { grad: 'linear-gradient(135deg, #14B8A6, #06B6D4)', bg: '#F0FDFA', color: '#0F766E', border: '#CCFBF1', solid: '#14B8A6' },
  'aprobar-manual':        { grad: 'linear-gradient(135deg, #8B5CF6, #A855F7)', bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE', solid: '#8B5CF6' },
  'confirm-aprobar-manual':{ grad: 'linear-gradient(135deg, #EF4444, #DC2626)', bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', solid: '#EF4444' },
}

const GLOBAL_STYLES = `
@keyframes sol-fade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes sol-modal-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes sol-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
`

const getIniciales = (n1 = '', a1 = '') => `${n1[0] || ''}${a1[0] || ''}`.toUpperCase()

function SolicitudesAcceso() {
  const [solicitudes, setSolicitudes]         = useState([])
  const [loading, setLoading]                 = useState(true)
  const [filtroEstado, setFiltroEstado]       = useState('PENDIENTE_APROBACION')
  const [detalle, setDetalle]                 = useState(null)
  const [modalTipo, setModalTipo]             = useState(null)
  // 'aprobar' | 'rechazar' | 'detalle' | 'reenviar' | 'aprobar-manual' | 'confirm-aprobar-manual'
  const [rolSeleccionado, setRolSeleccionado] = useState('')
  const [motivoRechazo, setMotivoRechazo]     = useState('')
  const [observacionManual, setObservacionManual] = useState('')
  const [procesando, setProcesando]           = useState(false)
  const [exito, setExito]                     = useState('')
  const [error, setError]                     = useState('')

  useEffect(() => { cargar() }, [filtroEstado])

  const cargar = async () => {
    setLoading(true)
    setError('')
    try {
      // Usar el nuevo endpoint enriquecido para estados con datos de reenvío
      const url = filtroEstado === 'TODOS'
        ? '/admin/solicitudes'
        : `/admin/solicitudes?estado=${filtroEstado}`
      const res = await api.get(url)
      setSolicitudes(res.data)
    } catch {
      // Fallback al endpoint anterior si el nuevo aún no está desplegado
      try {
        const urlFallback = filtroEstado === 'TODOS'
          ? '/usuarios'
          : `/usuarios/por-estado?estado=${filtroEstado}`
        const res = await api.get(urlFallback)
        setSolicitudes(res.data)
      } catch {
        setError('Error al cargar las solicitudes.')
      }
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (usuario, tipo) => {
    setDetalle(usuario)
    setModalTipo(tipo)
    setRolSeleccionado('')
    setMotivoRechazo('')
    setObservacionManual('')
    setExito('')
    setError('')
  }

  const cerrarModal = () => {
    setDetalle(null)
    setModalTipo(null)
  }

  // ── Aprobar normal ─────────────────────────────────────────────────────────
  const handleAprobar = async () => {
    if (!rolSeleccionado) { setError('Debes seleccionar un rol.'); return }
    setProcesando(true); setError('')
    try {
      await api.patch(`/usuarios/${detalle.idUsuario}/aprobar`, {
        idRolAsignado: parseInt(rolSeleccionado)
      })
      setExito(`✅ ${detalle.nombre1} ${detalle.apellido1} fue aprobado/a correctamente.`)
      cerrarModal(); cargar()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al aprobar.')
    } finally { setProcesando(false) }
  }

  // ── Rechazar ───────────────────────────────────────────────────────────────
  const handleRechazar = async () => {
    setProcesando(true); setError('')
    try {
      await api.patch(`/usuarios/${detalle.idUsuario}/rechazar`, {
        motivoRechazo: motivoRechazo || null
      })
      setExito(`❌ ${detalle.nombre1} ${detalle.apellido1} fue rechazado/a.`)
      cerrarModal(); cargar()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al rechazar.')
    } finally { setProcesando(false) }
  }

  // ── Reenviar correo (admin) ────────────────────────────────────────────────
  const handleReenviarCorreo = async () => {
    setProcesando(true); setError('')
    try {
      await api.post(`/admin/solicitudes/${detalle.idUsuario}/reenviar-correo`)
      setExito(`📧 Correo de verificación reenviado a ${detalle.email}.`)
      cerrarModal(); cargar()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al reenviar el correo.')
    } finally { setProcesando(false) }
  }

  // ── Aprobar manualmente (paso 1: confirmación) ─────────────────────────────
  const irAConfirmarManual = () => {
    if (!rolSeleccionado) { setError('Debes seleccionar un rol.'); return }
    setError('')
    setModalTipo('confirm-aprobar-manual')
  }

  // ── Aprobar manualmente (paso 2: ejecutar) ─────────────────────────────────
  const handleAprobarManual = async () => {
    setProcesando(true); setError('')
    try {
      await api.patch(`/admin/solicitudes/${detalle.idUsuario}/aprobar-manual`, {
        idRolAsignado: parseInt(rolSeleccionado),
        observaciones: observacionManual || 'Aprobación manual por administrador.'
      })
      setExito(`✅ ${detalle.nombre1} ${detalle.apellido1} fue activado/a manualmente.`)
      cerrarModal(); cargar()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error en aprobación manual.')
    } finally { setProcesando(false) }
  }

  const formatFecha = (f) => f
    ? new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  const formatFechaHora = (f) => f
    ? new Date(f).toLocaleString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : '—'

  // ── Determinar qué acciones mostrar según estado ───────────────────────────
  const accionesParaEstado = (u) => {
    const puede = {
      verDetalle:     true,
      aprobarNormal:  u.estado === 'PENDIENTE_APROBACION',
      rechazar:       u.estado === 'PENDIENTE_APROBACION',
      reenviarCorreo: u.estado === 'PENDIENTE_VERIFICACION' || u.estado === 'ERROR_ENVIO_CORREO',
      aprobarManual:  u.estado === 'PENDIENTE_VERIFICACION' || u.estado === 'ERROR_ENVIO_CORREO',
    }
    return puede
  }

  const mostrarColumnaReenvios =
    filtroEstado === 'PENDIENTE_VERIFICACION' ||
    filtroEstado === 'ERROR_ENVIO_CORREO' ||
    filtroEstado === 'TODOS'

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
            <ShieldCheck size={24} color="#fff" aria-hidden />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Solicitudes de Acceso
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
              Aprueba o rechaza las solicitudes de registro al sistema
            </p>
          </div>
        </div>

        <button
          onClick={cargar}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', border: '1.5px solid #E2E8F0', color: '#64748B',
            borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#14B8A6'; e.currentTarget.style.color = '#14B8A6' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
        >
          <RefreshCw size={15} aria-hidden /> Actualizar
        </button>
      </div>

      {/* Feedback global de éxito */}
      {exito && (
        <div style={{
          background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 14,
          padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <CheckCircle size={17} color="#10B981" aria-hidden />
          <span style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>{exito}</span>
        </div>
      )}

      {/* ── Filtros tipo píldora ─────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap'
      }}>
        <Filter size={15} color="#94A3B8" aria-hidden />
        {FILTROS.map(f => {
          const activo = filtroEstado === f.valor
          return (
            <button
              key={f.valor}
              onClick={() => setFiltroEstado(f.valor)}
              style={{
                padding: '8px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                background: activo ? 'linear-gradient(135deg, #14B8A6, #06B6D4)' : '#F1F5F9',
                color: activo ? '#fff' : '#64748B',
                boxShadow: activo ? '0 4px 12px rgba(20,184,166,0.3)' : 'none'
              }}
              onMouseEnter={e => { if (!activo) e.currentTarget.style.background = '#E2E8F0' }}
              onMouseLeave={e => { if (!activo) e.currentTarget.style.background = '#F1F5F9' }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Error de carga */}
      {error && !modalTipo && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14,
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20
        }}>
          <AlertTriangle size={17} color="#EF4444" aria-hidden />
          <span style={{ fontSize: 13, color: '#991B1B' }}>{error}</span>
        </div>
      )}

      {/* ── Contenido ───────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ height: 3, background: '#F1F5F9', animation: 'sol-pulse 1.4s ease infinite' }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F1F5F9', animation: 'sol-pulse 1.4s ease infinite', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, marginBottom: 6, animation: 'sol-pulse 1.4s ease infinite' }} />
                    <div style={{ height: 10, width: '60%', background: '#F1F5F9', borderRadius: 6, animation: 'sol-pulse 1.4s ease infinite', animationDelay: '0.1s' }} />
                  </div>
                </div>
                {[0,1,2].map(j => (
                  <div key={j} style={{ height: 10, background: '#F1F5F9', borderRadius: 6, marginBottom: 8, animation: 'sol-pulse 1.4s ease infinite', animationDelay: `${0.1*j}s` }} />
                ))}
              </div>
              <div style={{ height: 44, background: '#FAFBFC', borderTop: '1px solid #F1F5F9', animation: 'sol-pulse 1.4s ease infinite' }} />
            </div>
          ))}
        </div>
      ) : solicitudes.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '60px 20px', textAlign: 'center'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, marginBottom: 16,
            background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Clock size={28} color="#14B8A6" aria-hidden />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>
            No hay solicitudes en este estado
          </p>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>
            Cambia el filtro para ver otras solicitudes
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {solicitudes.map((u, idx) => (
            <SolicitudCard
              key={u.idUsuario}
              usuario={u}
              idx={idx}
              acciones={accionesParaEstado(u)}
              mostrarReenvios={mostrarColumnaReenvios}
              formatFecha={formatFecha}
              formatFechaHora={formatFechaHora}
              onAbrirModal={abrirModal}
            />
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
           MODALES
         ════════════════════════════════════════════════════════ */}
      {modalTipo && detalle && (
        <ModalOverlay onClose={cerrarModal}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460,
            maxHeight: '92vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            animation: 'sol-modal-in 0.2s ease both'
          }}>
            {/* Cabecera del modal */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #F1F5F9',
              borderRadius: '20px 20px 0 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: ACCION_TOKEN[modalTipo].grad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {modalTipo === 'aprobar' && <CheckCircle size={18} color="#fff" aria-hidden />}
                  {modalTipo === 'rechazar' && <XCircle size={18} color="#fff" aria-hidden />}
                  {modalTipo === 'detalle' && <User size={18} color="#fff" aria-hidden />}
                  {modalTipo === 'reenviar' && <Send size={18} color="#fff" aria-hidden />}
                  {modalTipo === 'aprobar-manual' && <ShieldCheck size={18} color="#fff" aria-hidden />}
                  {modalTipo === 'confirm-aprobar-manual' && <AlertTriangle size={18} color="#fff" aria-hidden />}
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {modalTipo === 'aprobar'              && 'Aprobar solicitud'}
                  {modalTipo === 'rechazar'             && 'Rechazar solicitud'}
                  {modalTipo === 'detalle'              && 'Detalle del solicitante'}
                  {modalTipo === 'reenviar'             && 'Reenviar correo de verificación'}
                  {modalTipo === 'aprobar-manual'       && 'Aprobar manualmente'}
                  {modalTipo === 'confirm-aprobar-manual' && 'Confirmar aprobación manual'}
                </h2>
              </div>
              <button
                onClick={cerrarModal}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
                  display: 'flex', padding: 6, borderRadius: 8, transition: 'all 0.2s ease', flexShrink: 0
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8' }}
                aria-label="Cerrar"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Info del usuario — presente en todos los modales */}
              <div style={{ background: '#FAFBFC', border: '1px solid #F1F5F9', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                <InfoLinea label="Nombre" valor={`${detalle.nombre1} ${detalle.nombre2 || ''} ${detalle.apellido1} ${detalle.apellido2 || ''}`} fuerte />
                <InfoLinea label="Documento" valor={detalle.documento || '—'} />
                <InfoLinea label="Correo" valor={detalle.email} />
                <InfoLinea label="Teléfono" valor={detalle.telefono || '—'} />
                <InfoLinea label="Cargo solicitado" valor={detalle.cargoSolicitado || '—'} fuerte />
                {detalle.direccion && <InfoLinea label="Dirección" valor={detalle.direccion} />}
                {detalle.fechaNacimiento && <InfoLinea label="F. Nacimiento" valor={formatFecha(detalle.fechaNacimiento)} />}

                {/* Datos de reenvío — solo en modales relevantes */}
                {(modalTipo === 'reenviar' || modalTipo === 'detalle' || modalTipo === 'aprobar-manual') && (
                  <>
                    <div style={{ borderTop: '1px solid #E2E8F0', margin: '4px 0' }} />
                    <InfoLinea label="Reenvíos anteriores" valor={String(detalle.cantidadReenvios || 0)} fuerte />
                    <InfoLinea label="Último correo enviado" valor={formatFechaHora(detalle.ultimoReenvio)} />
                    {detalle.errorEnvioCorreo && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '8px 10px', marginTop: 4 }}>
                        <p style={{ fontSize: 11, color: '#991B1B', fontWeight: 700, margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <AlertTriangle size={11} aria-hidden /> Error SMTP registrado:
                        </p>
                        <p style={{ fontSize: 11, color: '#EF4444', margin: 0, wordBreak: 'break-all' }}>{detalle.errorEnvioCorreo}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Modal: Aprobar normal ── */}
              {modalTipo === 'aprobar' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Rol a asignar *
                  </label>
                  <SelectModal
                    value={rolSeleccionado}
                    onChange={setRolSeleccionado}
                    focusColor={ACCION_TOKEN.aprobar.solid}
                  >
                    {ROLES_DISPONIBLES.map(r => (
                      <option key={r.id ?? 'none'} value={r.id ?? ''} disabled={!r.id}>{r.nombre}</option>
                    ))}
                  </SelectModal>
                  <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                    Cargo solicitado: <strong style={{ color: '#64748B' }}>{detalle.cargoSolicitado}</strong>
                  </p>
                </div>
              )}

              {/* ── Modal: Rechazar ── */}
              {modalTipo === 'rechazar' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Motivo del rechazo (opcional)
                  </label>
                  <textarea
                    value={motivoRechazo}
                    onChange={e => setMotivoRechazo(e.target.value)}
                    rows={3}
                    placeholder="Ej: La información proporcionada no coincide con nuestros registros."
                    style={{
                      width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0',
                      borderRadius: 9, background: '#FAFAFA', fontSize: 13, color: '#0F172A',
                      outline: 'none', resize: 'none', boxSizing: 'border-box',
                      fontFamily: 'inherit', transition: 'all 0.2s ease'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#EF4444'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                  />
                  <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                    Este mensaje se enviará al usuario por correo.
                  </p>
                </div>
              )}

              {/* ── Modal: Reenviar correo ── */}
              {modalTipo === 'reenviar' && (
                <div style={{ background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 13, color: '#0F766E', margin: 0 }}>
                    Se generará un nuevo token de verificación e invalidará el anterior.
                    El correo se enviará a <strong>{detalle.email}</strong>.
                  </p>
                </div>
              )}

              {/* ── Modal: Aprobar manualmente — paso 1 ── */}
              {modalTipo === 'aprobar-manual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: '#FFFBEB', border: '1px solid #FED7AA', borderRadius: 10, padding: '12px 14px' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={13} aria-hidden /> Esta acción omite la verificación de correo.
                    </p>
                    <p style={{ fontSize: 12, color: '#92400E', margin: 0 }}>
                      Úsala solo cuando conozcas personalmente al solicitante y el correo no haya llegado por causas externas.
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                      Rol a asignar *
                    </label>
                    <SelectModal
                      value={rolSeleccionado}
                      onChange={setRolSeleccionado}
                      focusColor={ACCION_TOKEN['aprobar-manual'].solid}
                    >
                      {ROLES_DISPONIBLES.map(r => (
                        <option key={r.id ?? 'none'} value={r.id ?? ''} disabled={!r.id}>{r.nombre}</option>
                      ))}
                    </SelectModal>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                      Justificación (se registra en auditoría)
                    </label>
                    <textarea
                      value={observacionManual}
                      onChange={e => setObservacionManual(e.target.value)}
                      rows={2}
                      placeholder="Ej: Se verificó identidad en persona. Correo institucional bloqueado."
                      style={{
                        width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0',
                        borderRadius: 9, background: '#FAFAFA', fontSize: 13, color: '#0F172A',
                        outline: 'none', resize: 'none', boxSizing: 'border-box',
                        fontFamily: 'inherit', transition: 'all 0.2s ease'
                      }}
                      onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)' }}
                      onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                </div>
              )}

              {/* ── Modal: Confirmar aprobación manual ── */}
              {modalTipo === 'confirm-aprobar-manual' && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '14px 16px' }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#991B1B', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} aria-hidden /> ATENCIÓN
                  </p>
                  <p style={{ fontSize: 13, color: '#991B1B', margin: 0 }}>
                    Esta acción activará la cuenta de{' '}
                    <strong>{detalle.nombre1} {detalle.apellido1}</strong>{' '}
                    <strong>sin realizar la validación automática del correo electrónico</strong>.
                    ¿Desea continuar?
                  </p>
                  <p style={{ marginTop: 8, fontSize: 11, color: '#EF4444' }}>
                    Esta acción quedará registrada en el historial de auditoría.
                  </p>
                </div>
              )}

              {error && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9,
                  padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <AlertTriangle size={14} color="#EF4444" aria-hidden />
                  <span style={{ fontSize: 12, color: '#991B1B' }}>{error}</span>
                </div>
              )}

              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 2 }}>
                <button
                  onClick={() => {
                    if (modalTipo === 'confirm-aprobar-manual') {
                      setModalTipo('aprobar-manual')
                    } else {
                      cerrarModal()
                    }
                  }}
                  style={{
                    flex: 1, padding: '10px 0', border: '1.5px solid #E2E8F0', background: '#FAFAFA',
                    color: '#64748B', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA' }}
                >
                  {modalTipo === 'detalle'              ? 'Cerrar'
                    : modalTipo === 'confirm-aprobar-manual' ? '← Volver'
                    : 'Cancelar'}
                </button>

                {modalTipo === 'aprobar' && (
                  <BotonAccion onClick={handleAprobar} disabled={procesando} token={ACCION_TOKEN.aprobar}>
                    {procesando ? 'Aprobando...' : 'Confirmar aprobación'}
                  </BotonAccion>
                )}

                {modalTipo === 'rechazar' && (
                  <BotonAccion onClick={handleRechazar} disabled={procesando} token={ACCION_TOKEN.rechazar}>
                    {procesando ? 'Rechazando...' : 'Confirmar rechazo'}
                  </BotonAccion>
                )}

                {modalTipo === 'reenviar' && (
                  <BotonAccion onClick={handleReenviarCorreo} disabled={procesando} token={ACCION_TOKEN.reenviar}>
                    {procesando ? 'Enviando...' : 'Reenviar correo'}
                  </BotonAccion>
                )}

                {modalTipo === 'aprobar-manual' && (
                  <BotonAccion onClick={irAConfirmarManual} token={ACCION_TOKEN['aprobar-manual']}>
                    Continuar →
                  </BotonAccion>
                )}

                {modalTipo === 'confirm-aprobar-manual' && (
                  <BotonAccion onClick={handleAprobarManual} disabled={procesando} token={ACCION_TOKEN['confirm-aprobar-manual']}>
                    {procesando ? 'Activando...' : 'Sí, activar cuenta'}
                  </BotonAccion>
                )}
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  )
}

// ── Card de solicitud ────────────────────────────────────────────────────────
function SolicitudCard({ usuario: u, idx, acciones, mostrarReenvios, formatFecha, formatFechaHora, onAbrirModal }) {
  const [hovered, setHovered] = useState(false)
  const badge = ESTADO_BADGE[u.estado] || { label: u.estado, style: { background: '#F1F5F9', color: '#64748B' } }

  const bordeTop = u.estado === 'ACTIVO' ? 'linear-gradient(90deg, #10B981, #059669)'
    : u.estado === 'RECHAZADO' || u.estado === 'ERROR_ENVIO_CORREO' ? 'linear-gradient(90deg, #EF4444, #DC2626)'
    : u.estado === 'PENDIENTE_APROBACION' ? 'linear-gradient(90deg, #3B82F6, #6366F1)'
    : u.estado === 'PENDIENTE_VERIFICACION' ? 'linear-gradient(90deg, #F59E0B, #F97316)'
    : 'linear-gradient(90deg, #94A3B8, #CBD5E1)'

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${hovered ? 'rgba(20,184,166,0.3)' : '#F1F5F9'}`,
        borderRadius: 14, overflow: 'hidden',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        animation: 'sol-fade 0.22s ease both',
        animationDelay: `${idx * 0.04}s`
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ height: 3, background: bordeTop }} />

      <div style={{ padding: '14px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#0F766E'
          }}>
            {getIniciales(u.nombre1, u.apellido1)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
              {u.nombre1} {u.apellido1}
            </p>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
              {u.documento || '—'}
            </p>
          </div>
        </div>

        {/* Datos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
          <DatoCard icon={<Mail size={12} aria-hidden />} texto={u.email} />
          <DatoCard icon={<Briefcase size={12} aria-hidden />} texto={u.cargoSolicitado || '—'} />
          <DatoCard icon={<Calendar size={12} aria-hidden />} texto={formatFecha(u.fechaCreacion)} />
          {mostrarReenvios && (
            <DatoCard
              icon={<Send size={12} aria-hidden />}
              texto={`Último correo: ${formatFechaHora(u.ultimoReenvio)} · ${u.cantidadReenvios || 0} reenvío${u.cantidadReenvios === 1 ? '' : 's'}`}
            />
          )}
        </div>

        {/* Estado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <ChipInline style={badge.style}>{badge.label}</ChipInline>
          {u.estado === 'ERROR_ENVIO_CORREO' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#EF4444', fontWeight: 600 }}>
              <AlertTriangle size={10} aria-hidden /> Error SMTP
            </span>
          )}
        </div>
      </div>

      {/* Footer con acciones */}
      <div style={{
        background: '#FAFBFC', borderTop: '1px solid #F1F5F9',
        padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4
      }}>
        <BtnIcono onClick={() => onAbrirModal(u, 'detalle')} title="Ver detalles" hoverColor="#3B82F6" hoverBg="#EFF6FF">
          <Eye size={14} aria-hidden />
        </BtnIcono>
        {acciones.aprobarNormal && (
          <BtnIcono onClick={() => onAbrirModal(u, 'aprobar')} title="Aprobar" hoverColor="#10B981" hoverBg="#F0FDF4">
            <CheckCircle size={14} aria-hidden />
          </BtnIcono>
        )}
        {acciones.rechazar && (
          <BtnIcono onClick={() => onAbrirModal(u, 'rechazar')} title="Rechazar" hoverColor="#EF4444" hoverBg="#FEF2F2">
            <XCircle size={14} aria-hidden />
          </BtnIcono>
        )}
        {acciones.reenviarCorreo && (
          <BtnIcono onClick={() => onAbrirModal(u, 'reenviar')} title="Reenviar correo de verificación" hoverColor="#14B8A6" hoverBg="#F0FDFA">
            <Send size={14} aria-hidden />
          </BtnIcono>
        )}
        {acciones.aprobarManual && (
          <BtnIcono onClick={() => onAbrirModal(u, 'aprobar-manual')} title="Aprobar manualmente (sin verificación de correo)" hoverColor="#8B5CF6" hoverBg="#F5F3FF">
            <ShieldCheck size={14} aria-hidden />
          </BtnIcono>
        )}
      </div>
    </div>
  )
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function ModalOverlay({ children, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)'
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>
  )
}

function InfoLinea({ label, valor, fuerte }) {
  return (
    <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
      <span style={{ color: '#94A3B8' }}>{label}:</span>{' '}
      <span style={{ color: '#334155', fontWeight: fuerte ? 700 : 400 }}>{valor}</span>
    </p>
  )
}

function SelectModal({ value, onChange, children, focusColor }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '9px 12px', boxSizing: 'border-box',
        border: '1.5px solid #E2E8F0', borderRadius: 9, background: '#FAFAFA',
        fontSize: 13, color: '#0F172A', outline: 'none', cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onFocus={e => { e.target.style.borderColor = focusColor; e.target.style.boxShadow = `0 0 0 3px ${focusColor}20` }}
      onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
    >
      {children}
    </select>
  )
}

function DatoCard({ icon, texto }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: '#94A3B8', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{texto}</span>
    </div>
  )
}

function ChipInline({ children, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 99,
      fontSize: 10, fontWeight: 700, ...style
    }}>
      {children}
    </span>
  )
}

function BtnIcono({ children, onClick, title, hoverColor, hoverBg }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick} title={title}
      style={{
        width: 30, height: 30, borderRadius: 8, border: 'none',
        background: hov ? hoverBg : 'transparent',
        color: hov ? hoverColor : '#94A3B8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s ease'
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  )
}

function BotonAccion({ children, onClick, disabled, token }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        flex: 1, padding: '10px 0', border: 'none', borderRadius: 10,
        fontSize: 13, fontWeight: 700, color: '#fff',
        background: token.grad, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1, transition: 'all 0.2s ease',
        boxShadow: `0 4px 12px ${token.solid}40`
      }}
    >
      {children}
    </button>
  )
}

export default SolicitudesAcceso
