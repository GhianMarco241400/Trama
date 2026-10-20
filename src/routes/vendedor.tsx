import { createFileRoute } from "@tanstack/react-router";
import {
  Search, Printer, BarChart3, Bell, Settings, Maximize, ChevronsUpDown, Shirt, Footprints, Watch,
  LayoutGrid, List, SlidersHorizontal, Plus, Minus, Trash2, Briefcase, Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/vendedor")({
  head: () => ({
    meta: [
      { title: "Caja del vendedor · Trama" },
      { name: "description", content: "Pantalla de venta de la tienda Trama: catálogo, carrito y cobro." },
      { property: "og:title", content: "Caja del vendedor · Trama" },
      { property: "og:description", content: "Pantalla de venta de la tienda Trama." },
    ],
  }),
  component: Vendedor,
});

const categorias: { n: string; i: LucideIcon }[] = [
  { n: "Polos", i: Shirt }, { n: "Camisas", i: Briefcase }, { n: "Pantalones", i: Layers },
  { n: "Casacas", i: Shirt }, { n: "Zapatillas", i: Footprints }, { n: "Accesorios", i: Watch },
];

const colores = ["#1d1d1d", "#2f5d50", "#c9b99a", "#8a3b2c", "#4b6b8a", "#bfc7c9"];

type P = { n: string; u: number; p: number; c: string[]; i: LucideIcon };
const productos: P[] = [
  { n: "Polo Básico Algodón", u: 26, p: 49.9, c: colores.slice(0, 4), i: Shirt },
  { n: "Camisa Oxford Lino", u: 14, p: 119.9, c: colores.slice(1, 5), i: Briefcase },
  { n: "Jean Recto Índigo", u: 0, p: 159.9, c: colores.slice(3, 6), i: Layers },
  { n: "Casaca Denim Clásica", u: 2, p: 219.9, c: colores.slice(0, 3), i: Shirt },
  { n: "Zapatilla Urbana Trama", u: 31, p: 249.9, c: colores.slice(2, 6), i: Footprints },
  { n: "Polo Oversize Rayas", u: 18, p: 69.9, c: colores.slice(0, 4), i: Shirt },
  { n: "Chino Slim Arena", u: 22, p: 139.9, c: colores.slice(1, 4), i: Layers },
  { n: "Reloj Minimal Negro", u: 2, p: 189.9, c: colores.slice(0, 2), i: Watch },
  { n: "Camisa Cuadros Franela", u: 0, p: 109.9, c: colores.slice(2, 5), i: Briefcase },
  { n: "Zapatilla Runner Lite", u: 40, p: 279.9, c: colores.slice(3, 6), i: Footprints },
  { n: "Casaca Cortaviento", u: 12, p: 199.9, c: colores.slice(0, 4), i: Shirt },
  { n: "Zapatilla Trail Pro", u: 28, p: 79.9, c: colores.slice(1, 5), i: Shirt },
];

const fotos: Record<string, string> = {
  "Polo Básico Algodón": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/Dutch_flag_white_t-shirt_at_the_HEMA%2C_Winschoten_%282019%29.jpg/500px-Dutch_flag_white_t-shirt_at_the_HEMA%2C_Winschoten_%282019%29.jpg",
  "Camisa Oxford Lino": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Banana_Republic_Button-Down_Shirt_3_2019-03-21.jpg/500px-Banana_Republic_Button-Down_Shirt_3_2019-03-21.jpg",
  "Jean Recto Índigo": "https://upload.wikimedia.org/wikipedia/commons/5/54/High_waisted_jeans_1435042736.jpg",
  "Casaca Denim Clásica": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Jean_jacket.jpg/500px-Jean_jacket.jpg",
  "Zapatilla Urbana Trama": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/A_Vans_Sneaker_On_The_Side.jpg/500px-A_Vans_Sneaker_On_The_Side.jpg",
  "Polo Oversize Rayas": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Banana_Republic_Button-Down_Shirt_4_2019-03-21.jpg/500px-Banana_Republic_Button-Down_Shirt_4_2019-03-21.jpg",
  "Chino Slim Arena": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Chino_pants.jpg/500px-Chino_pants.jpg",
  "Reloj Minimal Negro": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Fossil_wristwatch_with_white_background.jpg/500px-Fossil_wristwatch_with_white_background.jpg",
  "Camisa Cuadros Franela": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Flannel_Shirt_For_Abi.jpg/500px-Flannel_Shirt_For_Abi.jpg",
  "Zapatilla Runner Lite": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Asics_Gel-Cumulus_22.jpg/500px-Asics_Gel-Cumulus_22.jpg",
  "Casaca Cortaviento": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Denim_jacket_details.jpg/500px-Denim_jacket_details.jpg",
  "Zapatilla Trail Pro": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Brooks_Ghost_14_GTX.jpg/500px-Brooks_Ghost_14_GTX.jpg",
};
const s = (n: number) => `S/ ${n.toFixed(2)}`;
const iconBtn = "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-ink hover:text-primary-foreground";

