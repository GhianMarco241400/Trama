import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/context/auth-context';
import { CreditCard, FileText, Banknote, BarChart3, DollarSign } from 'lucide-react';

export const Route = createFileRoute('/_auth/contador/')({
  component: ContadorDashboard,
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

function ContadorDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard - Contador</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bienvenido(a), {user?.name} | Control financiero</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Ventas del mes" value="S/ 18,450.00" icon={DollarSign} color="bg-sky/10 text-ink" />
        <StatCard title="CxC Pendientes" value="S/ 3,240.00" icon={CreditCard} color="bg-brand/10 text-ink" />
        <StatCard title="CxP Pendientes" value="S/ 1,890.00" icon={FileText} color="bg-sky/10 text-ink" />
        <StatCard title="Caja y Bancos" value="S/ 9,650.00" icon={Banknote} color="bg-brand/10 text-ink" />
        <StatCard title="Reportes" value="12" icon={BarChart3} color="bg-sky/10 text-ink" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Acciones rápidas</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">Cuentas por cobrar</button>
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">Cuentas por pagar</button>
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">Arqueo de caja</button>
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">Reportes financieros</button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Resumen diario</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>• Ventas hoy: S/ 2,450.00</li>
            <li>• Pagos recibidos: S/ 1,800.00</li>
            <li>• Pagos realizados: S/ 650.00</li>
            <li>• Arqueos pendientes: 2</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
