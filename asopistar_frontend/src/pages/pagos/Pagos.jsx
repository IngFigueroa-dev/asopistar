import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
  Search,
  Filter,
  ChevronDown,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  CreditCard,
  User,
  Package,
  Scale,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n ?? 0);

const fmtKg = (n) =>
  `${new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2 }).format(n ?? 0)} kg`;

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Badge de estado ──────────────────────────────────────────────────────────

const EstadoBadge = ({ estado }) => {
  const cfg = {
    PAGADO: {
      cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: <CheckCircle2 size={12} />,
    },
    PENDIENTE: {
      cls: "bg-amber-100 text-amber-800 border-amber-200",
      icon: <Clock size={12} />,
    },
  };
  const { cls, icon } = cfg[estado] ?? {
    cls: "bg-gray-100 text-gray-600 border-gray-200",
    icon: null,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {icon}
      {estado}
    </span>
  );
};

// ─── Tarjeta de estadística ───────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub, accent }) => (
  <div className="relative overflow-hidden bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
    <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10 ${accent}`} />
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
      {icon}
    </div>
    <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-bold text-stone-800 leading-tight">{value}</p>
    {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
  </div>
);

// ─── Modal Registrar Pago ─────────────────────────────────────────────────────

const ModalRegistrarPago = ({ onClose, onSuccess }) => {
  const [productores, setProductores]   = useState([]);
  const [recepciones, setRecepciones]   = useState([]);
  const [metodosPago, setMetodosPago]   = useState([]);
  const [loadingRec, setLoadingRec]     = useState(false);
  const [loadingForm, setLoadingForm]   = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState("");
  const [errorRec, setErrorRec]         = useState("");

  const [form, setForm] = useState({
    idProductor: "",
    idRecepcion: "",
    idMetodoPago: "",
    precioKg: "",
    kilosPagados: "",
  });

  const montoPreview =
    form.precioKg && form.kilosPagados
      ? (parseFloat(form.precioKg) * parseFloat(form.kilosPagados)).toFixed(2)
      : null;

  // Cargar productores y métodos de pago al abrir el modal
  useEffect(() => {
    const fetchCatalogos = async () => {
      setLoadingForm(true);
      try {
        const [pRes, mRes] = await Promise.all([
          api.get("/productores/activos"),
          api.get("/metodos-pago"),
        ]);
        setProductores(pRes.data);
        setMetodosPago(mRes.data);
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          setError("Sesión expirada. Por favor recarga la página.");
        } else if (status === 403) {
          setError("No tienes permisos para acceder a esta información.");
        } else {
          setError("Error cargando datos del formulario. Verifica que el servidor esté activo.");
        }
      } finally {
        setLoadingForm(false);
      }
    };
    fetchCatalogos();
  }, []);

  // Cargar recepciones cuando cambia el productor seleccionado
  useEffect(() => {
    if (!form.idProductor) {
      setRecepciones([]);
      setForm((f) => ({ ...f, idRecepcion: "", kilosPagados: "" }));
      setErrorRec("");
      return;
    }

    const fetchRecepciones = async () => {
      setLoadingRec(true);
      setErrorRec("");
      setRecepciones([]);
      setForm((f) => ({ ...f, idRecepcion: "", kilosPagados: "" }));

      try {
        // Usamos /recepciones/sin-pago para mostrar SOLO las que necesitan pago
        const res = await api.get("/recepciones/sin-pago", {
          params: { idProductor: parseInt(form.idProductor) },
        });
        setRecepciones(res.data);
      } catch (err) {
        const status = err.response?.status;
        if (status === 403) {
          setErrorRec("Sin permisos para ver recepciones. Contacta al administrador.");
        } else if (status === 404) {
          // Algunos backends retornan 404 si no hay resultados — tratarlo como lista vacía
          setRecepciones([]);
        } else {
          setErrorRec(
            `Error al cargar recepciones (${status ?? "sin respuesta"}). ` +
            "Verifica que el backend esté activo y el endpoint /recepciones/sin-pago exista."
          );
        }
      } finally {
        setLoadingRec(false);
      }
    };

    fetchRecepciones();
  }, [form.idProductor]);

  // Al seleccionar recepción, prellenar kilos con los de esa recepción
  useEffect(() => {
    if (!form.idRecepcion) return;
    const rec = recepciones.find(
      (r) => String(r.idRecepcion) === String(form.idRecepcion)
    );
    if (rec?.kilosRecibidos) {
      setForm((f) => ({ ...f, kilosPagados: String(rec.kilosRecibidos) }));
    }
  }, [form.idRecepcion, recepciones]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");

    // Validación local
    if (!form.idProductor || !form.idRecepcion || !form.idMetodoPago ||
        !form.precioKg || !form.kilosPagados) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (parseFloat(form.precioKg) <= 0) {
      setError("El precio por kg debe ser mayor a 0.");
      return;
    }
    if (parseFloat(form.kilosPagados) <= 0) {
      setError("Los kilos pagados deben ser mayores a 0.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/pagos-productor", {
        idProductor:  parseInt(form.idProductor),
        idRecepcion:  parseInt(form.idRecepcion),
        idMetodoPago: parseInt(form.idMetodoPago),
        precioKg:     parseFloat(form.precioKg),
        kilosPagados: parseFloat(form.kilosPagados),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Error al registrar el pago (${err.response?.status ?? "sin respuesta"}).`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed";
  const labelCls =
    "block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Registrar Pago</h2>
                <p className="text-amber-100 text-xs">A productor por recepción</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* Error general */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {loadingForm ? (
            <div className="flex items-center justify-center py-8 gap-2 text-stone-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Cargando formulario...</span>
            </div>
          ) : (
            <>
              {/* Productor */}
              <div>
                <label className={labelCls}>
                  <User size={12} className="inline mr-1" />Productor
                </label>
                <div className="relative">
                  <select
                    name="idProductor"
                    value={form.idProductor}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    <option value="">Seleccionar productor...</option>
                    {productores.map((p) => (
                      <option key={p.idProductor} value={p.idProductor}>
                        {p.nombre1} {p.apellido1} — Doc: {p.documento}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recepción */}
              <div>
                <label className={labelCls}>
                  <Package size={12} className="inline mr-1" />Recepción sin pago
                </label>

                {loadingRec ? (
                  <div className="flex items-center gap-2 py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-400">
                    <Loader2 size={14} className="animate-spin" />
                    Cargando recepciones...
                  </div>
                ) : errorRec ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-red-700 text-xs">{errorRec}</p>
                    </div>
                  </div>
                ) : (
                  <select
                    name="idRecepcion"
                    value={form.idRecepcion}
                    onChange={handleChange}
                    className={inputCls}
                    disabled={!form.idProductor}
                  >
                    <option value="">
                      {!form.idProductor
                        ? "Primero selecciona un productor"
                        : recepciones.length === 0
                        ? "Este productor no tiene recepciones pendientes de pago"
                        : "Seleccionar recepción..."}
                    </option>
                    {recepciones.map((r) => (
                      <option key={r.idRecepcion} value={r.idRecepcion}>
                        #{r.idRecepcion} — {fmtDate(r.fechaHora)} — {fmtKg(r.kilosRecibidos)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Kilos y precio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    <Scale size={12} className="inline mr-1" />Kilos a pagar
                  </label>
                  <input
                    type="number"
                    name="kilosPagados"
                    value={form.kilosPagados}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    <DollarSign size={12} className="inline mr-1" />Precio/kg (COP)
                  </label>
                  <input
                    type="number"
                    name="precioKg"
                    value={form.precioKg}
                    onChange={handleChange}
                    placeholder="0"
                    min="1"
                    step="100"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Preview del monto */}
              {montoPreview && parseFloat(montoPreview) > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-amber-800 text-sm font-medium">Monto calculado:</span>
                  <span className="text-amber-900 text-xl font-bold">{fmt(montoPreview)}</span>
                </div>
              )}

              {/* Método de pago */}
              <div>
                <label className={labelCls}>
                  <CreditCard size={12} className="inline mr-1" />Método de pago
                </label>
                <select
                  name="idMetodoPago"
                  value={form.idMetodoPago}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">Seleccionar método...</option>
                  {metodosPago.map((m) => (
                    <option key={m.idMetodoPago} value={m.idMetodoPago}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loadingForm}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 transition"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {submitting ? "Registrando..." : "Registrar pago"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Confirmar Pago ─────────────────────────────────────────────────────

const ModalConfirmarPago = ({ pago, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.patch(`/pagos-productor/${pago.idPago}/marcar-pagado`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error al procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Confirmar Pago</h3>
          <p className="text-stone-500 text-sm mb-5">
            ¿Confirmas que se realizó el pago a{" "}
            <strong className="text-stone-700">{pago.nombreProductor}</strong>?
          </p>

          <div className="bg-stone-50 rounded-2xl p-4 text-left space-y-2 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Monto</span>
              <span className="font-bold text-stone-800">{fmt(pago.monto)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Kilos</span>
              <span className="text-stone-700">{fmtKg(pago.kilosPagados)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Método</span>
              <span className="text-stone-700">{pago.nombreMetodoPago}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Recepción</span>
              <span className="text-stone-700">#{pago.idRecepcion}</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <AlertCircle size={14} className="text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {loading ? "Procesando..." : "Confirmar pago"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Fila de la tabla ─────────────────────────────────────────────────────────

const FilaPago = ({ pago, onMarcarPagado }) => (
  <tr className="group border-b border-stone-100 hover:bg-amber-50/30 transition-colors">
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center shrink-0">
          <User size={16} className="text-stone-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-800">{pago.nombreProductor}</p>
          <p className="text-xs text-stone-400">{pago.documentoProductor}</p>
        </div>
      </div>
    </td>
    <td className="px-4 py-3">
      <p className="text-sm text-stone-700">Rec. #{pago.idRecepcion}</p>
      <p className="text-xs text-stone-400">{fmtDate(pago.fechaRecepcion)}</p>
    </td>
    <td className="px-4 py-3">
      <span className="text-sm text-stone-600">{fmtKg(pago.kilosPagados)}</span>
      <p className="text-xs text-stone-400">{fmt(pago.precioKg)}/kg</p>
    </td>
    <td className="px-4 py-3">
      <span className="text-base font-bold text-stone-800">{fmt(pago.monto)}</span>
    </td>
    <td className="px-4 py-3">
      <span className="text-xs text-stone-500">{pago.nombreMetodoPago}</span>
    </td>
    <td className="px-4 py-3">
      <EstadoBadge estado={pago.estado} />
      {pago.fechaPago && (
        <p className="text-xs text-stone-400 mt-1">{fmtDate(pago.fechaPago)}</p>
      )}
    </td>
    <td className="px-4 py-3">
      {pago.estado === "PENDIENTE" && (
        <button
          onClick={() => onMarcarPagado(pago)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition"
        >
          <CheckCircle2 size={12} />
          Marcar pagado
        </button>
      )}
    </td>
  </tr>
);

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Pagos() {
  const [pagos, setPagos]             = useState([]);
  const [stats, setStats]             = useState(null);
  const [productores, setProductores] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  const [filtroEstado, setFiltroEstado]       = useState("");
  const [filtroProductor, setFiltroProductor] = useState("");
  const [busqueda, setBusqueda]               = useState("");

  const [showModalRegistrar, setShowModalRegistrar] = useState(false);
  const [pagoAConfirmar, setPagoAConfirmar]         = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filtroEstado)    params.estado      = filtroEstado;
      if (filtroProductor) params.idProductor = filtroProductor;

      const [pagosRes, statsRes, prodRes] = await Promise.all([
        api.get("/pagos-productor", { params }),
        api.get("/pagos-productor/estadisticas"),
        api.get("/productores/activos"),
      ]);

      setPagos(pagosRes.data);
      setStats(statsRes.data);
      setProductores(prodRes.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError("No tienes permisos para ver el módulo de pagos.");
      } else {
        setError("Error cargando los datos. Verifica la conexión con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, filtroProductor]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pagosFiltrados = pagos.filter((p) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      p.nombreProductor?.toLowerCase().includes(q) ||
      p.documentoProductor?.toLowerCase().includes(q) ||
      String(p.idRecepcion).includes(q) ||
      String(p.idPago).includes(q)
    );
  });

  const pendientesCount = pagos.filter((p) => p.estado === "PENDIENTE").length;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
                <DollarSign size={16} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-stone-800">Pagos a Productores</h1>
              {pendientesCount > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendientesCount} pendiente{pendientesCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-stone-500 text-sm">
              Control de pagos por recepción de pescado — ASOPISTAR
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 transition"
              title="Actualizar"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowModalRegistrar(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              <Plus size={16} />
              Registrar pago
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<CheckCircle2 size={20} className="text-white" />}
              label="Total pagado"
              value={fmt(stats.totalPagado)}
              sub={`${stats.cantidadPagados} pago${stats.cantidadPagados !== 1 ? "s" : ""} completado${stats.cantidadPagados !== 1 ? "s" : ""}`}
              accent="bg-emerald-500"
            />
            <StatCard
              icon={<Clock size={20} className="text-white" />}
              label="Por pagar"
              value={fmt(stats.totalPendiente)}
              sub={`${stats.cantidadPendientes} pago${stats.cantidadPendientes !== 1 ? "s" : ""} pendiente${stats.cantidadPendientes !== 1 ? "s" : ""}`}
              accent="bg-amber-500"
            />
            <StatCard
              icon={<TrendingUp size={20} className="text-white" />}
              label="Promedio pago"
              value={fmt(stats.promedioMontoPago)}
              sub="por recepción"
              accent="bg-blue-500"
            />
            <StatCard
              icon={<DollarSign size={20} className="text-white" />}
              label="Total registros"
              value={stats.cantidadPagados + stats.cantidadPendientes}
              sub="pagos en total"
              accent="bg-violet-500"
            />
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por productor, documento o recepción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>

            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none transition"
              >
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="PAGADO">Pagado</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>

            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <select
                value={filtroProductor}
                onChange={(e) => setFiltroProductor(e.target.value)}
                className="pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none transition min-w-44"
              >
                <option value="">Todos los productores</option>
                {productores.map((p) => (
                  <option key={p.idProductor} value={p.idProductor}>
                    {p.nombre1} {p.apellido1}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>

            {(filtroEstado || filtroProductor || busqueda) && (
              <button
                onClick={() => { setFiltroEstado(""); setFiltroProductor(""); setBusqueda(""); }}
                className="flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-red-500 text-sm border border-stone-200 rounded-xl hover:border-red-200 hover:bg-red-50 transition"
              >
                <X size={13} />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <Loader2 size={24} className="animate-spin text-amber-500" />
              <span className="text-stone-500 text-sm">Cargando pagos...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle size={24} className="text-red-500" />
              </div>
              <p className="text-stone-600 text-sm text-center max-w-sm">{error}</p>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm rounded-xl transition"
              >
                <RefreshCw size={14} />
                Reintentar
              </button>
            </div>
          ) : pagosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center">
                <DollarSign size={24} className="text-stone-400" />
              </div>
              <p className="text-stone-500 text-sm">No hay pagos para mostrar</p>
              <button
                onClick={() => setShowModalRegistrar(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-xl transition"
              >
                <Plus size={14} />
                Registrar primer pago
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/70">
                    {["Productor", "Recepción", "Kilos / Precio", "Monto", "Método", "Estado", "Acción"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados.map((pago) => (
                    <FilaPago key={pago.idPago} pago={pago} onMarcarPagado={setPagoAConfirmar} />
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <p className="text-xs text-stone-400">
                  Mostrando <strong className="text-stone-600">{pagosFiltrados.length}</strong> de{" "}
                  <strong className="text-stone-600">{pagos.length}</strong> pago(s)
                </p>
                {pagosFiltrados.length > 0 && (
                  <p className="text-xs text-stone-400">
                    Total mostrado:{" "}
                    <strong className="text-stone-700">
                      {fmt(pagosFiltrados.reduce((a, p) => a + Number(p.monto), 0))}
                    </strong>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModalRegistrar && (
        <ModalRegistrarPago
          onClose={() => setShowModalRegistrar(false)}
          onSuccess={fetchData}
        />
      )}
      {pagoAConfirmar && (
        <ModalConfirmarPago
          pago={pagoAConfirmar}
          onClose={() => setPagoAConfirmar(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
