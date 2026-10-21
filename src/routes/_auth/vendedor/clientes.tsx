import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Eye, Phone, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { listCustomers, createCustomer, updateCustomer } from "@/lib/api/sales";

export const Route = createFileRoute("/_auth/vendedor/clientes")({
  component: ClientesVendedor,
});

type Cliente = {
  id: string;
  tipo: "Natural" | "Jurídica";
  documento: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  estado: "Activo" | "Inactivo";
};

const emptyForm = {
  tipo: "Natural",
  documento: "",
  nombre: "",
  telefono: "",
  email: "",
  direccion: "",
};

function ClientesVendedor() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: listCustomers,
  });

  const clientes: Cliente[] = raw.map((c: any) => ({
    id: c.id,
    tipo: c.doc_type === "ruc" ? "Jurídica" : "Natural",
    documento: c.doc_number ?? "—",
    nombre: c.name,
    telefono: c.phone ?? "—",
    email: c.email ?? "—",
    direccion: c.address ?? "—",
    estado: c.status === "inactivo" ? "Inactivo" : "Activo",
  }));

  const filtered = clientes.filter(
    (c) => c.nombre.toLowerCase().includes(search.toLowerCase()) || c.documento.includes(search),
  );

  const mutation = useMutation({
    mutationFn: () =>
      editId
        ? updateCustomer(editId, {
            doc_type: form.documento.length === 11 ? "ruc" : "dni",
            doc_number: form.documento,
            name: form.nombre,
            phone: form.telefono || null,
            email: form.email || null,
            address: form.direccion || null,
          } as any)
        : createCustomer({
            doc_type: form.documento.length === 11 ? "ruc" : "dni",
            doc_number: form.documento,
            name: form.nombre,
            phone: form.telefono || null,
            email: form.email || null,
            address: form.direccion || null,
          } as any),
    onSuccess: () => {
      toast.success(editId ? "Cliente actualizado" : "Cliente registrado");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowModal(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      const msg = err?.message || "Error de conexión con el servidor";
      toast.error("No se pudo guardar el cliente", { description: msg });
    },
  });

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c: Cliente) => {
    setEditId(c.id);
    setForm({
      tipo: c.tipo,
      documento: c.documento === "—" ? "" : c.documento,
      nombre: c.nombre,
      telefono: c.telefono === "—" ? "" : c.telefono,
      email: c.email === "—" ? "" : c.email,
      direccion: c.direccion === "—" ? "" : c.direccion,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Buscar y registrar clientes para ventas
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por DNI/RUC o nombre..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Cliente
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Documento
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Contacto
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Estado
                </th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    Cargando clientes…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    Sin clientes registrados.
                  </td>
                </tr>
              )}
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
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${cliente.estado === "Activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {cliente.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-full p-2 hover:bg-sky/10" title="Ver">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEdit(cliente)}
                        className="rounded-full p-2 hover:bg-sky/10"
                        title="Editar"
                      >
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
            <h2 className="text-lg font-semibold">{editId ? "Editar Cliente" : "Nuevo Cliente"}</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Tipo de Cliente</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option>Natural</option>
                  <option>Jurídica</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">DNI / RUC</label>
                <input
                  value={form.documento}
                  onChange={(e) => setForm((p) => ({ ...p, documento: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="Ingrese documento"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nombre / Razón Social</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="Ingrese nombre"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="987654321"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dirección</label>
                <input
                  value={form.direccion}
                  onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="Dirección completa"
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
                disabled={!form.nombre || !form.documento || mutation.isPending}
                onClick={() => mutation.mutate()}
                className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                {mutation.isPending ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
