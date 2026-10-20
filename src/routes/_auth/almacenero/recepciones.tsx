import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus, Eye, Search, CheckCircle, FileText } from 'lucide-react';

export const Route = createFileRoute('/_auth/almacenero/recepciones')({
  component: RecepcionesAlmacen,
});

type Recepcion = {
  id: string;
  oc: string;
  proveedor: string;
  fecha: string;
  items: number;
  total: number;
  estado: 'Pendiente' | 'Recibido' | 'Parcial';
  recibidoPor?: string;
};

const MOCK_RECEPCIONES: Recepcion[] = [
  { id: 'REC-001', oc: 'OC-001', proveedor: 'Textiles Perú SAC', fecha: '2026-10-19', items: 25, total: 5450.0, estado: 'Recibido', recibidoPor: 'Carlos Medina' },
  { id: 'REC-002', oc: 'OC-002', proveedor: 'Calzado Industrial SA', fecha: '2026-10-20', items: 40, total: 12800.0, estado: 'Pendiente' },
  { id: 'REC-003', oc: 'OC-003', proveedor: 'Accesorios Moda EIRL', fecha: '2026-10-18', items: 60, total: 2340.0, estado: 'Recibido', recibidoPor: 'Carlos Medina' },
];

function RecepcionesAlmacen() {
  const [recepciones] = useState<Recepcion[]>(MOCK_RECEPCIONES);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = recepciones.filter((r) => r.oc.toLowerCase().includes(search.toLowerCase()) || r.proveedor.toLowerCase().includes(search.toLowerCase()));

  const getEstadoColor = (estado: string) => {
    if (estado === 'Recibido') return 'bg-green-100 text-green-700';
    if (estado === 'Parcial') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recepciones de Compra</h1>
          <p className="mt-1 text-sm text-muted-foreground">Recepción de mercadería desde órdenes de compra</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por OC o proveedor..." className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">N° Recepción</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">N° OC</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Proveedor</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Items</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Total</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Estado</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Recibido por</th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec) => (
                <tr key={rec.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm font-semibold">{rec.id}</td>
                  <td className="p-4 text-sm">{rec.oc}</td>
                  <td className="p-4 text-sm">{rec.proveedor}</td>
                  <td className="p-4 text-sm text-muted-foreground">{rec.fecha}</td>
                  <td className="p-4 text-sm">{rec.items}</td>
                  <td className="p-4 text-sm font-semibold">S/ {rec.total.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${getEstadoColor(rec.estado)}`}>{rec.estado}</span>
                  </td>
                  <td className="p-4 text-sm">{rec.recibidoPor || '-'}</td>
                  <td className="p-4 text-right">
                    {rec.estado === 'Pendiente' ? (
                      <button onClick={() => setShowModal(true)} className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs text-white hover:opacity-90">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-xl rounded-2xl bg-card p-6">
            <h2 className="text-lg font-semibold">Recepcionar Mercadería - OC-002</h2>
            <p className="mt-1 text-sm text-muted-foreground">Calzado Industrial SA</p>
            <div className="mt-4 rounded-xl border border-border">
              <div className="grid grid-cols-12 gap-2 border-b border-border p-2 text-xs font-semibold">
                <div className="col-span-5">Producto</div>
                <div className="col-span-2">Solicitado</div>
                <div className="col-span-3">Recibido</div>
                <div className="col-span-2">Diferencia</div>
              </div>
              {['Zapatilla Urbana Trama', 'Zapatilla Runner Lite', 'Zapatilla Trail Pro'].map((prod, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 border-b border-border p-2 text-sm">
                  <div className="col-span-5">{prod}</div>
                  <div className="col-span-2">20</div>
                  <div className="col-span-3">
                    <input type="number" className="w-full rounded-lg border border-border px-2 py-1 text-sm" placeholder="0" />
                  </div>
                  <div className="col-span-2 text-muted-foreground">0</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Observaciones</label>
              <textarea className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" rows={3} placeholder="Observaciones de recepción" />
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-full border border-border py-2 text-sm">
                Cancelar
              </button>
              <button onClick={() => { setShowModal(false); alert('Mercadería recepcionada correctamente'); }} className="flex-1 rounded-full bg-green-600 py-2 text-sm text-white hover:opacity-90">
                Confirmar Recepción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
