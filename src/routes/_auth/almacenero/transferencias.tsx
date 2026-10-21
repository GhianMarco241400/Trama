import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  listTransfers,
  createTransfer,
  receiveTransfer,
  listWarehouses,
} from "@/lib/api/inventory";
import { listProducts } from "@/lib/api/catalog";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/_auth/almacenero/transferencias")({
  component: TransferenciasAlmacen,
});

type Transferencia = {
  id: string;
  codigo: string;
  fecha: string;
  origen: string;
  destino: string;
  items: number;
  estado: string;
  solicitadoPor: string;
};

function TransferenciasAlmacen() {
  const { user } = useAuth() as any;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [origenId, setOrigenId] = useState("");
  const [destinoId, setDestinoId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [observaciones, setObservaciones] = useState("");
  const [lineas, setLineas] = useState<{ variant_id: string; quantity: number }[]>([]);

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ["transfers"],
    queryFn: listTransfers,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: listWarehouses,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const variantes = useMemo(() => {
    const list: any[] = [];
    (products as any[]).forEach((p) => {
      (p.variants || []).forEach((v: any) => {
        list.push({ id: v.id, label: `${p.name} - ${v.sku}` });
      });
    });
    return list;
  }, [products]);

  const transferencias = useMemo<Transferencia[]>(() => {
    return (transfers as any[]).map((t) => {
      const fechaStr = t.transfered_at
        ? new Date(t.transfered_at).toISOString().split("T")[0]
        : "-";
      const fecha = fechaStr || "-";
      let estado = t.status || "-";
      if (estado === "pendiente") estado = "Pendiente";
      else if (estado === "en_transito") estado = "En tránsito";
      else if (estado === "recibido") estado = "Recibido";
      else if (estado === "anulado") estado = "Anulado";
      return {
        id: t.id,
        codigo: t.code || t.id.slice(0, 8).toUpperCase(),
        fecha,
        origen: t.origin?.name || "-",
        destino: t.destination?.name || "-",
        items: t.items_count || 0,
        estado,
        solicitadoPor: t.requested_by || user?.name || "-",
      };
    });
  }, [transfers, user]);

  const filtered = useMemo(() => {
    return transferencias.filter(
      (t) =>
        (t.codigo || t.id).toLowerCase().includes(search.toLowerCase()) ||
        t.origen.toLowerCase().includes(search.toLowerCase()) ||
        t.destino.toLowerCase().includes(search.toLowerCase()),
    );
  }, [transferencias, search]);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!origenId || !destinoId) throw new Error("Selecciona origen y destino");
      const code = `TR-${Date.now().toString().slice(-6)}`;
      await createTransfer(
        {
          code,
          origin_warehouse_id: origenId,
          destination_warehouse_id: destinoId,
          status: "pendiente",
          requested_by: user?.name || null,
          notes: observaciones || null,
        } as any,
        lineas.filter((l) => l.variant_id && l.quantity > 0),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast.success("Transferencia creada");
      setShowModal(false);
      setLineas([]);
      setObservaciones("");
    },
    onError: (e: any) => {
      toast.error(e?.message || "Error al crear transferencia");
    },
  });

  const receiveMutation = useMutation({
    mutationFn: async (transferId: string) => {
      await receiveTransfer(transferId, user?.id || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      toast.success("Transferencia recibida");
    },
    onError: (e: any) => {
      toast.error(e?.message || "Error al recibir transferencia");
    },
  });

  const getEstadoColor = (estado: string) => {
    if (estado === "Recibido") return "bg-green-100 text-green-700";
    if (estado === "En tránsito") return "bg-yellow-100 text-yellow-700";
    if (estado === "Pendiente") return "bg-blue-100 text-blue-700";
    return "bg-red-100 text-red-700";
  };

  const addLinea = () => setLineas((prev) => [...prev, { variant_id: "", quantity: 1 }]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transferencias entre Almacenes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Movimiento de stock entre almacenes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nueva Transferencia
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar transferencia..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  N° Transferencia
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Origen
                </th>
                <th className="p-4 text-center text-xs font-semibold text-muted-foreground"></th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Destino
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Items</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Estado
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Solicitado por
                </th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-sm text-muted-foreground">
                    Cargando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-sm text-muted-foreground">
                    Sin transferencias
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border hover:bg-sky/5">
                    <td className="p-4 text-sm font-semibold">{t.codigo}</td>
                    <td className="p-4 text-sm">{t.fecha}</td>
                    <td className="p-4 text-sm">{t.origen}</td>
                    <td className="p-4 text-center">
                      <ArrowRight className="mx-auto h-4 w-4" />
                    </td>
                    <td className="p-4 text-sm">{t.destino}</td>
                    <td className="p-4 text-sm">{t.items}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${getEstadoColor(t.estado)}`}
                      >
                        {t.estado}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{t.solicitadoPor}</td>
                    <td className="p-4 text-right">
                      {t.estado === "Pendiente" || t.estado === "En tránsito" ? (
                        <button
                          onClick={() => receiveMutation.mutate(t.id)}
                          disabled={receiveMutation.isPending}
                          className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs text-white hover:opacity-90 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Recibir
                        </button>
                      ) : (
                        <button className="rounded-full p-2 hover:bg-sky/10">
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl bg-card p-6">
            <h2 className="text-lg font-semibold">Nueva Transferencia</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Almacén Origen</label>
                <select
                  value={origenId}
                  onChange={(e) => setOrigenId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar origen</option>
                  {(warehouses as any[]).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Almacén Destino</label>
                <select
                  value={destinoId}
                  onChange={(e) => setDestinoId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar destino</option>
                  {(warehouses as any[]).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Productos</label>
                <button
                  onClick={addLinea}
                  className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  Agregar producto
                </button>
              </div>
              <div className="mt-2 rounded-xl border border-border">
                <div className="grid grid-cols-12 gap-2 border-b border-border p-2 text-xs font-semibold">
                  <div className="col-span-7">Producto</div>
                  <div className="col-span-5">Cantidad</div>
                </div>
                {lineas.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No hay productos
                  </div>
                ) : (
                  lineas.map((l, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 border-b border-border p-2 text-sm"
                    >
                      <div className="col-span-7">
                        <select
                          value={l.variant_id}
                          onChange={(e) =>
                            setLineas((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, variant_id: e.target.value } : x,
                              ),
                            )
                          }
                          className="w-full rounded-lg border border-border px-2 py-1 text-sm"
                        >
                          <option value="">Seleccionar</option>
                          {variantes.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-5">
                        <input
                          type="number"
                          value={l.quantity}
                          onChange={(e) =>
                            setLineas((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, quantity: Number(e.target.value) } : x,
                              ),
                            )
                          }
                          className="w-full rounded-lg border border-border px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                rows={3}
                placeholder="Observaciones de la transferencia"
              />
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-full border border-border py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                {createMutation.isPending ? "Creando..." : "Crear Transferencia"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
