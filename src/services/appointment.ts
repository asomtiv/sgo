"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  rescheduleAppointmentSchema,
} from "@/types/schemas";
import { checkProfessionalAvailability } from "@/services/availability-check";
import { getCurrentUser } from "@/services/user";
import { dayStartEnd } from "@/lib/timezone";
import type { Role } from "@/generated/prisma/client";
import type {
  AgendaDayData,
  AgendaProfessional,
  PatientSearchResult,
  MonthlyAppointmentCounts,
} from "@/types";

// --- Read functions ---

export async function getActiveProfessionals() {
  return prisma.professional.findMany({
    where: { isActive: true },
    select: {
      id: true,
      slotDuration: true,
      user: { select: { profile: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { user: { profile: { lastName: "asc" } } },
  });
}

export async function getAgendaData(
  date: string,
  professionalId?: string
): Promise<AgendaDayData> {
  const { start, end } = dayStartEnd(date);
  const dayOfWeek = new Date(date + "T12:00:00").getDay();

  const professionals = await prisma.professional.findMany({
    where: {
      isActive: true,
      ...(professionalId ? { id: professionalId } : {}),
    },
    include: {
      user: { include: { profile: true } },
      speciality: true,
      availabilities: { where: { dayOfWeek } },
      leaves: {
        where: { startDate: { lte: end }, endDate: { gte: start } },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Only show professionals that have availability for this day or are on leave.
  // Leaves on weekends are ignored since no appointments are scheduled on those days.
  const filtered = professionals.filter(
    (p) => p.availabilities.length > 0 || (!isWeekend && p.leaves.length > 0)
  );

  const agendaProfessionals: AgendaProfessional[] = filtered.map((p) => ({
    id: p.id,
    slotDuration: p.slotDuration,
    user: {
      id: p.userId,
      role: "Profesional" as Role,
      profile: p.user.profile
        ? {
            firstName: p.user.profile.firstName,
            lastName: p.user.profile.lastName,
          }
        : null,
    },
    speciality: { name: p.speciality.name },
    availabilities: p.availabilities.map((a) => ({
      id: a.id,
      professionalId: a.professionalId,
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
    onLeave:
      p.leaves.length > 0
        ? { type: p.leaves[0].type, description: p.leaves[0].description }
        : null,
  }));

  const professionalIds = filtered.map((p) => p.id);

  const appointments =
    professionalIds.length > 0
      ? await prisma.appointment.findMany({
          where: {
            professionalId: { in: professionalIds },
            startDateTime: { gte: start },
            endDateTime: { lte: end },
            status: { not: "Cancelado" },
          },
          include: {
            patient: {
              select: {
                id: true,
                dni: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            professional: {
              select: {
                id: true,
                slotDuration: true,
                user: {
                  select: {
                    role: true,
                    profile: {
                      select: { firstName: true, lastName: true },
                    },
                  },
                },
              },
            },
            createdBy: {
              select: {
                role: true,
                profile: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
          orderBy: { startDateTime: "asc" },
        })
      : [];

  return { professionals: agendaProfessionals, appointments, date };
}

export async function searchPatients(
  query: string
): Promise<PatientSearchResult[]> {
  if (!query || query.length < 2) return [];

  return prisma.patient.findMany({
    where: {
      OR: [
        { dni: { contains: query } },
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, dni: true, firstName: true, lastName: true },
    take: 10,
    orderBy: { lastName: "asc" },
  });
}

export async function getMonthlyAppointmentCounts(
  month: string,
  professionalId?: string
): Promise<MonthlyAppointmentCounts> {
  const [year, mon] = month.split("-").map(Number);
  const start = new Date(`${month}-01T00:00:00-03:00`);
  const nextMonth =
    mon === 12
      ? `${year + 1}-01`
      : `${year}-${String(mon + 1).padStart(2, "0")}`;
  const end = new Date(
    new Date(`${nextMonth}-01T00:00:00-03:00`).getTime() - 1
  );

  const appointments = await prisma.appointment.findMany({
    where: {
      startDateTime: { gte: start, lte: end },
      status: { not: "Cancelado" },
      ...(professionalId ? { professionalId } : {}),
    },
    select: { startDateTime: true },
  });

  const counts: MonthlyAppointmentCounts = {};
  for (const apt of appointments) {
    const localDate = apt.startDateTime
      .toLocaleString("sv-SE", {
        timeZone: "America/Argentina/Buenos_Aires",
      })
      .split(" ")[0];
    counts[localDate] = (counts[localDate] ?? 0) + 1;
  }
  return counts;
}

// --- Mutations ---

export async function createAppointment(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = createAppointmentSchema.safeParse({
    patientId: formData.get("patientId"),
    professionalId: formData.get("professionalId"),
    startDateTime: formData.get("startDateTime"),
    endDateTime: formData.get("endDateTime"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { error: firstError };
  }

  const { patientId, professionalId, startDateTime, endDateTime, notes } =
    parsed.data;

  const startDT = new Date(startDateTime);
  const endDT = new Date(endDateTime);

  // 1. Availability check (reuses existing engine)
  const availCheck = await checkProfessionalAvailability(
    professionalId,
    startDT,
    endDT
  );
  if (!availCheck.available) {
    return { error: availCheck.reason! };
  }

  // 2. Professional collision
  const profCollision = await prisma.appointment.findFirst({
    where: {
      professionalId,
      status: { not: "Cancelado" },
      startDateTime: { lt: endDT },
      endDateTime: { gt: startDT },
    },
  });
  if (profCollision) {
    return { error: "El profesional ya tiene un turno en ese horario" };
  }

  // 3. Patient collision
  const patCollision = await prisma.appointment.findFirst({
    where: {
      patientId,
      status: { not: "Cancelado" },
      startDateTime: { lt: endDT },
      endDateTime: { gt: startDT },
    },
  });
  if (patCollision) {
    return { error: "El paciente ya tiene un turno en ese horario" };
  }

  const currentUser = await getCurrentUser();

  await prisma.appointment.create({
    data: {
      patientId,
      professionalId,
      startDateTime: startDT,
      endDateTime: endDT,
      notes: notes || null,
      createdById: currentUser?.id ?? null,
    },
  });

  revalidatePath("/dashboard/agenda");
  return { success: true };
}

export async function updateAppointmentStatus(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = updateAppointmentStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    cancellationReason: formData.get("cancellationReason") || undefined,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { error: firstError };
  }

  const { id, status, cancellationReason } = parsed.data;

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Turno no encontrado" };
  }

  await prisma.appointment.update({
    where: { id },
    data: {
      status,
      ...(status === "Cancelado"
        ? { cancellationReason: cancellationReason || null }
        : {}),
    },
  });

  revalidatePath("/dashboard/agenda");
  return { success: true };
}

export async function rescheduleAppointment(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = rescheduleAppointmentSchema.safeParse({
    id: formData.get("id"),
    professionalId: formData.get("professionalId"),
    startDateTime: formData.get("startDateTime"),
    endDateTime: formData.get("endDateTime"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { error: firstError };
  }

  const { id, professionalId, startDateTime, endDateTime } = parsed.data;
  const startDT = new Date(startDateTime);
  const endDT = new Date(endDateTime);

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Turno no encontrado" };
  }

  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: { isActive: true },
  });
  if (!professional?.isActive) {
    return { error: "El profesional seleccionado no está activo" };
  }

  // 1. Availability check
  const availCheck = await checkProfessionalAvailability(
    professionalId,
    startDT,
    endDT
  );
  if (!availCheck.available) {
    return { error: availCheck.reason! };
  }

  // 2. Professional collision (excluding this appointment if same professional)
  const profCollision = await prisma.appointment.findFirst({
    where: {
      professionalId,
      id: { not: id },
      status: { not: "Cancelado" },
      startDateTime: { lt: endDT },
      endDateTime: { gt: startDT },
    },
  });
  if (profCollision) {
    return { error: "El profesional ya tiene un turno en ese horario" };
  }

  // 3. Patient collision (excluding this appointment)
  const patCollision = await prisma.appointment.findFirst({
    where: {
      patientId: existing.patientId,
      id: { not: id },
      status: { not: "Cancelado" },
      startDateTime: { lt: endDT },
      endDateTime: { gt: startDT },
    },
  });
  if (patCollision) {
    return { error: "El paciente ya tiene un turno en ese horario" };
  }

  await prisma.appointment.update({
    where: { id },
    data: {
      professionalId,
      startDateTime: startDT,
      endDateTime: endDT,
      status: "Pendiente",
    },
  });

  revalidatePath("/dashboard/agenda");
  return { success: true };
}

export async function deleteAppointment(
  _prevState: unknown,
  formData: FormData
) {
  const id = formData.get("id");
  if (!id || typeof id !== "string") return { error: "ID inválido" };

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) return { error: "Turno no encontrado" };
  if (existing.status !== "Ausente" && existing.status !== "Completado")
    return { error: "Solo se pueden eliminar turnos marcados como Ausente o Completado" };

  await prisma.appointment.delete({ where: { id } });

  revalidatePath("/dashboard/agenda");
  return { success: true };
}
