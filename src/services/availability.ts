"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createAvailabilitySchema,
  updateSlotDurationSchema,
  createLeaveSchema,
} from "@/types/schemas";
import type { ProfessionalAvailabilityData } from "@/types";

export async function getProfessionalAvailability(
  professionalId: string
): Promise<ProfessionalAvailabilityData | null> {
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: {
      slotDuration: true,
      availabilities: {
        select: {
          id: true,
          professionalId: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
      leaves: {
        select: {
          id: true,
          professionalId: true,
          startDate: true,
          endDate: true,
          type: true,
          description: true,
        },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!professional) return null;

  return {
    slotDuration: professional.slotDuration,
    availabilities: professional.availabilities,
    leaves: professional.leaves,
  };
}

export async function createAvailability(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = createAvailabilitySchema.safeParse({
    professionalId: formData.get("professionalId"),
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { error: firstError };
  }

  const { professionalId, dayOfWeek, startTime, endTime } = parsed.data;

  // Check for overlapping blocks on the same day
  const existingBlocks = await prisma.availability.findMany({
    where: { professionalId, dayOfWeek },
  });

  const overlapping = existingBlocks.find(
    (b) => startTime < b.endTime && endTime > b.startTime
  );

  if (overlapping) {
    return {
      error: `Este bloque se superpone con el horario ${overlapping.startTime} - ${overlapping.endTime}`,
    };
  }

  await prisma.availability.create({
    data: { professionalId, dayOfWeek, startTime, endTime },
  });

  revalidatePath("/dashboard/profesionales");
  return { success: true };
}

export async function deleteAvailability(
  _prevState: unknown,
  formData: FormData
) {
  const id = formData.get("id") as string;

  if (!id) {
    return { error: "ID requerido" };
  }

  await prisma.availability.delete({ where: { id } });

  revalidatePath("/dashboard/profesionales");
  return { success: true };
}

export async function updateSlotDuration(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = updateSlotDurationSchema.safeParse({
    professionalId: formData.get("professionalId"),
    slotDuration: formData.get("slotDuration"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { error: firstError };
  }

  await prisma.professional.update({
    where: { id: parsed.data.professionalId },
    data: { slotDuration: parsed.data.slotDuration },
  });

  revalidatePath("/dashboard/profesionales");
  return { success: true };
}

export async function createLeave(_prevState: unknown, formData: FormData) {
  const parsed = createLeaveSchema.safeParse({
    professionalId: formData.get("professionalId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    type: formData.get("type"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { error: firstError };
  }

  const { professionalId, startDate, endDate, type, description } =
    parsed.data;

  const startDateObj = new Date(`${startDate}T00:00:00`);
  const endDateObj = new Date(`${endDate}T00:00:00`);

  // Check for overlapping leaves
  const overlapping = await prisma.leave.findFirst({
    where: {
      professionalId,
      startDate: { lte: endDateObj },
      endDate: { gte: startDateObj },
    },
  });

  if (overlapping) {
    return { error: "Ya existe una ausencia que se superpone con estas fechas" };
  }

  await prisma.leave.create({
    data: {
      professionalId,
      startDate: startDateObj,
      endDate: endDateObj,
      type,
      description: description || null,
    },
  });

  revalidatePath("/dashboard/profesionales");
  return { success: true };
}

export async function deleteLeave(_prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return { error: "ID requerido" };
  }

  await prisma.leave.delete({ where: { id } });

  revalidatePath("/dashboard/profesionales");
  return { success: true };
}
