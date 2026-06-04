// src/pages/ingresos/Ingresos.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import {
  TrendingUp, DollarSign, Clock, CheckCircle2, AlertCircle,
  Plus, Search, Filter, ChevronDown, X, Loader2, RefreshCw,
  CreditCard, Building2, FileText, ChevronRight, BarChart3,
  ArrowUpRight, Banknote, CircleDollarSign, Zap,
} from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n ?? 0);

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const TIPOS_INGRESO = [
  { value: "VENTA_PESCADO",     label: "Venta de pescado" },
  { value: "VENTA_ALEVINOS",    label: "Venta de alevinos" },
  { value: "VENTA_CONCENTRADO", label: "Venta de concentrado" },
  { value: "OTRO",              label: "Otro" },
];
const TIPO_LABELS = Object.fromEntries(TIPOS_INGRESO.map((t) => [t.value, t.label]));

const EstadoBadge = ({ estado }) => {
  const cfg = {
    PENDIENTE: { cls: "bg-amber-100 text-amber-800 border-amber-200",      icon: <Clock size={11} /> },
    PARCIAL:   { cls: "bg-blue-100 text-blue-800 border-blue-200",         icon: <ArrowUpRight size={11} /> },
    PAGADO:    { cls: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle2 size={11} /> },
    ANULADO:   { cls: "bg-red-100 text-red-800 border-red-200",            icon: <X size={11} /> },
  };
  const { cls, icon } = cfg[estado] ?? { cls: "bg-gray-100 text-gray-600 border-gray-200", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {icon}{estado}
    </span>
  );
};

