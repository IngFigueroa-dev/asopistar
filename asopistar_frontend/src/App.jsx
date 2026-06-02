// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Auth
import Login              from './pages/auth/Login'
import Registro           from './pages/auth/Registro'
import VerificacionEmail  from './pages/auth/VerificacionEmail'
import PendienteAprobacion from './pages/auth/PendienteAprobacion'

// Layout y protección
import Layout         from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Páginas del sistema
import Dashboard     from './pages/dashboard/Dashboard'
import Productores   from './pages/productores/Productores'
import Produccion    from './pages/produccion/Produccion'
import Calendario    from './pages/calendario/Calendario'
import Recepciones   from './pages/recepciones/Recepciones'
import Procesamiento from './pages/procesamiento/Procesamiento'
import Almacenamiento from './pages/almacenamiento/Almacenamiento'
import Logistica     from './pages/logistica/Logistica'
import Pagos         from './pages/pagos/Pagos'
import Reportes      from './pages/reportes/Reportes'
import Configuracion from './pages/configuracion/Configuracion'
import Insumos       from './pages/insumos/Insumos'
import Clientes      from './pages/clientes/Clientes'   // ← NUEVO

// Admin
import SolicitudesAcceso from './pages/admin/SolicitudesAcceso'
import GestionUsuarios   from './pages/admin/GestionUsuarios'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Rutas públicas (sin token) ──────────────────────── */}
        <Route path="/login"                element={<Login />} />
        <Route path="/registro"             element={<Registro />} />
        <Route path="/verificar-email"      element={<VerificacionEmail />} />
        <Route path="/pendiente-aprobacion" element={<PendienteAprobacion />} />

        {/* ── Rutas protegidas ────────────────────────────────── */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard"     element={<Dashboard />} />
                  <Route path="/productores"   element={<Productores />} />
                  <Route path="/produccion"    element={<Produccion />} />
                  <Route path="/calendario"    element={<Calendario />} />
                  <Route path="/recepciones"   element={<Recepciones />} />
                  <Route path="/procesamiento" element={<Procesamiento />} />
                  <Route path="/insumos"       element={<Insumos />} />
                  <Route path="/almacenamiento" element={<Almacenamiento />} />
                  <Route path="/logistica"     element={<Logistica />} />
                  <Route path="/clientes"      element={<Clientes />} />   {/* ← NUEVO */}
                  <Route path="/pagos"         element={<Pagos />} />
                  <Route path="/reportes"      element={<Reportes />} />
                  <Route path="/configuracion" element={<Configuracion />} />

                  {/* Admin — solo ADMINISTRADOR_GENERAL */}
                  <Route
                    path="/admin/solicitudes"
                    element={
                      <ProtectedRoute requiredRol="ROLE_ADMINISTRADOR_GENERAL">
                        <SolicitudesAcceso />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/usuarios"
                    element={
                      <ProtectedRoute requiredRol="ROLE_ADMINISTRADOR_GENERAL">
                        <GestionUsuarios />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
