import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/context/auth-context';
import { Warehouse, Package, ArrowLeftRight, FileText, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

export const Route = createFileRoute('/_auth/almacenero/')({
  component: AlmaceneroDashboard,
});

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: { title: string; value: string; subtitle?: string; icon: any; color: string; trend?: { value: string; up: boolean } }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className={`mt-2 flex items-center gap-1 text-xs ${trend.up ? 'text-green-600' : 'text-red-600'}`}>
              {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function AlmaceneroDashboard() {
  const { user } = useAuth() as any;

  const stockCritico = [
    { producto: 'Casaca Denim Clásica', codigo: 'PRD-004', stock: 2, minimo: 5 },
    { producto: 'Reloj Minimal Negro', codigo: 'PRD-007', stock: 2, minimo: 5 },
    { producto: 'Jean Recto Índigo', codigo: 'PRD-003', stock: 0, minimo: 8 },
  ];

  const movimientosRecientes = [
    { tipo: 'Salida', producto: 'Polo Básico Algodón', doc: 'V-00123', cant: 2, hora: '09:15' },
    { tipo: 'Entrada', producto: 'Zapatilla Urbana Trama', doc: 'OC-001', cant: 15, hora: '14:30' },
    { tipo: 'Salida', producto: 'Camisa Oxford Lino', doc: 'V-00124', cant: 2, hora: '11:20' },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Almacén</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bienvenido(a), {user?.name} • Control y gestión de inventario</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-border px-4 py-2 text-sm hover:bg-sky/5">Ver Kardex</button>
          <button className="rounded-full bg-ink px-4 py-2 text-sm text-primary-foreground hover:opacity-90">Nueva Recepción</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Productos" value="128" subtitle="En catálogo" icon={Package} color="bg-sky/10 text-ink" trend={{ value: '+3 esta semana', up: true }} />
        <StatCard title="Stock Total" value="93" subtitle="Unidades en almacén" icon={Warehouse} color="bg-brand/10 text-ink" />
        <StatCard title="Recepciones Pendientes" value="1" subtitle="Por recibir" icon={FileText} color="bg-blue-100 text-blue-700" />
        <StatCard title="Transferencias Activas" value="1" subtitle="En tránsito" icon={ArrowLeftRight} color="bg-orange-100 text-orange-700" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="text-lg font-semibold">Movimientos Recientes</h2>
              <p className="text-sm text-muted-foreground">Últimas operaciones en almacén</p>
            </div>
            <button className="text-sm text-muted-foreground hover:text-foreground">Ver todo</button>
          </div>
          <div className="divide-y divide-border">
            {movimientosRecientes.map((mov, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-sky/5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${mov.tipo === 'Entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {mov.tipo === 'Entrada' ? <TrendingUp className="h-5 w-5 text-green-700" /> : <TrendingDown className="h-5 w-5 text-red-700" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{mov.producto}</p>
                    <p className="text-xs text-muted-foreground">{mov.doc} • {mov.hora}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${mov.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    {mov.tipo === 'Entrada' ? '+' : '-'}{mov.cant}
                  </p>
                  <p className="text-xs text-muted-foreground">{mov.tipo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold">Stock Crítico</h2>
            </div>
            <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">{stockCritico.length}</span>
          </div>
          <div className="divide-y divide-border">
            {stockCritico.map((item, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{item.producto}</p>
                    <p className="text-xs text-muted-foreground">{item.codigo}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${item.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {item.stock === 0 ? 'Agotado' : 'Crítico'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Stock: {item.stock} / Mínimo: {item.minimo}</span>
                  <button className="font-medium text-ink hover:underline">Solicitar compra</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Acciones Rápidas</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm hover:bg-sky/5">
              <Package className="h-4 w-4" />
              Ver Inventario
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm hover:bg-sky/5">
              <FileText className="h-4 w-4" />
              Nueva Recepción
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm hover:bg-sky/5">
              <ArrowLeftRight className="h-4 w-4" />
              Transferencia
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm hover:bg-sky/5">
              <Warehouse className="h-4 w-4" />
              Ajuste de Stock
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Resumen por Almacén</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Almacén Principal</p>
                <p className="text-xs text-muted-foreground">75 unidades</p>
              </div>
              <div className="h-2 w-32 rounded-full bg-muted">
                <div className="h-2 w-3/4 rounded-full bg-ink"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Almacén Secundario</p>
                <p className="text-xs text-muted-foreground">18 unidades</p>
              </div>
              <div className="h-2 w-32 rounded-full bg-muted">
                <div className="h-2 w-1/4 rounded-full bg-ink"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
