import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye, Printer, Calendar } from "lucide-react";
import { listSales } from "@/lib/api/sales";

export const Route = createFileRoute("/_auth/vendedor/ventas-del-dia")({
  component: VentasDelDia,
});

type Venta = {
  id: string;
  hora: string;
  cliente: string;
  total: number;
  metodoPago: string;
  comprobante: "Boleta" | "Factura";
  items: number;
};

const methodLabels: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  yape_plin: "Yape / Plin",
  transferencia: "Transferencia",
  cheque: "Cheque",
};

function VentasDelDia() {
  const [search, setSearch] = useState("");

  const { data: raw = [], isLoading } = useQuery({ queryKey: ["sales"], queryFn: listSales });

  const hoy = new Date().toISOString().split("T")[0];
  const ventas: Venta[] = raw
    .filter((s: any) => (s.sold_at ?? "").slice(0, 10) === hoy)
    .map((s: any) => ({
      id: s.code ?? s.id.slice(0, 8).toUpperCase(),
      hora: s.sold_at
        ? new Date(s.sold_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
        : "—",
      cliente: s.customer?.name ?? "Cliente General",
      total: Number(s.total) || 0,
      metodoPago: methodLabels[s.payment_method] ?? s.payment_method ?? "—",
      comprobante: s.receipt_type === "factura" ? "Factura" : "Boleta",
      items: 0,
    }));

  const filtered = ventas.filter(
    (v) =>
      v.id.toLowerCase().includes(search.toLowerCase()) ||
      v.cliente.toLowerCase().includes(search.toLowerCase()),
  );
  const totalDia = ventas.reduce((acc, v) => acc + v.total, 0);

  const porMetodo = ventas.reduce<Record<string, number>>((acc, v) => {
    acc[v.metodoPago] = (acc[v.metodoPago] ?? 0) + v.total;
    return acc;
  }, {});
  const boletas = ventas.filter((v) => v.comprobante === "Boleta").length;
  const facturas = ventas.filter((v) => v.comprobante === "Factura").length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ventas del Día</h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString("es-PE")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total del día</p>
          <p className="text-2xl font-bold">S/ {totalDia.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por N° venta o cliente..."
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
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Hora</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Cliente
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Comprobante
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Método Pago
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Total</th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                    Cargando ventas…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                    Sin ventas registradas hoy.
                  </td>
                </tr>
              )}
              {filtered.map((venta) => (
                <tr key={venta.id} className="border-b border-border hover:bg-sky/5">
                  <td className="p-4 text-sm font-semibold">{venta.id}</td>
                  <td className="p-4 text-sm text-muted-foreground">{venta.hora}</td>
                  <td className="p-4 text-sm">{venta.cliente}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-sky/20 px-2 py-1 text-xs">
                      {venta.comprobante}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{venta.metodoPago}</td>
                  <td className="p-4 text-sm font-semibold">S/ {venta.total.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-full p-2 hover:bg-sky/10" title="Ver detalle">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-full p-2 hover:bg-sky/10" title="Reimprimir">
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-semibold">Ventas por método de pago</h3>
          <div className="mt-2 space-y-1 text-sm">
            {Object.keys(porMetodo).length === 0 && (
              <p className="text-muted-foreground">Sin datos.</p>
            )}
            {Object.entries(porMetodo).map(([metodo, monto]) => (
              <div key={metodo} className="flex justify-between">
                <span className="text-muted-foreground">{metodo}</span>
                <span className="font-semibold">S/ {monto.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-semibold">Comprobantes</h3>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Boletas</span>
              <span className="font-semibold">{boletas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Facturas</span>
              <span className="font-semibold">{facturas}</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-semibold">Cantidad de ventas</h3>
          <p className="mt-2 text-xl font-bold">{ventas.length} ventas</p>
        </div>
      </div>
    </div>
  );
}
