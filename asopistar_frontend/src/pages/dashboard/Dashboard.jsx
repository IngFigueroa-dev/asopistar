// src/pages/dashboard/Dashboard.jsx
// Dashboard analítico inteligente de ASOPISTAR.
// Muestra widgets según el rol del usuario leído desde localStorage.
// Cada widget carga de forma independiente — un error en uno no afecta a los demás.

import { RefreshCw } from 'lucide-react'
import { useDashboard } from './hooks/useDashboard'
import { ROL_LABELS } from '../../config/navItemsByRol'

import ProduccionWidget from './widgets/ProduccionWidget'
import PlantaWidget     from './widgets/PlantaWidget'
import ComercialWidget  from './widgets/ComercialWidget'
import FinanzasWidget   from './widgets/FinanzasWidget'
import AlertasWidget    from './widgets/AlertasWidget'

// Qué secciones ve cada rol, en el orden en que aparecen en la pantalla.
// Las alertas siempre van al final si el rol puede verlas.
const SECCIONES_POR_ROL = {
  ROLE_ADMINISTRADOR_GENERAL: ['produccion', 'planta', 'comercial', 'finanzas', 'alertas'],
  ROLE_GERENTE_PLANTA:        ['produccion', 'planta', 'alertas'],
  ROLE_GERENTE_COMERCIAL:     ['comercial', 'alertas'],
  ROLE_CONTADORA:             ['finanzas', 'alertas'],
  ROLE_BIOLOGO:               ['produccion', 'alertas'],
  ROLE_SECRETARIA:            ['produccion', 'comercial', 'alertas'],
  ROLE_VENDEDOR_INSUMOS:      ['alertas'],
  ROLE_PRODUCTOR:             [],
  ROLE_PERSONAL_CUARTO_FRIO:  ['planta', 'alertas'],
}

const SECCION_TITULOS = {
  produccion: 'Producción',
  planta:     'Planta y Almacenamiento',
  comercial:  'Comercial y Logística',
  finanzas:   'Finanzas',
}

function Dashboard() {
  const { produccion, planta, comercial, finanzas, alertas, recargar, rol } = useDashboard()

  const nombre   = localStorage.getItem('nombre') || 'Usuario'
  const rolLabel = ROL_LABELS[rol] || rol
  const secciones = SECCIONES_POR_ROL[rol] || []

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  // Mapa de estado por sección para pasarle a cada widget
  const estadoPorSeccion = { produccion, planta, comercial, finanzas, alertas }

  return (
    <div className="space-y-8">

      {/* ── Encabezado ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {saludo}, {nombre.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {rolLabel} · Panel de control ASOPISTAR
          </p>
        </div>
        <button
          onClick={recargar}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
          title="Actualizar todos los datos"
        >
          <RefreshCw size={15} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* ── Sin acceso a ninguna sección ──────────────────────── */}
      {secciones.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">
            No hay información de dashboard disponible para tu rol.
          </p>
        </div>
      )}

      {/* ── Alertas (siempre arriba si el rol las tiene) ──────── */}
      {secciones.includes('alertas') && (
        <div>
          <AlertasWidget
            data={alertas.data}
            loading={alertas.loading}
            error={alertas.error}
            onRetry={() => recargar()}
          />
        </div>
      )}

      {/* ── Secciones de módulos ──────────────────────────────── */}
      {secciones
        .filter(s => s !== 'alertas')
        .map(seccion => (
          <SeccionDashboard
            key={seccion}
            titulo={SECCION_TITULOS[seccion]}
            seccion={seccion}
            estado={estadoPorSeccion[seccion]}
            onRetry={recargar}
          />
        ))}

    </div>
  )
}

// Renderiza el widget correcto según el nombre de la sección
function SeccionDashboard({ titulo, seccion, estado, onRetry }) {
  const { data, loading, error } = estado

  const widgetProps = { data, loading, error, onRetry }

  const WIDGETS = {
    produccion: <ProduccionWidget {...widgetProps} />,
    planta:     <PlantaWidget     {...widgetProps} />,
    comercial:  <ComercialWidget  {...widgetProps} />,
    finanzas:   <FinanzasWidget   {...widgetProps} />,
  }

  const widget = WIDGETS[seccion]
  if (!widget) return null

  return (
    <section>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        {titulo}
      </h2>
      {widget}
    </section>
  )
}

export default Dashboard
