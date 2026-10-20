import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { MOCK_USERS, type Role, type User } from '@/lib/auth';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => User | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'trama_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
      }
    } catch (error) {
      console.error('Error al cargar sesión', error);
    }
  }, []);

  const login = (email: string, password: string): User | null => {
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!found) {
      return null;
    }

    const { password: _password, ...sessionUser } = found;
    setUser(sessionUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
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
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}

export function getHomeByRole(role: Role): string {
  switch (role) {
    case 'administrador':
      return '/admin';
    case 'vendedor':
      return '/vendedor';
    case 'almacenero':
      return '/almacenero';
    case 'contador':
      return '/contador';
    default:
      return '/';
  }
}
