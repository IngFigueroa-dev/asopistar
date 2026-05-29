import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Layout from './components/layout/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import Productores from './pages/productores/Productores'
import Produccion from './pages/produccion/Produccion'
import Calendario from './pages/calendario/Calendario'
import Almacenamiento from './pages/almacenamiento/Almacenamiento'
import Logistica from './pages/logistica/Logistica'
import Pagos from './pages/pagos/Pagos'
import Reportes from './pages/reportes/Reportes'
import Configuracion from './pages/configuracion/Configuracion'
import ProtectedRoute from './components/ProtectedRoute'
import Recepciones from './pages/recepciones/Recepciones'
import Procesamiento from './pages/procesamiento/Procesamiento'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/productores" element={<Productores />} />
                  <Route path="/produccion" element={<Produccion />} />
                  <Route path="/calendario" element={<Calendario />} />
                  <Route path="/recepciones" element={<Recepciones />} /> 
                  <Route path="/procesamiento" element={<Procesamiento />} /> 
                  <Route path="/almacenamiento" element={<Almacenamiento />} />
                  <Route path="/logistica" element={<Logistica />} />
                  <Route path="/pagos" element={<Pagos />} />
                  <Route path="/reportes" element={<Reportes />} />
                  <Route path="/configuracion" element={<Configuracion />} />
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