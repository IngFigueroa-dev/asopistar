// src/pages/admin/SolicitudesAcceso.jsx
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, RefreshCw, Clock, Filter } from 'lucide-react'
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
  { id: 10,  nombre: 'Vendedor de Insumos' },
]

const ESTADO_BADGE = {
  PENDIENTE_VERIFICACION: { label: 'Pendiente verificación', cls: 'bg-yellow-100 text-yellow-700' },
  PENDIENTE_APROBACION:   { label: 'Pendiente aprobación',   cls: 'bg-blue-100 text-blue-700' },
  ACTIVO:                 { label: 'Aprobado',               cls: 'bg-green-100 text-green-700' },
  RECHAZADO:              { label: 'Rechazado',              cls: 'bg-red-100 text-red-600' },
  INACTIVO:               { label: 'Inactivo',               cls: 'bg-gray-100 text-gray-600' },
}

function SolicitudesAcceso() {
  const [solicitudes, setSolicitudes]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('PENDIENTE_APROBACION')
  const [detalle, setDetalle]           = useState(null)   // usuario seleccionado
  const [modalTipo, setModalTipo]       = useState(null)   // 'aprobar' | 'rechazar' | 'detalle'
  const [rolSeleccionado, setRolSeleccionado] = useState('')
  const [motivoRechazo, setMotivoRechazo]     = useState('')
  const [procesando, setProcesando]           = useState(false)
  const [exito, setExito]                     = useState('')
  const [error, setError]                     = useState('')

  useEffect(() => { cargar() }, [filtroEstado])

  const cargar = async () => {
    setLoading(true)
    setError('')
    try {
      const url = filtroEstado === 'TODOS'
        ? '/usuarios'
        : `/usuarios/por-estado?estado=${filtroEstado}`
      const res = await api.get(url)
      setSolicitudes(res.data)
    } catch {
      setError('Error al cargar las solicitudes.')
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (usuario, tipo) => {
    setDetalle(usuario)
    setModalTipo(tipo)
    setRolSeleccionado('')
    setMotivoRechazo('')
    setExito('')
    setError('')
  }

  const cerrarModal = () => {
    setDetalle(null)
    setModalTipo(null)
  }

  const handleAprobar = async () => {
    if (!rolSeleccionado) { setError('Debes seleccionar un rol.'); return }
    setProcesando(true)
    setError('')
    try {
      await api.patch(`/usuarios/${detalle.idUsuario}/aprobar`, {
        idRolAsignado: parseInt(rolSeleccionado)
      })
      setExito(`✅ ${detalle.nombre1} ${detalle.apellido1} fue aprobado/a correctamente.`)
      cerrarModal()
      cargar()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al aprobar.')
    } finally {
      setProcesando(false)
    }
  }

  const handleRechazar = async () => {
    setProcesando(true)
    setError('')
    try {
      await api.patch(`/usuarios/${detalle.idUsuario}/rechazar`, {
        motivoRechazo: motivoRechazo || null
      })
      setExito(`❌ ${detalle.nombre1} ${detalle.apellido1} fue rechazado/a.`)
      cerrarModal()
      cargar()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al rechazar.')
    } finally {
      setProcesando(false)
    }
  }

  const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric'
  }) : '—'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Solicitudes de Acceso</h1>
          <p className="text-gray-500 text-sm mt-1">
            Aprueba o rechaza las solicitudes de registro al sistema.
          </p>
        </div>
        <button onClick={cargar} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {/* Feedback global */}
      {exito && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
          {exito}
        </div>
      )}

      {/* Filtro de estado */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Filter size={16} className="text-gray-400" />
        {['PENDIENTE_APROBACION', 'PENDIENTE_VERIFICACION', 'ACTIVO', 'RECHAZADO', 'TODOS'].map(e => (
          <button
            key={e}
            onClick={() => setFiltroEstado(e)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filtroEstado === e
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {e === 'TODOS' ? 'Todos' : ESTADO_BADGE[e]?.label || e}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400">Cargando...</div>
      ) : solicitudes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Clock size={36} className="mb-2 opacity-30" />
          <p>No hay solicitudes en este estado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Nombre</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Documento</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Correo</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Cargo solicitado</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Fecha</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map(u => {
                  const badge = ESTADO_BADGE[u.estado] || { label: u.estado, cls: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={u.idUsuario} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {u.nombre1} {u.apellido1}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{u.documento || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{u.email}</td>
                      <td className="px-5 py-3 text-gray-600">{u.cargoSolicitado || '—'}</td>
                      <td className="px-5 py-3 text-gray-500">{formatFecha(u.fechaCreacion)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirModal(u, 'detalle')}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                          {u.estado === 'PENDIENTE_APROBACION' && (
                            <>
                              <button
                                onClick={() => abrirModal(u, 'aprobar')}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Aprobar"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => abrirModal(u, 'rechazar')}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Rechazar"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
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

      {/* ── Modal ──────────────────────────────────────────────── */}
      {modalTipo && detalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {modalTipo === 'aprobar'  && '✅ Aprobar solicitud'}
                {modalTipo === 'rechazar' && '❌ Rechazar solicitud'}
                {modalTipo === 'detalle'  && '👤 Detalle del solicitante'}
              </h2>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Info del usuario */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <p><span className="text-gray-500">Nombre:</span> <strong>{detalle.nombre1} {detalle.nombre2 || ''} {detalle.apellido1} {detalle.apellido2 || ''}</strong></p>
                <p><span className="text-gray-500">Documento:</span> {detalle.documento || '—'}</p>
                <p><span className="text-gray-500">Correo:</span> {detalle.email}</p>
                <p><span className="text-gray-500">Teléfono:</span> {detalle.telefono || '—'}</p>
                <p><span className="text-gray-500">Cargo solicitado:</span> <strong>{detalle.cargoSolicitado || '—'}</strong></p>
                {detalle.direccion && <p><span className="text-gray-500">Dirección:</span> {detalle.direccion}</p>}
                {detalle.fechaNacimiento && <p><span className="text-gray-500">F. Nacimiento:</span> {formatFecha(detalle.fechaNacimiento)}</p>}
              </div>

              {/* Aprobar — seleccionar rol */}
              {modalTipo === 'aprobar' && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Rol a asignar <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rolSeleccionado}
                    onChange={e => setRolSeleccionado(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  >
                    {ROLES_DISPONIBLES.map(r => (
                      <option key={r.id ?? 'none'} value={r.id ?? ''} disabled={!r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    El cargo solicitado fue: <strong>{detalle.cargoSolicitado}</strong>
                  </p>
                </div>
              )}

              {/* Rechazar — motivo opcional */}
              {modalTipo === 'rechazar' && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Motivo del rechazo (opcional)
                  </label>
                  <textarea
                    value={motivoRechazo}
                    onChange={e => setMotivoRechazo(e.target.value)}
                    rows={3}
                    placeholder="Ej: La información proporcionada no coincide con nuestros registros."
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Este mensaje se enviará al usuario por correo.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={cerrarModal}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {modalTipo === 'detalle' ? 'Cerrar' : 'Cancelar'}
                </button>

                {modalTipo === 'aprobar' && (
                  <button
                    onClick={handleAprobar}
                    disabled={procesando}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70"
                  >
                    {procesando ? 'Aprobando...' : 'Confirmar aprobación'}
                  </button>
                )}

                {modalTipo === 'rechazar' && (
                  <button
                    onClick={handleRechazar}
                    disabled={procesando}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70"
                  >
                    {procesando ? 'Rechazando...' : 'Confirmar rechazo'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SolicitudesAcceso
