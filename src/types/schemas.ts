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
  nroAfiliado: z.string().optional(),
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
  nroAfiliado: z.string().optional(),
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
  professionalId: z.string().min(1, "Profesional requerido"),
  startDateTime: z.string().min(1, "Fecha y hora requerida"),
  endDateTime: z.string().min(1, "Fecha y hora requerida"),
});

// --- Historia Clínica ---

const anamnesisSchema = z.object({
  enfermedades: z.boolean().default(false),
  enfermedadesDetalle: z.string().optional(),
  tratamientoMedico: z.boolean().default(false),
  tratamientoDetalle: z.string().optional(),
  medicamentosActuales: z.boolean().default(false),
  medicamentosActualesDetalle: z.string().optional(),
  medicamentosPasados: z.boolean().default(false),
  medicamentosPasadosDetalle: z.string().optional(),
  operaciones: z.boolean().default(false),
  operacionesDetalle: z.string().optional(),
  transfusiones: z.boolean().default(false),
  problemasRespiratorios: z.boolean().default(false),
  respiratoriosDetalle: z.string().optional(),
  cicatrizaMal: z.boolean().default(false),
  sangraMucho: z.boolean().default(false),
  problemaColageno: z.boolean().default(false),
  fiebreReumatica: z.boolean().default(false),
  fiebreReumaticaMedicacion: z.string().optional(),
  diabetes: z.boolean().default(false),
  diabetesControlada: z.boolean().default(false),
  diabetesDetalle: z.string().optional(),
  problemaCardiaco: z.boolean().default(false),
  problemaCardiacoDetalle: z.string().optional(),
  aspirinAnticoagulante: z.boolean().default(false),
  aspirinFrecuencia: z.string().optional(),
  presionAlta: z.boolean().default(false),
  chagas: z.boolean().default(false),
  chagasTratamiento: z.boolean().default(false),
  problemasRenales: z.boolean().default(false),
  ulceraGastrica: z.boolean().default(false),
  hepatitis: z.boolean().default(false),
  hepatitisTipo: z.string().optional(),
  problemaHepatico: z.boolean().default(false),
  problemaHepaticoDetalle: z.string().optional(),
  convulsionesEpilepsia: z.boolean().default(false),
  convulsionesMedicacion: z.string().optional(),
  sifilisgonorrea: z.boolean().default(false),
  otraEnfermedad: z.boolean().default(false),
  otraEnfermedadDetalle: z.string().optional(),
  tratamientoAlternativo: z.boolean().default(false),
  tratamientoAlternativoDetalle: z.string().optional(),
  medicoClinico: z.string().optional(),
  clinicaDerivacion: z.string().optional(),
  antecedentesPadre: z.string().optional(),
  antecedentesMadre: z.string().optional(),
  antecedentesHermanos: z.string().optional(),
  fuma: z.boolean().default(false),
  deporte: z.boolean().default(false),
  deporteDetalle: z.string().optional(),
  malestDeporte: z.boolean().default(false),
});

const examenClinicoSchema = z.object({
  tejidoLabios: z.string().optional(),
  tejidoLengua: z.string().optional(),
  tejidoPaladar: z.string().optional(),
  tejidoPisoBoca: z.string().optional(),
  tejidoMucosaYugal: z.string().optional(),
  tejidoCarrillos: z.string().optional(),
  tejidoRebordes: z.string().optional(),
  lesionManchas: z.boolean().default(false),
  lesionAbultamiento: z.boolean().default(false),
  lesionUlceraciones: z.boolean().default(false),
  lesionAmpollas: z.boolean().default(false),
  lesionesOtras: z.string().optional(),
  anomalias: z.boolean().default(false),
  anomaliasDetalle: z.string().optional(),
  salidaPus: z.boolean().default(false),
  salidaPusDetalle: z.string().optional(),
  movilidadDental: z.boolean().default(false),
  morderAlto: z.boolean().default(false),
  caraHinchada: z.boolean().default(false),
  caraHinchadaDetalle: z.string().optional(),
  indicePlaca: z.string().optional(),
  higieneEstado: z.enum(["MuyBueno", "Bueno", "Deficiente", "Malo"]).optional(),
  sangradoEncias: z.boolean().default(false),
  sangradoDesde: z.string().optional(),
  sarro: z.boolean().default(false),
  enfermedadPeriodontal: z.boolean().default(false),
});

