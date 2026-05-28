import { useState, useEffect } from 'react'
import { UserPlus, Search, Phone, Mail, Package } from 'lucide-react'
import api from '../../services/api'

function Productores() {
  const [productores, setProductores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre1: '', nombre2: '', apellido1: '', apellido2: '',
    documento: '', telefono: '', direccion: '',
    fechaIngreso: '', fechaNacimiento: '', cantidadHijos: '',
    idUsuario: 1
  })

  useEffect(() => {
    cargarProductores()
  }, [])

  const cargarProductores = async () => {
    try {
      setLoading(true)
      const res = await api.get('/productores')
      setProductores(res.data)
    } catch (err) {
      setError('Error al cargar productores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/productores', {
        ...form,
        cantidadHijos: parseInt(form.cantidadHijos) || 0,
        idUsuario: parseInt(form.idUsuario)
      })
      setMostrarModal(false)
      setForm({
        nombre1: '', nombre2: '', apellido1: '', apellido2: '',
        documento: '', telefono: '', direccion: '',
        fechaIngreso: '', fechaNacimiento: '', cantidadHijos: '',
        idUsuario: 1
      })
      cargarProductores()
    } catch (err) {
      setError('Error al crear productor')
    }
  }

  const producoresFiltrados = productores.filter(p =>
    `${p.nombre1} ${p.apellido1}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.documento?.includes(busqueda)
  )

  const getInicial = (nombre) => nombre?.charAt(0).toUpperCase() || '?'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Productores</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestiona los productores piscícolas y su información.
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <UserPlus size={18} />
          Agregar Productor
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-gray-400">Cargando productores...</div>
        </div>
      ) : producoresFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Package size={40} className="mb-2 opacity-30" />
          <p>No hay productores registrados</p>
        </div>
      ) : (
        /* Grid de productores */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {producoresFiltrados.map(p => (
            <div
              key={p.idProductor}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Nombre e inicial */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {getInicial(p.nombre1)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {p.nombre1} {p.apellido1}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.activo
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate">{p.documento}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  <span>{p.telefono}</span>
                </div>
              </div>

              {/* Dirección */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 truncate">{p.direccion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal agregar productor */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Agregar Productor</h2>
              <p className="text-sm text-gray-500 mt-1">Completa la información del productor</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Primer nombre *</label>
                  <input
                    required
                    value={form.nombre1}
                    onChange={e => setForm({ ...form, nombre1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Segundo nombre</label>
                  <input
                    value={form.nombre2}
                    onChange={e => setForm({ ...form, nombre2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Primer apellido *</label>
                  <input
                    required
                    value={form.apellido1}
                    onChange={e => setForm({ ...form, apellido1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Segundo apellido</label>
                  <input
                    value={form.apellido2}
                    onChange={e => setForm({ ...form, apellido2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Documento *</label>
                  <input
                    required
                    value={form.documento}
                    onChange={e => setForm({ ...form, documento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Teléfono *</label>
                  <input
                    required
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Dirección *</label>
                <input
                  required
                  value={form.direccion}
                  onChange={e => setForm({ ...form, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha ingreso *</label>
                  <input
                    type="date"
                    required
                    value={form.fechaIngreso}
                    onChange={e => setForm({ ...form, fechaIngreso: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fecha nacimiento *</label>
                  <input
                    type="date"
                    required
                    value={form.fechaNacimiento}
                    onChange={e => setForm({ ...form, fechaNacimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Cantidad de hijos</label>
                <input
                  type="number"
                  min="0"
                  value={form.cantidadHijos}
                  onChange={e => setForm({ ...form, cantidadHijos: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setMostrarModal(false); setError('') }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Guardar Productor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Productores