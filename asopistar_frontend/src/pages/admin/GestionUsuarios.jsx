// src/pages/admin/GestionUsuarios.jsx
import { useState, useEffect } from 'react'
import {
  UserCog, Search, RefreshCw, ToggleLeft, ToggleRight,
  Key, ShieldCheck, X, CheckCircle, XCircle, Clock,
  AlertCircle, MinusCircle, Mail, Calendar, Hash,
  Users, AlertTriangle
} from 'lucide-react'
import api from '../../services/api'

// ── Constantes de dominio (sin cambios) ──────────────────────────
const ROLES_DISPONIBLES = [
  { id: 2,  nombre: 'Administrador General' },
  { id: 3,  nombre: 'Productor' },
  { id: 4,  nombre: 'Biólogo' },
  { id: 5,  nombre: 'Gerente de Planta' },
  { id: 6,  nombre: 'Personal Cuarto Frío' },
  { id: 7,  nombre: 'Contadora' },
  { id: 8,  nombre: 'Secretaria' },
  { id: 9,  nombre: 'Gerente Comercial' },
  { id: 10, nombre: 'Vendedor de Insumos' },
]

// ── Helpers de presentación (tokens del Design System ASOPISTAR) ─
const ESTADO_LABEL = {
  ACTIVO:                 'Activo',
  PENDIENTE_APROBACION:   'Pendiente aprobación',
  PENDIENTE_VERIFICACION: 'Pendiente verificación',
  RECHAZADO:              'Rechazado',
  INACTIVO:               'Inactivo',
}
const ESTADO_STYLE = {
  ACTIVO:                 { background: '#D1FAE5', color: '#065F46' },
  PENDIENTE_APROBACION:   { background: '#DBEAFE', color: '#1E40AF' },
  PENDIENTE_VERIFICACION: { background: '#FEF3C7', color: '#92400E' },
  RECHAZADO:              { background: '#FEE2E2', color: '#991B1B' },
  INACTIVO:               { background: '#F1F5F9', color: '#64748B' },
}
const ESTADO_ICON = {
  ACTIVO:                 <CheckCircle size={12} aria-hidden />,
  PENDIENTE_APROBACION:   <Clock size={12} aria-hidden />,
  PENDIENTE_VERIFICACION: <AlertCircle size={12} aria-hidden />,
  RECHAZADO:              <XCircle size={12} aria-hidden />,
  INACTIVO:               <MinusCircle size={12} aria-hidden />,
}
const getBordeTop = (estado) => {
  if (estado === 'RECHAZADO')              return 'linear-gradient(90deg, #EF4444, #DC2626)'
  if (estado === 'INACTIVO')               return 'linear-gradient(90deg, #94A3B8, #CBD5E1)'
  if (estado === 'PENDIENTE_APROBACION')   return 'linear-gradient(90deg, #3B82F6, #60A5FA)'
  if (estado === 'PENDIENTE_VERIFICACION') return 'linear-gradient(90deg, #F59E0B, #FBBF24)'
  return 'linear-gradient(90deg, #14B8A6, #06B6D4)'
}
const getIniciales = (nombre1 = '', apellido1 = '') => {
  const a = nombre1.trim().charAt(0).toUpperCase()
  const b = apellido1.trim().charAt(0).toUpperCase()
  return (a + b) || '—'
}

// ── Estilos globales de animación ────────────────────────────────
const GLOBAL_STYLES = `
@keyframes usr-fade {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes usr-modal-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes usr-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
@keyframes usr-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`