const historiaOdontologicaSchema = z.object({
  motivoConsulta: z.string().optional(),
  consultoOtroProfesional: z.boolean().default(false),
  tomoMedicamentoPrevio: z.boolean().default(false),
  medicamentoPrevioNombre: z.string().optional(),
  medicamentoPrevioDesde: z.string().optional(),
  medicamentoPrevioResultado: z.boolean().default(false),
  tuvoDolor: z.boolean().default(false),
  dolorTipo: z.string().optional(),
  dolorTemporal: z.string().optional(),
  dolorModo: z.string().optional(),
  dolorEstimulo: z.string().optional(),
  dolorUbicacion: z.string().optional(),
  dolorLocalizadoDonde: z.string().optional(),
  dolorIrradiadoHacia: z.string().optional(),
  dolorCalmante: z.string().optional(),
  golpeDientes: z.boolean().default(false),
  golpeCuando: z.string().optional(),
  golpeComo: z.string().optional(),
  fracturaDiente: z.boolean().default(false),
  fracturaDetalle: z.string().optional(),
  fracturaTratamiento: z.string().optional(),
  dificultadHablar: z.string().optional(),
  dificultadMasticar: z.string().optional(),
  dificultadAbrirBoca: z.string().optional(),
  dificultadTragar: z.string().optional(),
  diagnosticoPresuntivo: z.string().optional(),
  planTratamiento: z.string().optional(),
  observaciones: z.string().optional(),
});

// --- Odontograma ---

const faceStatusSchema = z.enum(['healthy', 'decay', 'restored', 'absent']);
const toothOverlaySchema = z.enum(['none', 'extraction', 'absent', 'crown']);

const toothStateSchema = z.object({
  faces: z.record(z.string(), faceStatusSchema),
  overlay: toothOverlaySchema,
});

const prosthesisSchema = z.object({
  id: z.string(),
  teeth: z.array(z.string()),
});

export const odontogramDataSchema = z.object({
  teeth: z.record(z.string(), toothStateSchema).default({}),
  prostheses: z.array(prosthesisSchema).default([]),
});

export const updateOdontogramSchema = z.object({
  historiaClinicaId: z.string().min(1),
  odontograma: odontogramDataSchema,
});
export type UpdateOdontogramInput = z.infer<typeof updateOdontogramSchema>;

const historiaClinicaBaseSchema = z.object({
  alergias: z.boolean().default(false),
  alergiasDetalle: z.string().optional(),
  enfermedadContagiosa: z.boolean().default(false),
  contagiosaDetalle: z.string().optional(),
  embarazada: z.boolean().default(false),
  embarazadaMeses: z.string().optional(),
  anamnesis: anamnesisSchema,
  examenClinico: examenClinicoSchema,
  historiaOdontologica: historiaOdontologicaSchema,
});

export const createHistoriaClinicaSchema = historiaClinicaBaseSchema.extend({
  patientId: z.string().min(1),
});
export const updateHistoriaClinicaSchema = historiaClinicaBaseSchema.extend({
  id: z.string().min(1),
});
export type CreateHistoriaClinicaInput = z.infer<typeof createHistoriaClinicaSchema>;
export type UpdateHistoriaClinicaInput = z.infer<typeof updateHistoriaClinicaSchema>;

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

// --- Insumos ---

const categoriaProductoEnum = z.enum([
  "MaterialDental",
  "Instrumental",
  "Descartable",
  "Medicamento",
  "Otro",
]);

const unidadMedidaEnum = z.enum([
  "Unidad",
  "Caja",
  "Paquete",
  "Litro",
  "Mililitro",
  "Kilogramo",
  "Gramo",
  "Metro",
  "Rollo",
]);

const tipoMovimientoEnum = z.enum(["Entrada", "Salida", "Ajuste"]);

export const createProductoSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(200, "Nombre muy largo"),
  description: z.string().max(500).optional(),
  category: categoriaProductoEnum,
  unit: unidadMedidaEnum,
  minStock: z.coerce.number().int().min(0, "El stock mínimo no puede ser negativo"),
});

export const updateProductoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Nombre requerido").max(200, "Nombre muy largo"),
  description: z.string().max(500).optional(),
  category: categoriaProductoEnum,
  unit: unidadMedidaEnum,
  minStock: z.coerce.number().int().min(0, "El stock mínimo no puede ser negativo"),
});

export const createStockMovementSchema = z.object({
  productoId: z.string().min(1, "Producto requerido"),
  type: tipoMovimientoEnum,
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
  reason: z.string().min(1, "Motivo requerido"),
  lote: z.string().optional(),
  expirationDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type CreateProductoInput = z.infer<typeof createProductoSchema>;
export type UpdateProductoInput = z.infer<typeof updateProductoSchema>;
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
