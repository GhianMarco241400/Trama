import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listPurchases, createPurchase, approvePurchase } from "@/lib/api/purchasing";
import { listSuppliers, listProducts } from "@/lib/api/catalog";
import { useAuth } from "@/context/auth-context";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_auth/admin/compras")({
  component: ComprasAdmin,
});

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  recibida: "Recibida",
  anulada: "Anulada",
};

type LineaForm = {
  variantId: string;
  quantity: number;
  unitCost: number;
};

type CompraFila = {
  id: string;
  internalId: string;
  proveedor: string;
  fecha: string;
  total: number;
  estado: string;
};

function ComprasAdmin() {
  const { user } = useAuth() as any;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ proveedor: "", fecha: "", observaciones: "" });
  const [lineas, setLineas] = useState<LineaForm[]>([]);
  const [newLine, setNewLine] = useState<LineaForm>({ variantId: "", quantity: 1, unitCost: 0 });

  const { data: compras = [], isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: listPurchases,
  });

  const { data: proveedores = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: listSuppliers,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const variantOptions = useMemo(() => {
    return products.flatMap((p) =>
      (p.variants ?? []).map((v) => ({
        id: v.id,
        label: `${p.name}${v.size ? ` · ${v.size}` : ""}${v.color_name ? ` · ${v.color_name}` : ""}`,
        basePrice: Number(p.base_price) || 0,
      })),
    );
  }, [products]);

  const createMutation = useMutation({
    mutationFn: () =>
      createPurchase({
        supplierId: form.proveedor,
        createdBy: user?.id ?? null,
        issuedAt: form.fecha || undefined,
        notes: form.observaciones || null,
        items: lineas.map((l) => ({
          variant_id: l.variantId,
          quantity: l.quantity,
          unit_cost: l.unitCost,
        })),
      }),
    onSuccess: () => {
      toast.success("Orden de compra creada");
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      closeModal();
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo crear la orden de compra"),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approvePurchase(id, user?.id ?? null),
    onSuccess: () => {
      toast.success("Orden aprobada: se generó la recepción y la cuenta por pagar");
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["goods-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["payables"] });
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo aprobar la orden"),
  });

  const filas: CompraFila[] = useMemo(() => {
    return compras.map((c) => ({
      id: c.code,
      internalId: c.id,
      proveedor: c.supplier?.business_name ?? "Sin proveedor",
      fecha: formatDate(c.issued_at),
      total: c.total,
      estado: ESTADO_LABELS[c.status] ?? c.status,
    }));
  }, [compras]);

  const filtered = useMemo(() => {
    return filas.filter(
      (c) =>
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.proveedor.toLowerCase().includes(search.toLowerCase()),
    );
  }, [filas, search]);

  const getEstadoColor = (estado: string) => {
    if (estado === "Recibida") return "bg-green-100 text-green-700";
    if (estado === "Aprobada") return "bg-blue-100 text-blue-700";
    if (estado === "Pendiente") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ proveedor: "", fecha: "", observaciones: "" });
    setLineas([]);
    setNewLine({ variantId: "", quantity: 1, unitCost: 0 });
  };

  const openCreate = () => {
    setForm({
      proveedor: proveedores[0]?.id ?? "",
      fecha: new Date().toISOString().slice(0, 10),
      observaciones: "",
    });
    setLineas([]);
    setNewLine({ variantId: "", quantity: 1, unitCost: 0 });
    setShowModal(true);
  };

  const addLinea = () => {
    if (!newLine.variantId) {
      toast.error("Selecciona un producto");
      return;
    }
    setLineas((prev) => [
      ...prev,
      {
        ...newLine,
        quantity: Number(newLine.quantity) || 1,
        unitCost: Number(newLine.unitCost) || 0,
      },
    ]);
    setNewLine({ variantId: "", quantity: 1, unitCost: 0 });
  };

  const removeLinea = (index: number) => {
    setLineas((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotalLineas = useMemo(
    () => lineas.reduce((acc, l) => acc + l.quantity * l.unitCost, 0),
    [lineas],
  );

  const handleSubmit = () => {
    if (!form.proveedor) {
      toast.error("Selecciona un proveedor");
      return;
    }
    if (lineas.length === 0) {
      toast.error("Agrega al menos un producto a la orden");
      return;
    }
    createMutation.mutate();
  };

  const onPickVariant = (variantId: string) => {
    const opt = variantOptions.find((v) => v.id === variantId);
    setNewLine((prev) => ({ ...prev, variantId, unitCost: prev.unitCost || opt?.basePrice || 0 }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compras</h1>
          <p className="mt-1 text-sm text-muted-foreground">Órdenes de compra a proveedores</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nueva Orden de Compra
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por OC o proveedor..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">N° OC</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Proveedor
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Total</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Estado
                </th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    Cargando…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    No hay órdenes de compra
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.internalId} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm font-semibold">{c.id}</td>
                  <td className="p-4 text-sm">{c.proveedor}</td>
                  <td className="p-4 text-sm text-muted-foreground">{c.fecha}</td>
                  <td className="p-4 text-sm font-semibold">{formatCurrency(c.total)}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${getEstadoColor(c.estado)}`}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {c.estado === "Pendiente" ? (
                      <button
                        onClick={() => approveMutation.mutate(c.internalId)}
                        disabled={approveMutation.isPending}
                        className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs text-white hover:opacity-90 disabled:opacity-60"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Aprobar
                      </button>
                    ) : (
                      <button className="rounded-full p-2 hover:bg-sky/10">
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl bg-card p-6">
            <h2 className="text-lg font-semibold">Nueva Orden de Compra</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Proveedor</label>
                <select
                  value={form.proveedor}
                  onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.business_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Fecha</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Productos</label>
              <div className="mt-2 grid grid-cols-12 gap-2">
                <select
                  value={newLine.variantId}
                  onChange={(e) => onPickVariant(e.target.value)}
                  className="col-span-6 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar producto</option>
                  {variantOptions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={newLine.quantity}
                  onChange={(e) => setNewLine((p) => ({ ...p, quantity: Number(e.target.value) }))}
                  placeholder="Cant."
                  className="col-span-2 rounded-xl border border-border px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={newLine.unitCost}
                  onChange={(e) => setNewLine((p) => ({ ...p, unitCost: Number(e.target.value) }))}
                  placeholder="Costo"
                  className="col-span-3 rounded-xl border border-border px-3 py-2 text-sm"
                />
                <button
                  onClick={addLinea}
                  className="col-span-1 flex items-center justify-center rounded-xl bg-ink text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 rounded-xl border border-border">
                <div className="grid grid-cols-12 gap-2 border-b border-border p-2 text-xs font-semibold">
                  <div className="col-span-6">Producto</div>
                  <div className="col-span-2">Cantidad</div>
                  <div className="col-span-3">Costo Unit.</div>
                  <div className="col-span-1" />
                </div>
                {lineas.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No hay productos
                  </div>
                ) : (
                  lineas.map((l, i) => {
                    const opt = variantOptions.find((v) => v.id === l.variantId);
                    return (
                      <div
                        key={`${l.variantId}-${i}`}
                        className="grid grid-cols-12 items-center gap-2 border-b border-border p-2 text-sm"
                      >
                        <div className="col-span-6">{opt?.label ?? l.variantId}</div>
                        <div className="col-span-2">{l.quantity}</div>
                        <div className="col-span-3">{formatCurrency(l.unitCost)}</div>
                        <div className="col-span-1 text-right">
                          <button onClick={() => removeLinea(i)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {lineas.length > 0 && (
                <p className="mt-2 text-right text-sm">
                  Subtotal: <span className="font-semibold">{formatCurrency(subtotalLineas)}</span>{" "}
                  · IGV 18%:{" "}
                  <span className="font-semibold">{formatCurrency(subtotalLineas * 0.18)}</span> ·
                  Total: <span className="font-bold">{formatCurrency(subtotalLineas * 1.18)}</span>
                </p>
              )}
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Observaciones</label>
              <textarea
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                rows={3}
                placeholder="Observaciones de la orden"
              />
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 rounded-full border border-border py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground disabled:opacity-60"
              >
                {createMutation.isPending ? "Creando…" : "Crear Orden"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
