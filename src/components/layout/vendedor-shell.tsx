import type { ReactNode } from "react";

export function VendedorShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      {children}
    </div>
  );
}
