import { Settings } from 'lucide-react'
import { useAccessibility } from '../../hooks/useAccessibility'

function BotoNivel({ icono, titulo, descripcion, nivel, nivelMax, labelNivel, activo, onClick }) {
  const puntos = Array.from({ length: nivelMax }, (_, i) => i + 1)
  return (
    <button
      onClick={onClick}
      className={`relative text-left p-5 rounded-xl border-2 transition-all w-full ${
        activo ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{icono}</span>
        {activo && (
          <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full font-semibold">
            {labelNivel}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{titulo}</h3>
      <p className="text-sm text-gray-500 mb-4">{descripcion}</p>
      <div className="flex gap-1.5">
        {puntos.map(p => (
          <span key={p} className={`h-1.5 flex-1 rounded-full transition-colors ${
            p <= nivel ? 'bg-teal-500' : 'bg-gray-200'
          }`} />
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {activo ? `Nivel ${nivel} de ${nivelMax} — clic para avanzar` : 'Inactivo — clic para activar'}
      </p>
    </button>
  )
}

function Configuracion() {
  const {
    estado, contraste, texto, cursor,
    ciclarContraste, ciclarTexto, ciclarCursor,
    resetear, hayAlgoActivo,
  } = useAccessibility()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Configuracion</h1>
        <p className="text-gray-500 text-sm mt-1">Preferencias de accesibilidad y sesion.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-teal-600" />
            <h2 className="font-semibold text-gray-800 text-lg">Accesibilidad</h2>
          </div>
          {hayAlgoActivo && (
            <button onClick={resetear}
              className="text-sm text-red-400 hover:text-red-600 font-medium">
              Restablecer todo
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Tambien puedes ajustar estas opciones desde el boton flotante visible en toda la plataforma, incluso sin iniciar sesion.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BotoNivel
            icono="&#9685;"
            titulo="Contraste"
            descripcion="Ajusta el contraste de colores para mayor visibilidad. 3 modos disponibles."
            nivel={contraste.nivel}
            nivelMax={3}
            labelNivel={contraste.label}
            activo={contraste.nivel > 0}
            onClick={ciclarContraste}
          />
          <BotoNivel
            icono="T"
            titulo="Tamano de texto"
            descripcion="Aumenta el tamano de la letra progresivamente. 4 niveles disponibles."
            nivel={texto.nivel}
            nivelMax={4}
            labelNivel={texto.label}
            activo={texto.nivel > 0}
            onClick={ciclarTexto}
          />
          <BotoNivel
            icono="&#8598;"
            titulo="Cursor y Lectura"
            descripcion="Nivel 1: cursor grande. Nivel 2: cursor grande con mascara de lectura."
            nivel={cursor.nivel}
            nivelMax={2}
            labelNivel={cursor.nivel === 1 ? 'Cursor grande' : 'Mascara activa'}
            activo={cursor.nivel > 0}
            onClick={ciclarCursor}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 text-lg mb-4">Informacion de Sesion</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Usuario</span>
            <span className="text-sm font-medium text-gray-800">{localStorage.getItem('email')}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Rol</span>
            <span className="text-sm font-medium text-gray-800">
              {localStorage.getItem('rol')?.replace('ROLE_', '')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Configuracion
