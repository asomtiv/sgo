"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createEvolucionSchema, updateEvolucionSchema } from "@/types/schemas";
import { getCurrentUser } from "@/services/user";
import type { EvolucionWithDetails } from "@/types";

export async function getEvolucionesByPatient(patientId: string): Promise<EvolucionWithDetails[]> {
  const rows = await prisma.evolucion.findMany({
    where: { patientId },
    include: {
      items: true,
      appointment: { select: { startDateTime: true, endDateTime: true, status: true } },
      professional: {
        select: {
          user: { select: { profile: { select: { firstName: true, lastName: true } }, role: true } },
          speciality: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows as EvolucionWithDetails[];
}

export async function createEvolucion(_prevState: unknown, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role === "Recepcion") {
    return { error: "No tenés permiso para registrar evoluciones" };
  }

  let items: unknown;
  try {
    items = JSON.parse(formData.get("items") as string);
  } catch {
    return { error: "Formato de prestaciones inválido" };
  }

  const parsed = createEvolucionSchema.safeParse({
    patientId: formData.get("patientId"),
    appointmentId: formData.get("appointmentId"),
    observations: formData.get("observations") || undefined,
    items,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { patientId, appointmentId, observations, items: parsedItems } = parsed.data;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { professionalId: true, evolucion: { select: { id: true } } },
  });

  if (!appointment) return { error: "Turno no encontrado" };
  if (appointment.evolucion) return { error: "Este turno ya tiene una evolución registrada" };

  await prisma.evolucion.create({
    data: {
      patientId,
      appointmentId,
      professionalId: appointment.professionalId,
      observations: observations ?? null,
      items: { create: parsedItems },
    },
  });

  revalidatePath(`/dashboard/pacientes/${patientId}`);
  return { success: true };
}

export async function updateEvolucion(_prevState: unknown, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role === "Recepcion") {
    return { error: "No tenés permiso para editar evoluciones" };
  }

  let items: unknown;
  try {
    items = JSON.parse(formData.get("items") as string);
  } catch {
    return { error: "Formato de prestaciones inválido" };
  }

  const parsed = updateEvolucionSchema.safeParse({
    id: formData.get("id"),
    patientId: formData.get("patientId"),
    observations: formData.get("observations") || undefined,
    items,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, patientId, observations, items: parsedItems } = parsed.data;

  await prisma.evolucionItem.deleteMany({ where: { evolucionId: id } });
  await prisma.evolucion.update({
    where: { id },
    data: {
      observations: observations ?? null,
      items: { create: parsedItems },
    },
  });

  revalidatePath(`/dashboard/pacientes/${patientId}`);
  return { success: true };
}

export async function deleteEvolucion(_prevState: unknown, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "Admin") {
    return { error: "Solo los administradores pueden eliminar evoluciones" };
  }

  const id = formData.get("id") as string;
  const patientId = formData.get("patientId") as string;
  if (!id || !patientId) return { error: "Datos inválidos" };

  await prisma.evolucion.delete({ where: { id } });

  revalidatePath(`/dashboard/pacientes/${patientId}`);
  return { success: true };
}
