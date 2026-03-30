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

const phoneSchema = z
  .string()
  .regex(/^\d{3}-\d{3}-\d{4}$/, "Formato requerido: 123-123-1234")
  .optional()
  .or(z.literal(""));

export const createUserSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  role: z.enum(["Admin", "Profesional", "Recepcion"], "Rol inválido"),
  phone: phoneSchema,
});

export const updateProfileSchema = z.object({
  userId: z.string().min(1),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  phone: phoneSchema,
});

export const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["Admin", "Profesional", "Recepcion"], "Rol inválido"),
});

// --- Pacientes ---

export const createPatientSchema = z.object({
  dni: z.string().regex(/^\d{7,8}$/, "DNI debe tener 7 u 8 dígitos"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  email: z.union([z.email("Email inválido"), z.literal("")]).optional(),
  phone: phoneSchema,
  birthDate: z.string().optional(),
  address: z.string().optional(),
  provinciaId: z.string().optional(),
  obraSocialId: z.string().optional(),
});

export const updatePatientSchema = z.object({
  id: z.string().min(1),
  dni: z.string().regex(/^\d{7,8}$/, "DNI debe tener 7 u 8 dígitos"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  email: z.union([z.email("Email inválido"), z.literal("")]).optional(),
  phone: phoneSchema,
  birthDate: z.string().optional(),
  address: z.string().optional(),
  provinciaId: z.string().optional(),
  obraSocialId: z.string().optional(),
});

// --- Profesionales ---

export const createProfessionalSchema = z.object({
  userId: z.string().min(1, "Debe seleccionar un usuario"),
  licenseNumber: z.string().min(1, "Matrícula requerida"),
  specialityId: z.string().min(1, "Debe seleccionar una especialidad"),
});

export const updateProfessionalSchema = z.object({
  id: z.string().min(1),
  licenseNumber: z.string().min(1, "Matrícula requerida"),
  specialityId: z.string().min(1, "Debe seleccionar una especialidad"),
});

// --- Contraseñas ---

export const forgotPasswordSchema = z.object({
  email: z.email("Email inválido"),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const adminResetPasswordSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type CreateProfessionalInput = z.infer<typeof createProfessionalSchema>;
export type UpdateProfessionalInput = z.infer<typeof updateProfessionalSchema>;
