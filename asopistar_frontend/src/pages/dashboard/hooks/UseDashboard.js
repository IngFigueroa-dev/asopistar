// src/pages/dashboard/hooks/useDashboard.js
// prueba para frontend
import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'

const ENDPOINTS = {
  produccion: '/dashboard/produccion',
  planta:     '/dashboard/planta',
  comercial:  '/dashboard/comercial',
  finanzas:   '/dashboard/finanzas',
  alertas:    '/dashboard/alertas',
  insumos:    '/dashboard/insumos',
}

const widgetInicial = () => ({ data: null, loading: true, error: null })

export function useDashboard() {
  const rol = localStorage.getItem('rol') || ''

  const [produccion, setProduccion] = useState(widgetInicial())
  const [planta,     setPlanta]     = useState(widgetInicial())
  const [comercial,  setComercial]  = useState(widgetInicial())
  const [finanzas,   setFinanzas]   = useState(widgetInicial())
  const [alertas,    setAlertas]    = useState(widgetInicial())
  const [insumos,    setInsumos]    = useState(widgetInicial())

  const setters = {
    produccion: setProduccion,
    planta:     setPlanta,
    comercial:  setComercial,
    finanzas:   setFinanzas,
    alertas:    setAlertas,
    insumos:    setInsumos,
  }

  const ENDPOINTS_POR_ROL = {
    ROLE_ADMINISTRADOR_GENERAL: ['produccion', 'planta', 'comercial', 'finanzas', 'alertas', 'insumos'],
    ROLE_GERENTE_PLANTA:        ['produccion', 'planta', 'alertas'],
    ROLE_GERENTE_COMERCIAL:     ['comercial', 'alertas'],
    ROLE_CONTADORA:             ['finanzas', 'alertas'],
    ROLE_BIOLOGO:               ['produccion', 'alertas'],
    ROLE_SECRETARIA:            ['produccion', 'comercial', 'alertas'],
    ROLE_VENDEDOR_INSUMOS:      ['insumos', 'alertas'],
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
      const esAccesoDenegado = err.response?.status === 403
      setter({
        data:    null,
        loading: false,
        error:   esAccesoDenegado ? null : (err.response?.data?.message || 'Error al cargar'),
      })
    }
  }, [])

  const recargar = useCallback(() => {
    const permitidos = ENDPOINTS_POR_ROL[rol] || []
    permitidos.forEach(nombre => cargarWidget(nombre))
    Object.keys(ENDPOINTS).forEach(nombre => {
      if (!permitidos.includes(nombre)) {
        setters[nombre]({ data: null, loading: false, error: null })
      }
    })
  }, [rol, cargarWidget])

  useEffect(() => { recargar() }, [recargar])

  return { produccion, planta, comercial, finanzas, alertas, insumos, recargar, rol }
}
