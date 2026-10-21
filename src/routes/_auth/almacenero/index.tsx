import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import {
  Warehouse,
  Package,
  ArrowLeftRight,
  FileText,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import {
  listInventory,
  listStockMovements,
  listTransfers,
  listGoodsReceipts,
} from "@/lib/api/inventory";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_auth/almacenero/")({
  component: AlmaceneroDashboard,
});

const stockConfig = {
  stock: { label: "Stock actual", color: "var(--brand)" },
  minimo: { label: "Stock mínimo", color: "var(--ink)" },
} satisfies ChartConfig;

const almacenConfig = {
  unidades: { label: "Unidades" },
} satisfies ChartConfig;

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  color: string;
  trend?: { value: string; up: boolean };
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div
              className={`mt-2 flex items-center gap-1 text-xs ${trend.up ? "text-green-600" : "text-red-600"}`}
            >
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

  const { data: inventory = [] } = useQuery({ queryKey: ["inventory"], queryFn: listInventory });
  const { data: movements = [] } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: listStockMovements,
  });
  const { data: transfers = [] } = useQuery({ queryKey: ["transfers"], queryFn: listTransfers });
  const { data: receipts = [] } = useQuery({
    queryKey: ["goods-receipts"],
    queryFn: listGoodsReceipts,
  });

  const items = (inventory as any[]).map((row: any) => {
    const producto = row.variant?.product?.name || row.variant?.sku || "-";
    const stock = Number(row.stock) || 0;
    const minimo = Number(row.min_stock) || 0;
    const almacen = row.warehouse?.name || "-";
    const precioVenta =
      row.variant?.product?.base_price != null ? Number(row.variant.product.base_price) : 0;
    return { producto, stock, minimo, almacen, precioVenta };
  });

  const stockCritico = items
    .filter((i) => i.stock <= i.minimo)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
    .map((i) => ({ producto: i.producto, codigo: "-", stock: i.stock, minimo: i.minimo }));

  const movimientosRecientes = (movements as any[]).slice(0, 5).map((m) => {
    const tipo = m.type === "entrada" ? "Entrada" : m.type === "salida" ? "Salida" : m.type;
    const movedAt = m.moved_at ? new Date(m.moved_at) : new Date();
    const hora = movedAt.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    return {
      tipo,
      producto: m.variant?.product?.name || m.variant?.sku || "-",
      doc: m.document_ref || "-",
      cant: Number(m.quantity) || 0,
      hora,
    };
  });

  const stockVsMinimo = items.slice(0, 6).map((i) => ({
    producto: i.producto.length > 15 ? i.producto.slice(0, 15) + "..." : i.producto,
    stock: i.stock,
    minimo: i.minimo,
  }));

  const almacenGroups: Record<string, number> = {};
  items.forEach((i) => {
    almacenGroups[i.almacen] = (almacenGroups[i.almacen] || 0) + i.stock;
  });
  const stockPorAlmacen = Object.entries(almacenGroups).map(([nombre, unidades], idx) => ({
    nombre,
    unidades,
    fill: idx === 0 ? "var(--chart-2)" : "var(--chart-4)",
  }));

  const totalProductos = items.length;
  const stockTotal = items.reduce((acc, i) => acc + i.stock, 0);
  const recepcionesPendientes = (receipts as any[]).filter(
    (r) => r.status === "pendiente" || r.status === "parcial",
  ).length;
  const transferenciasActivas = (transfers as any[]).filter(
    (t) => t.status === "pendiente" || t.status === "en_transito",
  ).length;

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Almacén</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bienvenido(a), {user?.name} • Control y gestión de inventario
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-border px-4 py-2 text-sm hover:bg-sky/5">
            Ver Kardex
          </button>
          <button className="rounded-full bg-ink px-4 py-2 text-sm text-primary-foreground hover:opacity-90">
            Nueva Recepción
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Productos"
          value={String(totalProductos)}
          subtitle="En catálogo"
          icon={Package}
          color="bg-sky/10 text-ink"
        />
        <StatCard
          title="Stock Total"
          value={String(stockTotal)}
          subtitle="Unidades en almacén"
          icon={Warehouse}
          color="bg-brand/10 text-ink"
        />
        <StatCard
          title="Recepciones Pendientes"
          value={String(recepcionesPendientes)}
          subtitle="Por recibir"
          icon={FileText}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          title="Transferencias Activas"
          value={String(transferenciasActivas)}
          subtitle="Pendientes/En tránsito"
          icon={ArrowLeftRight}
          color="bg-orange-100 text-orange-700"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="text-lg font-semibold">Movimientos Recientes</h2>
              <p className="text-sm text-muted-foreground">Últimas operaciones en almacén</p>
            </div>
            <button className="text-sm text-muted-foreground hover:text-foreground">
              Ver todo
            </button>
          </div>
          <div className="divide-y divide-border">
            {movimientosRecientes.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Sin movimientos</div>
            ) : (
              movimientosRecientes.map((mov, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-sky/5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${mov.tipo === "Entrada" ? "bg-green-100" : "bg-red-100"}`}
                    >
                      {mov.tipo === "Entrada" ? (
                        <TrendingUp className="h-5 w-5 text-green-700" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-700" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{mov.producto}</p>
                      <p className="text-xs text-muted-foreground">
                        {mov.doc} • {mov.hora}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${mov.tipo === "Entrada" ? "text-green-600" : "text-red-600"}`}
                    >
                      {mov.tipo === "Entrada" ? "+" : "-"}
                      {mov.cant}
                    </p>
                    <p className="text-xs text-muted-foreground">{mov.tipo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold">Stock Crítico</h2>
            </div>
            <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
              {stockCritico.length}
            </span>
          </div>
          <div className="divide-y divide-border">
            {stockCritico.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Sin alertas</div>
            ) : (
              stockCritico.map((item, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{item.producto}</p>
                      <p className="text-xs text-muted-foreground">{item.codigo}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${item.stock === 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {item.stock === 0 ? "Agotado" : "Crítico"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Stock: {item.stock} / Mínimo: {item.minimo}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold">Stock actual vs mínimo</h2>
          {stockVsMinimo.length === 0 ? (
            <div className="mt-4 p-6 text-center text-sm text-muted-foreground">Sin datos</div>
          ) : (
            <ChartContainer config={stockConfig} className="mt-4 aspect-auto h-64 w-full">
              <BarChart data={stockVsMinimo} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="producto"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={0}
                  angle={-15}
                  height={50}
                  textAnchor="end"
                />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <ChartTooltip
                  cursor={{ fill: "var(--sky)", opacity: 0.4 }}
                  content={<ChartTooltipContent />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="stock" fill="var(--brand)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="minimo" fill="var(--ink)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Stock por almacén</h2>
          {stockPorAlmacen.length === 0 ? (
            <div className="mt-4 p-6 text-center text-sm text-muted-foreground">Sin datos</div>
          ) : (
            <ChartContainer
              config={almacenConfig}
              className="mx-auto mt-4 aspect-square h-52 w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="nombre"
                      hideLabel
                      formatter={(value) => `${Number(value).toLocaleString("es-PE")} und`}
                    />
                  }
                />
                <Pie
                  data={stockPorAlmacen}
                  dataKey="unidades"
                  nameKey="nombre"
                  innerRadius={55}
                  outerRadius={85}
                  strokeWidth={2}
                >
                  {stockPorAlmacen.map((entry) => (
                    <Cell key={entry.nombre} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="nombre" />} />
              </PieChart>
            </ChartContainer>
          )}
        </div>
      </div>
    </div>
  );
}
