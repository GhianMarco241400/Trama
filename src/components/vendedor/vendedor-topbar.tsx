import { Search, Printer, BarChart3, Bell, Settings, Maximize, ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { ROLE_LABELS } from "@/lib/auth";

const iconBtn = "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-ink hover:text-primary-foreground";

function getInitials(name?: string | null) {
  if (!name) return "LQ";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function VendedorTopbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-2.5">
      <div className="flex w-full max-w-xs items-center rounded-full border border-border px-4 py-2">
        <input placeholder="Buscar productos" className="w-full bg-transparent text-sm outline-none" />
        <Search className="h-4 w-4" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        {[Printer, BarChart3, Bell, Settings, Maximize].map((Icon, i) => (
          <button key={i} className={`${iconBtn} hidden sm:flex`} title={String(Icon.name || "Acción")}>
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <div className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-primary-foreground">
            {getInitials(user?.name)}
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold">{user?.name ?? "Vendedor"}</p>
            <p className="text-[10px] text-muted-foreground">{user?.role ? ROLE_LABELS[user.role] : "Vendedor(a)"}</p>
          </div>
        </div>
        <button className={iconBtn} onClick={handleLogout} title="Cerrar sesión">
          <LogOut className="h-4 w-4" />
        </button>
        <button className={iconBtn} title="Más opciones">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
