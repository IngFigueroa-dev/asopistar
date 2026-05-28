import { useState, useEffect } from 'react'
import { Settings, Type, Sun, AlignLeft, Check } from 'lucide-react'
 
function Configuracion() {
  const [accesibilidad, setAccesibilidad] = useState({
    textoGrande: false,
    altoContraste: false,
    tipografiaAlternativa: false,
  })
 
  useEffect(() => {
    const guardado = JSON.parse(localStorage.getItem('accesibilidad') || '{}')
    setAccesibilidad(prev => ({ ...prev, ...guardado }))
    aplicarAccesibilidad(guardado)
  }, [])
 
  const aplicarAccesibilidad = (config) => {
    document.body.classList.toggle('large-text', !!config.textoGrande)
    document.body.classList.toggle('high-contrast', !!config.altoContraste)
    document.body.classList.toggle('alt-font', !!config.tipografiaAlternativa)
  }
 
  const toggleOpcion = (key) => {
    const nuevo = { ...accesibilidad, [key]: !accesibilidad[key] }
    setAccesibilidad(nuevo)
    localStorage.setItem('accesibilidad', JSON.stringify(nuevo))
    aplicarAccesibilidad(nuevo)
  }
 
  const opciones = [
    {
      key: 'textoGrande',
      icon: Type,
      titulo: 'Texto Grande',
      descripcion: 'Aumenta el tamaño de la letra para facilitar la lectura',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      key: 'altoContraste',
      icon: Sun,
      titulo: 'Alto Contraste',
      descripcion: 'Aumenta el contraste de colores para mayor visibilidad',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      key: 'tipografiaAlternativa',
      icon: AlignLeft,
      titulo: 'Tipografía Alternativa',
      descripcion: 'Usa una fuente más legible con mayor espacio entre letras',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]
 
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona las preferencias y configuraciones de la plataforma.</p>
      </div>
 
      {/* Accesibilidad */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings size={20} className="text-teal-600" />
          <h2 className="font-semibold text-gray-800 text-lg">Opciones de Accesibilidad</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Activa las opciones que mejor se adapten a tus necesidades. Los cambios se aplican de inmediato.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {opciones.map(({ key, icon: Icon, titulo, descripcion, color, bg }) => (
            <button
              key={key}
              onClick={() => toggleOpcion(key)}
              className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                accesibilidad[key]
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {accesibilidad[key] && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
                <Icon size={24} className={color} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{titulo}</h3>
              <p className="text-sm text-gray-500">{descripcion}</p>
              <div className={`mt-4 text-sm font-medium ${accesibilidad[key] ? 'text-teal-600' : 'text-gray-400'}`}>
                {accesibilidad[key] ? '✓ Activado' : 'Inactivo'}
              </div>
            </button>
          ))}
        </div>
      </div>
 
      {/* Info usuario */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 text-lg mb-4">Información de Sesión</h2>
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
