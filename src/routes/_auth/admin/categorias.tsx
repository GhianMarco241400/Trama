import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listProducts,
  type Category,
} from "@/lib/api/catalog";

export const Route = createFileRoute("/_auth/admin/categorias")({
  component: CategoriasAdmin,
});

type CategoriaFila = {
  id: string;
  nombre: string;
  productos: number;
  descripcion: string;
  estado: "Activa" | "Inactiva";
};

function CategoriasAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const { data: productos = [] } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const createMutation = useMutation({
    mutationFn: () => createCategory({ name: form.nombre, description: form.descripcion || null }),
    onSuccess: () => {
      toast.success("Categoría creada");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModal();
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo crear la categoría"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateCategory(editing!.id, { name: form.nombre, description: form.descripcion || null }),
    onSuccess: () => {
      toast.success("Categoría actualizada");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModal();
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo actualizar la categoría"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Categoría eliminada");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("No se pudo eliminar la categoría. Tiene productos asociados."),
  });

  const conteoPorCategoria = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const p of productos) {
      mapa[p.category_id] = (mapa[p.category_id] ?? 0) + 1;
    }
    return mapa;
  }, [productos]);

  const filas: CategoriaFila[] = useMemo(() => {
    return categorias.map((c) => ({
      id: c.id,
      nombre: c.name,
      productos: conteoPorCategoria[c.id] ?? 0,
      descripcion: c.description ?? "",
      estado: c.status === "activo" ? "Activa" : "Inactiva",
    }));
  }, [categorias, conteoPorCategoria]);

  const filtered = useMemo(() => {
    return filas.filter((c) => c.nombre.toLowerCase().includes(search.toLowerCase()));
  }, [filas, search]);

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ nombre: "", descripcion: "" });
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: "", descripcion: "" });
    setShowModal(true);
  };

  const openEdit = (c: CategoriaFila) => {
    const original = categorias.find((x) => x.id === c.id)!;
    setEditing(original);
    setForm({ nombre: original.name, descripcion: original.description ?? "" });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.nombre) {
      toast.error("Ingresa el nombre de la categoría");
      return;
    }
    if (editing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleDelete = (c: CategoriaFila) => {
    if (window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) {
      deleteMutation.mutate(c.id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorías</h1>
          <p className="mt-1 text-sm text-muted-foreground">Categorías de productos del catálogo</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Nombre
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Descripción
                </th>
                <th className="p-4 text-center text-xs font-semibold text-muted-foreground">
                  Productos
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
                  <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                    Cargando…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                    No hay categorías
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm font-semibold">{c.nombre}</td>
                  <td className="p-4 text-sm text-muted-foreground">{c.descripcion}</td>
                  <td className="p-4 text-center text-sm">{c.productos}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${c.estado === "Activa" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded-full p-2 hover:bg-sky/10"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
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
              {editing ? "Editar Categoría" : "Nueva Categoría"}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="Nombre de la categoría"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Descripción de la categoría"
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
                    : "Crear Categoría"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
