// src/config/navItemsByRol.js
import {
  LayoutDashboard,
  Users,
  Fish,
  CalendarDays,
  Truck,
  Package,
  Snowflake,
  Send,
  CreditCard,
  BarChart3,
  Settings,
  ClipboardList,
  UserCheck,
  DollarSign,
  Store,
  ShieldCheck,
} from 'lucide-react'

// ── Etiquetas visibles de cada rol ───────────────────────────────────────────
export const ROL_LABELS = {
  ROLE_ADMINISTRADOR_GENERAL: 'Administrador General',
  ROLE_GERENTE_PLANTA:        'Gerente de Planta',
  ROLE_GERENTE_COMERCIAL:     'Gerente Comercial',
  ROLE_CONTADORA:             'Contadora',
  ROLE_BIOLOGO:               'Biólogo',
  ROLE_SECRETARIA:            'Secretaria',
  ROLE_VENDEDOR_INSUMOS:      'Vendedor de Insumos',
  ROLE_PRODUCTOR:             'Productor',
  ROLE_PERSONAL_CUARTO_FRIO:  'Personal Cuarto Frío',
}

// ── Menú por rol ──────────────────────────────────────────────────────────────
const NAV_ITEMS = {

  // ── Administrador: acceso total ──────────────────────────────────────────
  ROLE_ADMINISTRADOR_GENERAL: [
    { to: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/productores',         icon: Users,           label: 'Productores' },
    { to: '/produccion',          icon: Fish,            label: 'Producción' },
    { to: '/calendario',          icon: CalendarDays,    label: 'Calendario' },
    { to: '/recepciones',         icon: Truck,           label: 'Recepciones' },
    { to: '/procesamiento',       icon: ClipboardList,   label: 'Procesamiento' },
    { to: '/almacenamiento',      icon: Snowflake,       label: 'Almacenamiento' },
    { to: '/insumos',             icon: Package,         label: 'Insumos' },
    { to: '/logistica',           icon: Send,            label: 'Logística' },
    { to: '/clientes',            icon: UserCheck,       label: 'Clientes' },
    { to: '/puntos-venta',        icon: Store,           label: 'Puntos de Venta' },
    { to: '/pagos',               icon: CreditCard,      label: 'Pagos' },
    { to: '/ingresos',            icon: DollarSign,      label: 'Ingresos' },
    { to: '/reportes',            icon: BarChart3,       label: 'Reportes' },
    { to: '/admin/solicitudes',   icon: ShieldCheck,     label: 'Solicitudes' },   // ← RESTAURADO
    { to: '/admin/usuarios',      icon: ShieldCheck,     label: 'Usuarios' },      // ← RESTAURADO
    { to: '/configuracion',       icon: Settings,        label: 'Configuración' }, 
  ],

  // ── Gerente de Planta ────────────────────────────────────────────────────
  ROLE_GERENTE_PLANTA: [
    { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/productores',      icon: Users,           label: 'Productores' },
    { to: '/produccion',       icon: Fish,            label: 'Producción' },
    { to: '/calendario',       icon: CalendarDays,    label: 'Calendario' },
    { to: '/recepciones',      icon: Truck,           label: 'Recepciones' },
    { to: '/procesamiento',    icon: ClipboardList,   label: 'Procesamiento' },
    { to: '/almacenamiento',   icon: Snowflake,       label: 'Almacenamiento' },
    { to: '/reportes',         icon: BarChart3,       label: 'Reportes' },
    { to: '/configuracion',    icon: Settings,        label: 'Configuración' },
  ],

  // ── Biólogo ──────────────────────────────────────────────────────────────
  ROLE_BIOLOGO: [
    { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/produccion',       icon: Fish,            label: 'Producción' },
    // { to: '/calendario',       icon: CalendarDays,    label: 'Calendario' },
    // { to: '/reportes',         icon: BarChart3,       label: 'Reportes' },
    { to: '/configuracion',    icon: Settings,        label: 'Configuración' },
  ],

  // ── Gerente Comercial ────────────────────────────────────────────────────
  ROLE_GERENTE_COMERCIAL: [
    { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/logistica',        icon: Send,            label: 'Logística' },
    { to: '/clientes',         icon: UserCheck,       label: 'Clientes' },
    { to: '/puntos-venta',     icon: Store,           label: 'Puntos de Venta' },
    { to: '/ingresos',         icon: DollarSign,      label: 'Ingresos' },
    { to: '/reportes',         icon: BarChart3,       label: 'Reportes' },
    { to: '/configuracion',    icon: Settings,        label: 'Configuración' },
  ],

  // ── Contadora ────────────────────────────────────────────────────────────
  ROLE_CONTADORA: [
    { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pagos',            icon: CreditCard,      label: 'Pagos' },
    { to: '/ingresos',         icon: DollarSign,      label: 'Ingresos' },
    { to: '/insumos',          icon: Package,         label: 'Insumos' },
    { to: '/reportes',         icon: BarChart3,       label: 'Reportes' },
    { to: '/configuracion',    icon: Settings,        label: 'Configuración' },
  ],

  // ── Secretaria ───────────────────────────────────────────────────────────
  ROLE_SECRETARIA: [
    { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/productores',      icon: Users,           label: 'Productores' },
    { to: '/recepciones',      icon: Truck,           label: 'Recepciones' },
    { to: '/logistica',        icon: Send,            label: 'Logística' },
    { to: '/reportes',         icon: BarChart3,       label: 'Reportes' },
    { to: '/configuracion',    icon: Settings,        label: 'Configuración' },
  ],

  // ── Vendedor de Insumos ──────────────────────────────────────────────────
  ROLE_VENDEDOR_INSUMOS: [
    { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/insumos',          icon: Package,         label: 'Insumos' },
    { to: '/configuracion',    icon: Settings,        label: 'Configuración' },
  ],

  // ── Productor ────────────────────────────────────────────────────────────
  ROLE_PRODUCTOR: [
    { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/produccion',       icon: Fish,            label: 'Mi Producción' },
    { to: '/calendario',       icon: CalendarDays,    label: 'Mis Turnos' },
    { to: '/insumos',          icon: Package,         label: 'Insumos' },
    { to: '/configuracion',    icon: Settings,        label: 'Configuración' },
  ],

  // ── Personal Cuarto Frío ─────────────────────────────────────────────────
  ROLE_PERSONAL_CUARTO_FRIO: [
    { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/almacenamiento',   icon: Snowflake,       label: 'Almacenamiento' },
    { to: '/procesamiento',    icon: ClipboardList,   label: 'Procesamiento' },
    { to: '/configuracion',    icon: Settings,        label: 'Configuración' },
  ],
}

// ── Rutas permitidas por rol ──────────────────────────────────────────────────
const RUTAS_POR_ROL = {
  ROLE_ADMINISTRADOR_GENERAL: [
    '/dashboard', '/productores', '/produccion', '/calendario', '/recepciones',
    '/procesamiento', '/almacenamiento', '/insumos', '/logistica', '/clientes',
    '/puntos-venta', '/pagos', '/ingresos', '/reportes', '/configuracion',
    '/admin/solicitudes', '/admin/usuarios',                        // ← RESTAURADO
  ],
  ROLE_GERENTE_PLANTA: [
    '/dashboard', '/productores', '/produccion', '/calendario', '/recepciones',
    '/procesamiento', '/almacenamiento', '/reportes', '/configuracion',
  ],
  ROLE_BIOLOGO: [
    '/dashboard', '/produccion', '/calendario', '/reportes', '/configuracion',
  ],
  ROLE_GERENTE_COMERCIAL: [
    '/dashboard', '/logistica', '/clientes', '/puntos-venta',
    '/ingresos', '/reportes', '/configuracion',
  ],
  ROLE_CONTADORA: [
    '/dashboard', '/pagos', '/ingresos', '/insumos', '/reportes', '/configuracion',
  ],
  ROLE_SECRETARIA: [
    '/dashboard', '/productores', '/recepciones', '/logistica',
    '/reportes', '/configuracion',
  ],
  ROLE_VENDEDOR_INSUMOS: [
    '/dashboard', '/insumos', '/configuracion',
  ],
  ROLE_PRODUCTOR: [
    '/dashboard', '/produccion', '/calendario', '/insumos', '/configuracion',
  ],
  ROLE_PERSONAL_CUARTO_FRIO: [
    '/dashboard', '/almacenamiento', '/procesamiento', '/configuracion',
  ],
}

// ── Helpers exportados ────────────────────────────────────────────────────────
export function getNavItemsParaRol(rol) {
  return NAV_ITEMS[rol] ?? [
    { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/configuracion', icon: Settings,        label: 'Configuración' },
  ]
}

export function tieneAcceso(rol, ruta) {
  const rutasPermitidas = RUTAS_POR_ROL[rol]
  if (!rutasPermitidas) return false
  return rutasPermitidas.includes(ruta)
}
