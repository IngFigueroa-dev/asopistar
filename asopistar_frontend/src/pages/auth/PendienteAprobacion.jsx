// src/pages/auth/PendienteAprobacion.jsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../services/api'

function PendienteAprobacion() {
  const location = useLocation()
  const email = location.state?.email || ''
  const tipo  = location.state?.tipo  || 'verificacion' // 'verificacion' | 'aprobacion'

  const [reenvioEstado, setReenvioEstado] = useState('idle') // idle | loading | exito | error

  const handleReenviar = async () => {
    if (!email) return
    setReenvioEstado('loading')
    try {
      await api.post('/auth/reenviar-verificacion', { email })
      setReenvioEstado('exito')
    } catch {
      setReenvioEstado('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1a2332] to-[#0d9488] p-5">
      <div className="bg-white rounded-2xl p-12 w-full max-w-lg shadow-2xl text-center">

        <div className="text-5xl mb-3">🐟</div>
        <h1 className="text-2xl font-extrabold text-[#1a2332] mb-1">ASOPISTAR</h1>
        <p className="text-gray-400 text-xs mb-8">Gestión Piscícola</p>

        {/* Ícono según tipo */}
        {tipo === 'verificacion' ? (
          <>
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Verifica tu correo electrónico
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Te enviamos un enlace de verificación a{' '}
              <strong className="text-gray-700">{email || 'tu correo'}</strong>.
              Haz clic en ese enlace para confirmar tu cuenta.
            </p>

            {/* Pasos visuales */}
            <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-3">
              {[
                { n: '1', texto: 'Revisa tu bandeja de entrada (y la carpeta de spam)' },
                { n: '2', texto: 'Haz clic en el enlace "Verificar correo"' },
                { n: '3', texto: 'Espera la aprobación del administrador' },
                { n: '4', texto: 'Recibirás un correo cuando tu acceso sea aprobado' },
              ].map(({ n, texto }) => (
                <div key={n} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {n}
                  </div>
                  <p className="text-sm text-gray-600">{texto}</p>
                </div>
              ))}
            </div>

            {/* Reenviar verificación */}
            {reenvioEstado === 'exito' ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
                ✅ Nuevo enlace enviado. Revisa tu correo.
              </div>
            ) : reenvioEstado === 'error' ? (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                ⚠️ No se pudo reenviar. Intenta más tarde.
              </div>
            ) : null}

            {email && reenvioEstado !== 'exito' && (
              <button
                onClick={handleReenviar}
                disabled={reenvioEstado === 'loading'}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium mb-4 disabled:opacity-50"
              >
                {reenvioEstado === 'loading' ? 'Enviando...' : '¿No recibiste el correo? Reenviar enlace'}
              </button>
            )}
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Solicitud enviada correctamente
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Tu solicitud ha sido enviada. Debes esperar la{' '}
              <strong>aprobación del administrador</strong> para acceder al sistema.
              Recibirás un correo en{' '}
              <strong className="text-gray-700">{email}</strong> cuando sea aprobada.
            </p>
          </>
        )}

        <Link
          to="/login"
          className="inline-block text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Volver al inicio de sesión
        </Link>

        <p className="text-xs text-gray-300 mt-6">
          Asociación de Piscicultores del Tarra
        </p>
      </div>
    </div>
  )
}

export default PendienteAprobacion
