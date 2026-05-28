import { useState, useEffect } from 'react'
import { Snowflake, Package, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import api from '../../services/api'

// Capacidad máxima del cuarto frío en kilogramos
const CAPACIDAD_MAX_KG = 500

function Almacenamiento() {
  const [lotes, setLotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarLotes()
  }, [])

  const cargarLotes = async () => {
    try {
      const res = await api.get('/lotes-cuarto-frio')
      setLotes(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Solo lotes disponibles (estado = true)
  const lotesDisponibles = lotes.filter(l => l.estado)
  const kilosEnStock = lotesDisponibles.reduce((acc, l) => acc + (parseFloat(l.kilos) || 0), 0)
  const porcentajeOcupado = Math.min((kilosEnStock / CAPACIDAD_MAX_KG) * 100, 100)
  const kilosLibres = Math.max(CAPACIDAD_MAX_KG - kilosEnStock, 0)

  // Color de la barra según nivel de ocupación
  const getBarraColor = () => {
    if (porcentajeOcupado >= 90) return { barra: 'bg-red-500', texto: 'text-red-700', borde: 'border-red-200', fondo: 'bg-red-50' }
    if (porcentajeOcupado >= 70) return { barra: 'bg-orange-400', texto: 'text-orange-700', borde: 'border-orange-200', fondo: 'bg-orange-50' }
    return { barra: 'bg-teal-500', texto: 'text-teal-700', borde: 'border-teal-200', fondo: 'bg-teal-50' }
  }

  const colores = getBarraColor()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Almacenamiento</h1>
        <p className="text-gray-500 text-sm mt-1">
          Los lotes se crean automáticamente al registrar una recepción.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <Snowflake size={20} className="text-blue-500" />
            <p className="text-sm text-gray-500">Lotes Disponibles</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {lotesDisponibles.length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-teal-100">
          <div className="flex items-center gap-3 mb-2">
            <Package size={20} className="text-teal-500" />
            <p className="text-sm text-gray-500">Total en Stock</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {kilosEnStock.toFixed(1)} <span className="text-lg text-gray-500">kg</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Snowflake size={20} className="text-gray-400" />
            <p className="text-sm text-gray-500">Espacio Libre</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {kilosLibres.toFixed(1)} <span className="text-lg text-gray-500">kg</span>
          </p>
        </div>
      </div>

      {/* Barra de capacidad del cuarto frío */}
      <div className={`bg-white rounded-xl p-5 shadow-sm border ${colores.borde} mb-6`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Snowflake size={16} className={colores.texto} />
            <span className="text-sm font-semibold text-gray-700">
              Capacidad del Cuarto Frío
            </span>
          </div>
          <span className={`text-sm font-bold ${colores.texto}`}>
            {kilosEnStock.toFixed(1)} / {CAPACIDAD_MAX_KG} kg ({porcentajeOcupado.toFixed(1)}%)
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${colores.barra}`}
            style={{ width: `${porcentajeOcupado}%` }}
          />
        </div>

        {/* Alertas */}
        {porcentajeOcupado >= 90 && (
          <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle size={15} />
            <span className="font-medium">
              ¡Cuarto frío casi lleno! Quedan solo {kilosLibres.toFixed(1)} kg disponibles.
            </span>
          </div>
        )}
        {porcentajeOcupado >= 70 && porcentajeOcupado < 90 && (
          <div className="mt-3 flex items-center gap-2 text-orange-600 text-sm">
            <AlertTriangle size={15} />
            <span>Capacidad alta. Considera despachar lotes pronto.</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-teal-800">
          <span className="font-semibold">¿Cómo funciona?</span> Cada vez que registras una
          recepción de pescado, el sistema crea automáticamente un lote en el cuarto frío
          con el código <span className="font-mono font-semibold">LOTE-XXX</span>.
        </p>
      </div>

      {/* Tabla lotes */}
      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">
          Cargando lotes...
        </div>
      ) : lotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Package size={40} className="mb-2 opacity-30" />
          <p>No hay lotes registrados</p>
          <p className="text-xs mt-1">Registra una recepción para crear el primer lote</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Código
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Productor
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Kilos
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Fecha Ingreso
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lotes.map(l => (
                <tr key={l.idLote} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-800">
                    {l.codigoLote}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                        {l.nombreProductor?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {l.nombreProductor}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">
                    {parseFloat(l.kilos).toFixed(1)} kg
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {l.fechaIngreso?.replace('T', ' ').substring(0, 16)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {l.estado ? (
                        <>
                          <CheckCircle size={15} className="text-green-500" />
                          <span className="text-xs font-medium text-green-700">Disponible</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={15} className="text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">Despachado</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Almacenamiento
