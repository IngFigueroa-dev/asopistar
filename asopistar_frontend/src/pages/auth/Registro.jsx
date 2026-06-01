// src/pages/auth/Registro.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ChevronDown } from 'lucide-react'
import api from '../../services/api'

const CARGOS = [
  { value: 'PRODUCTOR',          label: 'Productor' },
  { value: 'BIOLOGO',            label: 'Biólogo' },
  { value: 'GERENTE_PLANTA',     label: 'Gerente de Planta' },
  { value: 'PERSONAL_CUARTO_FRIO', label: 'Personal de Cuarto Frío' },
  { value: 'CONTADORA',          label: 'Contadora' },
  { value: 'SECRETARIA',         label: 'Secretaria' },
  { value: 'GERENTE_COMERCIAL',  label: 'Gerente Comercial' },
  { value: 'VENDEDOR_INSUMOS',   label: 'Vendedor de Insumos' },
]

const FORM_INICIAL = {
  nombre1: '', nombre2: '', apellido1: '', apellido2: '',
  documento: '', telefono: '', email: '',
  contrasena: '', confirmarContrasena: '',
  cargoSolicitado: '',
  // Campos productor
  fechaNacimiento: '', cantidadHijos: '', direccion: '',
}

function Campo({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"

function Registro() {
  const navigate = useNavigate()
  const [form, setForm]           = useState(FORM_INICIAL)
  const [verPass, setVerPass]     = useState(false)
  const [verPass2, setVerPass2]   = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [paso, setPaso]           = useState(1) // 1=datos personales, 2=acceso

  const esProductor = form.cargoSolicitado === 'PRODUCTOR'
  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const validarPaso1 = () => {
    if (!form.nombre1 || !form.apellido1 || !form.documento || !form.telefono) {
      setError('Completa todos los campos obligatorios.')
      return false
    }
    if (esProductor && (!form.fechaNacimiento || !form.direccion)) {
      setError('La fecha de nacimiento y dirección son obligatorias para productores.')
      return false
    }
    setError('')
    return true
  }

  const handleSiguiente = () => {
    if (validarPaso1()) setPaso(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.contrasena || !form.cargoSolicitado) {
      setError('Completa todos los campos obligatorios.')
      return
    }
    if (form.contrasena !== form.confirmarContrasena) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (form.contrasena.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.')
      return
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.contrasena)) {
      setError('La contraseña debe tener mayúscula, minúscula y número.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        nombre1:           form.nombre1,
        nombre2:           form.nombre2 || null,
        apellido1:         form.apellido1,
        apellido2:         form.apellido2 || null,
        documento:         form.documento,
        telefono:          form.telefono,
        email:             form.email,
        contrasena:        form.contrasena,
        confirmarContrasena: form.confirmarContrasena,
        cargoSolicitado:   form.cargoSolicitado,
        fechaNacimiento:   esProductor ? form.fechaNacimiento : null,
        cantidadHijos:     esProductor ? (parseInt(form.cantidadHijos) || 0) : null,
        direccion:         esProductor ? form.direccion : null,
      }
      await api.post('/auth/registro', payload)
      navigate('/pendiente-aprobacion', {
        state: { email: form.email, tipo: 'verificacion' }
      })
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message
      setError(msg || 'Error al registrarse. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1a2332] to-[#0d9488] p-5">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">

        {/* Cabecera */}
        <div className="bg-[#1a2332] px-8 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐟</span>
            <div>
              <h1 className="text-white font-extrabold text-xl">ASOPISTAR</h1>
              <p className="text-teal-400 text-xs">Solicitud de acceso al sistema</p>
            </div>
          </div>
          {/* Indicador de pasos */}
          <div className="flex items-center gap-2 mt-5">
            {[1, 2].map(n => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  paso >= n ? 'bg-teal-500 text-white' : 'bg-white/20 text-white/50'
                }`}>
                  {n}
                </div>
                <span className={`text-xs ${paso >= n ? 'text-teal-300' : 'text-white/40'}`}>
                  {n === 1 ? 'Datos personales' : 'Acceso y cargo'}
                </span>
                {n < 2 && <div className={`h-px w-8 ${paso > n ? 'bg-teal-400' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">

          {/* ── PASO 1: Datos personales ─────────────────────── */}
          {paso === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Información personal</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Ingresa tus datos tal como aparecen en tu documento de identidad.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Campo label="Primer nombre" required>
                  <input required value={form.nombre1} onChange={set('nombre1')} className={inputCls} />
                </Campo>
                <Campo label="Segundo nombre">
                  <input value={form.nombre2} onChange={set('nombre2')} className={inputCls} />
                </Campo>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Campo label="Primer apellido" required>
                  <input required value={form.apellido1} onChange={set('apellido1')} className={inputCls} />
                </Campo>
                <Campo label="Segundo apellido">
                  <input value={form.apellido2} onChange={set('apellido2')} className={inputCls} />
                </Campo>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Campo label="Número de documento" required>
                  <input required value={form.documento} onChange={set('documento')} className={inputCls} />
                </Campo>
                <Campo label="Teléfono" required>
                  <input required value={form.telefono} onChange={set('telefono')} className={inputCls} placeholder="3001234567" />
                </Campo>
              </div>

              {/* Campos adicionales para PRODUCTOR — se muestran si ya seleccionó cargo */}
              {esProductor && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex flex-col gap-4">
                  <p className="text-sm font-semibold text-teal-700">
                    📋 Información adicional requerida para productores
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Campo label="Fecha de nacimiento" required>
                      <input type="date" required value={form.fechaNacimiento} onChange={set('fechaNacimiento')} className={inputCls} />
                    </Campo>
                    <Campo label="Cantidad de hijos">
                      <input type="number" min="0" value={form.cantidadHijos} onChange={set('cantidadHijos')} className={inputCls} />
                    </Campo>
                  </div>
                  <Campo label="Dirección" required>
                    <input required value={form.direccion} onChange={set('direccion')} className={inputCls} placeholder="Vereda, municipio..." />
                  </Campo>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Link
                  to="/login"
                  className="flex-1 text-center px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Volver al login
                </Link>
                <button
                  type="button"
                  onClick={handleSiguiente}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 2: Acceso y cargo ───────────────────────── */}
          {paso === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Acceso al sistema</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Define tu correo, contraseña y el cargo que desempeñas en la organización.
                </p>
              </div>

              <Campo label="Correo electrónico" required>
                <input
                  type="email" required value={form.email} onChange={set('email')}
                  className={inputCls} placeholder="nombre@correo.com"
                />
              </Campo>

              <div className="grid grid-cols-2 gap-4">
                <Campo label="Contraseña" required>
                  <div className="relative">
                    <input
                      type={verPass ? 'text' : 'password'}
                      required value={form.contrasena} onChange={set('contrasena')}
                      className={`${inputCls} pr-10`}
                      placeholder="Mín. 8 caracteres"
                    />
                    <button type="button" onClick={() => setVerPass(!verPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {verPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Debe tener mayúscula, minúscula y número</p>
                </Campo>

                <Campo label="Confirmar contraseña" required>
                  <div className="relative">
                    <input
                      type={verPass2 ? 'text' : 'password'}
                      required value={form.confirmarContrasena} onChange={set('confirmarContrasena')}
                      className={`${inputCls} pr-10`}
                    />
                    <button type="button" onClick={() => setVerPass2(!verPass2)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {verPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Campo>
              </div>

              <Campo label="Cargo solicitado" required>
                <div className="relative">
                  <select
                    required value={form.cargoSolicitado}
                    onChange={e => {
                      setForm({ ...form, cargoSolicitado: e.target.value })
                      // Si cambia a productor y estaba en paso 2, volver para mostrar campos extra
                      if (e.target.value === 'PRODUCTOR') setPaso(1)
                    }}
                    className={`${inputCls} appearance-none pr-10`}
                  >
                    <option value="">-- Selecciona tu cargo --</option>
                    {CARGOS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  El administrador verificará y asignará tu rol definitivo al aprobar tu solicitud.
                </p>
              </Campo>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setPaso(1); setError('') }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70"
                >
                  {loading ? 'Enviando solicitud...' : 'Enviar solicitud de acceso'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Registro