const StatCard = ({ icon, label, value, sub, accent }) => (
  <div className="relative overflow-hidden bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
    <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10 ${accent}`} />
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>{icon}</div>
    <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-bold text-stone-800 leading-tight">{value}</p>
    {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
  </div>
);

const BarraCobro = ({ pct }) => (
  <div className="w-full bg-stone-100 rounded-full h-1.5 mt-1">
    <div
      className={`h-1.5 rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : pct > 0 ? "bg-blue-500" : "bg-stone-300"}`}
      style={{ width: `${Math.min(pct, 100)}%` }}
    />
  </div>
);

// ─── Modal Registrar Ingreso ──────────────────────────────────────────────────

const ModalRegistrarIngreso = ({ onClose, onSuccess }) => {
  const [clientes,    setClientes]    = useState([]);
  const [envios,      setEnvios]      = useState([]);
  const [loadingForm, setLoadingForm] = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");

  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 16),
    concepto: "", tipoIngreso: "", valorTotal: "",
    idCliente: "", idEnvio: "", observaciones: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoadingForm(true);
      try {
        const [cRes, eRes] = await Promise.all([api.get("/clientes"), api.get("/envios")]);
        setClientes(cRes.data);
        setEnvios(eRes.data.filter((e) => e.estado === "ENTREGADO"));
      } catch (err) {
        const s = err.response?.status;
        setError(s === 403 ? "Sin permisos para cargar el formulario." : "Error cargando datos.");
      } finally {
        setLoadingForm(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "tipoIngreso") setForm((f) => ({ ...f, tipoIngreso: value, idEnvio: "" }));
    else setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.concepto.trim()) { setError("El concepto es obligatorio."); return; }
    if (!form.tipoIngreso)     { setError("El tipo de ingreso es obligatorio."); return; }
    if (!form.valorTotal || parseFloat(form.valorTotal) <= 0) { setError("El valor total debe ser mayor a 0."); return; }
    setSubmitting(true);
    try {
      await api.post("/ingresos", {
        fecha:         form.fecha ? new Date(form.fecha).toISOString() : null,
        concepto:      form.concepto.trim(),
        tipoIngreso:   form.tipoIngreso,
        valorTotal:    parseFloat(form.valorTotal),
        idCliente:     form.idCliente ? parseInt(form.idCliente) : null,
        idEnvio:       form.idEnvio   ? parseInt(form.idEnvio)   : null,
        observaciones: form.observaciones.trim() || null,
      });
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || `Error al registrar (${err.response?.status ?? "sin respuesta"}).`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition disabled:opacity-50";
  const labelCls = "block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <CircleDollarSign size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Registrar Ingreso</h2>
                <p className="text-teal-100 text-xs">El número se genera automáticamente</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition">
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {loadingForm ? (
            <div className="flex items-center justify-center py-8 gap-2 text-stone-400">
              <Loader2 size={20} className="animate-spin" /><span className="text-sm">Cargando formulario...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Fecha</label>
                  <input type="datetime-local" name="fecha" value={form.fecha} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tipo de ingreso</label>
                  <select name="tipoIngreso" value={form.tipoIngreso} onChange={handleChange} className={inputCls}>
                    <option value="">Seleccionar...</option>
                    {TIPOS_INGRESO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}><FileText size={12} className="inline mr-1" />Concepto</label>
                <input type="text" name="concepto" value={form.concepto} onChange={handleChange} placeholder="Ej: Venta cachama a Distribuidora Norte" maxLength={100} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}><DollarSign size={12} className="inline mr-1" />Valor total (COP)</label>
                <input type="number" name="valorTotal" value={form.valorTotal} onChange={handleChange} placeholder="0" min="1" step="1000" className={inputCls} />
              </div>
              {form.valorTotal && parseFloat(form.valorTotal) > 0 && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-teal-700 text-sm font-medium">Valor a registrar:</span>
                  <span className="text-teal-900 text-xl font-bold">{fmt(form.valorTotal)}</span>
                </div>
              )}
              <div>
                <label className={labelCls}><Building2 size={12} className="inline mr-1" />Cliente (opcional)</label>
                <select name="idCliente" value={form.idCliente} onChange={handleChange} className={inputCls}>
                  <option value="">Sin cliente asociado</option>
                  {clientes.map((c) => <option key={c.idCliente} value={c.idCliente}>{c.razonSocial} — {c.nit}</option>)}
                </select>
              </div>
              {form.tipoIngreso === "VENTA_PESCADO" && (
                <div>
                  <label className={labelCls}>Envío asociado (opcional)</label>
                  <select name="idEnvio" value={form.idEnvio} onChange={handleChange} className={inputCls}>
                    <option value="">Sin envío asociado</option>
                    {envios.map((e) => <option key={e.idEnvio} value={e.idEnvio}>#{e.idEnvio} — {e.destinoCiudad} — {fmtDate(e.fechaEnvio)}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className={labelCls}>Observaciones</label>
                <input type="text" name="observaciones" value={form.observaciones} onChange={handleChange} placeholder="Notas adicionales..." maxLength={100} className={inputCls} />
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-100 transition">Cancelar</button>
          <button onClick={handleSubmit} disabled={submitting || loadingForm} className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 transition">
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {submitting ? "Registrando..." : "Registrar ingreso"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Detalle + Abono ────────────────────────────────────────────────────
// ✅ FIX 1: Carga métodos de pago con manejo de error visible
// ✅ FIX 2: Botón "Pagar saldo completo" que llena el valor automáticamente
// ✅ FIX 3: Botones de porcentaje rápido (25%, 50%, 75%, 100%)

const ModalDetalleIngreso = ({ ingreso, onClose, onSuccess }) => {
  const [metodos,       setMetodos]       = useState([]);
  const [loadingMetodos,setLoadingMetodos] = useState(true);
  const [errorMetodos,  setErrorMetodos]  = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState("");
  const [tab,           setTab]           = useState("detalle");
  const [abono, setAbono] = useState({ valorPago: "", idMetodoPago: "", referencia: "", observaciones: "" });

  const saldo = parseFloat(ingreso.saldoPendiente ?? 0);

  // ✅ FIX: carga con manejo de error visible al usuario
  useEffect(() => {
    setLoadingMetodos(true);
    setErrorMetodos("");
    api.get("/metodos-pago")
      .then((r) => {
        setMetodos(r.data);
        if (r.data.length === 0) {
          setErrorMetodos("No hay métodos de pago configurados. Pide al administrador que los agregue en la BD.");
        }
      })
      .catch((err) => {
        const s = err.response?.status;
        if (s === 403) setErrorMetodos("Sin permisos para ver métodos de pago.");
        else setErrorMetodos("No se pudieron cargar los métodos de pago. Verifica que el servidor esté activo.");
      })
      .finally(() => setLoadingMetodos(false));
  }, []);

  // ✅ Llenar el valor del abono con un porcentaje del saldo
  const aplicarPorcentaje = (pct) => {
    const valor = Math.round((saldo * pct) / 100);
    setAbono((a) => ({ ...a, valorPago: String(valor) }));
  };

  // ✅ Llenar con el saldo completo
  const pagarCompleto = () => {
    setAbono((a) => ({ ...a, valorPago: String(saldo) }));
  };

  const handleAbono = async () => {
    setError("");
    if (!abono.valorPago || !abono.idMetodoPago) { setError("Valor y método de pago son obligatorios."); return; }
    if (parseFloat(abono.valorPago) <= 0)         { setError("El valor del abono debe ser mayor a 0."); return; }
    if (parseFloat(abono.valorPago) > saldo)      { setError(`El abono supera el saldo pendiente (${fmt(saldo)}).`); return; }
    setSubmitting(true);
    try {
      await api.post(`/ingresos/${ingreso.idIngreso}/pagos`, {
        valorPago:     parseFloat(abono.valorPago),
        idMetodoPago:  parseInt(abono.idMetodoPago),
        referencia:    abono.referencia || null,
        observaciones: abono.observaciones || null,
      });
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrar el abono.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-400 transition";
  const puedeAbonar = ingreso.estadoPago !== "PAGADO" && ingreso.estadoPago !== "ANULADO";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-xs font-medium">{ingreso.numeroIngreso}</p>
              <h2 className="text-white font-bold text-lg leading-tight truncate max-w-xs">{ingreso.concepto}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition">
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-stone-200">
          {[{ id: "detalle", label: "Detalle" }, puedeAbonar && { id: "abonar", label: "Registrar abono" }]
            .filter(Boolean).map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); setError(""); }}
                className={`flex-1 py-3 text-sm font-semibold transition ${tab === t.id ? "text-teal-700 border-b-2 border-teal-600" : "text-stone-500 hover:text-stone-700"}`}>
                {t.label}
              </button>
            ))}
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">

          {/* ── Tab Detalle ── */}
          {tab === "detalle" && (
            <>
              <div className="bg-stone-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Valor total</span>
                  <span className="font-bold text-stone-800">{fmt(ingreso.valorTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Total abonado</span>
                  <span className="font-semibold text-emerald-700">{fmt(ingreso.valorPagado)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-stone-200 pt-2">
                  <span className="text-stone-600 font-medium">Saldo pendiente</span>
                  <span className={`font-bold ${saldo > 0 ? "text-amber-700" : "text-emerald-700"}`}>{fmt(saldo)}</span>
                </div>
                <BarraCobro pct={ingreso.porcentajePagado ?? 0} />
                <p className="text-xs text-stone-400 text-right">{ingreso.porcentajePagado ?? 0}% cobrado</p>
              </div>
              <div className="space-y-2">
                {ingreso.razonSocial && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Cliente</span>
                    <span className="text-stone-700 font-medium">{ingreso.razonSocial}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Tipo</span>
                  <span className="text-stone-700">{TIPO_LABELS[ingreso.tipoIngreso] ?? ingreso.tipoIngreso}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Estado</span>
                  <EstadoBadge estado={ingreso.estadoPago} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Fecha</span>
                  <span className="text-stone-700">{fmtDate(ingreso.fecha)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">N° Ingreso</span>
                  <span className="text-stone-700 font-mono text-xs font-semibold">{ingreso.numeroIngreso}</span>
                </div>
              </div>
              {ingreso.pagos && ingreso.pagos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Historial de abonos</p>
                  <div className="space-y-2">
                    {ingreso.pagos.map((p) => (
                      <div key={p.idPagoIngreso} className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                        <div>
                          <p className="text-xs font-semibold text-emerald-800">{fmt(p.valorPago)}</p>
                          <p className="text-xs text-stone-400">{p.nombreMetodoPago} · {fmtDate(p.fechaPago)}</p>
                          {p.referencia && <p className="text-xs text-stone-400 font-mono">{p.referencia}</p>}
                        </div>
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Tab Abonar ── */}
          {tab === "abonar" && (
            <>
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Resumen saldo */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center">
                <span className="text-amber-700 text-sm font-medium">Saldo pendiente</span>
                <span className="text-amber-900 font-bold text-lg">{fmt(saldo)}</span>
              </div>

              {/* ✅ Botón pago completo + porcentajes rápidos */}
              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Seleccionar monto</p>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    onClick={pagarCompleto}
                    className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition"
                  >
                    <Zap size={13} />
                    Pago completo
                  </button>
                  {[25, 50, 75].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => aplicarPorcentaje(pct)}
                      className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor del abono */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                  <DollarSign size={12} className="inline mr-1" />Valor del abono (COP)
                </label>
                <input
                  type="number" value={abono.valorPago}
                  onChange={(e) => setAbono((a) => ({ ...a, valorPago: e.target.value }))}
                  placeholder="0" min="1" step="1000" max={saldo} className={inputCls}
                />
                {/* Preview del abono */}
                {abono.valorPago && parseFloat(abono.valorPago) > 0 && (
                  <div className="mt-2 flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
                    <span className="text-teal-700 text-xs font-medium">Abono a registrar</span>
                    <span className="text-teal-900 font-bold">{fmt(abono.valorPago)}</span>
                  </div>
                )}
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                  <CreditCard size={12} className="inline mr-1" />Método de pago
                </label>
                {loadingMetodos ? (
                  <div className="flex items-center gap-2 py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-400">
                    <Loader2 size={14} className="animate-spin" />Cargando métodos...
                  </div>
                ) : errorMetodos ? (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-amber-700 text-xs">{errorMetodos}</p>
                  </div>
                ) : (
                  <select value={abono.idMetodoPago} onChange={(e) => setAbono((a) => ({ ...a, idMetodoPago: e.target.value }))} className={inputCls}>
                    <option value="">Seleccionar método...</option>
                    {metodos.map((m) => <option key={m.idMetodoPago} value={m.idMetodoPago}>{m.nombre}</option>)}
                  </select>
                )}
              </div>

              {/* Referencia y observaciones */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Referencia</label>
                  <input type="text" value={abono.referencia} onChange={(e) => setAbono((a) => ({ ...a, referencia: e.target.value }))} placeholder="Ej: TRF-001" maxLength={60} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Observaciones</label>
                  <input type="text" value={abono.observaciones} onChange={(e) => setAbono((a) => ({ ...a, observaciones: e.target.value }))} placeholder="Notas..." maxLength={200} className={inputCls} />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-100 transition">Cerrar</button>
          {tab === "abonar" && (
            <button onClick={handleAbono} disabled={submitting || loadingMetodos || !!errorMetodos}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 transition">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Banknote size={15} />}
              {submitting ? "Registrando..." : "Confirmar abono"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Fila tabla ───────────────────────────────────────────────────────────────

const FilaIngreso = ({ ingreso, onVerDetalle }) => (
  <tr className="group border-b border-stone-100 hover:bg-teal-50/30 transition-colors cursor-pointer" onClick={() => onVerDetalle(ingreso)}>
    <td className="px-4 py-3">
      <p className="text-xs font-mono font-semibold text-teal-700">{ingreso.numeroIngreso}</p>
      <p className="text-xs text-stone-400">{fmtDate(ingreso.fecha)}</p>
    </td>
    <td className="px-4 py-3">
      <p className="text-sm font-semibold text-stone-800 truncate max-w-[180px]">{ingreso.concepto}</p>
      {ingreso.razonSocial && <p className="text-xs text-stone-400 flex items-center gap-1"><Building2 size={11} />{ingreso.razonSocial}</p>}
    </td>
    <td className="px-4 py-3">
      <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
        {TIPO_LABELS[ingreso.tipoIngreso] ?? ingreso.tipoIngreso ?? "—"}
      </span>
    </td>
    <td className="px-4 py-3"><p className="text-sm font-bold text-stone-800">{fmt(ingreso.valorTotal)}</p></td>
    <td className="px-4 py-3">
      <p className="text-xs text-stone-600">{fmt(ingreso.saldoPendiente)} pendiente</p>
      <BarraCobro pct={ingreso.porcentajePagado ?? 0} />
    </td>
    <td className="px-4 py-3"><EstadoBadge estado={ingreso.estadoPago} /></td>
    <td className="px-4 py-3"><button className="text-teal-600 hover:text-teal-800 transition"><ChevronRight size={18} /></button></td>
  </tr>
);

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Ingresos() {
  const [ingresos,    setIngresos]    = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo,   setFiltroTipo]   = useState("");
  const [busqueda,     setBusqueda]     = useState("");
  const [showModalRegistrar, setShowModalRegistrar] = useState(false);
  const [ingresoDetalle,     setIngresoDetalle]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroTipo)   params.tipo   = filtroTipo;
      const [ingRes, statsRes] = await Promise.all([
        api.get("/ingresos", { params }),
        api.get("/ingresos/estadisticas"),
      ]);
      setIngresos(ingRes.data);
      setStats(statsRes.data);
    } catch (err) {
      const s = err.response?.status;
      setError(s === 403 ? "No tienes permisos para ver el módulo de ingresos." : "Error cargando los datos.");
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, filtroTipo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleVerDetalle = async (ingreso) => {
    try {
      const [iRes, pRes] = await Promise.all([
        api.get(`/ingresos/${ingreso.idIngreso}`),
        api.get(`/ingresos/${ingreso.idIngreso}/pagos`),
      ]);
      setIngresoDetalle({ ...iRes.data, pagos: pRes.data });
    } catch {
      setIngresoDetalle(ingreso);
    }
  };

  const ingresosFiltrados = ingresos.filter((i) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      i.numeroIngreso?.toLowerCase().includes(q) ||
      i.concepto?.toLowerCase().includes(q) ||
      i.razonSocial?.toLowerCase().includes(q) ||
      String(i.idIngreso).includes(q)
    );
  });

  const pendientesCount = ingresos.filter((i) => i.estadoPago === "PENDIENTE" || i.estadoPago === "PARCIAL").length;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-7">

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={16} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-stone-800">Registro de Ingresos</h1>
              {pendientesCount > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendientesCount} por cobrar</span>
              )}
            </div>
            <p className="text-stone-500 text-sm">Control financiero de ventas — ASOPISTAR</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 transition">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setShowModalRegistrar(true)} className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition">
              <Plus size={16} />Registrar ingreso
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<BarChart3 size={20} className="text-white" />} label="Total facturado" value={fmt(stats.totalFacturado)} sub={`${stats.cantidadPagados + stats.cantidadParciales + stats.cantidadPendientes} ingresos`} accent="bg-teal-600" />
            <StatCard icon={<CheckCircle2 size={20} className="text-white" />} label="Total recaudado" value={fmt(stats.totalRecaudado)} sub={`${stats.cantidadPagados} pago${stats.cantidadPagados !== 1 ? "s" : ""}`} accent="bg-emerald-500" />
            <StatCard icon={<Clock size={20} className="text-white" />} label="Por cobrar" value={fmt(stats.totalPendiente)} sub={`${stats.cantidadPendientes} pendiente${stats.cantidadPendientes !== 1 ? "s" : ""}, ${stats.cantidadParciales} parcial${stats.cantidadParciales !== 1 ? "es" : ""}`} accent="bg-amber-500" />
            <StatCard icon={<DollarSign size={20} className="text-white" />} label="Total registros" value={stats.cantidadPagados + stats.cantidadParciales + stats.cantidadPendientes + stats.cantidadAnulados} sub="en el sistema" accent="bg-violet-500" />
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="text" placeholder="Buscar por número, concepto o cliente..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none transition">
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="PARCIAL">Parcial</option>
                <option value="PAGADO">Pagado</option>
                <option value="ANULADO">Anulado</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>
            <div className="relative">
              <BarChart3 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none transition min-w-44">
                <option value="">Todos los tipos</option>
                {TIPOS_INGRESO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>
            {(filtroEstado || filtroTipo || busqueda) && (
              <button onClick={() => { setFiltroEstado(""); setFiltroTipo(""); setBusqueda(""); }} className="flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-red-500 text-sm border border-stone-200 rounded-xl hover:border-red-200 hover:bg-red-50 transition">
                <X size={13} />Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <Loader2 size={24} className="animate-spin text-teal-600" />
              <span className="text-stone-500 text-sm">Cargando ingresos...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle size={24} className="text-red-500" />
              </div>
              <p className="text-stone-600 text-sm text-center max-w-sm">{error}</p>
              <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm rounded-xl transition">
                <RefreshCw size={14} />Reintentar
              </button>
            </div>
          ) : ingresosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center">
                <TrendingUp size={24} className="text-stone-400" />
              </div>
              <p className="text-stone-500 text-sm">No hay ingresos para mostrar</p>
              <button onClick={() => setShowModalRegistrar(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-xl transition">
                <Plus size={14} />Registrar primer ingreso
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/70">
                    {["Número / Fecha", "Concepto / Cliente", "Tipo", "Valor total", "Cobro", "Estado", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ingresosFiltrados.map((ing) => <FilaIngreso key={ing.idIngreso} ingreso={ing} onVerDetalle={handleVerDetalle} />)}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <p className="text-xs text-stone-400">
                  Mostrando <strong className="text-stone-600">{ingresosFiltrados.length}</strong> de <strong className="text-stone-600">{ingresos.length}</strong> ingreso(s)
                </p>
                {ingresosFiltrados.length > 0 && (
                  <p className="text-xs text-stone-400">Total mostrado: <strong className="text-stone-700">{fmt(ingresosFiltrados.reduce((a, i) => a + Number(i.valorTotal ?? 0), 0))}</strong></p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModalRegistrar && <ModalRegistrarIngreso onClose={() => setShowModalRegistrar(false)} onSuccess={fetchData} />}
      {ingresoDetalle && <ModalDetalleIngreso ingreso={ingresoDetalle} onClose={() => setIngresoDetalle(null)} onSuccess={fetchData} />}
    </div>
  );
}
