import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { adjustStock, listWarehouses } from "@/lib/api/inventory";
import { listProducts } from "@/lib/api/catalog";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/_auth/almacenero/ajustes")({
  component: AjustesInventario,
});

type Ajuste = {
  id: string;
  fecha: string;
  producto: string;
  tipo: "Entrada" | "Salida";
  cantidad: number;
  motivo: string;
  usuario: string;
};

function AjustesInventario() {
  const { user } = useAuth() as any;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [productoId, setProductoId] = useState("");
  const [varianteId, setVarianteId] = useState("");
  const [tipo, setTipo] = useState<"Entrada" | "Salida">("Entrada");
  const [cantidad, setCantidad] = useState("");
  const [almacenId, setAlmacenId] = useState("");
  const [motivo, setMotivo] = useState("conteo_fisico");
  const [observacion, setObservacion] = useState("");

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
        list.push({
          id: v.id,
          sku: v.sku,
          producto: p.name,
          label: `${p.name} - ${v.sku}${v.size ? " / " + v.size : ""}${v.color_name ? " / " + v.color_name : ""}`,
        });
      });
    });
    return list;
  }, [products]);

  const ajusteMutation = useMutation({
    mutationFn: async () => {
      const qty = Number(cantidad);
      if (!varianteId || !almacenId || !qty || qty <= 0)
        throw new Error("Completa todos los campos");
      const code = `AJ-${Date.now().toString().slice(-6)}`;
      const reasonMap: Record<
        string,
        "conteo_fisico" | "producto_danado" | "producto_vencido" | "correccion_inventario" | "otro"
      > = {
        "Conteo físico": "conteo_fisico",
        conteo_fisico: "conteo_fisico",
        "Producto dañado": "producto_danado",
        producto_danado: "producto_danado",
        "Producto vencido": "producto_vencido",
        producto_vencido: "producto_vencido",
        "Corrección de inventario": "correccion_inventario",
        correccion_inventario: "correccion_inventario",
        Otro: "otro",
        otro: "otro",
      };
      const reason = reasonMap[motivo] || "otro";
      await adjustStock({
        code,
        variantId: varianteId,
        warehouseId: almacenId,
        type: tipo === "Entrada" ? "entrada" : "salida",
        quantity: qty,
        reason,
        userId: user?.id || null,
        notes: observacion || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      toast.success("Ajuste registrado");
      setShowModal(false);
      setVarianteId("");
      setProductoId("");
      setCantidad("");
      setObservacion("");
    },
    onError: (e: any) => {
      toast.error(e?.message || "Error al registrar ajuste");
    },
  });

  const ajustes: Ajuste[] = [];

  const filtered = useMemo(() => {
    return ajustes.filter(
      (a) =>
        a.producto.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase()),
    );
  }, [ajustes, search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ajustes de Inventario</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajustes por conteo físico o correcciones
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Ajuste
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ajuste..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  N° Ajuste
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Producto
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                <th className="p-4 text-center text-xs font-semibold text-muted-foreground">
                  Cantidad
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Motivo
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Usuario
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                    Los ajustes se registran con código AJ-...
                  </td>
                </tr>
              ) : (
                filtered.map((ajuste) => (
                  <tr key={ajuste.id} className="border-b border-border hover:bg-sky/5">
                    <td className="p-4 text-sm font-semibold">{ajuste.id}</td>
                    <td className="p-4 text-sm text-muted-foreground">{ajuste.fecha}</td>
                    <td className="p-4 text-sm">{ajuste.producto}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${ajuste.tipo === "Entrada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {ajuste.tipo}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`font-semibold ${ajuste.tipo === "Entrada" ? "text-green-600" : "text-red-600"}`}
                      >
                        {ajuste.tipo === "Entrada" ? "+" : "-"}
                        {ajuste.cantidad}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{ajuste.motivo}</td>
                    <td className="p-4 text-sm">{ajuste.usuario}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-card p-6">
            <h2 className="text-lg font-semibold">Nuevo Ajuste de Inventario</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Producto / Variante</label>
                <select
                  value={varianteId}
                  onChange={(e) => {
                    setVarianteId(e.target.value);
                  }}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar variante</option>
                  {variantes.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <option>Entrada</option>
                    <option>Salida</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Cantidad</label>
                  <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Almacén</label>
                <select
                  value={almacenId}
                  onChange={(e) => setAlmacenId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar almacén</option>
                  {(warehouses as any[]).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Motivo</label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="conteo_fisico">Conteo físico</option>
                  <option value="producto_danado">Producto dañado</option>
                  <option value="producto_vencido">Producto vencido</option>
                  <option value="correccion_inventario">Corrección de inventario</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Observación</label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Detalle del ajuste"
                />
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
                onClick={() => ajusteMutation.mutate()}
                disabled={ajusteMutation.isPending}
                className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                {ajusteMutation.isPending ? "Registrando..." : "Registrar Ajuste"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
