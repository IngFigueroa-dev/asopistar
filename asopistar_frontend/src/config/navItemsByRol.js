// src/config/navItemsByRol.js
// Define qué ítems del menú lateral ve cada rol.
// El Layout los filtra automáticamente según el rol guardado en localStorage.

import {
  LayoutDashboard, Users, Fish, Calendar,
  Snowflake, Truck, DollarSign, BarChart2,
  Settings, ClipboardCheck, ShieldCheck, UserCog,
  Beaker, ShoppingBag
} from 'lucide-react'

// Todos los ítems posibles del sistema
export const ALL_NAV_ITEMS = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Panel Principal' },
  { to: '/productores',         icon: Users,           label: 'Productores' },
  { to: '/produccion',          icon: Fish,            label: 'Producción' },
  { to: '/calendario',          icon: Calendar,        label: 'Calendario de Pesca' },
  { to: '/recepciones',         icon: ClipboardCheck,  label: 'Recepciones' },
  { to: '/procesamiento',       icon: Beaker,          label: 'Procesamiento' },
  { to: '/insumos', icon: ShoppingBag, label: 'Insumos' },
  { to: '/almacenamiento',      icon: Snowflake,       label: 'Almacenamiento' },
  { to: '/logistica',           icon: Truck,           label: 'Logística' },
  { to: '/pagos',               icon: DollarSign,      label: 'Pagos' },
  { to: '/reportes',            icon: BarChart2,       label: 'Reportes' },
  { to: '/admin/solicitudes',   icon: ShieldCheck,     label: 'Solicitudes de Acceso' },
  { to: '/admin/usuarios',      icon: UserCog,         label: 'Gestión de Usuarios' },
  { to: '/configuracion',       icon: Settings,        label: 'Configuración' },
]

// Rutas permitidas por rol.
// El ADMINISTRADOR_GENERAL ve todo; los demás solo su subconjunto.
const RUTAS_POR_ROL = {
  ROLE_ADMINISTRADOR_GENERAL: [
    '/dashboard', '/productores', '/produccion', '/calendario',
    '/recepciones', '/procesamiento', '/almacenamiento', '/logistica',
    '/pagos', '/insumos', '/reportes', '/admin/solicitudes', '/admin/usuarios',
    '/configuracion',
  ],
  ROLE_PRODUCTOR: [
    '/dashboard', '/calendario', '/configuracion',
  ],
  ROLE_BIOLOGO: [
    '/dashboard', '/productores', '/produccion', '/calendario', '/configuracion',
  ],
  ROLE_GERENTE_PLANTA: [
    '/dashboard', '/productores', '/produccion', '/calendario',
    '/recepciones', '/procesamiento', '/almacenamiento', '/reportes', '/configuracion',
  ],
  ROLE_PERSONAL_CUARTO_FRIO: [
    '/dashboard', '/procesamiento', '/almacenamiento', '/configuracion',
  ],
  ROLE_CONTADORA: [
    '/dashboard', '/recepciones', '/pagos', '/insumos', '/reportes', '/configuracion',
  ],
  ROLE_SECRETARIA: [
    '/dashboard', '/productores', '/recepciones', '/reportes', '/configuracion',
  ],
  ROLE_GERENTE_COMERCIAL: [
    '/dashboard', '/almacenamiento', '/logistica', '/reportes', '/configuracion',
  ],
  ROLE_VENDEDOR_INSUMOS: [
    '/dashboard', '/productores', '/insumos', '/configuracion',
  ],
}

/**
 * Devuelve los ítems de menú que le corresponden al rol dado.
 * Si el rol no está mapeado, devuelve solo dashboard y configuración.
 */
export function getNavItemsParaRol(rol) {
  const rutasPermitidas = RUTAS_POR_ROL[rol] || ['/dashboard', '/configuracion']
  return ALL_NAV_ITEMS.filter(item => rutasPermitidas.includes(item.to))
}

/**
 * Verifica si un rol tiene acceso a una ruta específica.
 */
export function tieneAcceso(rol, ruta) {
  const rutasPermitidas = RUTAS_POR_ROL[rol] || ['/dashboard', '/configuracion']
  return rutasPermitidas.includes(ruta)
}

// Etiqueta legible para cada rol (usada en el header)
export const ROL_LABELS = {
  ROLE_ADMINISTRADOR_GENERAL: 'Administrador General',
  ROLE_PRODUCTOR:             'Productor',
  ROLE_BIOLOGO:               'Biólogo',
  ROLE_GERENTE_PLANTA:        'Gerente de Planta',
  ROLE_PERSONAL_CUARTO_FRIO:  'Personal Cuarto Frío',
  ROLE_CONTADORA:             'Contadora',
  ROLE_SECRETARIA:            'Secretaria',
  ROLE_GERENTE_COMERCIAL:     'Gerente Comercial',
  ROLE_VENDEDOR_INSUMOS:      'Vendedor de Insumos',
  // Compatibilidad con roles anteriores
  ROLE_ADMIN:                 'Administrador',
  ROLE_ENCARGADO_INSUMOS:     'Encargado de Insumos',
}
