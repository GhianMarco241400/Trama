import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
import { listSales, listSalesByCategory, listTopProducts } from "@/lib/api/sales";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_auth/admin/reportes")({
  component: ReportesAdmin,
});

const categoriaConfig = {
  monto: { label: "Monto" },
  polos: { label: "Polos", color: "var(--chart-1)" },
  camisas: { label: "Camisas", color: "var(--chart-2)" },
  pantalones: { label: "Pantalones", color: "var(--chart-3)" },
  casacas: { label: "Casacas", color: "var(--chart-4)" },
  calzado: { label: "Calzado", color: "var(--chart-5)" },
} satisfies ChartConfig;

const CATEGORY_FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const vendedorConfig = {
  ventas: { label: "Ventas (S/)", color: "var(--brand)" },
} satisfies ChartConfig;

const evolucionConfig = {
  ventas: { label: "Ventas (S/)", color: "var(--ink)" },
} satisfies ChartConfig;

const productosConfig = {
  unidades: { label: "Unidades", color: "var(--brand)" },
} satisfies ChartConfig;

function ReportesAdmin() {
  const { data: ventas = [], isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: listSales,
  });

  const { data: porCategoria = [] } = useQuery({
    queryKey: ["sales-by-category"],
    queryFn: listSalesByCategory,
  });

  const { data: topProductosData = [] } = useQuery({
    queryKey: ["top-products"],
    queryFn: listTopProducts,
  });

  const ventasPorCategoria = useMemo(
    () =>
      [...porCategoria]
        .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
        .slice(0, 5)
        .map((c, i) => ({
          categoria: c.category,
          monto: Math.round((c.total ?? 0) * 100) / 100,
          fill: CATEGORY_FILLS[i % CATEGORY_FILLS.length] ?? "var(--chart-1)",
        })),
    [porCategoria],
  );

  const topProductos = useMemo(
    () =>
      topProductosData.map((p) => ({
        producto: p.product,
        unidades: Number(p.units ?? 0),
      })),
    [topProductosData],
  );

  const pagadas = useMemo(() => ventas.filter((v) => v.status === "pagada"), [ventas]);

  const productosVendidos = useMemo(
    () => topProductosData.reduce((acc, p) => acc + Number(p.units ?? 0), 0),
    [topProductosData],
  );

  const evolucionMensual = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const v of pagadas) {
      const d = new Date(v.sold_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      mapa.set(key, (mapa.get(key) ?? 0) + v.total);
    }
    return Array.from(mapa.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([key, ventas]) => {
        const partes = key.split("-");
        const anio = Number(partes[0]);
        const mes = Number(partes[1]);
        return {
          mes: new Date(anio, mes - 1, 1)
            .toLocaleDateString("es-PE", { month: "short" })
            .replace(".", ""),
          ventas: Math.round(ventas * 100) / 100,
        };
      });
  }, [pagadas]);

  const ventasPorVendedor = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const v of pagadas) {
      const key = v.seller?.full_name ?? "Sin asignar";
      mapa.set(key, (mapa.get(key) ?? 0) + v.total);
    }
    return Array.from(mapa.entries())
      .map(([vendedor, ventas]) => ({ vendedor, ventas: Math.round(ventas * 100) / 100 }))
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 6);
  }, [pagadas]);

  const { ventasDelMes, ticketPromedio } = useMemo(() => {
    if (pagadas.length === 0) return { ventasDelMes: 0, ticketPromedio: 0 };
    const fechas = pagadas.map((v) => new Date(v.sold_at).getTime());
    const ref = new Date(Math.max(...fechas));
    const mes = ref.getMonth();
    const anio = ref.getFullYear();
    const delMes = pagadas
      .filter((v) => {
        const d = new Date(v.sold_at);
        return d.getMonth() === mes && d.getFullYear() === anio;
      })
      .reduce((acc, v) => acc + v.total, 0);
    const totalAnio = pagadas
      .filter((v) => {
        const d = new Date(v.sold_at);
        return d.getFullYear() === anio;
      })
      .reduce((acc, v) => acc + v.total, 0);
    const countAnio = pagadas.filter((v) => new Date(v.sold_at).getFullYear() === anio).length;
    return {
      ventasDelMes: delMes,
      ticketPromedio: countAnio > 0 ? totalAnio / countAnio : 0,
    };
  }, [pagadas]);

  const periodo = new Date().toLocaleDateString("es-PE", { month: "long", year: "numeric" });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analítica de ventas y desempeño del negocio
          </p>
        </div>
        <span className="rounded-full bg-sky/20 px-3 py-1 text-sm capitalize">{periodo}</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold">Evolución mensual de ventas</h2>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Cargando…
            </div>
          ) : (
            <ChartContainer config={evolucionConfig} className="mt-4 aspect-auto h-64 w-full">
              <LineChart data={evolucionMensual} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
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
                <Line
                  dataKey="ventas"
                  type="monotone"
                  stroke="var(--ink)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--brand)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          )}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Ventas del mes</p>
              <p className="text-lg font-bold">{formatCurrency(ventasDelMes)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Productos vendidos</p>
              <p className="text-lg font-bold">{productosVendidos.toLocaleString("es-PE")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ticket promedio</p>
              <p className="text-lg font-bold">{formatCurrency(ticketPromedio)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Ventas por categoría</h2>
          {ventasPorCategoria.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
              No hay ventas registradas
            </div>
          ) : (
            <ChartContainer
              config={categoriaConfig}
              className="mx-auto mt-4 aspect-square h-56 w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="categoria"
                      hideLabel
                      formatter={(value) => `S/ ${Number(value).toLocaleString("es-PE")}`}
                    />
                  }
                />
                <Pie
                  data={ventasPorCategoria}
                  dataKey="monto"
                  nameKey="categoria"
                  innerRadius={50}
                  outerRadius={82}
                  strokeWidth={2}
                >
                  {ventasPorCategoria.map((entry) => (
                    <Cell key={entry.categoria} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="categoria" />} />
              </PieChart>
            </ChartContainer>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Ventas por vendedor</h2>
          {isLoading ? (
            <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
              Cargando…
            </div>
          ) : ventasPorVendedor.length === 0 ? (
            <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
              No hay ventas registradas
            </div>
          ) : (
            <ChartContainer config={vendedorConfig} className="mt-4 aspect-auto h-60 w-full">
              <BarChart data={ventasPorVendedor} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="vendedor" tickLine={false} axisLine={false} tickMargin={8} />
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
                <Bar dataKey="ventas" fill="var(--brand)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Top 5 productos más vendidos</h2>
          {topProductos.length === 0 ? (
            <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
              No hay ventas registradas
            </div>
          ) : (
            <ChartContainer config={productosConfig} className="mt-4 aspect-auto h-60 w-full">
              <BarChart
                data={topProductos}
                layout="vertical"
                margin={{ left: 8, right: 16, top: 8 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="producto"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={150}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--sky)", opacity: 0.4 }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `${Number(value).toLocaleString("es-PE")} und`}
                    />
                  }
                />
                <Bar dataKey="unidades" fill="var(--ink)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </div>
    </div>
  );
}
