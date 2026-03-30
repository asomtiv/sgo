"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createPatientSchema, updatePatientSchema } from "@/types/schemas";
import type { PatientWithProvincia } from "@/types";

export async function getAllPatients(
  search?: string
): Promise<PatientWithProvincia[]> {
  const where = search
    ? {
        OR: [
          { dni: { contains: search } },
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  return prisma.patient.findMany({
    where,
    include: { provincia: true, obraSocial: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPatient(_prevState: unknown, formData: FormData) {
  const parsed = createPatientSchema.safeParse({
    dni: formData.get("dni"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    birthDate: formData.get("birthDate") || undefined,
    address: formData.get("address") || undefined,
    provinciaId: formData.get("provinciaId") || undefined,
    obraSocialId: formData.get("obraSocialId") || undefined,
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Verificá el DNI (7-8 dígitos) y el email." };
  }

  const existing = await prisma.patient.findUnique({
    where: { dni: parsed.data.dni },
  });

  if (existing) {
    return { error: "Ya existe un paciente con ese DNI" };
  }

  await prisma.patient.create({
    data: {
      dni: parsed.data.dni,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      birthDate: parsed.data.birthDate
        ? new Date(parsed.data.birthDate)
        : null,
      address: parsed.data.address || null,
      provinciaId: parsed.data.provinciaId || null,
      obraSocialId: parsed.data.obraSocialId || null,
    },
  });

  revalidatePath("/dashboard/pacientes");
  return { success: true };
}

export async function updatePatient(_prevState: unknown, formData: FormData) {
  const parsed = updatePatientSchema.safeParse({
    id: formData.get("id"),
    dni: formData.get("dni"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    birthDate: formData.get("birthDate") || undefined,
    address: formData.get("address") || undefined,
    provinciaId: formData.get("provinciaId") || undefined,
    obraSocialId: formData.get("obraSocialId") || undefined,
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Verificá el DNI (7-8 dígitos) y el email." };
  }

  const existing = await prisma.patient.findFirst({
    where: { dni: parsed.data.dni, NOT: { id: parsed.data.id } },
  });

  if (existing) {
    return { error: "Ya existe otro paciente con ese DNI" };
  }

  await prisma.patient.update({
    where: { id: parsed.data.id },
    data: {
      dni: parsed.data.dni,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      birthDate: parsed.data.birthDate
        ? new Date(parsed.data.birthDate)
        : null,
      address: parsed.data.address || null,
      provinciaId: parsed.data.provinciaId || null,
      obraSocialId: parsed.data.obraSocialId || null,
    },
  });

  revalidatePath("/dashboard/pacientes");
  return { success: true };
}

export async function deletePatient(id: string) {
  await prisma.patient.delete({ where: { id } });
  revalidatePath("/dashboard/pacientes");
  return { success: true };
}
