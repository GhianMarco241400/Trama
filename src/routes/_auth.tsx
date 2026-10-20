import { createFileRoute, Outlet, redirect, useRouterState } from '@tanstack/react-router';
import { AppShell } from '@/components/layout/app-shell';
import { VendedorShell } from '@/components/layout/vendedor-shell';
import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    try {
      const raw = localStorage.getItem('trama_session');
      if (!raw) {
        throw redirect({ to: '/' });
      }
    } catch (error) {
      if (error instanceof Response) {
        throw error;
      }
      throw redirect({ to: '/' });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouterState();
  const pathname = router.location.pathname;

  useEffect(() => {
    if (!isAuthenticated && !user) {
      window.location.href = '/';
    }
  }, [isAuthenticated, user]);

  const isVendedorPOS = pathname.startsWith('/vendedor');

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
