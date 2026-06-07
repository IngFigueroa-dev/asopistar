// src/pages/dashboard/Dashboard.jsx
// Dashboard analítico de ASOPISTAR.
// Muestra widgets según el rol del usuario leído desde localStorage.
// ROLE_PRODUCTOR tiene su propio panel con resumen de su producción.

import { useState, useEffect } from 'react'
import { RefreshCw, Fish, Calendar, CheckCircle2, Clock, Waves } from 'lucide-react'
import { useDashboard } from './hooks/useDashboard'
import { ROL_LABELS } from '../../config/navItemsByRol'
import api from '../../services/api'

import ProduccionWidget from './widgets/ProduccionWidget'
import PlantaWidget     from './widgets/PlantaWidget'
import ComercialWidget  from './widgets/ComercialWidget'
import FinanzasWidget   from './widgets/FinanzasWidget'
import AlertasWidget    from './widgets/AlertasWidget'

// Qué secciones ve cada rol (no-productor)
const SECCIONES_POR_ROL = {
  ROLE_ADMINISTRADOR_GENERAL: ['produccion', 'planta', 'comercial', 'finanzas', 'alertas'],
  ROLE_GERENTE_PLANTA:        ['produccion', 'planta', 'alertas'],
  ROLE_GERENTE_COMERCIAL:     ['comercial', 'alertas'],
  ROLE_CONTADORA:             ['finanzas', 'alertas'],
  ROLE_BIOLOGO:               ['produccion', 'alertas'],
  ROLE_SECRETARIA:            ['produccion', 'comercial', 'alertas'],
  ROLE_VENDEDOR_INSUMOS:      ['alertas'],
  ROLE_PERSONAL_CUARTO_FRIO:  ['planta', 'alertas'],
}

const SECCION_TITULOS = {
  produccion: 'Producción',
  planta:     'Planta y Almacenamiento',
  comercial:  'Comercial y Logística',
  finanzas:   'Finanzas',
}

// ── Dashboard exclusivo del PRODUCTOR ────────────────────────────────────────
function DashboardProductor({ nombre, saludo }) {
  const idProductor = parseInt(localStorage.getItem('idProductor'))
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!idProductor) { setLoading(false); return }
    const cargar = async () => {
      try {
        const [siembrasRes, turnosRes] = await Promise.all([
          api.get('/siembras'),
          api.get(`/turnos-pesca/productor/${idProductor}`),
        ])
        const todasSiembras = siembrasRes.data
        const misSiembras   = todasSiembras.filter(s => s.idProductor === idProductor)
        const misTurnos     = turnosRes.data

        setResumen({
          totalSiembras:    misSiembras.length,
          enCurso:          misSiembras.filter(s => s.estado === 'EN_CURSO').length,
          cosechadas:        misSiembras.filter(s => s.estado === 'COSECHADO').length,
          turnosPendientes:  misTurnos.filter(t => t.estado === 'PENDIENTE').length,
          turnosConfirmados: misTurnos.filter(t => t.estado === 'CONFIRMADO').length,
        })
      } catch (err) {
        console.error('Error cargando resumen del productor:', err)
        setResumen(null)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [idProductor])

  return (
    <div className="space-y-8">

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {saludo}, {nombre.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Productor · Panel de control ASOPISTAR
        </p>
      </div>

      {/* Tarjetas de resumen */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-8 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : resumen ? (
        <>
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Mi Producción
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Fish size={16} className="text-teal-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Total siembras</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{resumen.totalSiembras}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Waves size={16} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">En curso</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">{resumen.enCurso}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Cosechadas</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{resumen.cosechadas}</p>
              </div>

            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Mis Turnos
            </h2>
            <div className="grid grid-cols-2 gap-4">

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-yellow-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Turnos pendientes</span>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{resumen.turnosPendientes}</p>
                {resumen.turnosPendientes > 0 && (
                  <p className="text-xs text-gray-400 mt-1">Esperando confirmación</p>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-teal-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Turnos confirmados</span>
                </div>
                <p className="text-3xl font-bold text-teal-600">{resumen.turnosConfirmados}</p>
                {resumen.turnosConfirmados > 0 && (
                  <p className="text-xs text-gray-400 mt-1">Listos para cosechar</p>
                )}
              </div>

            </div>
          </section>

          {/* Accesos rápidos */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Accesos rápidos
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <a href="/produccion"
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-teal-300 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                    <Fish size={20} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Mi Producción</p>
                    <p className="text-xs text-gray-400">Estanques · Siembras</p>
                  </div>
                </div>
              </a>
              <a href="/calendario"
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-teal-300 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Mis Turnos</p>
                    <p className="text-xs text-gray-400">Calendario de pesca</p>
                  </div>
                </div>
              </a>
            </div>
          </section>
        </>
      ) : (
        // Sin idProductor o error de carga — panel mínimo
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <Fish size={40} className="mx-auto mb-3 text-teal-200" />
          <p className="font-semibold text-gray-600 mb-1">Bienvenido al sistema</p>
          <p className="text-sm text-gray-400">
            Dirígete a <strong>Mi Producción</strong> para registrar tus estanques y siembras.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Dashboard principal ───────────────────────────────────────────────────────
function Dashboard() {
  const { produccion, planta, comercial, finanzas, alertas, recargar, rol } = useDashboard()

  const nombre   = localStorage.getItem('nombre') || 'Usuario'
  const rolLabel = ROL_LABELS[rol] || rol
  const secciones = SECCIONES_POR_ROL[rol] || []

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  // ── El productor tiene su propio panel ───────────────────────────────────
  if (rol === 'ROLE_PRODUCTOR') {
    return <DashboardProductor nombre={nombre} saludo={saludo} />
  }

  // ── Panel estándar para todos los demás roles ────────────────────────────
  const estadoPorSeccion = { produccion, planta, comercial, finanzas, alertas }

  return (
    <div className="space-y-8">

      {/* Encabezado */}
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

      {/* Sin acceso a ninguna sección */}
      {secciones.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">
            No hay información de dashboard disponible para tu rol.
          </p>
        </div>
      )}

      {/* Alertas siempre arriba */}
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

      {/* Secciones de módulos */}
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
