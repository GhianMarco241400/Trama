import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/lib/api/admin";

export const Route = createFileRoute("/_auth/admin/configuracion")({
  component: ConfiguracionAdmin,
});

type FormState = {
  business_name: string;
  ruc: string;
  phone: string;
  address: string;
  currency: string;
  igv: string;
  timezone: string;
  receipt_format: string;
  notify_critical_stock: boolean;
};

const emptyForm: FormState = {
  business_name: "",
  ruc: "",
  phone: "",
  address: "",
  currency: "PEN",
  igv: "18",
  timezone: "America/Lima",
  receipt_format: "B001 - Boletas",
  notify_critical_stock: true,
};

function ConfiguracionAdmin() {
  const queryClient = useQueryClient();
  const [guardado, setGuardado] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        business_name: settings.business_name,
        ruc: settings.ruc ?? "",
        phone: settings.phone ?? "",
        address: settings.address ?? "",
        currency: settings.currency,
        igv: String(Math.round(settings.igv_rate * 100)),
        timezone: settings.timezone,
        receipt_format: settings.receipt_format,
        notify_critical_stock: settings.notify_critical_stock,
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateSettings({
        business_name: form.business_name,
        ruc: form.ruc || null,
        phone: form.phone || null,
        address: form.address || null,
        currency: form.currency,
        igv_rate: (Number(form.igv) || 0) / 100,
        timezone: form.timezone,
        receipt_format: form.receipt_format,
        notify_critical_stock: form.notify_critical_stock,
      }),
    onSuccess: () => {
      toast.success("Configuración guardada correctamente");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo guardar la configuración"),
  });

  const handleGuardar = () => {
    if (!form.business_name) {
      toast.error("Ingresa la razón social");
      return;
    }
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Datos de la empresa y parámetros del sistema
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Datos de la empresa y parámetros del sistema
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Datos de la empresa</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Razón Social</label>
              <input
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                placeholder="Razón social"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">RUC</label>
                <input
                  value={form.ruc}
                  onChange={(e) => setForm({ ...form, ruc: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="20xxxxxxxxx"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="(01) 000-0000"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Dirección</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                placeholder="Dirección fiscal"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Parámetros del sistema</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Moneda</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                {form.currency && form.currency !== "PEN" && form.currency !== "USD" && (
                  <option value={form.currency}>{form.currency}</option>
                )}
                <option value="PEN">Soles (S/)</option>
                <option value="USD">Dólares ($)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">IGV (%)</label>
                <input
                  type="number"
                  value={form.igv}
                  onChange={(e) => setForm({ ...form, igv: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="18"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Zona horaria</label>
                <select
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                >
                  {form.timezone &&
                    form.timezone !== "America/Lima" &&
                    form.timezone !== "America/Bogota" &&
                    form.timezone !== "America/Santiago" && (
                      <option value={form.timezone}>{form.timezone}</option>
                    )}
                  <option value="America/Lima">America/Lima</option>
                  <option value="America/Bogota">America/Bogota</option>
                  <option value="America/Santiago">America/Santiago</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Formato de comprobante</label>
              <select
                value={form.receipt_format}
                onChange={(e) => setForm({ ...form, receipt_format: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                {form.receipt_format &&
                  form.receipt_format !== "B001 - Boletas" &&
                  form.receipt_format !== "F001 - Facturas" && (
                    <option value={form.receipt_format}>{form.receipt_format}</option>
                  )}
                <option value="B001 - Boletas">B001 - Boletas</option>
                <option value="F001 - Facturas">F001 - Facturas</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
              <span className="text-sm">Notificar stock crítico</span>
              <input
                type="checkbox"
                checked={form.notify_critical_stock}
                onChange={(e) => setForm({ ...form, notify_critical_stock: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 rounded-full bg-ink px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? "Guardando…" : guardado ? "Guardado" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
