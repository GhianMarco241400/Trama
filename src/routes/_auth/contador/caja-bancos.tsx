import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Banknote, Landmark, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { listAccounts, listAccountMovements } from "@/lib/api/treasury";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_auth/contador/caja-bancos")({
  component: CajaBancos,
});

const saldoConfig = {
  saldo: { label: "Saldo (S/)", color: "var(--brand)" },
} satisfies ChartConfig;

const movConfig = {
  monto: { label: "Movimiento (S/)", color: "var(--chart-2)" },
} satisfies ChartConfig;

function CajaBancos() {
  const [search, setSearch] = useState("");

  const { data: cuentas = [], isLoading: isLoadingCuentas } = useQuery({
    queryKey: ["treasury", "accounts"],
    queryFn: listAccounts,
  });

  const { data: movimientos = [], isLoading: isLoadingMovimientos } = useQuery({
    queryKey: ["treasury", "account-movements"],
    queryFn: listAccountMovements,
  });

  const filtered = useMemo(() => {
    return movimientos.filter((m) => {
      const descripcion = m.description ?? "";
      const cuenta = m.account?.name ?? "";
      return (
        descripcion.toLowerCase().includes(search.toLowerCase()) ||
        cuenta.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [movimientos, search]);

  const totalSaldo = cuentas.reduce((acc, c) => acc + c.balance, 0);

  const cuentasGrafico = useMemo(() => {
    return cuentas.map((c) => ({ numero: c.number ?? c.name, saldo: c.balance }));
  }, [cuentas]);

  const movimientosGrafico = useMemo(() => {
    return movimientos.map((m) => {
      const fecha = m.moved_at.slice(0, 10);
      return {
        fecha: `${fecha.slice(8)}/${fecha.slice(5, 7)}`,
        monto: m.type === "ingreso" ? m.amount : -m.amount,
      };
    });
  }, [movimientos]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Caja y Bancos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control de saldos de cajas y cuentas bancarias
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Saldo consolidado</p>
          <p className="text-2xl font-bold">S/ {totalSaldo.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoadingCuentas ? (
          <p className="text-sm text-muted-foreground">Cargando cuentas...</p>
        ) : cuentas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay cuentas registradas</p>
        ) : (
          cuentas.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky/10 text-ink">
                  {c.type === "caja" ? (
                    <Wallet className="h-5 w-5" />
                  ) : (
                    <Landmark className="h-5 w-5" />
                  )}
                </div>
                <span className="rounded-full bg-sky/20 px-2 py-1 text-xs">
                  {c.type === "caja" ? "Caja" : "Banco"}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.number ?? "—"}</p>
              <p className="mt-2 text-xl font-bold">S/ {c.balance.toFixed(2)}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Saldos por cuenta</h2>
          <ChartContainer config={saldoConfig} className="mt-4 aspect-auto h-60 w-full">
            <BarChart data={cuentasGrafico} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="numero" tickLine={false} axisLine={false} tickMargin={8} />
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
              <Bar dataKey="saldo" fill="var(--brand)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Flujo de movimientos</h2>
          <ChartContainer config={movConfig} className="mt-4 aspect-auto h-60 w-full">
            <AreaChart data={movimientosGrafico} margin={{ left: 0, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="fillMov" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="fecha" tickLine={false} axisLine={false} tickMargin={8} />
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
                dataKey="monto"
                type="monotone"
                fill="url(#fillMov)"
                stroke="var(--chart-2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <h2 className="font-semibold">Movimientos recientes</h2>
          <div className="ml-auto flex w-72 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Banknote className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar movimiento..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Cuenta
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Descripción
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingMovimientos ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-sm text-muted-foreground">
                    Cargando movimientos...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-sm text-muted-foreground">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-b border-border hover:bg-sky/5">
                    <td className="p-4 text-sm text-muted-foreground">{formatDate(m.moved_at)}</td>
                    <td className="p-4 text-sm">{m.account?.name ?? "—"}</td>
                    <td className="p-4 text-sm">{m.description ?? "—"}</td>
                    <td className="p-4">
                      <span
                        className={`flex w-fit items-center gap-1 rounded-full px-2 py-1 text-xs ${m.type === "ingreso" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {m.type === "ingreso" ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {m.type === "ingreso" ? "Ingreso" : "Egreso"}
                      </span>
                    </td>
                    <td
                      className={`p-4 text-right text-sm font-semibold ${m.type === "ingreso" ? "text-green-600" : "text-red-600"}`}
                    >
                      {m.type === "ingreso" ? "+" : "-"} S/ {m.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
