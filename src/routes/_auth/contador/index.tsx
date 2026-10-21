import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { CreditCard, FileText, Banknote, BarChart3, DollarSign } from "lucide-react";
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
import {
  listAccounts,
  listAccountMovements,
  listReceivables,
  listPayables,
  listCashCounts,
} from "@/lib/api/treasury";

export const Route = createFileRoute("/_auth/contador/")({
  component: ContadorDashboard,
});

const comparativoConfig = {
  ingresos: { label: "Ingresos (S/)", color: "var(--brand)" },
  egresos: { label: "Egresos (S/)", color: "var(--ink)" },
} satisfies ChartConfig;

const flujoConfig = {
  saldo: { label: "Saldo (S/)", color: "var(--chart-2)" },
} satisfies ChartConfig;

const composicionConfig = {
  monto: { label: "Monto" },
  cxc: { label: "Cuentas por cobrar", color: "var(--chart-1)" },
  cxp: { label: "Cuentas por pagar", color: "var(--chart-2)" },
  disponible: { label: "Disponible", color: "var(--chart-3)" },
} satisfies ChartConfig;

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const fmt = (v: number) =>
  `S/ ${v.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

function ContadorDashboard() {
  const { user } = useAuth();

  const { data: cuentas = [], isLoading: isLoadingCuentas } = useQuery({
    queryKey: ["treasury", "accounts"],
    queryFn: listAccounts,
  });

  const { data: movimientos = [] } = useQuery({
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

  const { data: arqueos = [] } = useQuery({
    queryKey: ["treasury", "cash-counts"],
    queryFn: listCashCounts,
  });

  const totalDisponible = cuentas.reduce((acc, c) => acc + c.balance, 0);
  const totalCxC = receivables.reduce((acc, r) => acc + r.balance, 0);
  const totalCxP = payables.reduce((acc, p) => acc + p.balance, 0);
  const arqueosPendientes = arqueos.filter((a) => a.status === "pendiente").length;

  const now = new Date();
  const ingresosMes = useMemo(() => {
    return movimientos
      .filter(
        (m) =>
          m.type === "ingreso" &&
          new Date(m.moved_at).getMonth() === now.getMonth() &&
          new Date(m.moved_at).getFullYear() === now.getFullYear(),
      )
      .reduce((acc, m) => acc + m.amount, 0);
  }, [movimientos]);

  const ingresosEgresos = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const ingresos = movimientos
        .filter((m) => {
          const fm = new Date(m.moved_at);
          return (
            m.type === "ingreso" &&
            fm.getMonth() === d.getMonth() &&
            fm.getFullYear() === d.getFullYear()
          );
        })
        .reduce((acc, m) => acc + m.amount, 0);
      const egresos = movimientos
        .filter((m) => {
          const fm = new Date(m.moved_at);
          return (
            m.type === "egreso" &&
            fm.getMonth() === d.getMonth() &&
            fm.getFullYear() === d.getFullYear()
          );
        })
        .reduce((acc, m) => acc + m.amount, 0);
      return { mes: MESES[d.getMonth()], ingresos, egresos };
    });
  }, [movimientos]);

  const flujoDiario = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const netoHasta = (hasta: Date) => {
      const fin = new Date(hasta);
      fin.setDate(fin.getDate() + 1);
      return movimientos
        .filter((m) => {
          const fm = new Date(m.moved_at);
          return fm >= hasta && fm < fin;
        })
        .reduce((acc, m) => acc + (m.type === "ingreso" ? m.amount : -m.amount), 0);
    };
    const netoTotal = movimientos.reduce(
      (acc, m) => acc + (m.type === "ingreso" ? m.amount : -m.amount),
      0,
    );
    let acumulado = 0;
    return dias.map((d) => {
      acumulado += netoHasta(d);
      return {
        dia: `${d.getDate()} ${MESES[d.getMonth()]}`,
        saldo: totalDisponible - (netoTotal - acumulado),
      };
    });
  }, [movimientos, totalDisponible]);

  const composicion = useMemo(() => {
    return [
      { nombre: "Cuentas por cobrar", monto: totalCxC, fill: "var(--chart-1)" },
      { nombre: "Cuentas por pagar", monto: totalCxP, fill: "var(--chart-2)" },
      { nombre: "Disponible (caja/bancos)", monto: totalDisponible, fill: "var(--chart-3)" },
    ];
  }, [totalCxC, totalCxP, totalDisponible]);

  const ingresosHoy = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    return movimientos
      .filter((m) => {
        const fm = new Date(m.moved_at);
        return m.type === "ingreso" && fm >= hoy && fm < manana;
      })
      .reduce((acc, m) => acc + m.amount, 0);
  }, [movimientos]);

  const egresosHoy = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    return movimientos
      .filter((m) => {
        const fm = new Date(m.moved_at);
        return m.type === "egreso" && fm >= hoy && fm < manana;
      })
      .reduce((acc, m) => acc + m.amount, 0);
  }, [movimientos]);

  const cargando = isLoadingCuentas;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard - Contador</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bienvenido(a), {user?.name} | Control financiero
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Ingresos del mes"
          value={cargando ? "—" : fmt(ingresosMes)}
          icon={DollarSign}
          color="bg-sky/10 text-ink"
        />
        <StatCard
          title="CxC Pendientes"
          value={cargando ? "—" : fmt(totalCxC)}
          icon={CreditCard}
          color="bg-brand/10 text-ink"
        />
        <StatCard
          title="CxP Pendientes"
          value={cargando ? "—" : fmt(totalCxP)}
          icon={FileText}
          color="bg-sky/10 text-ink"
        />
        <StatCard
          title="Caja y Bancos"
          value={cargando ? "—" : fmt(totalDisponible)}
          icon={Banknote}
          color="bg-brand/10 text-ink"
        />
        <StatCard title="Reportes" value="12" icon={BarChart3} color="bg-sky/10 text-ink" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold">Ingresos vs Egresos (6 meses)</h2>
          <ChartContainer config={comparativoConfig} className="mt-4 aspect-auto h-64 w-full">
            <BarChart data={ingresosEgresos} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
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
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="ingresos" fill="var(--brand)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="egresos" fill="var(--ink)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Composición financiera</h2>
          <ChartContainer
            config={composicionConfig}
            className="mx-auto mt-4 aspect-square h-52 w-full"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="nombre"
                    hideLabel
                    formatter={(value) => `S/ ${Number(value).toLocaleString("es-PE")}`}
                  />
                }
              />
              <Pie
                data={composicion}
                dataKey="monto"
                nameKey="nombre"
                innerRadius={55}
                outerRadius={85}
                strokeWidth={2}
              >
                {composicion.map((entry) => (
                  <Cell key={entry.nombre} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="nombre" />} />
            </PieChart>
          </ChartContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold">Flujo de caja del mes</h2>
          <ChartContainer config={flujoConfig} className="mt-4 aspect-auto h-56 w-full">
            <LineChart data={flujoDiario} margin={{ left: 0, right: 12, top: 8 }}>
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
              <Line
                dataKey="saldo"
                type="monotone"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--chart-2)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Resumen diario</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>• Ingresos hoy: {fmt(ingresosHoy)}</li>
            <li>• Egresos hoy: {fmt(egresosHoy)}</li>
            <li>• CxC pendientes: {receivables.filter((r) => r.balance > 0).length}</li>
            <li>• Arqueos pendientes: {arqueosPendientes}</li>
          </ul>
          <h2 className="mt-5 text-lg font-semibold">Acciones rápidas</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">
              Cuentas por cobrar
            </button>
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">
              Cuentas por pagar
            </button>
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">
              Arqueo de caja
            </button>
            <button className="rounded-2xl border border-border p-3 hover:bg-sky/5">
              Reportes financieros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
