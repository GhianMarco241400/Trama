import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  listGoodsReceipts,
  listGoodsReceiptItems,
  receiveGoods,
  listWarehouses,
} from "@/lib/api/inventory";
import { useAuth } from "@/context/auth-context";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_auth/almacenero/recepciones")({
  component: RecepcionesAlmacen,
});

type Recepcion = {
  id: string;
  code: string;
  oc: string;
  proveedor: string;
  fecha: string;
  items: number;
  total: number;
  estado: string;
  recibidoPor?: string;
};

function RecepcionesAlmacen() {
  const { user } = useAuth() as any;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [receiptItems, setReceiptItems] = useState<any[]>([]);
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [warehouseId, setWarehouseId] = useState<string>("");

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ["goods-receipts"],
    queryFn: listGoodsReceipts,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: listWarehouses,
  });

  const recepciones = useMemo<Recepcion[]>(() => {
    return (receipts as any[]).map((r) => {
      const fechaStr = r.received_at ? new Date(r.received_at).toISOString().split("T")[0] : "-";
      const fecha = fechaStr || "-";
      let estado = r.status || "-";
      if (estado === "recibido") estado = "Recibido";
      else if (estado === "pendiente") estado = "Pendiente";
      else if (estado === "parcial") estado = "Parcial";
      return {
        id: r.id,
        code: r.code,
        oc: r.purchase?.code || r.purchase_id || "-",
        proveedor: r.supplier?.business_name || "-",
        fecha,
        items: 0,
        total: Number(r.total) || 0,
        estado,
        recibidoPor: r.received_by || undefined,
      };
    });
  }, [receipts]);

  const filtered = recepciones.filter(
    (r) =>
      (r.oc || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.proveedor || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.code || "").toLowerCase().includes(search.toLowerCase()),
  );

  const getEstadoColor = (estado: string) => {
    if (estado === "Recibido") return "bg-green-100 text-green-700";
    if (estado === "Parcial") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  const openReceive = async (rec: any) => {
    setSelectedReceipt(rec);
    setShowModal(true);
    const principal =
      (warehouses as any[]).find((w) => w.name?.toLowerCase().includes("principal")) ||
      (warehouses as any[])[0];
    setWarehouseId(principal?.id ?? "");
    try {
      const data = await listGoodsReceiptItems(rec.id);
      setReceiptItems(data || []);
      const initial: Record<string, number> = {};
      (data || []).forEach((it: any) => {
        initial[it.id] = it.received_qty > 0 ? it.received_qty : it.requested_qty || 0;
      });
      setReceivedQtys(initial);
    } catch (e: any) {
      toast.error(e?.message || "Error al cargar detalle");
    }
  };

  const receiveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedReceipt) return;
      if (!warehouseId) throw new Error("Selecciona un almacén de destino");
      const items = receiptItems.map((it: any) => ({
        variant_id: it.variant_id,
        requested_qty: it.requested_qty || 0,
        received_qty: Number(receivedQtys[it.id]) || 0,
      }));
      await receiveGoods({
        receiptId: selectedReceipt.id,
        warehouseId,
        userId: user?.id || null,
        items,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goods-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success("Mercadería recepcionada correctamente");
      setShowModal(false);
    },
    onError: (e: any) => {
      toast.error(e?.message || "Error al recepcionar");
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recepciones de Compra</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recepción de mercadería desde órdenes de compra
          </p>
        </div>
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
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  N° Recepción
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">N° OC</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Proveedor
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                  Total
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                    Cargando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                    Sin recepciones
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id} className="border-b border-border hover:bg-sky/5">
                    <td className="p-4 text-sm font-semibold">{rec.code}</td>
                    <td className="p-4 text-sm">{rec.oc}</td>
                    <td className="p-4 text-sm">{rec.proveedor}</td>
                    <td className="p-4 text-sm text-muted-foreground">{rec.fecha}</td>
                    <td className="p-4 text-right text-sm font-semibold">
                      {formatCurrency(rec.total)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${getEstadoColor(rec.estado)}`}
                      >
                        {rec.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {rec.estado === "Pendiente" || rec.estado === "Parcial" ? (
                        <button
                          onClick={() => openReceive(rec)}
                          className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs text-white hover:opacity-90"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Recepcionar
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
          <div className="w-full max-w-xl rounded-2xl bg-card p-6">
            <h2 className="text-lg font-semibold">Recepcionar Mercadería</h2>
            <p className="mt-1 text-sm text-muted-foreground">{selectedReceipt?.proveedor}</p>
            <div className="mt-4">
              <label className="text-sm font-medium">Almacén de destino</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                {warehouses.map((w: any) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 rounded-xl border border-border">
              <div className="grid grid-cols-12 gap-2 border-b border-border p-2 text-xs font-semibold">
                <div className="col-span-6">Producto</div>
                <div className="col-span-3">Solicitado</div>
                <div className="col-span-3">Recibido</div>
              </div>
              {receiptItems.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Sin detalle</div>
              ) : (
                receiptItems.map((it: any) => (
                  <div
                    key={it.id}
                    className="grid grid-cols-12 gap-2 border-b border-border p-2 text-sm"
                  >
                    <div className="col-span-6">
                      {it.variant?.product?.name || it.variant?.sku || "-"}
                    </div>
                    <div className="col-span-3">{it.requested_qty}</div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={receivedQtys[it.id] || 0}
                        onChange={(e) =>
                          setReceivedQtys((prev) => ({ ...prev, [it.id]: Number(e.target.value) }))
                        }
                        className="w-full rounded-lg border border-border px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-full border border-border py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => receiveMutation.mutate()}
                disabled={receiveMutation.isPending}
                className="flex-1 rounded-full bg-green-600 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                {receiveMutation.isPending ? "Procesando..." : "Confirmar Recepción"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
