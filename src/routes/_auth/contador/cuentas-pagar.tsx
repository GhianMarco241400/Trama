import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, DollarSign, Eye } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { listPayables, listAccounts, registerPayment, type Payment } from "@/lib/api/treasury";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/_auth/contador/cuentas-pagar")({
  component: CuentasPagar,
});

const agingConfig = {
  monto: { label: "Monto" },
  corriente: { label: "Corriente", color: "var(--chart-2)" },
  porVencer: { label: "Por vencer", color: "var(--chart-4)" },
  vencido: { label: "Vencido", color: "var(--chart-1)" },
} satisfies ChartConfig;

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  vencida: "Vencida",
  pagada: "Pagada",
};

const METODOS: { value: Payment["method"]; label: string }[] = [
  { value: "transferencia", label: "Transferencia" },
  { value: "efectivo", label: "Efectivo" },
  { value: "cheque", label: "Cheque" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "yape_plin", label: "Yape / Plin" },
];

function CuentasPagar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Payment["method"]>("transferencia");
  const [reference, setReference] = useState("");
  const [accountId, setAccountId] = useState("");

  const { data: cuentas = [], isLoading } = useQuery({
    queryKey: ["treasury", "payables"],
    queryFn: listPayables,
  });

  const { data: cuentasBanco = [] } = useQuery({
    queryKey: ["treasury", "accounts"],
    queryFn: listAccounts,
  });

  const filtered = useMemo(() => {
    return cuentas.filter((c) => {
      const proveedor = c.supplier?.business_name ?? "";
      const comprobante = c.receipt_number ?? "";
      return (
        proveedor.toLowerCase().includes(search.toLowerCase()) ||
        comprobante.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [cuentas, search]);

  const totalPendiente = cuentas.reduce((acc, c) => acc + c.balance, 0);

  const aging = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let corriente = 0;
    let porVencer = 0;
    let vencido = 0;
    cuentas.forEach((c) => {
      if (c.balance <= 0) return;
      if (!c.due_date) {
        corriente += c.balance;
        return;
      }
      const diffDays = (new Date(c.due_date).getTime() - today.getTime()) / 86400000;
      if (diffDays < 0) vencido += c.balance;
      else if (diffDays <= 7) porVencer += c.balance;
      else corriente += c.balance;
    });
    return [
      { nombre: "Corriente", monto: corriente, fill: "var(--chart-2)" },
      { nombre: "Por vencer", monto: porVencer, fill: "var(--chart-4)" },
      { nombre: "Vencido", monto: vencido, fill: "var(--chart-1)" },
    ];
  }, [cuentas]);

  const topProveedores = useMemo(() => {
    const map = new Map<string, number>();
    cuentas.forEach((c) => {
      if (c.balance > 0) {
        const nombre = c.supplier?.business_name ?? "Sin proveedor";
        map.set(nombre, (map.get(nombre) ?? 0) + c.balance);
      }
    });
    return [...map.entries()]
      .map(([nombre, saldo]) => ({ nombre, saldo }))
      .sort((a, b) => b.saldo - a.saldo);
  }, [cuentas]);

  const maxSaldo = topProveedores[0]?.saldo ?? 1;

  const registrarPago = useMutation({
    mutationFn: () =>
      registerPayment({
        receivableId: null,
        payableId: selectedId,
        amount: Number(amount),
        method,
        reference: reference || null,
        accountId: accountId || null,
        userId: user?.id ?? null,
      }),
    onSuccess: () => {
      toast.success("Pago registrado");
      queryClient.invalidateQueries({ queryKey: ["treasury", "payables"] });
      queryClient.invalidateQueries({ queryKey: ["treasury", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["treasury", "account-movements"] });
      closeModal();
    },
    onError: () => {
      toast.error("No se pudo registrar el pago");
    },
  });

  const getEstadoColor = (estado: string) => {
    if (estado === "Pagada") return "bg-green-100 text-green-700";
    if (estado === "Pendiente") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const openModal = (id: string) => {
    setSelectedId(id);
    setAmount("");
    setMethod("transferencia");
    setReference("");
    setAccountId("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  const handleRegistrar = () => {
    if (!selectedId) return;
    const monto = Number(amount);
    if (!monto || monto <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    if (!accountId) {
      toast.error("Selecciona una cuenta");
      return;
    }
    registrarPago.mutate();
  };

  const selected = cuentas.find((c) => c.id === selectedId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cuentas por Pagar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Saldos pendientes con proveedores</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Saldo total pendiente</p>
          <p className="text-2xl font-bold">S/ {totalPendiente.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Antigüedad de saldos</h2>
          <ChartContainer config={agingConfig} className="mx-auto mt-4 aspect-square h-48 w-full">
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
                data={aging}
                dataKey="monto"
                nameKey="nombre"
                innerRadius={50}
                outerRadius={78}
                strokeWidth={2}
              >
                {aging.map((entry) => (
                  <Cell key={entry.nombre} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="nombre" />} />
            </PieChart>
          </ChartContainer>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold">Proveedores con mayor saldo</h2>
          {topProveedores.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Sin saldos pendientes</p>
          ) : (
            <div className="mt-4 space-y-3">
              {topProveedores.map((c) => (
                <div key={c.nombre} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.nombre}</p>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-brand"
                        style={{ width: `${(c.saldo / maxSaldo) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-4 text-sm font-semibold">S/ {c.saldo.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por proveedor o comprobante..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Proveedor
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Comprobante
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Emisión
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Vencimiento
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Total</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Saldo</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Estado
                </th>
                <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-sm text-muted-foreground">
                    Cargando cuentas por pagar...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-sm text-muted-foreground">
                    No hay cuentas por pagar registradas
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const estado = ESTADO_LABEL[c.status] ?? c.status;
                  return (
                    <tr key={c.id} className="border-b border-border hover:bg-sky/5">
                      <td className="p-4 text-sm font-semibold">
                        {c.supplier?.business_name ?? "Sin proveedor"}
                      </td>
                      <td className="p-4 text-sm">{c.receipt_number ?? "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{c.issue_date}</td>
                      <td className="p-4 text-sm text-muted-foreground">{c.due_date ?? "—"}</td>
                      <td className="p-4 text-sm">S/ {c.total.toFixed(2)}</td>
                      <td className="p-4 text-sm font-semibold">S/ {c.balance.toFixed(2)}</td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${getEstadoColor(estado)}`}
                        >
                          {estado}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {c.status !== "pagada" ? (
                          <button
                            onClick={() => openModal(c.id)}
                            className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs text-white hover:opacity-90"
                          >
                            <DollarSign className="h-3 w-3" />
                            Registrar pago
                          </button>
                        ) : (
                          <button className="rounded-full p-2 hover:bg-sky/10">
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-card p-6">
            <h2 className="text-lg font-semibold">Registrar Pago a Proveedor</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Proveedor</label>
                <p className="mt-1 rounded-xl border border-border px-3 py-2 text-sm">
                  {selected?.supplier?.business_name ?? "Sin proveedor"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Cuenta de origen</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar cuenta</option>
                  {cuentasBanco.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Monto (S/)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Método de pago</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as Payment["method"])}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    {METODOS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Referencia</label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="N° de operación"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 rounded-full border border-border py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrar}
                disabled={registrarPago.isPending}
                className="flex-1 rounded-full bg-green-600 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
              >
                {registrarPago.isPending ? "Registrando..." : "Registrar Pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