function Vendedor() {
  const subtotal = 249.9 + 119.9 * 2;
  const igv = subtotal * 0.18;
  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <aside className="hidden w-48 shrink-0 bg-ink p-4 md:block">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-extrabold text-primary-foreground">T</div>
          <span className="text-xl font-extrabold text-primary-foreground">Trama</span>
        </div>
        <h2 className="mb-3 text-lg font-bold text-primary-foreground">Categorías</h2>
        <div className="space-y-3">
          {categorias.map((c, i) => (
            <button key={c.n} className={`group w-full rounded-2xl border-4 p-1.5 transition-colors ${i === 0 ? "border-sky bg-sky" : "border-foreground/80 bg-foreground/90 hover:border-brand"}`}>
              <div className="flex h-20 items-center justify-center rounded-xl bg-ink">
                <c.i className="h-10 w-10 text-sky" strokeWidth={1.4} />
              </div>
              <p className={`py-1.5 text-xs font-medium ${i === 0 ? "text-ink" : "text-primary-foreground"}`}>{c.n}</p>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-2.5">
          <div className="flex w-full max-w-xs items-center rounded-full border border-border px-4 py-2">
            <input placeholder="Buscar productos" className="w-full bg-transparent text-sm outline-none" />
            <Search className="h-4 w-4" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {[Printer, BarChart3, Bell, Settings, Maximize].map((I, i) => (
              <button key={i} className={`${iconBtn} hidden sm:flex`}><I className="h-4 w-4" /></button>
            ))}
            <div className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-primary-foreground">LQ</div>
              <div className="leading-tight">
                <p className="text-xs font-semibold">Lucía Quispe</p>
                <p className="text-[10px] text-muted-foreground">Vendedora</p>
              </div>
            </div>
            <button className={iconBtn}><ChevronsUpDown className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 xl:flex-row">
          <main className="min-w-0 flex-1">
            <div className="mb-4 flex items-center gap-2">
              {["Todos", "Tendencia", "Nuevos", "Más vendidos"].map((f, i) => (
                <button key={f} className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${i === 1 ? "border-brand bg-brand text-primary-foreground" : "border-border bg-card hover:border-ink"}`}>{f}</button>
              ))}
              <button className={iconBtn}><SlidersHorizontal className="h-4 w-4" /></button>
              <div className="ml-auto flex gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-card"><LayoutGrid className="h-4 w-4" /></button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full"><List className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {productos.map((p) => {
                const agotado = p.u === 0;
                return (
                  <div key={p.n} className={`rounded-2xl bg-card p-2.5 transition-shadow hover:shadow-lg ${agotado ? "opacity-50" : ""}`}>
                    <div className="relative flex h-40 items-center justify-center rounded-xl bg-sky">
                      <span className={`absolute left-2.5 top-2.5 z-10 rounded-full px-3 py-1 text-[11px] font-medium ${agotado ? "bg-ink text-primary-foreground" : p.u <= 2 ? "bg-brand text-primary-foreground" : "bg-card"}`}>
                        {agotado ? "Agotado" : p.u <= 2 ? `Quedan ${p.u}` : `${p.u} unidades`}
                      </span>
                      <img src={fotos[p.n]} alt={p.n} loading="lazy" className="h-full w-full rounded-xl object-cover" />
                    </div>
                    <div className="px-1.5 pb-1 pt-3">
                      <h3 className="text-sm font-semibold">{p.n}</h3>
                      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                        <span>Talla</span><span className="w-24">Color</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex gap-1">
                          {["S", "M", "L", "XL"].map((t) => (
                            <span key={t} className="flex h-6 min-w-6 items-center justify-center rounded-full bg-background px-1 text-[10px]">{t}</span>
                          ))}
                        </div>
                        <div className="flex w-24 gap-1">
                          {p.c.map((c) => <span key={c} className="h-5 w-5 rounded-full" style={{ background: c }} />)}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-base font-bold">{s(p.p)}</span>
                        <button disabled={agotado} className="flex items-center gap-0.5 transition-transform hover:scale-105 disabled:hover:scale-100">
                          <span className="rounded-full bg-brand px-3 py-1.5 text-xs text-primary-foreground">Agregar</span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-primary-foreground"><Plus className="h-4 w-4" /></span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          <aside className="w-full shrink-0 self-start rounded-2xl bg-card p-4 xl:w-80">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Detalle del pedido</h2>
              <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium">N° 004521</span>
            </div>
            <div className="mt-4 rounded-2xl bg-sky p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Cliente</span>
                <button className="flex items-center gap-0.5"><span className="rounded-full bg-ink px-3 py-1 text-[10px] text-primary-foreground">Agregar</span><span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-primary-foreground"><Plus className="h-3 w-3" /></span></button>
              </div>
              <div className="mt-3 flex items-end justify-between border-t border-ink/10 pt-3">
                <div><p className="text-sm font-semibold">Cliente general</p><p className="text-[11px] text-muted-foreground">DNI —</p></div>
                <div className="text-right"><p className="font-semibold">0</p><p className="text-[10px] text-muted-foreground">Compras</p></div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <h3 className="font-semibold">Carrito</h3>
              <button className="rounded-full bg-background px-3 py-1 text-[10px] hover:bg-sky">Vaciar</button>
            </div>
            {[{ n: "Zapatilla Urbana Trama", t: "42", c: "Arena", p: 249.9, q: 1, i: Footprints, h: "#c9b99a" }, { n: "Camisa Oxford Lino", t: "M", c: "Verde", p: 119.9, q: 2, i: Briefcase, h: "#2f5d50" }].map((it) => (
              <div key={it.n} className="mt-3 flex gap-3 rounded-2xl border border-border p-2.5">
                <img src={fotos[it.n]} alt={it.n} className="h-20 w-20 shrink-0 rounded-xl bg-sky object-cover" />
                <div className="flex-1">
                  <div className="flex justify-between"><p className="text-sm font-semibold">{it.n}</p><Trash2 className="h-4 w-4 text-muted-foreground" /></div>
                  <div className="mt-1 flex gap-1 text-[10px]">
                    <span className="rounded-full bg-background px-2 py-0.5">Talla · {it.t}</span>
                    <span className="flex items-center gap-1 rounded-full bg-background px-2 py-0.5"><span className="h-2 w-2 rounded-full" style={{ background: it.h }} />{it.c}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold">{s(it.p)}</span>
                    <div className="flex items-center gap-1.5"><Minus className="h-3.5 w-3.5" /><span className="rounded-full border border-border px-2 text-xs">0{it.q}</span><Plus className="h-3.5 w-3.5" /></div>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4 rounded-2xl border border-border p-3">
              <h3 className="font-semibold">Resumen</h3>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="font-semibold text-foreground">{s(subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>IGV (18%)</span><span className="font-semibold text-foreground">{s(igv)}</span></div>
                <div className="flex justify-between border-t border-border pt-2 text-sm"><span>Total</span><span className="font-bold">{s(subtotal + igv)}</span></div>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">Comprobante</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-full bg-background p-1 text-xs">
                <button className="rounded-full bg-ink py-1.5 text-primary-foreground">Boleta</button>
                <button className="rounded-full py-1.5 hover:bg-card">Factura</button>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">Método de pago</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-xs">
                {["Efectivo", "Tarjeta", "Yape / Plin", "Transferencia"].map((m, i) => (
                  <button key={m} className={`rounded-full border py-2 transition-colors ${i === 0 ? "border-brand text-brand" : "border-border hover:border-ink"}`}>{m}</button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-medium">
                <button className="rounded-full bg-ink py-2.5 text-primary-foreground transition-opacity hover:opacity-85">Vista previa de boleta</button>
                <button className="rounded-full bg-brand py-2.5 text-primary-foreground transition-opacity hover:opacity-85">Confirmar venta</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
