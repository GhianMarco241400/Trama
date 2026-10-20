import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ingresar · Trama" },
      { name: "description", content: "Acceso al sistema de caja de la tienda Trama." },
      { property: "og:title", content: "Ingresar · Trama" },
      { property: "og:description", content: "Acceso al sistema de caja de la tienda Trama." },
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <div className="grid min-h-screen bg-background font-sans lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div className="absolute left-[12%] top-[10%] h-56 w-56 rounded-full bg-brand animate-floaty" />
        <div className="absolute right-[10%] top-[18%] h-40 w-80 rounded-t-full bg-sky animate-floaty [animation-delay:-2s]" />
        <div className="absolute bottom-[14%] left-[20%] h-72 w-72 rounded-full border-[28px] border-background animate-floaty [animation-delay:-4s]" />
        <div className="absolute bottom-[22%] right-[14%] flex flex-col gap-3 animate-floaty [animation-delay:-1s]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-44 rounded-full bg-brand" />
          ))}
        </div>
        <div className="absolute left-[55%] top-[48%] grid grid-cols-5 gap-4 animate-floaty [animation-delay:-3s]">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-2.5 w-2.5 rounded-full bg-sky" />
          ))}
        </div>
        <div className="absolute bottom-[6%] right-[40%] h-24 w-24 rounded-full bg-sky animate-floaty [animation-delay:-5s]" />
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-rise">
          <div className="mb-10"><Logo /></div>
          <h1 className="text-3xl font-bold text-foreground">Bienvenido de nuevo</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ingresa tus datos para abrir la caja.</p>
          <div className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Correo electrónico
              <input type="email" placeholder="vendedor@trama.pe" className="mt-1.5 w-full rounded-full border border-border bg-card px-5 py-3 text-sm outline-none focus:border-ink" />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Contraseña
              <input type="password" placeholder="••••••••" className="mt-1.5 w-full rounded-full border border-border bg-card px-5 py-3 text-sm outline-none focus:border-ink" />
            </label>
            <Link to="/vendedor" className="mt-2 block rounded-full bg-ink py-3 text-center text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-brand">
              Ingresar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
