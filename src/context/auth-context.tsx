import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Role, User } from "@/lib/auth";

export type LoginResult = { user: User | null; error: string | null };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed"))
    return "El correo no está confirmado. Revisa tu bandeja o confírmalo en Supabase.";
  if (lower.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (lower.includes("invalid api key") || lower.includes("failed to fetch"))
    return "No se pudo conectar con Supabase. Revisa la configuración.";
  return message;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    role: data.role,
    ...(data.avatar_url ? { avatar: data.avatar_url } : {}),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        if (active) setUser(profile);
      }
      if (active) setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return {
        user: null,
        error: translateAuthError(error?.message ?? "No se pudo iniciar sesión."),
      };
    }

    await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user.id);

    const profile = await loadProfile(data.user.id);
    if (!profile) {
      return {
        user: null,
        error: "Tu cuenta no tiene un perfil configurado. Contacta al administrador.",
      };
    }
    setUser(profile);
    return { user: profile, error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}

export function getHomeByRole(role: Role): string {
  switch (role) {
    case "administrador":
      return "/admin";
    case "vendedor":
      return "/vendedor";
    case "almacenero":
      return "/almacenero";
    case "contador":
      return "/contador";
    default:
      return "/";
  }
}
