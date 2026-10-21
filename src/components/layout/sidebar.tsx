import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Warehouse,
  FileText,
  ClipboardList,
  CreditCard,
  Banknote,
  BarChart3,
  Settings,
  UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Logo } from "@/components/Logo";
import type { Role } from "@/lib/auth";

type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  administrador: [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Usuarios y roles", to: "/admin/usuarios", icon: UserCog },
    { label: "Productos", to: "/admin/productos", icon: Package },
    { label: "Categorías", to: "/admin/categorias", icon: ClipboardList },
    { label: "Ventas", to: "/admin/ventas", icon: ShoppingCart },
    { label: "Compras", to: "/admin/compras", icon: FileText },
    { label: "Proveedores", to: "/admin/proveedores", icon: Users },
    { label: "Reportes", to: "/admin/reportes", icon: BarChart3 },
    { label: "Configuración", to: "/admin/configuracion", icon: Settings },
  ],
  vendedor: [
    { label: "Caja (POS)", to: "/vendedor", icon: ShoppingCart },
    { label: "Clientes", to: "/vendedor/clientes", icon: Users },
    { label: "Cotizaciones", to: "/vendedor/cotizaciones", icon: FileText },
    { label: "Ventas del día", to: "/vendedor/ventas-del-dia", icon: BarChart3 },
  ],
  almacenero: [
    { label: "Dashboard", to: "/almacenero", icon: LayoutDashboard },
    { label: "Inventario", to: "/almacenero/inventario", icon: Warehouse },
    { label: "Kardex", to: "/almacenero/kardex", icon: ClipboardList },
    { label: "Recepciones", to: "/almacenero/recepciones", icon: FileText },
    { label: "Transferencias", to: "/almacenero/transferencias", icon: Package },
    { label: "Ajustes", to: "/almacenero/ajustes", icon: Settings },
  ],
  contador: [
    { label: "Dashboard", to: "/contador", icon: LayoutDashboard },
    { label: "Cuentas por cobrar", to: "/contador/cuentas-cobrar", icon: CreditCard },
    { label: "Cuentas por pagar", to: "/contador/cuentas-pagar", icon: FileText },
    { label: "Caja y bancos", to: "/contador/caja-bancos", icon: Banknote },
    { label: "Arqueo de caja", to: "/contador/arqueo", icon: ClipboardList },
    { label: "Reportes", to: "/contador/reportes", icon: BarChart3 },
  ],
};

export function Sidebar() {
  const { user } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const role = user?.role ?? "vendedor";

  const items = NAV_BY_ROLE[role];

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-ink md:flex">
      <div className="px-6 pb-6 pt-6">
        <Logo dark />
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 pb-6 [scrollbar-width:none]">
        {items.map(({ label, to, icon: Icon }) => {
          const isActive = currentPath === to || currentPath.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-brand text-ink"
                  : "text-sky/70 hover:bg-foreground/80 hover:text-primary-foreground"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${isActive ? "text-ink" : "text-sky/60 group-hover:text-primary-foreground"}`}
                strokeWidth={1.8}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="m-4 mt-0 rounded-2xl border border-sky/15 p-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-sky/40">Sesión activa</p>
        <p className="mt-1 text-sm font-semibold text-primary-foreground">{user?.name}</p>
        <p className="text-[10px] text-sky/50">{user?.email}</p>
      </div>
    </aside>
  );
}
