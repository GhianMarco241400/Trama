import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Search, Eye, Printer, Calendar } from 'lucide-react';

export const Route = createFileRoute('/_auth/vendedor/ventas-del-dia')({
  component: VentasDelDia,
});

type Venta = {
  id: string;
  hora: string;
  cliente: string;
  total: number;
  metodoPago: string;
  comprobante: 'Boleta' | 'Factura';
  items: number;
};

const MOCK_VENTAS_HOY: Venta[] = [
  { id: 'V-00123', hora: '10:45', cliente: 'Cliente General', total: 249.9, metodoPago: 'Efectivo', comprobante: 'Boleta', items: 1 },
  { id: 'V-00124', hora: '11:20', cliente: 'Juan Pérez', total: 839.7, metodoPago: 'Tarjeta', comprobante: 'Factura', items: 3 },
  { id: 'V-00125', hora: '12:15', cliente: 'Cliente General', total: 119.9, metodoPago: 'Yape / Plin', comprobante: 'Boleta', items: 1 },
  { id: 'V-00126', hora: '13:30', cliente: 'María García', total: 449.8, metodoPago: 'Efectivo', comprobante: 'Boleta', items: 2 },
];

function VentasDelDia() {
  const [ventas] = useState<Venta[]>(MOCK_VENTAS_HOY);
  const [search, setSearch] = useState('');

  const filtered = ventas.filter((v) => v.id.toLowerCase().includes(search.toLowerCase()) || v.cliente.toLowerCase().includes(search.toLowerCase()));
  const totalDia = ventas.reduce((acc, v) => acc + v.total, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ventas del Día</h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('es-PE')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total del día</p>
          <p className="text-2xl font-bold">S/ {totalDia.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por N° venta o cliente..." className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">N° Venta</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Hora</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Cliente</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Items</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Comprobante</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Método Pago</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Total</th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((venta) => (
                <tr key={venta.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm font-semibold">{venta.id}</td>
                  <td className="p-4 text-sm text-muted-foreground">{venta.hora}</td>
                  <td className="p-4 text-sm">{venta.cliente}</td>
                  <td className="p-4 text-sm">{venta.items}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-sky/20 px-2 py-1 text-xs">{venta.comprobante}</span>
                  </td>
                  <td className="p-4 text-sm">{venta.metodoPago}</td>
                  <td className="p-4 text-sm font-semibold">S/ {venta.total.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-full p-2 hover:bg-sky/10" title="Ver detalle">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-full p-2 hover:bg-sky/10" title="Reimprimir">
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-semibold">Ventas por método de pago</h3>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Efectivo</span>
              <span className="font-semibold">S/ 699.70</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tarjeta</span>
              <span className="font-semibold">S/ 839.70</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Yape / Plin</span>
              <span className="font-semibold">S/ 119.90</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-semibold">Comprobantes</h3>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Boletas</span>
              <span className="font-semibold">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Facturas</span>
              <span className="font-semibold">1</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-semibold">Cantidad de ventas</h3>
          <p className="mt-2 text-xl font-bold">{ventas.length} ventas</p>
        </div>
      </div>
    </div>
  );
}
