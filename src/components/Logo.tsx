// Logo "Trama": un tejido de hilos entrelazados (trama y urdimbre)
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" aria-hidden>
        <rect width="40" height="40" rx="12" className="fill-brand" />
        <rect x="8" y="10" width="24" height="5" rx="2.5" className="fill-ink" />
        <rect x="8" y="25" width="24" height="5" rx="2.5" className="fill-ink" />
        <rect x="12" y="6" width="5" height="28" rx="2.5" className="fill-sky" />
        <rect x="23" y="6" width="5" height="28" rx="2.5" className="fill-sky" />
        <rect x="12" y="10" width="5" height="5" className="fill-ink" />
        <rect x="23" y="25" width="5" height="5" className="fill-ink" />
      </svg>
      <div className="leading-none">
        <span className={`block text-2xl font-extrabold tracking-tight ${dark ? "text-primary-foreground" : "text-foreground"}`}>
          trama<span className="text-brand">.</span>
        </span>
        <span className={`mt-1 block text-[9px] font-semibold uppercase tracking-[0.3em] ${dark ? "text-sky/60" : "text-muted-foreground"}`}>
          ropa & calzado
        </span>
      </div>
    </div>
  );
}
