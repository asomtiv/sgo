import type { Role, TipoAusencia, EstadoTurno, EstadoCivil } from "@/generated/prisma/client";

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
  patient: { id: string; dni: string; firstName: string; lastName: string };
  professional: {
    id: string;
    slotDuration: number;
    user: {
      profile: { firstName: string; lastName: string } | null;
      role: Role;
    };
  };
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

// --- Vista Mensual ---

export type MonthlyAppointmentCounts = Record<string, number>; // "YYYY-MM-DD" → count

export type MonthlyData = {
  counts: MonthlyAppointmentCounts;
  month: string; // "YYYY-MM"
};