// ════════════════════════════════════════════════════════════════
function GestionUsuarios() {
  const [usuarios, setUsuarios]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [busqueda, setBusqueda]     = useState('')
  const [modal, setModal]           = useState(null)   // { tipo, usuario }
  const [form, setForm]             = useState({})
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje]       = useState({ tipo: '', texto: '' })

  useEffect(() => { cargar() }, [])

  // ── Lógica original (sin modificar) ────────────────────────────
  const cargar = async () => {
    setLoading(true)
    try {
      const res = await api.get('/usuarios')
      setUsuarios(res.data)
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al cargar usuarios.' })
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (tipo, usuario) => {
    setModal({ tipo, usuario })
    setForm({})
    setMensaje({ tipo: '', texto: '' })
  }

  const cerrar = () => { setModal(null); setForm({}) }

  const mostrarExito = (texto) => {
    setMensaje({ tipo: 'exito', texto })
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000)
  }

  // Activar / Desactivar
  const handleToggleActivo = async (u) => {
    try {
      const endpoint = u.estado === 'ACTIVO' ? 'desactivar' : 'activar'
      await api.patch(`/usuarios/${u.idUsuario}/${endpoint}`)
      mostrarExito(`Usuario ${u.estado === 'ACTIVO' ? 'desactivado' : 'activado'} correctamente.`)
      cargar()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al cambiar estado.' })
    }
  }

  // Cambiar rol
  const handleCambiarRol = async () => {
    if (!form.idRol) { setMensaje({ tipo: 'error', texto: 'Selecciona un rol.' }); return }
    setProcesando(true)
    try {
      await api.patch(`/usuarios/${modal.usuario.idUsuario}/cambiar-rol`, { idRol: parseInt(form.idRol) })
      mostrarExito('Rol actualizado correctamente.')
      cerrar(); cargar()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al cambiar rol.' })
    } finally { setProcesando(false) }
  }

  // Restablecer contraseña
  const handleRestablecerPass = async () => {
    if (!form.nuevaContrasena) { setMensaje({ tipo: 'error', texto: 'Ingresa la nueva contraseña.' }); return }
    if (form.nuevaContrasena.length < 8) { setMensaje({ tipo: 'error', texto: 'Mínimo 8 caracteres.' }); return }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.nuevaContrasena)) {
      setMensaje({ tipo: 'error', texto: 'Debe tener mayúscula, minúscula y número.' }); return
    }
    setProcesando(true)
    try {
      await api.patch(`/usuarios/${modal.usuario.idUsuario}/restablecer-contrasena`, {
        nuevaContrasena: form.nuevaContrasena
      })
      mostrarExito('Contraseña restablecida. El usuario recibirá un correo de notificación.')
      cerrar()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al restablecer.' })
    } finally { setProcesando(false) }
  }

  const filtrados = usuarios.filter(u =>
    `${u.nombre1} ${u.apellido1} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric'
  }) : '—'

  // ── KPIs derivados (solo lectura visual, sin nuevos endpoints) ──
  const totalUsuarios = usuarios.length
  const activos       = usuarios.filter(u => u.estado === 'ACTIVO').length
  const pendientes    = usuarios.filter(u => u.estado === 'PENDIENTE_APROBACION' || u.estado === 'PENDIENTE_VERIFICACION').length
  const sinAcceso     = usuarios.filter(u => u.estado === 'RECHAZADO' || u.estado === 'INACTIVO').length

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: 24 }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC, #EFF6FF)',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Burbujas decorativas */}
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
            <UserCog size={24} color="#fff" aria-hidden />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Gestión de Usuarios
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
              Roles, accesos y contraseñas — {totalUsuarios} usuario{totalUsuarios !== 1 ? 's' : ''} registrado{totalUsuarios !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={cargar}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1.5px solid #E2E8F0', background: '#FAFAFA',
            color: '#64748B', borderRadius: 10,
            padding: '10px 20px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#14B8A6'; e.currentTarget.style.color = '#0F766E'; e.currentTarget.style.background = '#F0FDFA' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = '#FAFAFA' }}
        >
          <RefreshCw size={15} aria-hidden style={{ animation: loading ? 'usr-spin 0.8s linear infinite' : 'none' }} />
          Actualizar
        </button>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {[
          {
            label: 'TOTAL', sub: 'usuarios registrados', valor: totalUsuarios,
            bg: '#F0FDFA', color: '#0F766E', border: '#CCFBF1', iconBg: '#14B8A6',
            Icon: Users
          },
          {
            label: 'ACTIVOS', sub: 'con acceso al sistema', valor: activos,
            bg: '#F0FDF4', color: '#065F46', border: '#A7F3D0', iconBg: '#10B981',
            Icon: CheckCircle
          },
          {
            label: 'PENDIENTES', sub: 'por aprobar o verificar', valor: pendientes,
            bg: '#FFFBEB', color: '#92400E', border: '#FED7AA', iconBg: '#F59E0B',
            Icon: Clock
          },
          {
            label: 'SIN ACCESO', sub: 'rechazados o inactivos', valor: sinAcceso,
            bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', iconBg: '#EF4444',
            Icon: XCircle
          },
        ].map(({ label, sub, valor, bg, color, border, iconBg, Icon }) => (
          <div key={label} style={{
            background: bg, border: `1px solid ${border}`, borderRadius: 14,
            padding: '16px', transition: 'all 0.2s ease', cursor: 'default'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color="#fff" aria-hidden />
              </div>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#0F172A' }}>{valor ?? '—'}</span>
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
            <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Banner de feedback ──────────────────────────────────── */}
      {mensaje.texto && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: mensaje.tipo === 'exito' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${mensaje.tipo === 'exito' ? '#A7F3D0' : '#FECACA'}`,
          borderRadius: 12, padding: '12px 16px', marginBottom: 20
        }}>
          {mensaje.tipo === 'exito'
            ? <CheckCircle size={16} color="#10B981" aria-hidden />
            : <AlertTriangle size={16} color="#EF4444" aria-hidden />}
          <span style={{ fontSize: 13, color: mensaje.tipo === 'exito' ? '#065F46' : '#991B1B', flex: 1 }}>
            {mensaje.texto}
          </span>
          <button
            onClick={() => setMensaje({ tipo: '', texto: '' })}
            aria-label="Cerrar mensaje"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: mensaje.tipo === 'exito' ? '#10B981' : '#EF4444', display: 'flex' }}
          >
            <X size={14} aria-hidden />
          </button>
        </div>
      )}

      {/* ── Barra de búsqueda ───────────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14,
        padding: '14px 18px', marginBottom: 24
      }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} color="#94A3B8" aria-hidden style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            style={{
              width: '100%', paddingLeft: 36, paddingRight: busqueda ? 32 : 12,
              paddingTop: 9, paddingBottom: 9, boxSizing: 'border-box',
              border: '1.5px solid #E2E8F0', borderRadius: 9, background: '#FAFAFA',
              fontSize: 13, color: '#0F172A', outline: 'none', transition: 'all 0.2s ease'
            }}
            onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda"
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
              <X size={14} aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* ── Grid de usuarios ────────────────────────────────────── */}
      {loading ? (
        /* Skeletons */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ height: 3, background: '#F1F5F9', animation: 'usr-pulse 1.4s ease infinite' }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F1F5F9', animation: 'usr-pulse 1.4s ease infinite', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, marginBottom: 6, animation: 'usr-pulse 1.4s ease infinite', animationDelay: '0.1s' }} />
                    <div style={{ height: 10, width: '60%', background: '#F1F5F9', borderRadius: 6, animation: 'usr-pulse 1.4s ease infinite', animationDelay: '0.2s' }} />
                  </div>
                </div>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{ height: 10, background: '#F1F5F9', borderRadius: 6, marginBottom: 8, animation: 'usr-pulse 1.4s ease infinite', animationDelay: `${0.1 * j}s` }} />
                ))}
              </div>
              <div style={{ height: 44, background: '#FAFBFC', borderTop: '1px solid #F1F5F9', animation: 'usr-pulse 1.4s ease infinite' }} />
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        /* Sin resultados */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '60px 20px', textAlign: 'center'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, marginBottom: 16,
            background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UserCog size={28} color="#14B8A6" aria-hidden />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>No se encontraron usuarios</p>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>
            {busqueda ? 'Ajusta el término de búsqueda' : 'Aún no hay usuarios registrados en el sistema'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtrados.map((u, idx) => (
              <UsuarioCard
                key={u.idUsuario}
                usuario={u}
                idx={idx}
                formatFecha={formatFecha}
                onCambiarRol={() => abrirModal('rol', u)}
                onRestablecer={() => abrirModal('pass', u)}
                onToggle={() => handleToggleActivo(u)}
              />
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: '#94A3B8', textAlign: 'right' }}>
            Mostrando {filtrados.length} de {usuarios.length} usuarios
          </div>
        </>
      )}

      {/* ── Modal cambiar rol ───────────────────────────────────── */}
      {modal?.tipo === 'rol' && (
        <ModalOverlay onClose={cerrar}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440,
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)', animation: 'usr-modal-in 0.2s ease both'
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid #F1F5F9',
              borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', gap: 12
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ShieldCheck size={18} color="#fff" aria-hidden />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>Cambiar Rol</h2>
                <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>Asigna un nuevo rol al usuario</p>
              </div>
              <button
                onClick={cerrar}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 6, borderRadius: 8, transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8' }}
                aria-label="Cerrar"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#FAFBFC', border: '1px solid #F1F5F9', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#0F172A', margin: 0, fontWeight: 700 }}>
                  {modal.usuario.nombre1} {modal.usuario.apellido1}
                </p>
                <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>
                  Rol actual: <strong>{modal.usuario.nombreRol}</strong>
                </p>
              </div>

              {mensaje.tipo === 'error' && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={14} color="#EF4444" aria-hidden />
                  <span style={{ fontSize: 12, color: '#991B1B' }}>{mensaje.texto}</span>
                </div>
              )}

              <CampoForm label="Nuevo rol *">
                <SelectForm value={form.idRol || ''} onChange={v => setForm({ ...form, idRol: v })}>
                  <option value="">-- Selecciona --</option>
                  {ROLES_DISPONIBLES.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </SelectForm>
              </CampoForm>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #F1F5F9', padding: '14px 24px', borderRadius: '0 0 20px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={cerrar}
                style={{ padding: '9px 18px', border: '1.5px solid #E2E8F0', background: '#FAFAFA', color: '#64748B', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCambiarRol}
                disabled={procesando}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '9px 22px',
                  background: 'linear-gradient(135deg, #14B8A6, #06B6D4)', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: procesando ? 'not-allowed' : 'pointer', opacity: procesando ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(20,184,166,0.3)', transition: 'all 0.2s ease'
                }}
              >
                {procesando && <RefreshCw size={13} style={{ animation: 'usr-spin 0.8s linear infinite' }} aria-hidden />}
                {procesando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── Modal restablecer contraseña ─────────────────────────── */}
      {modal?.tipo === 'pass' && (
        <ModalOverlay onClose={cerrar}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440,
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)', animation: 'usr-modal-in 0.2s ease both'
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid #F1F5F9',
              borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', gap: 12
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #F59E0B, #FB923C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Key size={18} color="#fff" aria-hidden />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>Restablecer Contraseña</h2>
                <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>Define una nueva contraseña temporal</p>
              </div>
              <button
                onClick={cerrar}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 6, borderRadius: 8, transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8' }}
                aria-label="Cerrar"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#FAFBFC', border: '1px solid #F1F5F9', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#0F172A', margin: 0, fontWeight: 700 }}>
                  {modal.usuario.nombre1} {modal.usuario.apellido1}
                </p>
                <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>{modal.usuario.email}</p>
              </div>

              {mensaje.tipo === 'error' && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={14} color="#EF4444" aria-hidden />
                  <span style={{ fontSize: 12, color: '#991B1B' }}>{mensaje.texto}</span>
                </div>
              )}

              <CampoForm label="Nueva contraseña *">
                <InputForm
                  type="password"
                  value={form.nuevaContrasena || ''}
                  placeholder="Mín. 8 caracteres, mayúscula y número"
                  onChange={v => setForm({ ...form, nuevaContrasena: v })}
                />
              </CampoForm>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>Se notificará al usuario por correo electrónico.</p>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #F1F5F9', padding: '14px 24px', borderRadius: '0 0 20px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={cerrar}
                style={{ padding: '9px 18px', border: '1.5px solid #E2E8F0', background: '#FAFAFA', color: '#64748B', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleRestablecerPass}
                disabled={procesando}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '9px 22px',
                  background: 'linear-gradient(135deg, #F59E0B, #FB923C)', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: procesando ? 'not-allowed' : 'pointer', opacity: procesando ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(245,158,11,0.3)', transition: 'all 0.2s ease'
                }}
              >
                {procesando && <RefreshCw size={13} style={{ animation: 'usr-spin 0.8s linear infinite' }} aria-hidden />}
                {procesando ? 'Guardando…' : 'Restablecer'}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  )
}

