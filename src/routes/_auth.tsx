import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { VendedorShell } from "@/components/layout/vendedor-shell";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouterState();
  const pathname = router.location.pathname;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !user) {
      window.location.href = "/";
    }
  }, [isLoading, isAuthenticated, user]);

  const isVendedorPOS = pathname.startsWith("/vendedor");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    );
  }

  if (isVendedorPOS) {
    return (
      <VendedorShell>
        <Outlet />
      </VendedorShell>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
