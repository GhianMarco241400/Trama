import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Plus, Search, Eye, ArrowRight, CheckCircle } from 'lucide-react';

export const Route = createFileRoute('/_auth/almacenero/transferencias')({
  component: TransferenciasAlmacen,
});

type Transferencia = {
  id: string;
  fecha: string;
  origen: string;
  destino: string;
  items: number;
  estado: 'Pendiente' | 'En tránsito' | 'Recibido' | 'Anulado';
  solicitadoPor: string;
};

const MOCK_TRANSFERENCIAS: Transferencia[] = [
  { id: 'TR-001', fecha: '2026-10-20', origen: 'Almacén Principal', destino: 'Almacén Secundario', items: 15, estado: 'En tránsito', solicitadoPor: 'Carlos Medina' },
  { id: 'TR-002', fecha: '2026-10-19', origen: 'Almacén Secundario', destino: 'Almacén Principal', items: 8, estado: 'Recibido', solicitadoPor: 'Carlos Medina' },
  { id: 'TR-003', fecha: '2026-10-18', origen: 'Almacén Principal', destino: 'Tienda Miraflores', items: 25, estado: 'Recibido', solicitadoPor: 'Ana Torres' },
];

function TransferenciasAlmacen() {
  const [transferencias] = useState<Transferencia[]>(MOCK_TRANSFERENCIAS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    return transferencias.filter((t) => t.id.toLowerCase().includes(search.toLowerCase()) || t.origen.toLowerCase().includes(search.toLowerCase()) || t.destino.toLowerCase().includes(search.toLowerCase()));
  }, [transferencias, search]);

  const getEstadoColor = (estado: string) => {
    if (estado === 'Recibido') return 'bg-green-100 text-green-700';
    if (estado === 'En tránsito') return 'bg-yellow-100 text-yellow-700';
    if (estado === 'Pendiente') return 'bg-blue-100 text-blue-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transferencias entre Almacenes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Movimiento de stock entre almacenes y tiendas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" />
          Nueva Transferencia
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar transferencia..." className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">N° Transferencia</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Origen</th>
                <th className="p-4 text-center text-xs font-semibold text-muted-foreground"></th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Destino</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Items</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Estado</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Solicitado por</th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm font-semibold">{t.id}</td>
                  <td className="p-4 text-sm">{t.fecha}</td>
                  <td className="p-4 text-sm">{t.origen}</td>
                  <td className="p-4 text-center">
                    <ArrowRight className="mx-auto h-4 w-4" />
                  </td>
                  <td className="p-4 text-sm">{t.destino}</td>
                  <td className="p-4 text-sm">{t.items}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${getEstadoColor(t.estado)}`}>{t.estado}</span>
                  </td>
                  <td className="p-4 text-sm">{t.solicitadoPor}</td>
                  <td className="p-4 text-right">
                    {t.estado === 'En tránsito' ? (
                      <button className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs text-white hover:opacity-90">
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
              ))}
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
                <select className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm">
                  <option>Seleccionar origen</option>
                  <option>Almacén Principal</option>
                  <option>Almacén Secundario</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Almacén Destino</label>
                <select className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm">
                  <option>Seleccionar destino</option>
                  <option>Almacén Principal</option>
                  <option>Almacén Secundario</option>
                  <option>Tienda Miraflores</option>
                  <option>Tienda San Isidro</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Fecha</label>
              <input type="date" className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" defaultValue="2026-10-20" />
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
                  <div className="col-span-6">Producto</div>
                  <div className="col-span-3">Stock Disponible</div>
                  <div className="col-span-3">Cantidad</div>
                </div>
                <div className="p-4 text-center text-sm text-muted-foreground">No hay productos</div>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Observaciones</label>
              <textarea className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" rows={3} placeholder="Observaciones de la transferencia" />
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-full border border-border py-2 text-sm">
                Cancelar
              </button>
              <button onClick={() => { setShowModal(false); alert('Transferencia creada'); }} className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground">
                Crear Transferencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
