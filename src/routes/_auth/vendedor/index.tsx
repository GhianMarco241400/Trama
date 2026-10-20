import { createFileRoute } from "@tanstack/react-router";
import { Shirt, Footprints, Watch, LayoutGrid, List, SlidersHorizontal, Plus, Minus, Trash2, Briefcase, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { VendedorTopbar } from "@/components/vendedor/vendedor-topbar";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_auth/vendedor/")({
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

const categorias: { n: string; i: LucideIcon; k: number; f: string }[] = [
  { n: "Polos", i: Shirt, k: 48, f: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/Dutch_flag_white_t-shirt_at_the_HEMA%2C_Winschoten_%282019%29.jpg/250px-Dutch_flag_white_t-shirt_at_the_HEMA%2C_Winschoten_%282019%29.jpg" },
  { n: "Camisas", i: Briefcase, k: 32, f: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Banana_Republic_Button-Down_Shirt_3_2019-03-21.jpg/250px-Banana_Republic_Button-Down_Shirt_3_2019-03-21.jpg" },
  { n: "Pantalones", i: Layers, k: 27, f: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Chino_pants.jpg/250px-Chino_pants.jpg" },
  { n: "Casacas", i: Shirt, k: 19, f: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Jean_jacket.jpg/250px-Jean_jacket.jpg" },
  { n: "Zapatillas", i: Footprints, k: 54, f: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/A_Vans_Sneaker_On_The_Side.jpg/250px-A_Vans_Sneaker_On_The_Side.jpg" },
  { n: "Accesorios", i: Watch, k: 23, f: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Fossil_wristwatch_with_white_background.jpg/250px-Fossil_wristwatch_with_white_background.jpg" },
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

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  size: string;
  color: string;
  colorHex: string;
  image: string;
};

const TALLAS = ["S", "M", "L", "XL"];

function Vendedor() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilter, setActiveFilter] = useState<string>("Todos");
  const [search, setSearch] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedProduct, setSelectedProduct] = useState<P | null>(null);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);
  const [comprobante, setComprobante] = useState<"boleta" | "factura">("boleta");
  const [metodoPago, setMetodoPago] = useState<string>("Efectivo");

  const filteredProducts = useMemo(() => {
    return productos.filter((p) => {
      const matchSearch = p.n.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (selectedCategory === "Todos") return true;
      if (selectedCategory === "Polos") return p.n.includes("Polo");
      if (selectedCategory === "Camisas") return p.n.includes("Camisa");
      if (selectedCategory === "Pantalones") return p.n.includes("Jean") || p.n.includes("Chino");
      if (selectedCategory === "Casacas") return p.n.includes("Casaca");
      if (selectedCategory === "Zapatillas") return p.n.includes("Zapatilla");
      if (selectedCategory === "Accesorios") return p.n.includes("Reloj");
      return true;
    });
  }, [search, selectedCategory]);

  const addToCart = (product: P) => {
    if (product.u === 0) return;
    const color = product.c[selectedColorIdx] || product.c[0];
    const id = `${product.n}-${selectedSize}-${color}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [
        ...prev,
        {
          id,
          name: product.n,
          price: product.p,
          qty: 1,
          size: selectedSize,
          color: `Color ${prev.length + 1}`,
          colorHex: color,
          image: fotos[product.n] || "",
        },
      ];
    });
  };

  const increaseQty = (id: string) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)));
  };

  const decreaseQty = (id: string) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.qty, 0), [cart]);
  const igv = useMemo(() => subtotal * 0.18, [subtotal]);
  const total = useMemo(() => subtotal + igv, [subtotal, igv]);

  const handleConfirmSale = () => {
    if (cart.length === 0) {
      alert("Agrega al menos un producto al carrito");
      return;
    }
    alert(`Venta confirmada\nComprobante: ${comprobante === "boleta" ? "Boleta" : "Factura"}\nMétodo de pago: ${metodoPago}\nTotal: ${s(total)}`);
    clearCart();
  };

  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col bg-ink md:flex">
        <div className="flex items-baseline justify-between px-5 pb-3 pt-6">
          <h2 className="text-lg font-bold text-primary-foreground">Categorías</h2>
          <span className="text-[10px] text-sky/50">{categorias.length} líneas</span>
        </div>
        <div className="flex-1 space-y-2.5 overflow-y-auto px-4 pb-5 [scrollbar-width:none]">
          <button
            onClick={() => setSelectedCategory("Todos")}
            className={`group relative w-full overflow-hidden rounded-2xl p-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${selectedCategory === "Todos" ? "bg-brand" : "bg-foreground/80 hover:bg-foreground"}`}
          >
            <div className="relative flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${selectedCategory === "Todos" ? "bg-ink/20" : "bg-ink/60"}`}>
                <LayoutGrid className={`h-5 w-5 ${selectedCategory === "Todos" ? "text-ink" : "text-primary-foreground"}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${selectedCategory === "Todos" ? "text-ink" : "text-primary-foreground"}`}>Todos</p>
                <p className={`text-[10px] ${selectedCategory === "Todos" ? "text-ink/70" : "text-sky/50"}`}>{productos.length} productos</p>
              </div>
            </div>
          </button>
          {categorias.map((c) => {
            const on = selectedCategory === c.n;
            return (
              <button
                key={c.n}
                onClick={() => setSelectedCategory(c.n)}
                className={`group relative w-full overflow-hidden rounded-2xl p-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${on ? "bg-brand" : "bg-foreground/80 hover:bg-foreground"}`}
              >
                <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full transition-transform duration-300 group-hover:scale-125 ${on ? "bg-ink/15" : "bg-sky/10"}`} />
                <div className={`absolute -bottom-3 right-6 h-8 w-8 rounded-full border-4 ${on ? "border-ink/20" : "border-sky/10"}`} />
                <div className="relative flex items-center gap-3">
                  <div className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ${on ? "ring-2 ring-ink/30" : ""}`}>
                    <img src={c.f} alt={c.n} loading="lazy" className="h-full w-full object-cover" />
                    <span className={`absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-md ${on ? "bg-ink text-brand" : "bg-ink/80 text-primary-foreground"}`}>
                      <c.i className="h-3 w-3" strokeWidth={1.8} />
                    </span>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${on ? "text-ink" : "text-primary-foreground"}`}>{c.n}</p>
                    <p className={`text-[10px] ${on ? "text-ink/70" : "text-sky/50"}`}>{c.k} productos</p>
                  </div>
                </div>
                <div className="relative mt-3 flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((d) => (
                    <span key={d} className={`h-1 flex-1 rounded-full ${d < c.k / 10 ? (on ? "bg-ink" : "bg-brand") : on ? "bg-ink/20" : "bg-sky/15"}`} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <VendedorTopbar />

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 xl:flex-row xl:overflow-hidden">
          <main className="min-w-0 flex-1 xl:overflow-y-auto xl:pr-1">
            <div className="sticky top-0 z-20 -mx-1 mb-4 flex flex-wrap items-center gap-2 bg-background px-1 pb-2">
              {["Todos", "Tendencia", "Nuevos", "Más vendidos"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${activeFilter === f ? "border-brand bg-brand text-primary-foreground" : "border-border bg-card hover:border-ink"}`}
                >
                  {f}
                </button>
              ))}
              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              <div className="ml-auto flex gap-1">
                <button onClick={() => setViewMode("grid")} className={`flex h-8 w-8 items-center justify-center rounded-full ${viewMode === "grid" ? "bg-card" : ""}`}>
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode("list")} className={`flex h-8 w-8 items-center justify-center rounded-full ${viewMode === "list" ? "bg-card" : ""}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex w-full max-w-sm items-center rounded-full border border-border bg-card px-4 py-2">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar productos por nombre" className="w-full bg-transparent text-sm outline-none" />
              </div>
              {search && (
                <button onClick={() => setSearch("")} className="rounded-full border border-border px-3 py-1.5 text-xs">
                  Limpiar
                </button>
              )}
            </div>
            <div className={viewMode === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-2"}>
              {filteredProducts.map((p) => {
                const agotado = p.u === 0;
                return (
                  <div
                    key={p.n}
                    onClick={() => {
                      if (agotado) return;
                      setSelectedProduct(p);
                      setSelectedColorIdx(0);
                    }}
                    className={`cursor-pointer rounded-2xl bg-card p-2.5 transition-shadow hover:shadow-lg ${agotado ? "opacity-50" : ""} ${viewMode === "list" ? "flex items-center gap-3" : ""}`}
                  >
                    <div className={`relative flex items-center justify-center rounded-xl bg-sky ${viewMode === "list" ? "h-20 w-20" : "h-40"}`}>
                      <span className={`absolute left-2.5 top-2.5 z-10 rounded-full px-3 py-1 text-[11px] font-medium ${agotado ? "bg-ink text-primary-foreground" : p.u <= 2 ? "bg-brand text-primary-foreground" : "bg-card"}`}>
                        {agotado ? "Agotado" : p.u <= 2 ? `Quedan ${p.u}` : `${p.u} unidades`}
                      </span>
                      <img src={fotos[p.n]} alt={p.n} loading="lazy" className="h-full w-full rounded-xl object-cover" />
                    </div>
                    <div className={`px-1.5 pb-1 pt-3 ${viewMode === "list" ? "flex flex-1 items-center justify-between pt-0" : ""}`}>
                      <div>
                        <h3 className="text-sm font-semibold">{p.n}</h3>
                        {viewMode === "grid" && (
                          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                            <span>Talla</span>
                            <span className="w-24">Color</span>
                          </div>
                        )}
                      </div>
                      <div className={`mt-3 flex items-center justify-between ${viewMode === "list" ? "mt-0 gap-6" : ""}`}>
                        <span className="text-base font-bold">{s(p.p)}</span>
                        <button
                          disabled={agotado}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (agotado) return;
                            setSelectedProduct(p);
                            setSelectedColorIdx(0);
                            setTimeout(() => addToCart(p), 0);
                          }}
                          className="flex items-center gap-0.5 transition-transform hover:scale-105 disabled:hover:scale-100"
                        >
                          <span className="rounded-full bg-brand px-3 py-1.5 text-xs text-primary-foreground">Agregar</span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-primary-foreground">
                            <Plus className="h-4 w-4" />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          <aside className="w-full shrink-0 rounded-2xl bg-card p-4 xl:w-80 xl:overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Detalle del pedido</h2>
              <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium">N° 004521</span>
            </div>
            <div className="mt-4 rounded-2xl bg-sky p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Cliente</span>
                <button className="flex items-center gap-0.5">
                  <span className="rounded-full bg-ink px-3 py-1 text-[10px] text-primary-foreground">Agregar</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-primary-foreground">
                    <Plus className="h-3 w-3" />
                  </span>
                </button>
              </div>
              <div className="mt-3 flex items-end justify-between border-t border-ink/10 pt-3">
                <div>
                  <p className="text-sm font-semibold">Cliente general</p>
                  <p className="text-[11px] text-muted-foreground">DNI —</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{cart.length}</p>
                  <p className="text-[10px] text-muted-foreground">Ítems</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <h3 className="font-semibold">Carrito</h3>
              {cart.length > 0 && (
                <button onClick={clearCart} className="rounded-full bg-background px-3 py-1 text-[10px] hover:bg-sky">
                  Vaciar
                </button>
              )}
            </div>
            {cart.length === 0 && <p className="mt-3 text-xs text-muted-foreground">Sin productos en el carrito</p>}
            {cart.map((it) => (
              <div key={it.id} className="mt-3 flex gap-3 rounded-2xl border border-border p-2.5">
                <img src={it.image} alt={it.name} className="h-20 w-20 shrink-0 rounded-xl bg-sky object-cover" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-semibold">{it.name}</p>
                    <button onClick={() => removeItem(it.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="mt-1 flex gap-1 text-[10px]">
                    <span className="rounded-full bg-background px-2 py-0.5">Talla · {it.size}</span>
                    <span className="flex items-center gap-1 rounded-full bg-background px-2 py-0.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: it.colorHex }} />
                      {it.color}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold">{s(it.price)}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => decreaseQty(it.id)} className="rounded-full border border-border p-1">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="rounded-full border border-border px-2 text-xs">{it.qty.toString().padStart(2, "0")}</span>
                      <button onClick={() => increaseQty(it.id)} className="rounded-full border border-border p-1">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4 rounded-2xl border border-border p-3">
              <h3 className="font-semibold">Resumen</h3>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">{s(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IGV (18%)</span>
                  <span className="font-semibold text-foreground">{s(igv)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-sm">
                  <span>Total</span>
                  <span className="font-bold">{s(total)}</span>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">Comprobante</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-full bg-background p-1 text-xs">
                <button onClick={() => setComprobante("boleta")} className={`rounded-full py-1.5 ${comprobante === "boleta" ? "bg-ink text-primary-foreground" : "hover:bg-card"}`}>
                  Boleta
                </button>
                <button onClick={() => setComprobante("factura")} className={`rounded-full py-1.5 ${comprobante === "factura" ? "bg-ink text-primary-foreground" : "hover:bg-card"}`}>
                  Factura
                </button>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">Método de pago</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-xs">
                {["Efectivo", "Tarjeta", "Yape / Plin", "Transferencia"].map((m) => (
                  <button key={m} onClick={() => setMetodoPago(m)} className={`rounded-full border py-2 transition-colors ${metodoPago === m ? "border-brand text-brand" : "border-border hover:border-ink"}`}>
                    {m}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-medium">
                <button className="rounded-full bg-ink py-2.5 text-primary-foreground transition-opacity hover:opacity-85">Vista previa</button>
                <button onClick={handleConfirmSale} className="rounded-full bg-brand py-2.5 text-primary-foreground transition-opacity hover:opacity-85">Confirmar venta</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
