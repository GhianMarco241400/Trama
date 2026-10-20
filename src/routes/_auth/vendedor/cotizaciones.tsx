import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus, Search, Eye, FileText, Download, Send } from 'lucide-react';

export const Route = createFileRoute('/_auth/vendedor/cotizaciones')({
  component: CotizacionesVendedor,
});

type Cotizacion = {
  id: string;
  fecha: string;
  cliente: string;
  total: number;
  items: number;
  estado: 'Pendiente' | 'Aprobada' | 'Vencida';
  validez: string;
};

const MOCK_COTIZACIONES: Cotizacion[] = [
  { id: 'COT-001', fecha: '2026-10-20', cliente: 'Juan Pérez García', total: 459.8, items: 2, estado: 'Pendiente', validez: '2026-10-27' },
  { id: 'COT-002', fecha: '2026-10-19', cliente: 'Empresa Ejemplo SAC', total: 1299.7, items: 4, estado: 'Aprobada', validez: '2026-10-26' },
  { id: 'COT-003', fecha: '2026-10-18', cliente: 'María García López', total: 249.9, items: 1, estado: 'Vencida', validez: '2026-10-25' },
];

function CotizacionesVendedor() {
  const [cotizaciones] = useState<Cotizacion[]>(MOCK_COTIZACIONES);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = cotizaciones.filter((c) => c.id.toLowerCase().includes(search.toLowerCase()) || c.cliente.toLowerCase().includes(search.toLowerCase()));

  const getEstadoColor = (estado: string) => {
    if (estado === 'Aprobada') return 'bg-green-100 text-green-700';
    if (estado === 'Pendiente') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cotizaciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">Crear y gestionar cotizaciones</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" />
          Nueva Cotización
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cotización o cliente..." className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">N° Cotización</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Cliente</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Items</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Total</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Válida hasta</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Estado</th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cot) => (
                <tr key={cot.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm font-semibold">{cot.id}</td>
                  <td className="p-4 text-sm">{cot.fecha}</td>
                  <td className="p-4 text-sm">{cot.cliente}</td>
                  <td className="p-4 text-sm">{cot.items}</td>
                  <td className="p-4 text-sm font-semibold">S/ {cot.total.toFixed(2)}</td>
                  <td className="p-4 text-sm text-muted-foreground">{cot.validez}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${getEstadoColor(cot.estado)}`}>{cot.estado}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-full p-2 hover:bg-sky/10" title="Ver">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-full p-2 hover:bg-sky/10" title="Descargar PDF">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="rounded-full p-2 hover:bg-sky/10" title="Enviar">
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
                <select className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm">
                  <option>Seleccionar cliente</option>
                  <option>Juan Pérez García</option>
                  <option>María García López</option>
                  <option>Empresa Ejemplo SAC</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Válida hasta</label>
                <input type="date" className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">Moneda</label>
                <select className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm">
                  <option>Soles (S/)</option>
                  <option>Dólares ($)</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Productos</label>
                <button className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs">
                  <Plus className="h-3 w-3" />
                  Agregar producto
                </button>
              </div>
              <div className="mt-2 rounded-xl border border-border">
                <div className="grid grid-cols-12 gap-2 border-b border-border p-2 text-xs font-semibold">
                  <div className="col-span-5">Producto</div>
                  <div className="col-span-2">Cantidad</div>
                  <div className="col-span-2">Precio</div>
                  <div className="col-span-3">Total</div>
                </div>
                <div className="p-4 text-center text-sm text-muted-foreground">No hay productos</div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>S/ 0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IGV (18%)</span>
                  <span>S/ 0.00</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>S/ 0.00</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-full border border-border py-2 text-sm">
                Cancelar
              </button>
              <button onClick={() => { setShowModal(false); alert('Cotización creada'); }} className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground">
                Crear Cotización
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
