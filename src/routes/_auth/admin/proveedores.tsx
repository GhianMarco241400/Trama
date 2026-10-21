import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  type Supplier,
} from "@/lib/api/catalog";

export const Route = createFileRoute("/_auth/admin/proveedores")({
  component: ProveedoresAdmin,
});

type ProveedorFila = {
  id: string;
  ruc: string;
  razonSocial: string;
  contacto: string;
  telefono: string;
  email: string;
  estado: "Activo" | "Inactivo";
};

const emptyForm = {
  razonSocial: "",
  ruc: "",
  contacto: "",
  telefono: "",
  email: "",
  direccion: "",
};

function ProveedoresAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: proveedores = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: listSuppliers,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createSupplier({
        business_name: form.razonSocial,
        ruc: form.ruc,
        contact_name: form.contacto || null,
        phone: form.telefono || null,
        email: form.email || null,
        address: form.direccion || null,
      }),
    onSuccess: () => {
      toast.success("Proveedor creado");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      closeModal();
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo crear el proveedor"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateSupplier(editing!.id, {
        business_name: form.razonSocial,
        ruc: form.ruc,
        contact_name: form.contacto || null,
        phone: form.telefono || null,
        email: form.email || null,
        address: form.direccion || null,
      }),
    onSuccess: () => {
      toast.success("Proveedor actualizado");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      closeModal();
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo actualizar el proveedor"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      toast.success("Proveedor eliminado");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: () => toast.error("No se pudo eliminar el proveedor. Tiene compras asociadas."),
  });

  const filas: ProveedorFila[] = useMemo(() => {
    return proveedores.map((p) => ({
      id: p.id,
      ruc: p.ruc,
      razonSocial: p.business_name,
      contacto: p.contact_name ?? "",
      telefono: p.phone ?? "",
      email: p.email ?? "",
      estado: p.status === "activo" ? "Activo" : "Inactivo",
    }));
  }, [proveedores]);

  const filtered = useMemo(() => {
    return filas.filter(
      (p) => p.razonSocial.toLowerCase().includes(search.toLowerCase()) || p.ruc.includes(search),
    );
  }, [filas, search]);

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: ProveedorFila) => {
    const original = proveedores.find((x) => x.id === p.id)!;
    setEditing(original);
    setForm({
      razonSocial: original.business_name,
      ruc: original.ruc,
      contacto: original.contact_name ?? "",
      telefono: original.phone ?? "",
      email: original.email ?? "",
      direccion: original.address ?? "",
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.razonSocial || !form.ruc) {
      toast.error("Ingresa la razón social y el RUC");
      return;
    }
    if (editing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleDelete = (p: ProveedorFila) => {
    if (window.confirm(`¿Eliminar el proveedor "${p.razonSocial}"?`)) {
      deleteMutation.mutate(p.id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Directorio de proveedores de la empresa
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por razón social o RUC..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">RUC</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Razón Social
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Contacto
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Teléfono
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Correo
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
                  <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                    Cargando…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                    No hay proveedores
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm text-muted-foreground">{p.ruc}</td>
                  <td className="p-4 text-sm font-semibold">{p.razonSocial}</td>
                  <td className="p-4 text-sm">{p.contacto}</td>
                  <td className="p-4 text-sm">{p.telefono}</td>
                  <td className="p-4 text-sm">{p.email}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${p.estado === "Activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-full p-2 hover:bg-sky/10"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="rounded-full p-2 hover:bg-sky/10"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
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
            <h2 className="text-lg font-semibold">
              {editing ? "Editar Proveedor" : "Nuevo Proveedor"}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Razón Social</label>
                <input
                  value={form.razonSocial}
                  onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="Nombre o razón social"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">RUC</label>
                  <input
                    value={form.ruc}
                    onChange={(e) => setForm({ ...form, ruc: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="20xxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Teléfono</label>
                  <input
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="999999999"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Persona de contacto</label>
                <input
                  value={form.contacto}
                  onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="Nombre del contacto"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Correo</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="proveedor@correo.pe"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dirección</label>
                <input
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="Dirección fiscal"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 rounded-full border border-border py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground disabled:opacity-60"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Guardando…"
                  : editing
                    ? "Guardar cambios"
                    : "Crear Proveedor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
