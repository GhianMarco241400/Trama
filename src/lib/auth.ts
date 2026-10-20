export type Role = 'administrador' | 'vendedor' | 'almacenero' | 'contador';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
};

export const MOCK_USERS: Array<User & { password: string }> = [
  { id: 'u1', name: 'Ana Torres', email: 'admin@trama.pe', password: 'admin123', role: 'administrador' },
  { id: 'u2', name: 'Lucía Quispe', email: 'vendedor@trama.pe', password: 'vendedor123', role: 'vendedor' },
  { id: 'u3', name: 'Carlos Medina', email: 'almacenero@trama.pe', password: 'almacen123', role: 'almacenero' },
  { id: 'u4', name: 'María Rojas', email: 'contador@trama.pe', password: 'conta123', role: 'contador' },
];

export const ROLE_LABELS: Record<Role, string> = {
  administrador: 'Administrador',
  vendedor: 'Vendedor(a)',
  almacenero: 'Almacenero(a)',
  contador: 'Contador(a)',
};
