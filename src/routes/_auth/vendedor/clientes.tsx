import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus, Search, Edit, Eye, Phone, Mail, User } from 'lucide-react';

export const Route = createFileRoute('/_auth/vendedor/clientes')({
  component: ClientesVendedor,
});

type Cliente = {
  id: number;
  tipo: 'Natural' | 'Jurídica';
  documento: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  estado: 'Activo' | 'Inactivo';
};

const MOCK_CLIENTES: Cliente[] = [
  { id: 1, tipo: 'Natural', documento: '12345678', nombre: 'Juan Pérez García', telefono: '987654321', email: 'juan@gmail.com', direccion: 'Av. Larco 123, Miraflores', estado: 'Activo' },
  { id: 2, tipo: 'Natural', documento: '87654321', nombre: 'María García López', telefono: '987654322', email: 'maria@gmail.com', direccion: 'Av. Javier Prado 456, San Isidro', estado: 'Activo' },
  { id: 3, tipo: 'Jurídica', documento: '20123456789', nombre: 'Empresa Ejemplo SAC', telefono: '01-4567890', email: 'ventas@empresa.com', direccion: 'Av. Industrial 789, Lima', estado: 'Activo' },
  { id: 4, tipo: 'Natural', documento: '45678912', nombre: 'Carlos Mendoza Torres', telefono: '987654323', email: 'carlos@gmail.com', direccion: 'Jr. Los Olivos 321, Surco', estado: 'Activo' },
];

function ClientesVendedor() {
  const [clientes] = useState<Cliente[]>(MOCK_CLIENTES);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = clientes.filter((c) => c.nombre.toLowerCase().includes(search.toLowerCase()) || c.documento.includes(search));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Buscar y registrar clientes para ventas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por DNI/RUC o nombre..." className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Cliente</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Documento</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Contacto</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Estado</th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cliente) => (
                <tr key={cliente.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-xs font-bold text-primary-foreground">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{cliente.nombre}</p>
                        <p className="text-xs text-muted-foreground">{cliente.direccion}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{cliente.tipo}</td>
                  <td className="p-4 text-sm font-mono">{cliente.documento}</td>
                  <td className="p-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cliente.telefono}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {cliente.email}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">{cliente.estado}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-full p-2 hover:bg-sky/10" title="Ver">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-full p-2 hover:bg-sky/10" title="Editar">
                        <Edit className="h-4 w-4" />
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
          <div className="w-full max-w-md rounded-2xl bg-card p-6">
            <h2 className="text-lg font-semibold">Nuevo Cliente</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Tipo de Cliente</label>
                <select className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm">
                  <option>Natural</option>
                  <option>Jurídica</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">DNI / RUC</label>
                <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" placeholder="Ingrese documento" />
              </div>
              <div>
                <label className="text-sm font-medium">Nombre / Razón Social</label>
                <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" placeholder="Ingrese nombre" />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono</label>
                <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" placeholder="987654321" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input type="email" className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" placeholder="correo@ejemplo.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Dirección</label>
                <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" placeholder="Dirección completa" />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-full border border-border py-2 text-sm">
                Cancelar
              </button>
              <button onClick={() => { setShowModal(false); alert('Cliente registrado'); }} className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
