import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
import { listAccountMovements, listReceivables, listPayables } from "@/lib/api/treasury";

export const Route = createFileRoute("/_auth/contador/reportes")({
  component: ReportesContador,
});

const resultadoConfig = {
  monto: { label: "Monto (S/)", color: "var(--brand)" },
} satisfies ChartConfig;

const flujoConfig = {
  acumulado: { label: "Flujo acumulado (S/)", color: "var(--chart-2)" },
} satisfies ChartConfig;

const cobranzasConfig = {
  cobranzas: { label: "Cobranzas (S/)", color: "var(--brand)" },
  pagos: { label: "Pagos (S/)", color: "var(--ink)" },
} satisfies ChartConfig;

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const fmt = (v: number) =>
  `S/ ${v.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function ReportesContador() {
  const { data: movimientos = [], isLoading: isLoadingMov } = useQuery({
    queryKey: ["treasury", "account-movements"],
    queryFn: listAccountMovements,
  });

  const { data: receivables = [] } = useQuery({
    queryKey: ["treasury", "receivables"],
    queryFn: listReceivables,
  });

  const { data: payables = [] } = useQuery({
    queryKey: ["treasury", "payables"],
    queryFn: listPayables,
  });

  const now = new Date();

  const resumenMes = useMemo(() => {
    const ingresos = movimientos
      .filter((m) => {
        const fm = new Date(m.moved_at);
        return (
          m.type === "ingreso" &&
          fm.getMonth() === now.getMonth() &&
          fm.getFullYear() === now.getFullYear()
        );
      })
      .reduce((acc, m) => acc + m.amount, 0);
    const egresos = movimientos
      .filter((m) => {
        const fm = new Date(m.moved_at);
        return (
          m.type === "egreso" &&
          fm.getMonth() === now.getMonth() &&
          fm.getFullYear() === now.getFullYear()
        );
      })
      .reduce((acc, m) => acc + m.amount, 0);
    const costos = payables
      .filter((p) => {
        const fi = new Date(p.issue_date);
        return fi.getMonth() === now.getMonth() && fi.getFullYear() === now.getFullYear();
      })
      .reduce((acc, p) => acc + p.total, 0);
    return { ingresos, egresos, costos, utilidad: ingresos - costos - egresos };
  }, [movimientos, payables]);

  const estadoResultados = useMemo(() => {
    return [
      { concepto: "Ingresos", monto: resumenMes.ingresos },
      { concepto: "Costos", monto: resumenMes.costos },
      { concepto: "Gastos", monto: resumenMes.egresos },
      { concepto: "Utilidad", monto: Math.max(resumenMes.utilidad, 0) },
    ];
  }, [resumenMes]);

  const flujoAcumulado = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    let acumulado = 0;
    return dias.map((d) => {
      const fin = new Date(d);
      fin.setDate(fin.getDate() + 1);
      acumulado += movimientos
        .filter((m) => {
          const fm = new Date(m.moved_at);
          return fm >= d && fm < fin;
        })
        .reduce((acc, m) => acc + (m.type === "ingreso" ? m.amount : -m.amount), 0);
      return {
        dia: `${d.getDate()} ${MESES[d.getMonth()]}`,
        acumulado,
      };
    });
  }, [movimientos]);

  const cobranzasPagos = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const cobranzas = receivables
        .filter((r) => {
          const fi = new Date(r.issue_date);
          return fi.getMonth() === d.getMonth() && fi.getFullYear() === d.getFullYear();
        })
        .reduce((acc, r) => acc + r.total, 0);
      const pagos = payables
        .filter((p) => {
          const fi = new Date(p.issue_date);
          return fi.getMonth() === d.getMonth() && fi.getFullYear() === d.getFullYear();
        })
        .reduce((acc, p) => acc + p.total, 0);
      return { mes: MESES[d.getMonth()], cobranzas, pagos };
    });
  }, [receivables, payables]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes Financieros</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informes contables y financieros del negocio
          </p>
        </div>
        <span className="rounded-full bg-sky/20 px-3 py-1 text-sm">
          {MESES[now.getMonth()]} {now.getFullYear()}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Estado de resultados</h2>
          <ChartContainer config={resultadoConfig} className="mt-4 aspect-auto h-60 w-full">
            <BarChart data={estadoResultados} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="concepto" tickLine={false} axisLine={false} tickMargin={8} />
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
              <Bar dataKey="monto" fill="var(--brand)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold">Flujo de caja acumulado</h2>
          <ChartContainer config={flujoConfig} className="mt-4 aspect-auto h-60 w-full">
            <AreaChart data={flujoAcumulado} margin={{ left: 0, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="fillFlujo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} />
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
                dataKey="acumulado"
                type="monotone"
                fill="url(#fillFlujo)"
                stroke="var(--chart-2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Cobranzas vs Pagos (6 meses)</h2>
        <ChartContainer config={cobranzasConfig} className="mt-4 aspect-auto h-64 w-full">
          <LineChart data={cobranzasPagos} margin={{ left: 0, right: 12, top: 8 }}>
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
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="cobranzas"
              type="monotone"
              stroke="var(--brand)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--brand)" }}
            />
            <Line
              dataKey="pagos"
              type="monotone"
              stroke="var(--ink)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--ink)" }}
            />
          </LineChart>
        </ChartContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Ingresos del mes</p>
          <p className="mt-1 text-xl font-bold">{isLoadingMov ? "—" : fmt(resumenMes.ingresos)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Costos y egresos</p>
          <p className="mt-1 text-xl font-bold">
            {isLoadingMov ? "—" : fmt(resumenMes.costos + resumenMes.egresos)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Utilidad estimada</p>
          <p className="mt-1 text-xl font-bold text-green-600">
            {isLoadingMov ? "—" : fmt(resumenMes.utilidad)}
          </p>
        </div>
      </div>
    </div>
  );
}
