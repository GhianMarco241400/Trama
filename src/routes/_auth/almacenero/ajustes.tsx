import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Plus, Search, FileText } from 'lucide-react';

export const Route = createFileRoute('/_auth/almacenero/ajustes')({
  component: AjustesInventario,
});

type Ajuste = {
  id: string;
  fecha: string;
  producto: string;
  tipo: 'Entrada' | 'Salida';
  cantidad: number;
  motivo: string;
  usuario: string;
};

const MOCK_AJUSTES: Ajuste[] = [
  { id: 'AJ-001', fecha: '2026-10-19', producto: 'Jean Recto Índigo', tipo: 'Entrada', cantidad: 5, motivo: 'Conteo físico - Hallazgo', usuario: 'Carlos Medina' },
  { id: 'AJ-002', fecha: '2026-10-18', producto: 'Casaca Denim Clásica', tipo: 'Salida', cantidad: 2, motivo: 'Producto dañado', usuario: 'Carlos Medina' },
  { id: 'AJ-003', fecha: '2026-10-17', producto: 'Zapatilla Urbana Trama', tipo: 'Entrada', cantidad: 10, motivo: 'Corrección de inventario', usuario: 'Carlos Medina' },
];

function AjustesInventario() {
  const [ajustes] = useState<Ajuste[]>(MOCK_AJUSTES);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    return ajustes.filter((a) => a.producto.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()));
  }, [ajustes, search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ajustes de Inventario</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ajustes por conteo físico o correcciones</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" />
          Nuevo Ajuste
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar ajuste..." className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">N° Ajuste</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Producto</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                <th className="p-4 text-center text-xs font-semibold text-muted-foreground">Cantidad</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Motivo</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ajuste) => (
                <tr key={ajuste.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm font-semibold">{ajuste.id}</td>
                  <td className="p-4 text-sm text-muted-foreground">{ajuste.fecha}</td>
                  <td className="p-4 text-sm">{ajuste.producto}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${ajuste.tipo === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {ajuste.tipo}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-semibold ${ajuste.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {ajuste.tipo === 'Entrada' ? '+' : '-'}{ajuste.cantidad}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{ajuste.motivo}</td>
                  <td className="p-4 text-sm">{ajuste.usuario}</td>
                </tr>
              ))}
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
                <label className="text-sm font-medium">Producto</label>
                <select className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm">
                  <option>Seleccionar producto</option>
                  <option>Polo Básico Algodón</option>
                  <option>Camisa Oxford Lino</option>
                  <option>Jean Recto Índigo</option>
                  <option>Casaca Denim Clásica</option>
                  <option>Zapatilla Urbana Trama</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <select className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm">
                    <option>Entrada</option>
                    <option>Salida</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Cantidad</label>
                  <input type="number" className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Almacén</label>
                <select className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm">
                  <option>Almacén Principal</option>
                  <option>Almacén Secundario</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Motivo</label>
                <select className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm">
                  <option>Conteo físico</option>
                  <option>Producto dañado</option>
                  <option>Producto vencido</option>
                  <option>Corrección de inventario</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Observación</label>
                <textarea className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" rows={3} placeholder="Detalle del ajuste" />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-full border border-border py-2 text-sm">
                Cancelar
              </button>
              <button onClick={() => { setShowModal(false); alert('Ajuste registrado'); }} className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground">
                Registrar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
