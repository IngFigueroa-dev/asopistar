// src/pages/auth/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { X } from 'lucide-react'
import api from '../../services/api'

function Login() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', contrasena: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  // ── Modal reenvío ────────────────────────────────────────────────────────
  const [modalReenvio, setModalReenvio]     = useState(false)
  const [emailReenvio, setEmailReenvio]     = useState('')
  const [reenvioEstado, setReenvioEstado]   = useState('idle') // idle|loading|exito|error
  const [reenvioMensaje, setReenvioMensaje] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token',     res.data.token)
      localStorage.setItem('email',     res.data.email)
      localStorage.setItem('rol',       res.data.rol)
      localStorage.setItem('nombre',    res.data.nombre)
      localStorage.setItem('idUsuario', res.data.idUsuario)
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      if (status === 401) {
        setError('Correo o contraseña incorrectos.')
      } else if (status === 403) {
        setError('Tu cuenta aún no está aprobada o fue desactivada.')
      } else {
        setError('Error de conexión. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const abrirModalReenvio = () => {
    setEmailReenvio(form.email) // pre-llenar con el correo que ya escribió
    setReenvioEstado('idle')
    setReenvioMensaje('')
    setModalReenvio(true)
  }

  const handleReenviar = async () => {
    if (!emailReenvio.trim()) {
      setReenvioMensaje('Ingresa tu correo electrónico.')
      setReenvioEstado('error')
      return
    }
    setReenvioEstado('loading')
    setReenvioMensaje('')
    try {
      await api.post('/auth/reenviar-verificacion', { email: emailReenvio.trim() })
      setReenvioEstado('exito')
      setReenvioMensaje('Hemos enviado un nuevo correo de verificación a tu dirección registrada.')
    } catch (err) {
      setReenvioEstado('error')
      const msg = err.response?.data?.mensaje || err.response?.data?.message
      setReenvioMensaje(msg || 'No se pudo reenviar. Verifica que el correo esté registrado.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1a2332] to-[#0d9488] p-5">
      <div className="bg-white rounded-2xl p-12 w-full max-w-md shadow-2xl">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">🐟</div>
          <h1 className="text-3xl font-extrabold text-[#1a2332]">ASOPISTAR</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión Piscícola</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="correo@asopistar.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-teal-500 transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.contrasena}
              onChange={e => setForm({ ...form, contrasena: e.target.value })}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-teal-500 transition-colors"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-lg text-base transition-colors disabled:opacity-70 mt-2"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Enlace a registro */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            ¿Eres nuevo en el sistema?{' '}
            <Link
              to="/registro"
              className="text-teal-600 hover:text-teal-700 font-semibold"
            >
              Solicitar acceso
            </Link>
          </p>
        </div>

        {/* ── Reenvío de verificación ── */}
        <div className="text-center mt-3">
          <button
            type="button"
            onClick={abrirModalReenvio}
            className="text-xs text-gray-400 hover:text-teal-600 transition-colors"
          >
            ¿No recibiste el correo de verificación? Reenviar enlace
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Asociación de Piscicultores del Tarra
        </p>
      </div>

      {/* ── Modal de reenvío ─────────────────────────────────────────────── */}
      {modalReenvio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">

            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">
                📧 Reenviar correo de verificación
              </h2>
              <button
                onClick={() => setModalReenvio(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {reenvioEstado !== 'exito' ? (
                <>
                  <p className="text-sm text-gray-500">
                    Ingresa el correo con el que te registraste y te enviaremos
                    un nuevo enlace de verificación.
                  </p>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={emailReenvio}
                      onChange={e => setEmailReenvio(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {reenvioEstado === 'error' && reenvioMensaje && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      ⚠️ {reenvioMensaje}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalReenvio(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleReenviar}
                      disabled={reenvioEstado === 'loading'}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70"
                    >
                      {reenvioEstado === 'loading' ? 'Enviando...' : 'Reenviar enlace'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="text-4xl">✅</div>
                  <p className="text-sm text-gray-600 text-center">{reenvioMensaje}</p>
                  <button
                    onClick={() => setModalReenvio(false)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
