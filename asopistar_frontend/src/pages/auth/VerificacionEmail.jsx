// src/pages/auth/VerificacionEmail.jsx
// El usuario llega aquí al hacer clic en el enlace del correo.
// NO verificamos automáticamente en el useEffect porque los clientes de correo
// (Gmail, Outlook) hacen pre-fetch de los enlaces y consumen el token.
// En su lugar mostramos un botón que el usuario debe presionar conscientemente.
import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../../services/api'

function VerificacionEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [estado, setEstado] = useState('esperando') // esperando | cargando | exito | error
  const [mensaje, setMensaje] = useState('')

  const handleVerificar = async () => {
    setEstado('cargando')
    try {
      await api.get(`/auth/verificar-email?token=${token}`)
      setEstado('exito')
    } catch (err) {
      setEstado('error')
      const msg = err.response?.data?.mensaje || err.response?.data?.message
      setMensaje(msg || 'El enlace expiró o ya fue usado. Solicita un nuevo enlace.')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2332] to-[#0d9488] p-5">
        <div className="bg-white rounded-2xl p-12 w-full max-w-md shadow-2xl text-center">
          <div className="text-5xl mb-3">🐟</div>
          <h1 className="text-2xl font-extrabold text-[#1a2332] mb-6">ASOPISTAR</h1>
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Enlace inválido</h2>
          <p className="text-gray-500 text-sm mb-6">El enlace no contiene un token de verificación válido.</p>
          <Link to="/login" className="text-sm text-teal-600 hover:text-teal-700 font-semibold">Volver al login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2332] to-[#0d9488] p-5">
      <div className="bg-white rounded-2xl p-12 w-full max-w-md shadow-2xl text-center">

        <div className="text-5xl mb-3">🐟</div>
        <h1 className="text-2xl font-extrabold text-[#1a2332] mb-1">ASOPISTAR</h1>
        <p className="text-gray-400 text-xs mb-8">Gestión Piscícola</p>

        {estado === 'esperando' && (
          <>
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Confirma tu correo electrónico
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Haz clic en el botón de abajo para verificar tu dirección de correo
              y enviar tu solicitud de acceso al administrador.
            </p>
            <button
              onClick={handleVerificar}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl text-base transition-colors mb-4"
            >
              ✅ Verificar mi correo
            </button>
            <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">
              Volver al inicio de sesión
            </Link>
          </>
        )}

        {estado === 'cargando' && (
          <>
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto my-6" />
            <p className="text-gray-500">Verificando tu correo...</p>
          </>
        )}

        {estado === 'exito' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              ¡Correo verificado exitosamente!
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Tu solicitud fue enviada al administrador. Recibirás un correo
              cuando tu acceso sea aprobado.
            </p>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-teal-700 font-medium">
                ⏳ Estado: <strong>Pendiente de aprobación</strong>
              </p>
            </div>
            <Link
              to="/login"
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-sm"
            >
              Ir al inicio de sesión
            </Link>
          </>
        )}

        {estado === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">Enlace inválido</h2>
            <p className="text-gray-500 text-sm mb-8">{mensaje}</p>
            <div className="flex flex-col gap-3">
              <Link
                to="/registro"
                className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-sm"
              >
                Registrarme de nuevo
              </Link>
              <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">
                Volver al login
              </Link>
            </div>
          </>
        )}

        <p className="text-xs text-gray-300 mt-8">
          Asociación de Piscicultores del Tarra
        </p>
      </div>
    </div>
  )
}

export default VerificacionEmail
