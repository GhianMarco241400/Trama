import type { Database } from "./database.types";

export type Role = Database["public"]["Enums"]["user_role"];

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
};

export const ROLE_LABELS: Record<Role, string> = {
  administrador: "Administrador",
  vendedor: "Vendedor(a)",
  almacenero: "Almacenero(a)",
  contador: "Contador(a)",
};

export const MOCK_CREDENTIALS = [
  {
    name: "Ana Torres",
    email: "admin@trama.pe",
    password: "admin123",
    role: "administrador" as Role,
  },
  {
    name: "Lucía Quispe",
    email: "vendedor@trama.pe",
    password: "vendedor123",
    role: "vendedor" as Role,
  },
  {
    name: "Carlos Medina",
    email: "almacenero@trama.pe",
    password: "almacen123",
    role: "almacenero" as Role,
  },
  {
    name: "María Rojas",
    email: "contador@trama.pe",
    password: "conta123",
    role: "contador" as Role,
  },
];
