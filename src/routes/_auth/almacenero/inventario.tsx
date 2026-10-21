import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, Filter, Package, AlertTriangle } from "lucide-react";
import { listInventory } from "@/lib/api/inventory";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_auth/almacenero/inventario")({
  component: InventarioAlmacen,
});

type ItemInventario = {
  codigo: string;
  producto: string;
  categoria: string;
  almacen: string;
  stock: number;
  stockMinimo: number;
  precioCompra: number;
  precioVenta: number;
  valorInventario: number;
};

function InventarioAlmacen() {
  const [search, setSearch] = useState("");
  const [filtroAlmacen, setFiltroAlmacen] = useState("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [sortBy, setSortBy] = useState("codigo");

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: listInventory,
  });

  const items = useMemo<ItemInventario[]>(() => {
    return (inventory as any[]).map((row: any) => {
      const codigo = row.variant?.sku || row.variant_id || "";
      const producto = row.variant?.product?.name || "-";
      const categoria = row.variant?.product?.category?.name || "-";
      const almacen = row.warehouse?.name || "-";
      const stock = Number(row.stock) || 0;
      const stockMinimo = Number(row.min_stock) || 0;
      const precioVenta =
        row.variant?.product?.base_price != null ? Number(row.variant.product.base_price) : 0;
      const precioCompra = 0;
      const valorInventario = stock * precioVenta;
      return {
        codigo,
        producto,
        categoria,
        almacen,
        stock,
        stockMinimo,
        precioCompra,
        precioVenta,
        valorInventario,
      };
    });
  }, [inventory]);

  const almacenes = ["Todos", ...Array.from(new Set(items.map((i) => i.almacen)))];
  const categorias = ["Todas", ...Array.from(new Set(items.map((i) => i.categoria)))];

  const filtered = useMemo(() => {
    const data = items.filter((item) => {
      const matchSearch =
        item.producto.toLowerCase().includes(search.toLowerCase()) ||
        item.codigo.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filtroAlmacen !== "Todos" && item.almacen !== filtroAlmacen) return false;
      if (filtroCategoria !== "Todas" && item.categoria !== filtroCategoria) return false;
      if (filtroEstado === "Agotado" && item.stock !== 0) return false;
      if (filtroEstado === "Crítico" && (item.stock === 0 || item.stock > item.stockMinimo))
        return false;
      if (filtroEstado === "Normal" && item.stock <= item.stockMinimo) return false;
      return true;
    });

    data.sort((a, b) => {
      if (sortBy === "stock") return b.stock - a.stock;
      if (sortBy === "producto") return a.producto.localeCompare(b.producto);
      return a.codigo.localeCompare(b.codigo);
    });

    return data;
  }, [items, search, filtroAlmacen, filtroCategoria, filtroEstado, sortBy]);

  const getEstado = (item: ItemInventario) => {
    if (item.stock === 0)
      return { text: "Agotado", color: "bg-red-50 text-red-700 border border-red-200" };
    if (item.stock <= item.stockMinimo)
      return { text: "Crítico", color: "bg-yellow-50 text-yellow-700 border border-yellow-200" };
    return { text: "Normal", color: "bg-green-50 text-green-700 border border-green-200" };
  };

  const valorTotal = items.reduce((acc, i) => acc + i.valorInventario, 0);
  const stockCritico = items.filter((i) => i.stock > 0 && i.stock <= i.stockMinimo).length;
  const agotados = items.filter((i) => i.stock === 0).length;

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta y seguimiento de stock en tiempo real
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-sky/5">
          <Download className="h-4 w-4" />
          Exportar Excel
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Valor Total
              </p>
              <p className="mt-2 text-xl font-bold">{formatCurrency(valorTotal)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Valor a precio de venta base</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky/10">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Items
              </p>
              <p className="mt-2 text-xl font-bold">{items.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Total de productos</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Stock Crítico
              </p>
              <p className="mt-2 text-xl font-bold text-yellow-600">{stockCritico}</p>
              <p className="mt-1 text-xs text-muted-foreground">Requieren reposición</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-5 w-5 text-yellow-700" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Agotados
              </p>
              <p className="mt-2 text-xl font-bold text-red-600">{agotados}</p>
              <p className="mt-1 text-xs text-muted-foreground">Sin stock</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código o nombre de producto..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filtroAlmacen}
              onChange={(e) => setFiltroAlmacen(e.target.value)}
              className="rounded-full border border-border px-4 py-2 text-sm"
            >
              {almacenes.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="rounded-full border border-border px-4 py-2 text-sm"
            >
              {categorias.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="rounded-full border border-border px-4 py-2 text-sm"
            >
              <option>Todos</option>
              <option>Normal</option>
              <option>Crítico</option>
              <option>Agotado</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-border px-4 py-2 text-sm"
            >
              <option value="codigo">Ordenar: Código</option>
              <option value="producto">Ordenar: Nombre</option>
              <option value="stock">Ordenar: Stock</option>
            </select>
            <button className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
              <Filter className="h-4 w-4" />
              Más filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Código
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Producto
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Categoría
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Almacén
                </th>
                <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Stock
                </th>
                <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mínimo
                </th>
                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  P. Compra
                </th>
                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  P. Venta
                </th>
                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Valor
                </th>
                <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-sm text-muted-foreground">
                    Cargando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-sm text-muted-foreground">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const estado = getEstado(item);
                  return (
                    <tr
                      key={`${item.codigo}-${item.almacen}`}
                      className="border-b border-border hover:bg-sky/5"
                    >
                      <td className="p-4 text-sm font-mono">{item.codigo}</td>
                      <td className="p-4">
                        <p className="text-sm font-semibold">{item.producto}</p>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{item.categoria}</td>
                      <td className="p-4 text-sm">{item.almacen}</td>
                      <td className="p-4 text-center text-sm font-semibold">{item.stock}</td>
                      <td className="p-4 text-center text-sm text-muted-foreground">
                        {item.stockMinimo}
                      </td>
                      <td className="p-4 text-right text-sm">-</td>
                      <td className="p-4 text-right text-sm">{formatCurrency(item.precioVenta)}</td>
                      <td className="p-4 text-right text-sm font-semibold">
                        {formatCurrency(item.valorInventario)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${estado.color}`}
                        >
                          {(estado.text === "Crítico" || estado.text === "Agotado") && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {estado.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border p-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filtered.length} de {items.length} registros
          </p>
        </div>
      </div>
    </div>
  );
}
