import { createFileRoute } from "@tanstack/react-router";
import {
  Shirt,
  Footprints,
  Watch,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Plus,
  Minus,
  Trash2,
  Briefcase,
  Layers,
  Check,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { VendedorTopbar } from "@/components/vendedor/vendedor-topbar";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listCategories, listProducts } from "@/lib/api/catalog";
import { listInventory, listWarehouses } from "@/lib/api/inventory";
import { registerSale, listCustomers, createCustomer, nextReceiptNumber } from "@/lib/api/sales";
import { listAccounts } from "@/lib/api/treasury";
import type { ProductVariant } from "@/lib/api/catalog";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/_auth/vendedor/")({
  head: () => ({
    meta: [
      { title: "Caja del vendedor · Trama" },
      {
        name: "description",
        content: "Pantalla de venta de la tienda Trama: catálogo, carrito y cobro.",
      },
      { property: "og:title", content: "Caja del vendedor · Trama" },
      { property: "og:description", content: "Pantalla de venta de la tienda Trama." },
    ],
  }),
  component: Vendedor,
});

const colorHexes = ["#1d1d1d", "#2f5d50", "#c9b99a", "#8a3b2c", "#4b6b8a", "#bfc7c9"];
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop&q=80&fm=jpg";
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  polos: Shirt,
  camisas: Briefcase,
  pantalones: Layers,
  casacas: Shirt,
  zapatillas: Footprints,
  accesorios: Watch,
};
const s = (n: number) => `S/ ${n.toFixed(2)}`;

function categoryIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Shirt;
  return CATEGORY_ICONS[name.toLowerCase()] ?? Shirt;
}

type P = {
  id: string;
  n: string;
  u: number;
  p: number;
  c: string[];
  i: LucideIcon;
  image: string;
  tag?: "tendencia" | "nuevo" | "top";
  category: string;
  variants: ProductVariant[];
};

type CartItem = {
  id: string;
  variantId: string;
  name: string;
  price: number;
  qty: number;
  size: string;
  color: string;
  colorHex: string;
  image: string;
};

