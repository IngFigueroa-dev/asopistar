// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { tieneAcceso } from '../config/navItemsByRol'

/**
 * Protege rutas según token y rol.
 * - Sin token → redirige a /login
 * - Con token pero sin acceso al rol → redirige a /dashboard
 * - requiredRol opcional: restringe a un rol específico (ej: módulos admin)
 */
function ProtectedRoute({ children, requiredRol }) {
  const token = localStorage.getItem('token')
  const rol   = localStorage.getItem('rol') || ''
  const location = useLocation()

  // Sin autenticación
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Verificación por rol específico (usado en rutas admin)
  if (requiredRol && rol !== requiredRol) {
    return <Navigate to="/dashboard" replace />
  }

  // Verificación por acceso a la ruta actual
  // Solo aplica a rutas conocidas del sistema (evita bloquear rutas genéricas)
  const rutaActual = location.pathname
  const rutasConocidas = [
    '/productores', '/produccion', '/calendario', '/recepciones',
    '/procesamiento', '/almacenamiento', '/logistica', '/pagos',
    '/reportes', '/admin/solicitudes', '/admin/usuarios',
  ]
  if (rutasConocidas.includes(rutaActual) && !tieneAcceso(rol, rutaActual)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
