import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listProfiles, updateProfile, createUser, deleteUser, type Profile } from "@/lib/api/admin";
import { formatDateTime } from "@/lib/format";
import type { Role } from "@/lib/auth";

export const Route = createFileRoute("/_auth/admin/usuarios")({
  component: UsuariosAdmin,
});

const ROLE_LABELS: Record<string, string> = {
  administrador: "Administrador",
  vendedor: "Vendedor",
  almacenero: "Almacenero",
  contador: "Contador",
};

function UsuariosAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("vendedor");

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: listProfiles,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      role,
      status,
    }: {
      id: string;
      role: Profile["role"];
      status: Profile["status"];
    }) => updateProfile(id, { role, status }),
    onSuccess: () => {
      toast.success("Usuario actualizado");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setEditing(null);
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo actualizar el usuario"),
  });

  const resetNewUser = () => {
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("vendedor");
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createUser({
        email: newEmail,
        password: newPassword,
        fullName: newName,
        role: newRole,
      }),
    onSuccess: () => {
      toast.success("Usuario creado correctamente");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setShowModal(false);
      resetNewUser();
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo crear el usuario"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("Usuario eliminado");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo eliminar el usuario"),
  });

  const filtered = useMemo(() => {
    return usuarios.filter(
      (u) =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [usuarios, search]);

  const openEdit = (u: Profile) => {
    setEditing(u);
    setEditRole(u.role);
    setEditStatus(u.status);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios y Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestión de usuarios y permisos del sistema
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">ID</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Nombre
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Correo
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Rol</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Último acceso
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
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm text-muted-foreground">{u.id.slice(0, 8)}</td>
                  <td className="p-4 text-sm font-semibold">{u.full_name}</td>
                  <td className="p-4 text-sm">{u.email}</td>
                  <td className="p-4 text-sm">{ROLE_LABELS[u.role] ?? u.role}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {u.last_login_at ? formatDateTime(u.last_login_at) : "Sin registro"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${u.status === "activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {u.status === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="rounded-full p-2 hover:bg-sky/10"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `¿Eliminar a ${u.full_name}? Esta acción no se puede deshacer.`,
                            )
                          ) {
                            deleteMutation.mutate(u.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="rounded-full p-2 hover:bg-sky/10 disabled:opacity-50"
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
            <h2 className="text-lg font-semibold">Nuevo Usuario</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Nombre completo</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="Nombre del usuario"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Correo</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="usuario@trama.pe"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rol</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="administrador">Administrador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="almacenero">Almacenero</option>
                  <option value="contador">Contador</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Contraseña temporal</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Mínimo 6 caracteres. El usuario podrá iniciar sesión de inmediato.
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetNewUser();
                }}
                className="flex-1 rounded-full border border-border py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={
                  createMutation.isPending || !newName || !newEmail || newPassword.length < 6
                }
                className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground disabled:opacity-60"
              >
                {createMutation.isPending ? "Creando…" : "Crear Usuario"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-card p-6">
            <h2 className="text-lg font-semibold">Editar Usuario</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Nombre completo</label>
                <input
                  value={editing.full_name}
                  disabled
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm opacity-60"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Correo</label>
                <input
                  value={editing.email}
                  disabled
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm opacity-60"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rol</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="administrador">Administrador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="almacenero">Almacenero</option>
                  <option value="contador">Contador</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Estado</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 rounded-full border border-border py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  updateMutation.mutate({
                    id: editing.id,
                    role: editRole as Profile["role"],
                    status: editStatus as Profile["status"],
                  })
                }
                disabled={updateMutation.isPending}
                className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground disabled:opacity-60"
              >
                {updateMutation.isPending ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
