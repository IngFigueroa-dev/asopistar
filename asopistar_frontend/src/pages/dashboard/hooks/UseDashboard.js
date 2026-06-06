// src/pages/dashboard/hooks/useDashboard.js
// Carga cada endpoint del dashboard de forma independiente.
// Si un endpoint retorna 403 (rol sin acceso), ese widget simplemente no muestra datos.
// Los demás widgets no se ven afectados.

import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'

const ENDPOINTS = {
  produccion: '/dashboard/produccion',
  planta:     '/dashboard/planta',
  comercial:  '/dashboard/comercial',
  finanzas:   '/dashboard/finanzas',
  alertas:    '/dashboard/alertas',
}

// Estado inicial de un widget antes de cargar
const widgetInicial = () => ({ data: null, loading: true, error: null })

export function useDashboard() {
  const rol = localStorage.getItem('rol') || ''

  // Cada módulo tiene su propio estado de carga
  const [produccion, setProduccion] = useState(widgetInicial())
  const [planta,     setPlanta]     = useState(widgetInicial())
  const [comercial,  setComercial]  = useState(widgetInicial())
  const [finanzas,   setFinanzas]   = useState(widgetInicial())
  const [alertas,    setAlertas]    = useState(widgetInicial())

  // Mapa de setters para simplificar la carga genérica
  const setters = {
    produccion: setProduccion,
    planta:     setPlanta,
    comercial:  setComercial,
    finanzas:   setFinanzas,
    alertas:    setAlertas,
  }

  // Qué endpoints puede llamar cada rol
  const ENDPOINTS_POR_ROL = {
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

  const cargarWidget = useCallback(async (nombre) => {
    const setter = setters[nombre]
    setter({ data: null, loading: true, error: null })
    try {
      const res = await api.get(ENDPOINTS[nombre])
      setter({ data: res.data, loading: false, error: null })
    } catch (err) {
      // 403 = sin acceso por rol (esperado) — no es un error visible para el usuario
      const esAccesoDenegado = err.response?.status === 403
      setter({
        data:    null,
        loading: false,
        error:   esAccesoDenegado ? null : (err.response?.data?.message || 'Error al cargar'),
      })
    }
  }, [])

  const recargar = useCallback(() => {
    const endpointsPermitidos = ENDPOINTS_POR_ROL[rol] || []
    endpointsPermitidos.forEach(nombre => cargarWidget(nombre))

    // Los endpoints que el rol no puede ver se marcan como no-cargando
    Object.keys(ENDPOINTS).forEach(nombre => {
      if (!endpointsPermitidos.includes(nombre)) {
        setters[nombre]({ data: null, loading: false, error: null })
      }
    })
  }, [rol, cargarWidget])

  useEffect(() => {
    recargar()
  }, [recargar])

  return { produccion, planta, comercial, finanzas, alertas, recargar, rol }
}
