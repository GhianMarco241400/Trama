import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardList, Plus, Eye } from "lucide-react";
import { listCashCounts, createCashCount, listAccounts } from "@/lib/api/treasury";
import { useAuth } from "@/context/auth-context";
import { formatDate, formatDateInput } from "@/lib/format";

export const Route = createFileRoute("/_auth/contador/arqueo")({
  component: ArqueoCaja,
});

const ESTADO_LABEL: Record<string, string> = {
  cuadrado: "Cuadrado",
  con_diferencia: "Con diferencia",
  pendiente: "Pendiente",
};

const TURNOS: { value: "manana" | "tarde"; label: string }[] = [
  { value: "manana", label: "Mañana" },
  { value: "tarde", label: "Tarde" },
];

function ArqueoCaja() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [fecha, setFecha] = useState(formatDateInput(new Date()));
  const [shift, setShift] = useState<"manana" | "tarde">("manana");
  const [opening, setOpening] = useState("");
  const [sales, setSales] = useState("");
  const [otherIncome, setOtherIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [counted, setCounted] = useState("");
  const [notes, setNotes] = useState("");

  const { data: arqueos = [], isLoading } = useQuery({
    queryKey: ["treasury", "cash-counts"],
    queryFn: listCashCounts,
  });

  const { data: cuentas = [] } = useQuery({
    queryKey: ["treasury", "accounts"],
    queryFn: listAccounts,
  });

  const cajas = cuentas.filter((c) => c.type === "caja");

  const crearArqueo = useMutation({
    mutationFn: () => {
      const openingAmount = Number(opening) || 0;
      const salesAmount = Number(sales) || 0;
      const otherIncomeAmount = Number(otherIncome) || 0;
      const expensesAmount = Number(expenses) || 0;
      const countedAmount = Number(counted) || 0;
      const expected = openingAmount + salesAmount + otherIncomeAmount - expensesAmount;
      const difference = countedAmount - expected;
      return createCashCount({
        code: `ARQ-${Date.now().toString(36).toUpperCase()}`,
        shift,
        account_id: accountId,
        user_id: user?.id ?? null,
        opening_amount: openingAmount,
        sales_amount: salesAmount,
        other_income: otherIncomeAmount,
        expenses: expensesAmount,
        expected,
        counted: countedAmount,
        difference,
        status: difference === 0 ? "cuadrado" : "con_diferencia",
        counted_at: `${fecha}T12:00:00`,
        notes: notes || null,
      });
    },
    onSuccess: () => {
      toast.success("Arqueo registrado");
      queryClient.invalidateQueries({ queryKey: ["treasury", "cash-counts"] });
      closeModal();
    },
    onError: () => {
      toast.error("No se pudo registrar el arqueo");
    },
  });

  const getEstadoColor = (estado: string) => {
    if (estado === "Cuadrado") return "bg-green-100 text-green-700";
    if (estado === "Con diferencia") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const closeModal = () => {
    setShowModal(false);
    setAccountId("");
    setFecha(formatDateInput(new Date()));
    setShift("manana");
    setOpening("");
    setSales("");
    setOtherIncome("");
    setExpenses("");
    setCounted("");
    setNotes("");
  };

  const handleRegistrar = () => {
    if (!accountId) {
      toast.error("Selecciona una caja");
      return;
    }
    if (!opening || !counted) {
      toast.error("Ingresa el saldo de apertura y el monto contado");
      return;
    }
    crearArqueo.mutate();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Arqueo de Caja</h1>
          <p className="mt-1 text-sm text-muted-foreground">Control y cuadre de caja por turno</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Arqueo
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  N° Arqueo
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">Caja</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Usuario
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Esperado
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Contado
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                  Diferencia
                </th>
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
                  <td colSpan={9} className="p-4 text-center text-sm text-muted-foreground">
                    Cargando arqueos...
                  </td>
                </tr>
              ) : arqueos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-sm text-muted-foreground">
                    No hay arqueos registrados
                  </td>
                </tr>
              ) : (
                arqueos.map((a) => {
                  const estado = ESTADO_LABEL[a.status] ?? a.status;
                  const usuario =
                    a.user_id && a.user_id === user?.id
                      ? (user.name ?? a.user_id)
                      : (a.user_id ?? "—");
                  return (
                    <tr key={a.id} className="border-b border-border hover:bg-sky/5">
                      <td className="p-4 text-sm font-semibold">{a.code}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDate(a.counted_at)}
                      </td>
                      <td className="p-4 text-sm">{a.account?.name ?? "—"}</td>
                      <td className="p-4 text-sm">{usuario}</td>
                      <td className="p-4 text-sm">S/ {a.expected.toFixed(2)}</td>
                      <td className="p-4 text-sm">S/ {a.counted.toFixed(2)}</td>
                      <td
                        className={`p-4 text-sm font-semibold ${a.status === "pendiente" ? "text-muted-foreground" : a.difference === 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {a.status === "pendiente" ? "-" : `S/ ${a.difference.toFixed(2)}`}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${getEstadoColor(estado)}`}
                        >
                          {estado}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {a.status === "pendiente" ? (
                          <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs text-white hover:opacity-90"
                          >
                            <ClipboardList className="h-3 w-3" />
                            Realizar arqueo
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
            <h2 className="text-lg font-semibold">Nuevo Arqueo de Caja</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Caja</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar caja</option>
                  {cajas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Turno</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as "manana" | "tarde")}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    {TURNOS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Saldo apertura (S/)</label>
                  <input
                    type="number"
                    value={opening}
                    onChange={(e) => setOpening(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Monto contado (S/)</label>
                  <input
                    type="number"
                    value={counted}
                    onChange={(e) => setCounted(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Ventas (S/)</label>
                  <input
                    type="number"
                    value={sales}
                    onChange={(e) => setSales(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ingresos (S/)</label>
                  <input
                    type="number"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Egresos (S/)</label>
                  <input
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Observaciones</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Observaciones del arqueo"
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
                disabled={crearArqueo.isPending}
                className="flex-1 rounded-full bg-ink py-2 text-sm text-primary-foreground disabled:opacity-60"
              >
                {crearArqueo.isPending ? "Registrando..." : "Registrar Arqueo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
