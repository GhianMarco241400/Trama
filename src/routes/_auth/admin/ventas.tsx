import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye, Calendar } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { listSales } from "@/lib/api/sales";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_auth/admin/ventas")({
  component: VentasAdmin,
});

const diaConfig = {
  ventas: { label: "Ventas (S/)", color: "var(--brand)" },
} satisfies ChartConfig;

const COMPROBANTE_LABELS: Record<string, string> = {
  boleta: "Boleta",
  factura: "Factura",
};

const PAGO_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  yape_plin: "Yape / Plin",
  transferencia: "Transferencia",
  cheque: "Cheque",
};

const ESTADO_LABELS: Record<string, string> = {
  pagada: "Pagada",
  pendiente: "Pendiente",
  anulada: "Anulada",
};

type VentaFila = {
  id: string;
  fecha: string;
  hora: string;
  cliente: string;
  vendedor: string;
  comprobante: string;
  metodoPago: string;
  total: number;
  estado: string;
};

function VentasAdmin() {
  const [search, setSearch] = useState("");

  const { data: ventas = [], isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: listSales,
  });

  const filas: VentaFila[] = useMemo(() => {
    return ventas.map((v) => {
      const d = new Date(v.sold_at);
      return {
        id: v.code,
        fecha: formatDate(d),
        hora: d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
        cliente: v.customer?.name ?? "Cliente General",
        vendedor: v.seller?.full_name ?? "Sin asignar",
        comprobante: COMPROBANTE_LABELS[v.receipt_type] ?? v.receipt_type,
        metodoPago: PAGO_LABELS[v.payment_method] ?? v.payment_method,
        total: v.total,
        estado: ESTADO_LABELS[v.status] ?? v.status,
      };
    });
  }, [ventas]);

  const ventasPorDia = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const v of ventas) {
      if (v.status !== "pagada") continue;
      const d = new Date(v.sold_at);
      const key = d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
      mapa.set(key, (mapa.get(key) ?? 0) + v.total);
    }
    return Array.from(mapa.entries())
      .map(([dia, ventas]) => ({ dia, ventas: Math.round(ventas * 100) / 100 }))
      .reverse();
  }, [ventas]);

  const filtered = useMemo(() => {
    return filas.filter(
      (v) =>
        v.id.toLowerCase().includes(search.toLowerCase()) ||
        v.cliente.toLowerCase().includes(search.toLowerCase()) ||
        v.vendedor.toLowerCase().includes(search.toLowerCase()),
    );
  }, [filas, search]);

  const total = filas.filter((v) => v.estado === "Pagada").reduce((acc, v) => acc + v.total, 0);

  const getEstadoColor = (estado: string) => {
    if (estado === "Pagada") return "bg-green-100 text-green-700";
    if (estado === "Pendiente") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ventas</h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Consolidado de ventas
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total cobrado</p>
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Ventas por día</h2>
        {isLoading ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            Cargando…
          </div>
        ) : ventasPorDia.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            No hay ventas registradas
          </div>
        ) : (
          <ChartContainer config={diaConfig} className="mt-4 aspect-auto h-56 w-full">
            <BarChart data={ventasPorDia} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} />
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

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por N° venta, cliente o vendedor..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  N° Venta
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Cliente
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Vendedor
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Comprobante
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Método Pago
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Total</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Estado
                </th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-sm text-muted-foreground">
                    Cargando…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-sm text-muted-foreground">
                    No hay ventas registradas
                  </td>
                </tr>
              )}
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm font-semibold">{v.id}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {v.fecha} {v.hora}
                  </td>
                  <td className="p-4 text-sm">{v.cliente}</td>
                  <td className="p-4 text-sm">{v.vendedor}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-sky/20 px-2 py-1 text-xs">
                      {v.comprobante}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{v.metodoPago}</td>
                  <td className="p-4 text-sm font-semibold">{formatCurrency(v.total)}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${getEstadoColor(v.estado)}`}>
                      {v.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="rounded-full p-2 hover:bg-sky/10" title="Ver detalle">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
