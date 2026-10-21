import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, Download, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  listQuotations,
  createQuotation,
  updateQuotationStatus,
  listCustomers,
} from "@/lib/api/sales";
import { listProducts } from "@/lib/api/catalog";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/_auth/vendedor/cotizaciones")({
  component: CotizacionesVendedor,
});

type Cotizacion = {
  id: string;
  codigo: string;
  fecha: string;
  cliente: string;
  total: number;
  validez: string;
  estado: string;
};

type Linea = { variantId: string; label: string; cantidad: number; precio: number };

const statusLabels: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Pendiente",
  aceptada: "Aprobada",
  rechazada: "Rechazada",
  vencida: "Vencida",
};

function CotizacionesVendedor() {
  const { user } = useAuth() as any;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [validez, setValidez] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [varianteId, setVarianteId] = useState("");
  const [cantidad, setCantidad] = useState("1");

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["quotations"],
    queryFn: listQuotations,
  });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: listCustomers });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: listProducts });

  const variantes = products.flatMap((p: any) =>
    (p.variants ?? []).map((v: any) => ({
      id: v.id,
      label: `${p.name} - ${v.sku}`,
      price: Number(p.base_price) || 0,
    })),
  );

  const cotizaciones: Cotizacion[] = raw.map((c: any) => ({
    id: c.id,
    codigo: c.code ?? c.id.slice(0, 8).toUpperCase(),
    fecha: c.issued_at ? new Date(c.issued_at).toLocaleDateString("es-PE") : "—",
    cliente: c.customer?.name ?? "Cliente General",
    total: Number(c.total) || 0,
    validez: c.valid_until ? new Date(c.valid_until).toLocaleDateString("es-PE") : "—",
    estado: statusLabels[c.status] ?? c.status ?? "—",
  }));

  const filtered = cotizaciones.filter(
    (c) =>
      c.codigo.toLowerCase().includes(search.toLowerCase()) ||
      c.cliente.toLowerCase().includes(search.toLowerCase()),
  );

  const getEstadoColor = (estado: string) => {
    if (estado === "Aprobada") return "bg-green-100 text-green-700";
    if (estado === "Pendiente" || estado === "Borrador") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const addLinea = () => {
    const v = variantes.find((x) => x.id === varianteId);
    if (!v) return;
    setLineas((prev) => [
      ...prev,
      { variantId: v.id, label: v.label, cantidad: Number(cantidad) || 1, precio: v.price },
    ]);
    setVarianteId("");
    setCantidad("1");
  };

  const subtotal = lineas.reduce((acc, l) => acc + l.precio * l.cantidad, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const mutation = useMutation({
    mutationFn: () =>
      createQuotation(
        {
          code: `COT-${Date.now().toString().slice(-6)}`,
          customer_id: clienteId || null,
          seller_id: user?.id ?? null,
          status: "borrador",
          valid_until: validez || null,
        } as any,
        lineas.map((l) => ({
          variant_id: l.variantId,
          quantity: l.cantidad,
          unit_price: l.precio,
        })),
      ),
    onSuccess: () => {
      toast.success("Cotización creada");
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      setShowModal(false);
      setClienteId("");
      setValidez("");
      setLineas([]);
    },
    onError: (err: any) =>
      toast.error("No se pudo crear la cotización", { description: err?.message }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => updateQuotationStatus(id, status),
    onSuccess: () => {
      toast.success("Estado actualizado");
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
    onError: (err: any) => toast.error("No se pudo actualizar", { description: err?.message }),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cotizaciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">Crear y gestionar cotizaciones</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nueva Cotización
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cotización o cliente..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  N° Cotización
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Cliente
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Total</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Válida hasta
                </th>
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
                  <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                    Cargando cotizaciones…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                    Sin cotizaciones registradas.
                  </td>
                </tr>
              )}
              {filtered.map((cot) => (
                <tr key={cot.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm font-semibold">{cot.codigo}</td>
                  <td className="p-4 text-sm">{cot.fecha}</td>
                  <td className="p-4 text-sm">{cot.cliente}</td>
                  <td className="p-4 text-sm font-semibold">S/ {cot.total.toFixed(2)}</td>
                  <td className="p-4 text-sm text-muted-foreground">{cot.validez}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${getEstadoColor(cot.estado)}`}
                    >
                      {cot.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-full p-2 hover:bg-sky/10" title="Ver">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-full p-2 hover:bg-sky/10" title="Descargar PDF">
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ id: cot.id, status: "enviada" })}
                        className="rounded-full p-2 hover:bg-sky/10"
                        title="Aprobar / Enviar"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
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
            <h2 className="text-lg font-semibold">Nueva Cotización</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium">Cliente</label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar cliente</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Válida hasta</label>
                <input
                  type="date"
                  value={validez}
                  onChange={(e) => setValidez(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Productos</label>
              <div className="mt-2 flex items-center gap-2">
                <select
                  value={varianteId}
                  onChange={(e) => setVarianteId(e.target.value)}
                  className="flex-1 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar producto</option>
                  {variantes.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-20 rounded-xl border border-border px-3 py-2 text-sm"
                />
                <button
                  onClick={addLinea}
                  disabled={!varianteId}
                  className="flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" />
                  Agregar
                </button>
              </div>
              <div className="mt-2 rounded-xl border border-border">
                {lineas.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No hay productos
                  </div>
                ) : (
                  lineas.map((l, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b border-border p-3 text-sm last:border-0"
                    >
                      <span className="flex-1">{l.label}</span>
                      <span className="mx-3 text-muted-foreground">
                        {l.cantidad} × S/ {l.precio.toFixed(2)}
                      </span>
                      <span className="font-semibold">S/ {(l.precio * l.cantidad).toFixed(2)}</span>
                      <button
                        onClick={() => setLineas((prev) => prev.filter((_, i) => i !== idx))}
                        className="ml-3"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IGV (18%)</span>
                  <span>S/ {igv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-full border border-border py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                disabled={lineas.length === 0 || mutation.isPending}
                onClick={() => mutation.mutate()}
                className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                {mutation.isPending ? "Creando…" : "Crear Cotización"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
