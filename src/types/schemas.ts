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

const estadoCivilEnum = z.enum([
  "Soltero", "Casado", "Viudo", "Divorciado", "Convivencia", "SeparadoLegalmente",
]);

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
  nacionalidadId: z.string().optional(),
  estadoCivil: estadoCivilEnum.optional(),
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
  nacionalidadId: z.string().optional(),
  estadoCivil: estadoCivilEnum.optional(),
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

// --- Disponibilidad ---

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createAvailabilitySchema = z
  .object({
    professionalId: z.string().min(1, "Profesional requerido"),
    dayOfWeek: z.coerce.number().int().min(1).max(5, "Solo se permiten días de semana (Lunes a Viernes)"),
    startTime: z.string().regex(timeRegex, "Formato HH:mm requerido"),
    endTime: z.string().regex(timeRegex, "Formato HH:mm requerido"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "La hora de inicio debe ser anterior a la hora de fin",
    path: ["endTime"],
  });

export const updateSlotDurationSchema = z.object({
  professionalId: z.string().min(1),
  slotDuration: z.coerce
    .number()
    .int()
    .min(10, "Mínimo 10 minutos")
    .max(120, "Máximo 120 minutos"),
});

// --- Ausencias ---

export const createLeaveSchema = z
  .object({
    professionalId: z.string().min(1, "Profesional requerido"),
    startDate: z.string().min(1, "Fecha de inicio requerida"),
    endDate: z.string().min(1, "Fecha de fin requerida"),
    type: z.enum(
      ["Vacaciones", "Enfermedad", "Personal", "Congreso", "Otro"],
      "Tipo de ausencia inválido"
    ),
    description: z.string().optional(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "La fecha de inicio debe ser anterior o igual a la fecha de fin",
    path: ["endDate"],
  });

// --- Turnos ---

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Paciente requerido"),
  professionalId: z.string().min(1, "Profesional requerido"),
  startDateTime: z.string().min(1, "Fecha y hora de inicio requerida"),
  endDateTime: z.string().min(1, "Fecha y hora de fin requerida"),
  notes: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(
    ["Pendiente", "Confirmado", "Cancelado", "Completado", "Ausente"],
    "Estado inválido"
  ),
  cancellationReason: z.string().optional(),
});

export const rescheduleAppointmentSchema = z.object({
  id: z.string().min(1),
  startDateTime: z.string().min(1, "Fecha y hora requerida"),
  endDateTime: z.string().min(1, "Fecha y hora requerida"),
});

export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
export type UpdateSlotDurationInput = z.infer<typeof updateSlotDurationSchema>;
export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type CreateProfessionalInput = z.infer<typeof createProfessionalSchema>;
export type UpdateProfessionalInput = z.infer<typeof updateProfessionalSchema>;
