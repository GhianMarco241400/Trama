import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { Package, ShoppingCart, Users, BarChart3, ClipboardList } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const Route = createFileRoute("/_auth/admin/")({
  component: AdminDashboard,
});

const ventas14Dias = [
  { dia: "07 Oct", ventas: 1820 },
  { dia: "08 Oct", ventas: 2140 },
  { dia: "09 Oct", ventas: 1980 },
  { dia: "10 Oct", ventas: 2560 },
  { dia: "11 Oct", ventas: 3120 },
  { dia: "12 Oct", ventas: 2890 },
  { dia: "13 Oct", ventas: 2210 },
  { dia: "14 Oct", ventas: 1980 },
  { dia: "15 Oct", ventas: 2340 },
  { dia: "16 Oct", ventas: 2780 },
  { dia: "17 Oct", ventas: 3210 },
  { dia: "18 Oct", ventas: 3640 },
  { dia: "19 Oct", ventas: 2980 },
  { dia: "20 Oct", ventas: 2450 },
];

const ventasPorCategoria = [
  { categoria: "Polos", ventas: 6420 },
  { categoria: "Camisas", ventas: 3980 },
  { categoria: "Pantalones", ventas: 3240 },
  { categoria: "Casacas", ventas: 2810 },
  { categoria: "Calzado", ventas: 2000 },
];

const ventasPorPago = [
  { metodo: "Efectivo", monto: 8240, fill: "var(--chart-1)" },
  { metodo: "Tarjeta", monto: 6390, fill: "var(--chart-2)" },
  { metodo: "Yape / Plin", monto: 3820, fill: "var(--chart-3)" },
];

const areaConfig = {
  ventas: { label: "Ventas (S/)", color: "var(--brand)" },
} satisfies ChartConfig;

const categoriaConfig = {
  ventas: { label: "Ventas (S/)", color: "var(--ink)" },
} satisfies ChartConfig;

const pagoConfig = {
  monto: { label: "Monto" },
  efectivo: { label: "Efectivo", color: "var(--chart-1)" },
  tarjeta: { label: "Tarjeta", color: "var(--chart-2)" },
  yape: { label: "Yape / Plin", color: "var(--chart-3)" },
} satisfies ChartConfig;

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
}) {
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
        <StatCard
          title="Ventas Hoy"
          value="S/ 2,450.00"
          icon={ShoppingCart}
          color="bg-brand/10 text-ink"
        />
        <StatCard title="Clientes" value="86" icon={Users} color="bg-sky/10 text-ink" />
        <StatCard
          title="Órdenes Pendientes"
          value="12"
          icon={ClipboardList}
          color="bg-brand/10 text-ink"
        />
        <StatCard title="Reportes" value="24" icon={BarChart3} color="bg-sky/10 text-ink" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ventas últimos 14 días</h2>
            <span className="text-sm text-muted-foreground">S/ 34,040 total</span>
          </div>
          <ChartContainer config={areaConfig} className="mt-4 aspect-auto h-64 w-full">
            <AreaChart data={ventas14Dias} margin={{ left: 0, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--brand)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} interval={1} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `S/ ${Number(value).toLocaleString("es-PE")}`}
                  />
                }
              />
              <Area
                dataKey="ventas"
                type="monotone"
                fill="url(#fillVentas)"
                stroke="var(--brand)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Ventas por método de pago</h2>
          <ChartContainer config={pagoConfig} className="mx-auto mt-4 aspect-square h-52 w-full">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="metodo"
                    hideLabel
                    formatter={(value) => `S/ ${Number(value).toLocaleString("es-PE")}`}
                  />
                }
              />
              <Pie
                data={ventasPorPago}
                dataKey="monto"
                nameKey="metodo"
                innerRadius={55}
                outerRadius={85}
                strokeWidth={2}
              >
                {ventasPorPago.map((entry) => (
                  <Cell key={entry.metodo} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="metodo" />} />
            </PieChart>
          </ChartContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold">Ventas por categoría</h2>
          <ChartContainer config={categoriaConfig} className="mt-4 aspect-auto h-60 w-full">
            <BarChart data={ventasPorCategoria} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="categoria" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <ChartTooltip
                cursor={{ fill: "var(--sky)", opacity: 0.4 }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => `S/ ${Number(value).toLocaleString("es-PE")}`}
                  />
                }
              />
              <Bar dataKey="ventas" fill="var(--ink)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Actividad reciente</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>• Venta registrada por Lucía Quispe - Hace 10 min</li>
            <li>• Nuevo producto agregado - Hace 25 min</li>
            <li>• Orden de compra recibida - Hace 1h</li>
            <li>• Usuario actualizado - Hace 2h</li>
          </ul>
          <h2 className="mt-5 text-lg font-semibold">Accesos rápidos</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">
              Gestionar usuarios
            </button>
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">
              Gestionar productos
            </button>
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">
              Ver ventas
            </button>
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">
              Ver reportes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