function Vendedor() {
  const { user } = useAuth() as any;
  const queryClient = useQueryClient();
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
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteNombre, setClienteNombre] = useState<string>("Cliente general");
  const [clienteDoc, setClienteDoc] = useState<string>("—");
  const [nuevoCliente, setNuevoCliente] = useState({
    name: "",
    doc_number: "",
    phone: "",
    email: "",
  });
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });
  const { data: inventory = [] } = useQuery({ queryKey: ["inventory"], queryFn: listInventory });
  const { data: warehouses = [] } = useQuery({ queryKey: ["warehouses"], queryFn: listWarehouses });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: listCustomers });
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: listAccounts });

  const cashAccounts = useMemo(() => accounts.filter((a) => a.type === "caja"), [accounts]);

  const stockByVariant = useMemo(() => {
    const map = new Map<string, number>();
    inventory.forEach((row) => {
      map.set(row.variant_id, (map.get(row.variant_id) ?? 0) + row.stock);
    });
    return map;
  }, [inventory]);

  const lista = useMemo<P[]>(() => {
    return products.map((prod) => {
      const variants = prod.variants ?? [];
      const colors = Array.from(
        new Set(variants.map((v) => v.color_hex).filter((c): c is string => !!c)),
      );
      const stock = variants.reduce((acc, v) => acc + (stockByVariant.get(v.id) ?? 0), 0);
      const image = variants.find((v) => v.image_url)?.image_url ?? FALLBACK_IMG;
      return {
        id: prod.id,
        n: prod.name,
        u: stock,
        p: Number(prod.base_price) || 0,
        c: colors.length > 0 ? colors : colorHexes.slice(0, 3),
        i: categoryIcon(prod.category?.name),
        image,
        category: prod.category?.name ?? "Sin categoría",
        variants,
      };
    });
  }, [products, stockByVariant]);

  const categorias = useMemo(() => {
    return categories.map((cat) => {
      const count = lista.filter((p) => p.category === cat.name).length;
      const firstImg = lista.find((p) => p.category === cat.name)?.image ?? FALLBACK_IMG;
      return { n: cat.name, i: categoryIcon(cat.name), k: count, f: firstImg };
    });
  }, [categories, lista]);

  const filteredProducts = useMemo(() => {
    const list = lista.filter((p) => {
      const matchSearch = p.n.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (selectedCategory === "Todos") return true;
      return p.category === selectedCategory;
    });

    if (activeFilter === "Tendencia") return list.filter((p) => p.tag === "tendencia");
    if (activeFilter === "Nuevos") return list.filter((p) => p.tag === "nuevo");
    if (activeFilter === "Más vendidos") return [...list].sort((a, b) => b.u - a.u);
    return list;
  }, [lista, search, selectedCategory, activeFilter]);

  const tallas = useMemo(() => {
    const set = new Set<string>();
    lista.forEach((p) => p.variants.forEach((v) => v.size && set.add(v.size)));
    return set.size > 0 ? Array.from(set) : ["S", "M", "L", "XL"];
  }, [lista]);

  const pickVariant = (product: P, size: string, colorHex: string): ProductVariant | undefined => {
    const bySizeColor = product.variants.find(
      (v) => (v.size ?? "") === size && (v.color_hex ?? "") === colorHex,
    );
    if (bySizeColor) return bySizeColor;
    const bySize = product.variants.find((v) => (v.size ?? "") === size);
    if (bySize) return bySize;
    return product.variants.find((v) => (v.color_hex ?? "") === colorHex) ?? product.variants[0];
  };

  const addToCart = (product: P, size?: string) => {
    if (product.u === 0) return;
    const colorHex = product.c[selectedColorIdx] ?? product.c[0] ?? colorHexes[0] ?? "#1d1d1d";
    const talla = size ?? selectedSize;
    const variant = pickVariant(product, talla, colorHex);
    if (!variant) {
      toast.error("Producto sin variantes", {
        description: "Configura variantes de este producto.",
      });
      return;
    }
    const id = `${variant.id}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [
        ...prev,
        {
          id,
          variantId: variant.id,
          name: product.n,
          price: product.p,
          qty: 1,
          size: talla,
          color: variant.color_name ?? "Único",
          colorHex,
          image: variant.image_url ?? product.image,
        },
      ];
    });
    toast.success("Producto agregado", {
      description: `${product.n} · Talla ${talla} · ${s(product.p)}`,
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

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cart],
  );
  const igv = useMemo(() => subtotal * 0.18, [subtotal]);
  const total = useMemo(() => subtotal + igv, [subtotal, igv]);

  const paymentMethodMap: Record<string, string> = {
    Efectivo: "efectivo",
    Tarjeta: "tarjeta",
    "Yape / Plin": "yape_plin",
    Transferencia: "transferencia",
  };

  const saleMutation = useMutation({
    mutationFn: async () => {
      const receiptNumber = await nextReceiptNumber(comprobante);
      return registerSale({
        customerId: clienteId,
        sellerId: user?.id ?? null,
        warehouseId: warehouseId || warehouses[0]?.id || null,
        receiptType: comprobante,
        receiptNumber,
        paymentMethod: paymentMethodMap[metodoPago] as any,
        items: cart.map((item) => ({
          variant_id: item.variantId,
          quantity: item.qty,
          unit_price: item.price,
        })),
        accountId: metodoPago === "Efectivo" ? accountId || cashAccounts[0]?.id || null : null,
      });
    },
    onSuccess: () => {
      toast.success("Venta confirmada", {
        description: `${comprobante === "boleta" ? "Boleta" : "Factura"} · ${metodoPago} · ${s(total)}`,
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      queryClient.invalidateQueries({ queryKey: ["account-movements"] });
      clearCart();
      setClienteId(null);
      setClienteNombre("Cliente general");
      setClienteDoc("—");
    },
    onError: (err: any) => {
      toast.error("No se pudo registrar la venta", {
        description: err?.message ?? "Intenta nuevamente.",
      });
    },
  });

  const clienteMutation = useMutation({
    mutationFn: () =>
      createCustomer({
        doc_type: nuevoCliente.doc_number.length === 11 ? "ruc" : "dni",
        doc_number: nuevoCliente.doc_number,
        name: nuevoCliente.name,
        phone: nuevoCliente.phone || null,
        email: nuevoCliente.email || null,
      } as any),
    onSuccess: (data: any) => {
      toast.success("Cliente creado");
      setClienteId(data.id);
      setClienteNombre(data.name);
      setClienteDoc(data.doc_number ?? "—");
      setShowClienteModal(false);
      setNuevoCliente({ name: "", doc_number: "", phone: "", email: "" });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err: any) =>
      toast.error("No se pudo crear el cliente", { description: err?.message }),
  });

  const handleConfirmSale = () => {
    if (cart.length === 0) {
      toast.error("Carrito vacío", {
        description: "Agrega al menos un producto antes de confirmar la venta.",
      });
      return;
    }
    saleMutation.mutate();
  };

  const selectCliente = (c: any) => {
    setClienteId(c.id);
    setClienteNombre(c.name);
    setClienteDoc(c.doc_number ?? "—");
    setShowClienteModal(false);
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
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${selectedCategory === "Todos" ? "bg-ink/20" : "bg-ink/60"}`}
              >
                <LayoutGrid
                  className={`h-5 w-5 ${selectedCategory === "Todos" ? "text-ink" : "text-primary-foreground"}`}
                />
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${selectedCategory === "Todos" ? "text-ink" : "text-primary-foreground"}`}
                >
                  Todos
                </p>
                <p
                  className={`text-[10px] ${selectedCategory === "Todos" ? "text-ink/70" : "text-sky/50"}`}
                >
                  {lista.length} productos
                </p>
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
                <div
                  className={`absolute -right-6 -top-6 h-20 w-20 rounded-full transition-transform duration-300 group-hover:scale-125 ${on ? "bg-ink/15" : "bg-sky/10"}`}
                />
                <div
                  className={`absolute -bottom-3 right-6 h-8 w-8 rounded-full border-4 ${on ? "border-ink/20" : "border-sky/10"}`}
                />
                <div className="relative flex items-center gap-3">
                  <div
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ${on ? "ring-2 ring-ink/30" : ""}`}
                  >
                    <img
                      src={c.f}
                      alt={c.n}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-md ${on ? "bg-ink text-brand" : "bg-ink/80 text-primary-foreground"}`}
                    >
                      <c.i className="h-3 w-3" strokeWidth={1.8} />
                    </span>
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${on ? "text-ink" : "text-primary-foreground"}`}
                    >
                      {c.n}
                    </p>
                    <p className={`text-[10px] ${on ? "text-ink/70" : "text-sky/50"}`}>
                      {c.k} productos
                    </p>
                  </div>
                </div>
                <div className="relative mt-3 flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((d) => (
                    <span
                      key={d}
                      className={`h-1 flex-1 rounded-full ${d < c.k ? (on ? "bg-ink" : "bg-brand") : on ? "bg-ink/20" : "bg-sky/15"}`}
                    />
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
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${viewMode === "grid" ? "bg-card" : ""}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${viewMode === "list" ? "bg-card" : ""}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex w-full max-w-sm items-center rounded-full border border-border bg-card px-4 py-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar productos por nombre"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="rounded-full border border-border px-3 py-1.5 text-xs"
                >
                  Limpiar
                </button>
              )}
            </div>
            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
                <p className="text-sm text-muted-foreground">Cargando catálogo…</p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
                    : "flex flex-col gap-2"
                }
              >
                {filteredProducts.map((p) => {
                  const agotado = p.u === 0;
                  if (viewMode === "list") {
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (agotado) return;
                          setSelectedProduct(p);
                          setSelectedColorIdx(0);
                        }}
                        className={`group flex cursor-pointer items-center gap-4 rounded-2xl bg-card p-3 transition-shadow hover:shadow-lg ${agotado ? "opacity-50" : ""}`}
                      >
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sky">
                          <img
                            src={p.image}
                            alt={p.n}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_IMG;
                            }}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-semibold">{p.n}</h3>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${agotado ? "bg-ink text-primary-foreground" : p.u <= 2 ? "bg-brand text-primary-foreground" : "bg-sky"}`}
                            >
                              {agotado ? "Agotado" : p.u <= 2 ? `Quedan ${p.u}` : `${p.u} unidades`}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-1">
                            {p.c.map((hex, idx) => (
                              <span
                                key={hex}
                                className="h-4 w-4 rounded-full border border-border"
                                style={{ background: hex }}
                                title={`Color ${idx + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">{s(p.p)}</span>
                          <button
                            disabled={agotado}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(p);
                            }}
                            className="flex items-center gap-0.5 transition-transform hover:scale-105 disabled:hover:scale-100"
                          >
                            <span className="rounded-full bg-brand px-3 py-1.5 text-xs text-primary-foreground">
                              Agregar
                            </span>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-primary-foreground">
                              <Plus className="h-4 w-4" />
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (agotado) return;
                        setSelectedProduct(p);
                        setSelectedColorIdx(0);
                      }}
                      className={`group cursor-pointer overflow-hidden rounded-2xl bg-card p-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${agotado ? "opacity-50" : ""}`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-sky">
                        <span
                          className={`absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-medium ${agotado ? "bg-ink text-primary-foreground" : p.u <= 2 ? "bg-brand text-primary-foreground" : "bg-card"}`}
                        >
                          {agotado ? "Agotado" : p.u <= 2 ? `Quedan ${p.u}` : `${p.u} unid.`}
                        </span>
                        {p.tag === "nuevo" && !agotado && (
                          <span className="absolute right-2 top-2 z-10 rounded-full bg-ink px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground">
                            Nuevo
                          </span>
                        )}
                        <img
                          src={p.image}
                          alt={p.n}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMG;
                          }}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {!agotado && (
                          <div className="absolute inset-x-2 bottom-2 z-10 flex translate-y-3 items-center justify-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <span className="rounded-full bg-ink/90 px-2.5 py-1 text-[10px] text-primary-foreground backdrop-blur">
                              Ver detalles
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="px-1 pb-0.5 pt-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-semibold leading-tight">{p.n}</h3>
                          <span className="shrink-0 text-sm font-bold">{s(p.p)}</span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {p.c.map((hex, idx) => (
                              <button
                                key={hex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(p);
                                  setSelectedColorIdx(idx);
                                }}
                                className="h-3.5 w-3.5 rounded-full border border-border transition-transform hover:scale-125"
                                style={{ background: hex }}
                                title={`Color ${idx + 1}`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-0.5">
                            {tallas.map((t) => (
                              <button
                                key={t}
                                disabled={agotado}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSize(t);
                                }}
                                className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-medium transition-colors ${selectedSize === t ? "bg-ink text-primary-foreground" : "bg-sky hover:bg-brand/20"} disabled:opacity-40`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <button
                            disabled={agotado}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(p);
                            }}
                            className="flex flex-1 items-center justify-center gap-1 rounded-full bg-brand py-1.5 text-[11px] font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                          >
                            <Plus className="h-3 w-3" />
                            Agregar
                          </button>
                          <button
                            disabled={agotado}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(p);
                              setSelectedColorIdx(0);
                            }}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:bg-sky disabled:opacity-40"
                            title="Ver tallas y detalles"
                          >
                            <Search className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!loadingProducts && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Sin resultados</p>
                  <p className="text-sm text-muted-foreground">
                    No encontramos productos para “{search || selectedCategory}”.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("Todos");
                    setActiveFilter("Todos");
                  }}
                  className="rounded-full bg-ink px-4 py-2 text-sm text-primary-foreground"
                >
                  Ver todo el catálogo
                </button>
              </div>
            )}
          </main>

          <aside className="w-full shrink-0 rounded-2xl bg-card p-4 xl:w-80 xl:overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Detalle del pedido</h2>
              <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium">
                N° 004521
              </span>
            </div>
            <div className="mt-4 rounded-2xl bg-sky p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Cliente</span>
                <button
                  onClick={() => setShowClienteModal(true)}
                  className="flex items-center gap-0.5"
                >
                  <span className="rounded-full bg-ink px-3 py-1 text-[10px] text-primary-foreground">
                    Agregar
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-primary-foreground">
                    <Plus className="h-3 w-3" />
                  </span>
                </button>
              </div>
              <div className="mt-3 flex items-end justify-between border-t border-ink/10 pt-3">
                <div>
                  <p className="text-sm font-semibold">{clienteNombre}</p>
                  <p className="text-[11px] text-muted-foreground">DNI {clienteDoc}</p>
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
                <button
                  onClick={clearCart}
                  className="rounded-full bg-background px-3 py-1 text-[10px] hover:bg-sky"
                >
                  Vaciar
                </button>
              )}
            </div>
            {cart.length === 0 && (
              <p className="mt-3 text-xs text-muted-foreground">Sin productos en el carrito</p>
            )}
            {cart.map((it) => (
              <div key={it.id} className="mt-3 flex gap-3 rounded-2xl border border-border p-2.5">
                <img
                  src={it.image}
                  alt={it.name}
                  className="h-20 w-20 shrink-0 rounded-xl bg-sky object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-semibold">{it.name}</p>
                    <button onClick={() => removeItem(it.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="mt-1 flex gap-1 text-[10px]">
                    <span className="rounded-full bg-background px-2 py-0.5">
                      Talla · {it.size}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-background px-2 py-0.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: it.colorHex }} />
                      {it.color}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold">{s(it.price)}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => decreaseQty(it.id)}
                        className="rounded-full border border-border p-1"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="rounded-full border border-border px-2 text-xs">
                        {it.qty.toString().padStart(2, "0")}
                      </span>
                      <button
                        onClick={() => increaseQty(it.id)}
                        className="rounded-full border border-border p-1"
                      >
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
                <button
                  onClick={() => setComprobante("boleta")}
                  className={`rounded-full py-1.5 ${comprobante === "boleta" ? "bg-ink text-primary-foreground" : "hover:bg-card"}`}
                >
                  Boleta
                </button>
                <button
                  onClick={() => setComprobante("factura")}
                  className={`rounded-full py-1.5 ${comprobante === "factura" ? "bg-ink text-primary-foreground" : "hover:bg-card"}`}
                >
                  Factura
                </button>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">Método de pago</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-xs">
                {["Efectivo", "Tarjeta", "Yape / Plin", "Transferencia"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetodoPago(m)}
                    className={`rounded-full border py-2 transition-colors ${metodoPago === m ? "border-brand text-brand" : "border-border hover:border-ink"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {metodoPago === "Efectivo" && cashAccounts.length > 0 && (
                <>
                  <p className="mt-4 text-[11px] text-muted-foreground">Caja</p>
                  <select
                    value={accountId || cashAccounts[0]?.id}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="mt-1.5 w-full rounded-full border border-border bg-background px-3 py-2 text-xs"
                  >
                    {cashAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <p className="mt-4 text-[11px] text-muted-foreground">Almacén</p>
              <select
                value={warehouseId || warehouses[0]?.id}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="mt-1.5 w-full rounded-full border border-border bg-background px-3 py-2 text-xs"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-medium">
                <button className="rounded-full bg-ink py-2.5 text-primary-foreground transition-opacity hover:opacity-85">
                  Vista previa
                </button>
                <button
                  onClick={handleConfirmSale}
                  disabled={saleMutation.isPending}
                  className="rounded-full bg-brand py-2.5 text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {saleMutation.isPending ? "Procesando…" : "Confirmar venta"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-3xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid gap-0 sm:grid-cols-2">
              <div className="relative aspect-[4/5] bg-sky">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.n}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                  className="h-full w-full object-cover"
                />
                {selectedProduct.tag === "nuevo" && (
                  <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                    Nuevo
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{selectedProduct.n}</h2>
                    <p className="mt-1 text-2xl font-extrabold text-brand">
                      {s(selectedProduct.p)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted-foreground hover:bg-sky"
                  >
                    ×
                  </button>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-[11px] font-medium ${selectedProduct.u === 0 ? "bg-ink text-primary-foreground" : selectedProduct.u <= 2 ? "bg-brand text-primary-foreground" : "bg-sky"}`}
                >
                  {selectedProduct.u === 0
                    ? "Agotado"
                    : selectedProduct.u <= 2
                      ? `Quedan ${selectedProduct.u} unidades`
                      : `${selectedProduct.u} unidades disponibles`}
                </span>
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Color</p>
                  <div className="flex items-center gap-2">
                    {selectedProduct.c.map((hex, idx) => (
                      <button
                        key={hex}
                        onClick={() => setSelectedColorIdx(idx)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${selectedColorIdx === idx ? "border-ink" : "border-border"}`}
                        style={{ background: hex }}
                      >
                        {selectedColorIdx === idx && (
                          <Check className="h-4 w-4 text-primary-foreground mix-blend-difference" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Talla</p>
                  <div className="flex flex-wrap gap-2">
                    {tallas.map((t) => (
                      <button
                        key={t}
                        disabled={selectedProduct.u === 0}
                        onClick={() => setSelectedSize(t)}
                        className={`h-9 w-11 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${selectedSize === t ? "bg-ink text-primary-foreground" : "bg-sky hover:bg-brand/20"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  disabled={selectedProduct.u === 0}
                  onClick={() => {
                    addToCart(selectedProduct, selectedSize);
                    setSelectedProduct(null);
                  }}
                  className="mt-auto flex items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showClienteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={() => setShowClienteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Cliente</h2>
            <div className="mt-3 max-h-40 space-y-1 overflow-y-auto">
              {customers.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => selectCliente(c)}
                  className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-left text-sm hover:bg-sky"
                >
                  <span>{c.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{c.doc_number}</span>
                </button>
              ))}
              {customers.length === 0 && (
                <p className="text-xs text-muted-foreground">Sin clientes registrados.</p>
              )}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-sm font-medium">Nuevo cliente</p>
              <div className="space-y-2">
                <input
                  value={nuevoCliente.name}
                  onChange={(e) => setNuevoCliente((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Nombre / Razón social"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                />
                <input
                  value={nuevoCliente.doc_number}
                  onChange={(e) => setNuevoCliente((p) => ({ ...p, doc_number: e.target.value }))}
                  placeholder="DNI / RUC"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                />
                <input
                  value={nuevoCliente.phone}
                  onChange={(e) => setNuevoCliente((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Teléfono"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                />
              </div>
              <button
                disabled={
                  !nuevoCliente.name || !nuevoCliente.doc_number || clienteMutation.isPending
                }
                onClick={() => clienteMutation.mutate()}
                className="mt-3 w-full rounded-full bg-brand py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                {clienteMutation.isPending ? "Guardando…" : "Guardar y usar"}
              </button>
            </div>
            <button
              onClick={() => setShowClienteModal(false)}
              className="mt-3 w-full rounded-full border border-border py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
