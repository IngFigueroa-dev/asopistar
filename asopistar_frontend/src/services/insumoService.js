// src/services/insumoService.js
import api from './api'

// ── Insumos ────────────────────────────────────────────────────
export const getInsumos        = ()        => api.get('/insumos')
export const getInsumosActivos = ()        => api.get('/insumos/activos')
export const getInsumosBajoStock = ()      => api.get('/insumos/bajo-stock')
export const getInsumoById     = (id)      => api.get(`/insumos/${id}`)
export const createInsumo      = (data)    => api.post('/insumos', data)
export const updateInsumo      = (id, data)=> api.put(`/insumos/${id}`, data)
export const desactivarInsumo  = (id)      => api.patch(`/insumos/${id}/desactivar`)

// ── Ventas ─────────────────────────────────────────────────────
export const getVentas              = ()          => api.get('/ventas-insumo')
export const getVentasByProductor   = (idProd)    => api.get(`/ventas-insumo/productor/${idProd}`)
export const getVentaById           = (id)        => api.get(`/ventas-insumo/${id}`)
export const createVenta            = (data)      => api.post('/ventas-insumo', data)
export const marcarVentaPagada      = (id)        => api.patch(`/ventas-insumo/${id}/marcar-pagado`)

// ── Movimientos ────────────────────────────────────────────────
export const getMovimientos         = ()         => api.get('/movimientos-insumo')
export const getMovimientosByInsumo = (idInsumo) => api.get(`/movimientos-insumo/insumo/${idInsumo}`)
export const createMovimiento       = (data)     => api.post('/movimientos-insumo', data)

// ── Productores (para selector en formulario de venta) ─────────
export const getProductoresActivos  = ()         => api.get('/productores/activos')
