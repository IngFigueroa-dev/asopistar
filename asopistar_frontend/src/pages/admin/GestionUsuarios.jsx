// src/pages/admin/GestionUsuarios.jsx
import { useState, useEffect } from 'react'
import {
  UserCog, Search, RefreshCw, ToggleLeft, ToggleRight,
  Key, Edit2, ShieldCheck
} from 'lucide-react'
import api from '../../services/api'

const ROLES_DISPONIBLES = [
  { id: 2,  nombre: 'Administrador General' },
  { id: 3,  nombre: 'Productor' },
  { id: 4,  nombre: 'Biólogo' },
  { id: 5,  nombre: 'Gerente de Planta' },
  { id: 6,  nombre: 'Personal Cuarto Frío' },
  { id: 7,  nombre: 'Contadora' },
  { id: 8,  nombre: 'Secretaria' },
  { id: 9,  nombre: 'Gerente Comercial' },
  { id: 10,  nombre: 'Vendedor de Insumos' },
]

const ESTADO_BADGE = {
  ACTIVO:                 { label: 'Activo',                  cls: 'bg-green-100 text-green-700' },
  PENDIENTE_APROBACION:   { label: 'Pendiente aprobación',    cls: 'bg-blue-100 text-blue-700' },
  PENDIENTE_VERIFICACION: { label: 'Pendiente verificación',  cls: 'bg-yellow-100 text-yellow-700' },
  RECHAZADO:              { label: 'Rechazado',               cls: 'bg-red-100 text-red-600' },
  INACTIVO:               { label: 'Inactivo',                cls: 'bg-gray-100 text-gray-500' },
}

function GestionUsuarios() {
  const [usuarios, setUsuarios]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [busqueda, setBusqueda]   = useState('')
  const [modal, setModal]         = useState(null)   // { tipo, usuario }
  const [form, setForm]           = useState({})
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje]     = useState({ tipo: '', texto: '' })

  useEffect(() => { cargar() }, [])

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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">
            Administra los usuarios del sistema: roles, accesos y contraseñas.
          </p>
        </div>
        <button onClick={cargar} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {/* Feedback global */}
      {mensaje.texto && (
        <div className={`px-4 py-3 rounded-lg text-sm mb-4 border ${
          mensaje.tipo === 'exito'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Buscador */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Usuario</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Correo</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Rol actual</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Registro</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(u => {
                  const badge = ESTADO_BADGE[u.estado] || { label: u.estado, cls: 'bg-gray-100 text-gray-500' }
                  return (
                    <tr key={u.idUsuario} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {u.nombre1?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{u.nombre1} {u.apellido1}</p>
                            <p className="text-xs text-gray-400">{u.documento || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{u.email}</td>
                      <td className="px-5 py-3 text-gray-600">{u.nombreRol || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{formatFecha(u.fechaCreacion)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          {/* Cambiar rol */}
                          <button
                            onClick={() => abrirModal('rol', u)}
                            className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Cambiar rol"
                          >
                            <ShieldCheck size={15} />
                          </button>
                          {/* Restablecer contraseña */}
                          <button
                            onClick={() => abrirModal('pass', u)}
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Restablecer contraseña"
                          >
                            <Key size={15} />
                          </button>
                          {/* Activar / Desactivar */}
                          {u.estado === 'ACTIVO' ? (
                            <button
                              onClick={() => handleToggleActivo(u)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Desactivar usuario"
                            >
                              <ToggleRight size={15} />
                            </button>
                          ) : u.estado === 'INACTIVO' ? (
                            <button
                              onClick={() => handleToggleActivo(u)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Activar usuario"
                            >
                              <ToggleLeft size={15} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal cambiar rol ───────────────────────────────── */}
      {modal?.tipo === 'rol' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Cambiar rol</h2>
            <p className="text-sm text-gray-500 mb-4">
              Usuario: <strong>{modal.usuario.nombre1} {modal.usuario.apellido1}</strong><br />
              Rol actual: <strong>{modal.usuario.nombreRol}</strong>
            </p>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Nuevo rol</label>
            <select
              value={form.idRol || ''}
              onChange={e => setForm({ ...form, idRol: e.target.value })}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 mb-4"
            >
              <option value="">-- Selecciona --</option>
              {ROLES_DISPONIBLES.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
            {mensaje.tipo === 'error' && (
              <p className="text-red-600 text-sm mb-3">⚠️ {mensaje.texto}</p>
            )}
            <div className="flex gap-3">
              <button onClick={cerrar} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleCambiarRol} disabled={procesando}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-70">
                {procesando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal restablecer contraseña ────────────────────── */}
      {modal?.tipo === 'pass' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Restablecer contraseña</h2>
            <p className="text-sm text-gray-500 mb-4">
              Usuario: <strong>{modal.usuario.nombre1} {modal.usuario.apellido1}</strong>
            </p>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={form.nuevaContrasena || ''}
              onChange={e => setForm({ ...form, nuevaContrasena: e.target.value })}
              placeholder="Mín. 8 caracteres, mayúscula y número"
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 mb-1"
            />
            <p className="text-xs text-gray-400 mb-4">Se notificará al usuario por correo.</p>
            {mensaje.tipo === 'error' && (
              <p className="text-red-600 text-sm mb-3">⚠️ {mensaje.texto}</p>
            )}
            <div className="flex gap-3">
              <button onClick={cerrar} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleRestablecerPass} disabled={procesando}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-70">
                {procesando ? 'Guardando...' : 'Restablecer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionUsuarios
