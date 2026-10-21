export const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

export const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });

export const formatDateTime = (value: string | Date) =>
  new Date(value).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDateInput = (value: string | Date) => {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const IGV_RATE = 0.18;
