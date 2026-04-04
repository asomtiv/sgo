import type { TipoAusencia, EstadoTurno } from "@/generated/prisma/client";

export const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
] as const;

export const WORK_DAYS = DAYS_OF_WEEK.filter(
  (d) => d.value >= 1 && d.value <= 5
);

export const LEAVE_TYPE_LABELS: Record<TipoAusencia, string> = {
  Vacaciones: "Vacaciones",
  Enfermedad: "Enfermedad",
  Personal: "Personal",
  Congreso: "Congreso",
  Otro: "Otro",
};

export const SLOT_DURATION_OPTIONS = [10, 15, 20, 30, 45, 60] as const;

// --- Turnos ---

export const APPOINTMENT_STATUS_LABELS: Record<EstadoTurno, string> = {
  Pendiente: "Pendiente",
  Confirmado: "Confirmado",
  Cancelado: "Cancelado",
  Completado: "Completado",
  Ausente: "Ausente",
};

export const APPOINTMENT_STATUS_COLORS: Record<
  EstadoTurno,
  { bg: string; text: string; border: string }
> = {
  Pendiente: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-800 dark:text-amber-200",
    border: "border-amber-300 dark:border-amber-700",
  },
  Confirmado: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-200",
    border: "border-blue-300 dark:border-blue-700",
  },
  Cancelado: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-200",
    border: "border-red-300 dark:border-red-700",
  },
  Completado: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-200",
    border: "border-green-300 dark:border-green-700",
  },
  Ausente: {
    bg: "bg-gray-200 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-400 dark:border-gray-600",
  },
};

export const GRID_BASE_INTERVAL = 15;
