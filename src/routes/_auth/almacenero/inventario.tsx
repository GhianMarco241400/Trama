import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Search, Download, Filter, ArrowUpDown, Package, AlertTriangle } from 'lucide-react';

export const Route = createFileRoute('/_auth/almacenero/inventario')({
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

const MOCK_INVENTARIO: ItemInventario[] = [
  { codigo: 'PRD-001', producto: 'Polo Básico Algodón', categoria: 'Polos', almacen: 'Almacén Principal', stock: 26, stockMinimo: 10, precioCompra: 25.0, precioVenta: 49.9, valorInventario: 650.0 },
  { codigo: 'PRD-002', producto: 'Camisa Oxford Lino', categoria: 'Camisas', almacen: 'Almacén Principal', stock: 14, stockMinimo: 5, precioCompra: 65.0, precioVenta: 119.9, valorInventario: 910.0 },
  { codigo: 'PRD-003', producto: 'Jean Recto Índigo', categoria: 'Pantalones', almacen: 'Almacén Principal', stock: 0, stockMinimo: 8, precioCompra: 85.0, precioVenta: 159.9, valorInventario: 0 },
  { codigo: 'PRD-004', producto: 'Casaca Denim Clásica', categoria: 'Casacas', almacen: 'Almacén Principal', stock: 2, stockMinimo: 5, precioCompra: 120.0, precioVenta: 219.9, valorInventario: 240.0 },
  { codigo: 'PRD-005', producto: 'Zapatilla Urbana Trama', categoria: 'Zapatillas', almacen: 'Almacén Principal', stock: 31, stockMinimo: 10, precioCompra: 140.0, precioVenta: 249.9, valorInventario: 4340.0 },
  { codigo: 'PRD-006', producto: 'Polo Oversize Rayas', categoria: 'Polos', almacen: 'Almacén Secundario', stock: 18, stockMinimo: 10, precioCompra: 28.0, precioVenta: 69.9, valorInventario: 504.0 },
  { codigo: 'PRD-007', producto: 'Reloj Minimal Negro', categoria: 'Accesorios', almacen: 'Almacén Principal', stock: 2, stockMinimo: 5, precioCompra: 95.0, precioVenta: 189.9, valorInventario: 190.0 },
];

function InventarioAlmacen() {
  const [search, setSearch] = useState('');
  const [filtroAlmacen, setFiltroAlmacen] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [sortBy, setSortBy] = useState('codigo');

  const almacenes = ['Todos', ...Array.from(new Set(MOCK_INVENTARIO.map((i) => i.almacen)))];
  const categorias = ['Todas', ...Array.from(new Set(MOCK_INVENTARIO.map((i) => i.categoria)))];

  const filtered = useMemo(() => {
    let data = MOCK_INVENTARIO.filter((item) => {
      const matchSearch = item.producto.toLowerCase().includes(search.toLowerCase()) || item.codigo.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filtroAlmacen !== 'Todos' && item.almacen !== filtroAlmacen) return false;
      if (filtroCategoria !== 'Todas' && item.categoria !== filtroCategoria) return false;
      if (filtroEstado === 'Agotado' && item.stock !== 0) return false;
      if (filtroEstado === 'Crítico' && (item.stock === 0 || item.stock > item.stockMinimo)) return false;
      if (filtroEstado === 'Normal' && item.stock <= item.stockMinimo) return false;
      return true;
    });

    data.sort((a, b) => {
      if (sortBy === 'stock') return b.stock - a.stock;
      if (sortBy === 'producto') return a.producto.localeCompare(b.producto);
      return a.codigo.localeCompare(b.codigo);
    });

    return data;
  }, [search, filtroAlmacen, filtroCategoria, filtroEstado, sortBy]);

  const getEstado = (item: ItemInventario) => {
    if (item.stock === 0) return { text: 'Agotado', color: 'bg-red-50 text-red-700 border border-red-200' };
    if (item.stock <= item.stockMinimo) return { text: 'Crítico', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' };
    return { text: 'Normal', color: 'bg-green-50 text-green-700 border border-green-200' };
  };

  const valorTotal = MOCK_INVENTARIO.reduce((acc, i) => acc + i.valorInventario, 0);
  const stockCritico = MOCK_INVENTARIO.filter((i) => i.stock > 0 && i.stock <= i.stockMinimo).length;
  const agotados = MOCK_INVENTARIO.filter((i) => i.stock === 0).length;

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="mt-1 text-sm text-muted-foreground">Consulta y seguimiento de stock en tiempo real</p>
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
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Valor Total</p>
              <p className="mt-2 text-xl font-bold">S/ {valorTotal.toFixed(2)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Valor a precio de compra</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky/10">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Items</p>
              <p className="mt-2 text-xl font-bold">{MOCK_INVENTARIO.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Total de productos</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stock Crítico</p>
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
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Agotados</p>
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
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por código o nombre de producto..." className="w-full bg-transparent text-sm outline-none" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={filtroAlmacen} onChange={(e) => setFiltroAlmacen(e.target.value)} className="rounded-full border border-border px-4 py-2 text-sm">
              {almacenes.map((a) => <option key={a}>{a}</option>)}
            </select>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="rounded-full border border-border px-4 py-2 text-sm">
              {categorias.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="rounded-full border border-border px-4 py-2 text-sm">
              <option>Todos</option>
              <option>Normal</option>
              <option>Crítico</option>
              <option>Agotado</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-full border border-border px-4 py-2 text-sm">
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
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Código</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Producto</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categoría</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Almacén</th>
                <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stock</th>
                <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mínimo</th>
                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">P. Compra</th>
                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">P. Venta</th>
                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor</th>
                <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const estado = getEstado(item);
                return (
                  <tr key={`${item.codigo}-${item.almacen}`} className="border-b border-border hover:bg-sky/5">
                    <td className="p-4 text-sm font-mono">{item.codigo}</td>
                    <td className="p-4">
                      <p className="text-sm font-semibold">{item.producto}</p>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{item.categoria}</td>
                    <td className="p-4 text-sm">{item.almacen}</td>
                    <td className="p-4 text-center text-sm font-semibold">{item.stock}</td>
                    <td className="p-4 text-center text-sm text-muted-foreground">{item.stockMinimo}</td>
                    <td className="p-4 text-right text-sm">S/ {item.precioCompra.toFixed(2)}</td>
                    <td className="p-4 text-right text-sm">S/ {item.precioVenta.toFixed(2)}</td>
                    <td className="p-4 text-right text-sm font-semibold">S/ {item.valorInventario.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${estado.color}`}>
                        {(estado.text === 'Crítico' || estado.text === 'Agotado') && <AlertTriangle className="h-3 w-3" />}
                        {estado.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border p-4">
          <p className="text-sm text-muted-foreground">Mostrando {filtered.length} de {MOCK_INVENTARIO.length} registros</p>
        </div>
      </div>
    </div>
  );
}