// ── Card de usuario ───────────────────────────────────────────────
function UsuarioCard({ usuario: u, idx, formatFecha, onCambiarRol, onRestablecer, onToggle }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${hovered ? 'rgba(20,184,166,0.3)' : '#F1F5F9'}`,
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'default',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        animation: 'usr-fade 0.22s ease both',
        animationDelay: `${idx * 0.04}s`
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Borde top */}
      <div style={{ height: 3, background: getBordeTop(u.estado) }} />

      {/* Cuerpo */}
      <div style={{ padding: '14px 16px' }}>
        {/* Header card */}
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
            <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0', fontFamily: 'monospace' }}>
              {u.documento || '—'}
            </p>
          </div>
          <ChipInline style={{ background: '#F0FDFA', color: '#0F766E' }}>
            {u.nombreRol || 'Sin rol'}
          </ChipInline>
        </div>

        {/* Datos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <DatoCard icon={<Mail size={12} aria-hidden />} texto={u.email} />
          <DatoCard icon={<Calendar size={12} aria-hidden />} texto={`Registrado: ${formatFecha(u.fechaCreacion)}`} />
        </div>
      </div>

      {/* Footer card */}
      <div style={{
        background: '#FAFBFC', borderTop: '1px solid #F1F5F9',
        padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <ChipInline style={ESTADO_STYLE[u.estado] || { background: '#F1F5F9', color: '#475569' }}>
          {ESTADO_ICON[u.estado]} {ESTADO_LABEL[u.estado] || u.estado}
        </ChipInline>

        <div style={{ display: 'flex', gap: 4 }}>
          <BtnIcono onClick={onCambiarRol} title="Cambiar rol" hoverColor="#14B8A6" hoverBg="#F0FDFA">
            <ShieldCheck size={14} aria-hidden />
          </BtnIcono>
          <BtnIcono onClick={onRestablecer} title="Restablecer contraseña" hoverColor="#D97706" hoverBg="#FFFBEB">
            <Key size={14} aria-hidden />
          </BtnIcono>
          {u.estado === 'ACTIVO' ? (
            <BtnIcono onClick={onToggle} title="Desactivar usuario" hoverColor="#EF4444" hoverBg="#FEF2F2">
              <ToggleRight size={14} aria-hidden />
            </BtnIcono>
          ) : u.estado === 'INACTIVO' ? (
            <BtnIcono onClick={onToggle} title="Activar usuario" hoverColor="#10B981" hoverBg="#F0FDF4">
              <ToggleLeft size={14} aria-hidden />
            </BtnIcono>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ── Componentes auxiliares del sistema ───────────────────────────

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

function CampoForm({ label, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function InputForm({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '9px 12px', boxSizing: 'border-box',
        border: '1.5px solid #E2E8F0', borderRadius: 9, background: '#FAFAFA',
        fontSize: 13, color: '#0F172A', outline: 'none', transition: 'all 0.2s ease'
      }}
      onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
      onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
    />
  )
}

function SelectForm({ value, onChange, children }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '9px 12px', boxSizing: 'border-box',
        border: '1.5px solid #E2E8F0', borderRadius: 9, background: '#FAFAFA',
        fontSize: 13, color: '#0F172A', outline: 'none',
        cursor: 'pointer', transition: 'all 0.2s ease'
      }}
      onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
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
      padding: '2px 8px', borderRadius: 99,
      fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', ...style
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

export default GestionUsuarios
