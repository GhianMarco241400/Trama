import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowUpCircle, ArrowDownCircle, Calendar } from "lucide-react";
import { listStockMovements } from "@/lib/api/inventory";

export const Route = createFileRoute("/_auth/almacenero/kardex")({
  component: KardexInventario,
});

type Movimiento = {
  id: string;
  fecha: string;
  hora: string;
  producto: string;
  tipo: "Entrada" | "Salida";
  documento: string;
  cantidad: number;
  saldo: number;
  usuario: string;
  motivo: string;
  almacen: string;
};

function KardexInventario() {
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroMotivo, setFiltroMotivo] = useState("Todos");

  const { data: movimientosRaw = [], isLoading } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: listStockMovements,
  });

  const movimientos = useMemo<Movimiento[]>(() => {
    return (movimientosRaw as any[]).map((m) => {
      const movedAt = m.moved_at ? new Date(m.moved_at) : new Date();
      const fechaStr = movedAt.toISOString().split("T")[0];
      const fecha = fechaStr || "";
      const hora = movedAt.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
      const producto = m.variant?.product?.name || m.variant?.sku || "-";
      const tipo =
        m.type === "entrada" ? "Entrada" : m.type === "salida" ? "Salida" : (m.type as any);
      const documento = m.document_ref || "-";
      const cantidad = Number(m.quantity) || 0;
      const saldo = Number(m.resulting_balance) || 0;
      const usuario = m.user_id || "-";
      const motivoMap: Record<string, string> = {
        venta: "Venta",
        compra: "Compra",
        ajuste: "Ajuste",
        transferencia: "Transferencia",
      };
      const motivo = motivoMap[m.reason] || m.reason || "-";
      const almacen = m.warehouse?.name || "-";
      return {
        id: m.id,
        fecha,
        hora,
        producto,
        tipo,
        documento,
        cantidad,
        saldo,
        usuario,
        motivo,
        almacen,
      };
    });
  }, [movimientosRaw]);

  const filtered = useMemo(() => {
    return movimientos.filter((m) => {
      const matchSearch =
        m.producto.toLowerCase().includes(search.toLowerCase()) ||
        m.documento.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filtroTipo !== "Todos" && m.tipo !== filtroTipo) return false;
      if (filtroMotivo !== "Todos" && m.motivo !== filtroMotivo) return false;
      return true;
    });
  }, [movimientos, search, filtroTipo, filtroMotivo]);

  const totalEntradas = movimientos
    .filter((m) => m.tipo === "Entrada")
    .reduce((acc, m) => acc + m.cantidad, 0);
  const totalSalidas = movimientos
    .filter((m) => m.tipo === "Salida")
    .reduce((acc, m) => acc + m.cantidad, 0);
  const hoy = new Date().toISOString().split("T")[0];
  const movimientosHoy = movimientos.filter((m) => m.fecha === hoy).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kardex de Inventario</h1>
          <p className="mt-1 text-sm text-muted-foreground">Historial de movimientos de stock</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Movimientos del día</p>
              <p className="mt-1 text-xl font-bold">{movimientosHoy}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky/10">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Entradas</p>
              <p className="mt-1 text-xl font-bold text-green-600">+{totalEntradas}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <ArrowUpCircle className="h-5 w-5 text-green-700" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Salidas</p>
              <p className="mt-1 text-xl font-bold text-red-600">-{totalSalidas}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <ArrowDownCircle className="h-5 w-5 text-red-700" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p
                className={`mt-1 text-xl font-bold ${totalEntradas - totalSalidas >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {totalEntradas - totalSalidas >= 0 ? "+" : ""}
                {totalEntradas - totalSalidas}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto o documento..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="rounded-full border border-border px-4 py-2 text-sm"
          >
            <option>Todos</option>
            <option>Entrada</option>
            <option>Salida</option>
          </select>
          <select
            value={filtroMotivo}
            onChange={(e) => setFiltroMotivo(e.target.value)}
            className="rounded-full border border-border px-4 py-2 text-sm"
          >
            <option>Todos</option>
            <option>Venta</option>
            <option>Compra</option>
            <option>Ajuste</option>
            <option>Transferencia</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Fecha/Hora
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Producto
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Documento
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Motivo
                </th>
                <th className="p-4 text-center text-xs font-semibold text-muted-foreground">
                  Cantidad
                </th>
                <th className="p-4 text-center text-xs font-semibold text-muted-foreground">
                  Saldo
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Almacén
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-sm text-muted-foreground">
                    Cargando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-sm text-muted-foreground">
                    Sin movimientos
                  </td>
                </tr>
              ) : (
                filtered.map((mov) => (
                  <tr key={mov.id} className="border-b border-border hover:bg-sky/5">
                    <td className="p-4 text-sm">
                      <div>
                        <p>{mov.fecha}</p>
                        <p className="text-xs text-muted-foreground">{mov.hora}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold">{mov.producto}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {mov.tipo === "Entrada" ? (
                          <ArrowUpCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${mov.tipo === "Entrada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {mov.tipo}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-mono">{mov.documento}</td>
                    <td className="p-4 text-sm text-muted-foreground">{mov.motivo}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`font-semibold ${mov.tipo === "Entrada" ? "text-green-600" : "text-red-600"}`}
                      >
                        {mov.tipo === "Entrada" ? "+" : "-"}
                        {mov.cantidad}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm font-semibold">{mov.saldo}</td>
                    <td className="p-4 text-sm">{mov.almacen}</td>
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
