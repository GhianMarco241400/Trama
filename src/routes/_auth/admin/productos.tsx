import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  listSuppliers,
  type ProductWithRelations,
} from "@/lib/api/catalog";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_auth/admin/productos")({
  component: ProductosAdmin,
});

type ProductoFila = {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  estado: "Activo" | "Inactivo";
};

function ProductosAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ProductWithRelations | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    sku: "",
    categoria: "",
    proveedor: "",
    precio: "",
    descripcion: "",
  });

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const { data: proveedores = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: listSuppliers,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createProduct({
        sku: form.sku,
        name: form.nombre,
        category_id: form.categoria,
        supplier_id: form.proveedor || null,
        base_price: Number(form.precio) || 0,
        description: form.descripcion || null,
      }),
    onSuccess: () => {
      toast.success("Producto creado");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo crear el producto"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProduct(editing!.id, {
        sku: form.sku,
        name: form.nombre,
        category_id: form.categoria,
        supplier_id: form.proveedor || null,
        base_price: Number(form.precio) || 0,
        description: form.descripcion || null,
      }),
    onSuccess: () => {
      toast.success("Producto actualizado");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo actualizar el producto"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Producto eliminado");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo eliminar el producto"),
  });

  const filas: ProductoFila[] = useMemo(() => {
    return productos.map((p) => ({
      id: p.id,
      sku: p.sku,
      nombre: p.name,
      categoria: p.category?.name ?? "Sin categoría",
      precio: p.base_price,
      stock: p.variants.length,
      estado: p.status === "activo" ? "Activo" : "Inactivo",
    }));
  }, [productos]);

  const filtered = useMemo(() => {
    return filas.filter(
      (p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()),
    );
  }, [filas, search]);

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ nombre: "", sku: "", categoria: "", proveedor: "", precio: "", descripcion: "" });
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      nombre: "",
      sku: "",
      categoria: categorias[0]?.id ?? "",
      proveedor: "",
      precio: "",
      descripcion: "",
    });
    setShowModal(true);
  };

  const openEdit = (p: ProductWithRelations) => {
    setEditing(p);
    setForm({
      nombre: p.name,
      sku: p.sku,
      categoria: p.category_id,
      proveedor: p.supplier_id ?? "",
      precio: String(p.base_price),
      descripcion: p.description ?? "",
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.nombre || !form.sku || !form.categoria) {
      toast.error("Completa nombre, SKU y categoría");
      return;
    }
    if (editing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleDelete = (p: ProductoFila) => {
    if (window.confirm(`¿Eliminar el producto "${p.nombre}"?`)) {
      deleteMutation.mutate(p.id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Catálogo de productos de la tienda</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o SKU..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">SKU</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Producto
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Categoría
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Precio
                </th>
                <th className="p-4 text-center text-xs font-semibold text-muted-foreground">
                  Stock
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
                    No hay productos
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm text-muted-foreground">{p.sku}</td>
                  <td className="p-4 text-sm font-semibold">{p.nombre}</td>
                  <td className="p-4 text-sm">{p.categoria}</td>
                  <td className="p-4 text-sm font-semibold">{formatCurrency(p.precio)}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${p.stock <= 10 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                    >
                      {p.stock}
                    </span>
                  </td>
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
                        onClick={() => openEdit(productos.find((x) => x.id === p.id)!)}
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
              {editing ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="Nombre del producto"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="SKU-000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Precio (S/)</label>
                  <input
                    type="number"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Proveedor</label>
                  <select
                    value={form.proveedor}
                    onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <option value="">Sin proveedor</option>
                    {proveedores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.business_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Descripción del producto"
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
                    : "Crear Producto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
