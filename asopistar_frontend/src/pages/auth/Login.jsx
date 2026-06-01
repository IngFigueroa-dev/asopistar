// src/pages/auth/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'

function Login() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', contrasena: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token',    res.data.token)
      localStorage.setItem('email',    res.data.email)
      localStorage.setItem('rol',      res.data.rol)
      localStorage.setItem('nombre',   res.data.nombre)
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

        <p className="text-center text-xs text-gray-400 mt-6">
          Asociación de Piscicultores del Tarra
        </p>
      </div>
    </div>
  )
}

export default Login
