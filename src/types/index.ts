import type {
  Role,
  TipoAusencia,
  EstadoTurno,
  EstadoCivil,
  CategoriaProducto,
  UnidadMedida,
  TipoMovimiento,
} from "@/generated/prisma/client";

export type UserWithProfile = {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  } | null;
};

export type PatientWithProvincia = {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthDate: Date | null;
  address: string | null;
  provinciaId: string | null;
  provincia: { id: string; name: string } | null;
  obraSocialId: string | null;
  obraSocial: { id: string; name: string } | null;
  nroAfiliado: string | null;
  nacionalidadId: string | null;
  nacionalidad: { id: string; name: string } | null;
  estadoCivil: EstadoCivil | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfessionalWithDetails = {
  id: string;
  licenseNumber: string;
  slotDuration: number;
  isActive: boolean;
  speciality: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    email: string;
    role: Role;
    profile: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string | null;
    } | null;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type AvailabilityBlock = {
  id: string;
  professionalId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type LeaveRecord = {
  id: string;
  professionalId: string;
  startDate: Date;
  endDate: Date;
  type: TipoAusencia;
  description: string | null;
};

export type ProfessionalAvailabilityData = {
  slotDuration: number;
  availabilities: AvailabilityBlock[];
  leaves: LeaveRecord[];
};

// --- Agenda ---

export type AppointmentWithDetails = {
  id: string;
  patientId: string;
  professionalId: string;
  startDateTime: Date;
  endDateTime: Date;
  status: EstadoTurno;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  patient: { id: string; dni: string; firstName: string; lastName: string; phone: string | null };
  professional: {
    id: string;
    slotDuration: number;
    user: {
      profile: { firstName: string; lastName: string } | null;
      role: Role;
    };
  };
  createdBy: {
    profile: { firstName: string; lastName: string } | null;
    role: Role;
  } | null;
};

export type AgendaProfessional = {
  id: string;
  slotDuration: number;
  user: {
    id: string;
    role: Role;
    profile: { firstName: string; lastName: string } | null;
  };
  speciality: { name: string };
  availabilities: AvailabilityBlock[];
  onLeave: { type: TipoAusencia; description: string | null } | null;
};

export type AgendaDayData = {
  professionals: AgendaProfessional[];
  appointments: AppointmentWithDetails[];
  date: string;
};

export type PatientSearchResult = {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
};

// --- Ficha Médica ---

export type AnamnesisData = {
  // Antecedentes generales
  enfermedades: boolean;
  enfermedadesDetalle?: string;
  tratamientoMedico: boolean;
  tratamientoDetalle?: string;
  medicamentosActuales: boolean;
  medicamentosActualesDetalle?: string;
  medicamentosPasados: boolean;
  medicamentosPasadosDetalle?: string;
  operaciones: boolean;
  operacionesDetalle?: string;
  transfusiones: boolean;
  problemasRespiratorios: boolean;
  respiratoriosDetalle?: string;
  // Cicatrización
  cicatrizaMal: boolean;
  sangraMucho: boolean;
  // Colágeno y reumatismo
  problemaColageno: boolean;
  fiebreReumatica: boolean;
  fiebreReumaticaMedicacion?: string;
  // Enfermedades específicas
  diabetes: boolean;
  diabetesControlada: boolean;
  diabetesDetalle?: string;
  problemaCardiaco: boolean;
  problemaCardiacoDetalle?: string;
  aspirinAnticoagulante: boolean;
  aspirinFrecuencia?: string;
  presionAlta: boolean;
  chagas: boolean;
  chagasTratamiento: boolean;
  problemasRenales: boolean;
  ulceraGastrica: boolean;
  hepatitis: boolean;
  hepatitisTipo?: string;
  problemaHepatico: boolean;
  problemaHepaticoDetalle?: string;
  convulsionesEpilepsia: boolean;
  convulsionesMedicacion?: string;
  sifilisgonorrea: boolean;
  otraEnfermedad: boolean;
  otraEnfermedadDetalle?: string;
  // Tratamientos alternativos y datos del médico
  tratamientoAlternativo: boolean;
  tratamientoAlternativoDetalle?: string;
  medicoClinico?: string;
  clinicaDerivacion?: string;
  // Antecedentes familiares
  antecedentesPadre?: string;
  antecedentesMadre?: string;
  antecedentesHermanos?: string;
  // Hábitos
  fuma: boolean;
  deporte: boolean;
  deporteDetalle?: string;
  malestDeporte: boolean;
};

export type ExamenClinicoData = {
  // Tejidos blandos
  tejidoLabios?: string;
  tejidoLengua?: string;
  tejidoPaladar?: string;
  tejidoPisoBoca?: string;
  tejidoMucosaYugal?: string;
  tejidoCarrillos?: string;
  tejidoRebordes?: string;
  // Lesiones
  lesionManchas: boolean;
  lesionAbultamiento: boolean;
  lesionUlceraciones: boolean;
  lesionAmpollas: boolean;
  lesionesOtras?: string;
  // Anomalías / pus
  anomalias: boolean;
  anomaliasDetalle?: string;
  salidaPus: boolean;
  salidaPusDetalle?: string;
  // Movilidad y oclusión
  movilidadDental: boolean;
  morderAlto: boolean;
  caraHinchada: boolean;
  caraHinchadaDetalle?: string;
  // Higiene y estado bucal
  indicePlaca?: string;
  higieneEstado?: "MuyBueno" | "Bueno" | "Deficiente" | "Malo";
  sangradoEncias: boolean;
  sangradoDesde?: string;
  sarro: boolean;
  enfermedadPeriodontal: boolean;
};

export type HistoriaOdontologicaData = {
  // Motivo de consulta
  motivoConsulta?: string;
  consultoOtroProfesional: boolean;
  tomoMedicamentoPrevio: boolean;
  medicamentoPrevioNombre?: string;
  medicamentoPrevioDesde?: string;
  medicamentoPrevioResultado: boolean;
  // Dolor
  tuvoDolor: boolean;
  dolorTipo?: string; // "Suave" | "Moderado" | "Intenso"
  dolorTemporal?: string; // "Temporario" | "Intermitente" | "Continuo"
  dolorModo?: string; // "Espontáneo" | "Provocado"
  dolorEstimulo?: string; // "Al frío" | "Al calor"
  dolorUbicacion?: string; // "Localizado" | "Irradiado"
  dolorLocalizadoDonde?: string;
  dolorIrradiadoHacia?: string;
  dolorCalmante?: string;
  // Traumatismos
  golpeDientes: boolean;
  golpeCuando?: string;
  golpeComo?: string;
  fracturaDiente: boolean;
  fracturaDetalle?: string;
  fracturaTratamiento?: string;
  // Función
  dificultadHablar?: string;
  dificultadMasticar?: string;
  dificultadAbrirBoca?: string;
  dificultadTragar?: string;
  // Diagnóstico y plan
  diagnosticoPresuntivo?: string;
  planTratamiento?: string;
  observaciones?: string;
};

// --- Odontograma ---

export type OdontogramFaceName = 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'oclusal';

export type OdontogramFaceStatus = 'healthy' | 'decay' | 'restored' | 'absent';

export type OdontogramToothOverlay = 'none' | 'extraction' | 'absent' | 'crown';

export type OdontogramToothState = {
  faces: Record<OdontogramFaceName, OdontogramFaceStatus>;
  overlay: OdontogramToothOverlay;
};

export type OdontogramProsthesis = {
  id: string;
  teeth: string[];
};

export type OdontogramData = {
  teeth: Record<string, OdontogramToothState>;
  prostheses: OdontogramProsthesis[];
};

export type HistoriaClinicaData = {
  id: string;
  patientId: string;
  alergias: boolean;
  alergiasDetalle: string | null;
  enfermedadContagiosa: boolean;
  contagiosaDetalle: string | null;
  embarazada: boolean;
  embarazadaMeses: string | null;
  anamnesis: AnamnesisData;
  examenClinico: ExamenClinicoData;
  historiaOdontologica: HistoriaOdontologicaData;
  odontograma: OdontogramData;
  createdAt: Date;
  updatedAt: Date;
};

export type PatientFichaData = PatientWithProvincia & {
  historiaClinica: HistoriaClinicaData | null;
};

// --- Vista Mensual ---

export type MonthlyAppointmentCounts = Record<string, number>; // "YYYY-MM-DD" → count

export type MonthlyData = {
  counts: MonthlyAppointmentCounts;
  month: string; // "YYYY-MM"
};

// --- Insumos ---

export type ProductoWithStock = {
  id: string;
  name: string;
  normalizedName: string;
  description: string | null;
  category: CategoriaProducto;
  unit: UnidadMedida;
  minStock: number;
  isActive: boolean;
  currentStock: number;
  createdAt: Date;
  updatedAt: Date;
};

export type StockMovementWithDetails = {
  id: string;
  productoId: string;
  type: TipoMovimiento;
  quantity: number;
  reason: string;
  lote: string | null;
  expirationDate: Date | null;
  notes: string | null;
  createdAt: Date;
  producto: { id: string; name: string; unit: UnidadMedida };
  createdBy: {
    profile: { firstName: string; lastName: string } | null;
  };
};

export type ProductoForSelect = {
  id: string;
  name: string;
  unit: UnidadMedida;
  isActive: boolean;
};
