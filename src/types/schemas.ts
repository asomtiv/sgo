import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
});

export const createUserSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  role: z.enum(["Admin", "Profesional", "Recepcion"], "Rol inválido"),
});

export const updateProfileSchema = z.object({
  userId: z.string().min(1),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  phone: z.string().optional(),
});

export const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["Admin", "Profesional", "Recepcion"], "Rol inválido"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
