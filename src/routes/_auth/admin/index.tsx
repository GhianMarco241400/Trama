import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/context/auth-context';
import { Package, ShoppingCart, Users, BarChart3, ClipboardList } from 'lucide-react';

export const Route = createFileRoute('/_auth/admin/')({
  component: AdminDashboard,
});

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-1 text-xl font-bold">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard - Administrador</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bienvenido(a), {user?.name}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Productos" value="128" icon={Package} color="bg-sky/10 text-ink" />
        <StatCard title="Ventas Hoy" value="S/ 2,450.00" icon={ShoppingCart} color="bg-brand/10 text-ink" />
        <StatCard title="Clientes" value="86" icon={Users} color="bg-sky/10 text-ink" />
        <StatCard title="Órdenes Pendientes" value="12" icon={ClipboardList} color="bg-brand/10 text-ink" />
        <StatCard title="Reportes" value="24" icon={BarChart3} color="bg-sky/10 text-ink" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Accesos rápidos</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">Gestionar usuarios</button>
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">Gestionar productos</button>
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">Ver ventas</button>
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">Ver reportes</button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Actividad reciente</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>• Venta registrada por Lucía Quispe - Hace 10 min</li>
            <li>• Nuevo producto agregado - Hace 25 min</li>
            <li>• Orden de compra recibida - Hace 1h</li>
            <li>• Usuario actualizado - Hace 2h</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
