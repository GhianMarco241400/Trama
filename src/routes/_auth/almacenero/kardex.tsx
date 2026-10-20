import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpCircle, ArrowDownCircle, Calendar } from 'lucide-react';

export const Route = createFileRoute('/_auth/almacenero/kardex')({
  component: KardexInventario,
});

type Movimiento = {
  id: string;
  fecha: string;
  hora: string;
  producto: string;
  tipo: 'Entrada' | 'Salida';
  documento: string;
  cantidad: number;
  saldo: number;
  usuario: string;
  motivo: string;
};

const MOCK_MOVIMIENTOS: Movimiento[] = [
  { id: 'K-001', fecha: '2026-10-20', hora: '09:15', producto: 'Polo Básico Algodón', tipo: 'Salida', documento: 'V-00123', cantidad: 2, saldo: 24, usuario: 'Lucía Quispe', motivo: 'Venta' },
  { id: 'K-002', fecha: '2026-10-19', hora: '14:30', producto: 'Zapatilla Urbana Trama', tipo: 'Entrada', documento: 'OC-001', cantidad: 15, saldo: 31, usuario: 'Carlos Medina', motivo: 'Compra' },
  { id: 'K-003', fecha: '2026-10-19', hora: '11:20', producto: 'Camisa Oxford Lino', tipo: 'Salida', documento: 'V-00124', cantidad: 2, saldo: 14, usuario: 'Lucía Quispe', motivo: 'Venta' },
  { id: 'K-004', fecha: '2026-10-18', hora: '16:00', producto: 'Casaca Denim Clásica', tipo: 'Salida', documento: 'AJ-002', cantidad: 2, saldo: 2, usuario: 'Carlos Medina', motivo: 'Ajuste' },
  { id: 'K-005', fecha: '2026-10-17', hora: '10:45', producto: 'Jean Recto Índigo', tipo: 'Entrada', documento: 'AJ-001', cantidad: 5, saldo: 0, usuario: 'Carlos Medina', motivo: 'Ajuste' },
];

function KardexInventario() {
  const [movimientos] = useState<Movimiento[]>(MOCK_MOVIMIENTOS);
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroMotivo, setFiltroMotivo] = useState('Todos');

  const filtered = useMemo(() => {
    return movimientos.filter((m) => {
      const matchSearch = m.producto.toLowerCase().includes(search.toLowerCase()) || m.documento.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filtroTipo !== 'Todos' && m.tipo !== filtroTipo) return false;
      if (filtroMotivo !== 'Todos' && m.motivo !== filtroMotivo) return false;
      return true;
    });
  }, [movimientos, search, filtroTipo, filtroMotivo]);

  const totalEntradas = movimientos.filter((m) => m.tipo === 'Entrada').reduce((acc, m) => acc + m.cantidad, 0);
  const totalSalidas = movimientos.filter((m) => m.tipo === 'Salida').reduce((acc, m) => acc + m.cantidad, 0);
  const movimientosHoy = movimientos.filter((m) => m.fecha === '2026-10-20').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kardex de Inventario</h1>
          <p className="mt-1 text-sm text-muted-foreground">Historial de movimientos de stock</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Movimientos del día</p>
              <p className="mt-1 text-xl font-bold">{movimientosHoy}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky/10">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Entradas</p>
              <p className="mt-1 text-xl font-bold text-green-600">+{totalEntradas}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <ArrowUpCircle className="h-5 w-5 text-green-700" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Salidas</p>
              <p className="mt-1 text-xl font-bold text-red-600">-{totalSalidas}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <ArrowDownCircle className="h-5 w-5 text-red-700" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className={`mt-1 text-xl font-bold ${totalEntradas - totalSalidas >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalEntradas - totalSalidas >= 0 ? '+' : ''}{totalEntradas - totalSalidas}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto o documento..." className="w-full bg-transparent text-sm outline-none" />
          </div>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="rounded-full border border-border px-4 py-2 text-sm">
            <option>Todos</option>
            <option>Entrada</option>
            <option>Salida</option>
          </select>
          <select value={filtroMotivo} onChange={(e) => setFiltroMotivo(e.target.value)} className="rounded-full border border-border px-4 py-2 text-sm">
            <option>Todos</option>
            <option>Venta</option>
            <option>Compra</option>
            <option>Ajuste</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha/Hora</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Producto</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Documento</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Motivo</th>
                <th className="p-4 text-center text-xs font-semibold text-muted-foreground">Cantidad</th>
                <th className="p-4 text-center text-xs font-semibold text-muted-foreground">Saldo</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((mov) => (
                <tr key={mov.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm">
                    <div>
                      <p>{mov.fecha}</p>
                      <p className="text-xs text-muted-foreground">{mov.hora}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-semibold">{mov.producto}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {mov.tipo === 'Entrada' ? <ArrowUpCircle className="h-4 w-4 text-green-600" /> : <ArrowDownCircle className="h-4 w-4 text-red-600" />}
                      <span className={`rounded-full px-2 py-1 text-xs ${mov.tipo === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {mov.tipo}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-mono">{mov.documento}</td>
                  <td className="p-4 text-sm text-muted-foreground">{mov.motivo}</td>
                  <td className="p-4 text-center">
                    <span className={`font-semibold ${mov.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {mov.tipo === 'Entrada' ? '+' : '-'}{mov.cantidad}
                    </span>
                  </td>
                  <td className="p-4 text-center text-sm font-semibold">{mov.saldo}</td>
                  <td className="p-4 text-sm">{mov.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
