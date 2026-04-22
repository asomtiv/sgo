"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createPatientSchema, updatePatientSchema } from "@/types/schemas";
import type { PatientWithProvincia } from "@/types";

function calcularEdad(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

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
    include: { provincia: true, obraSocial: true, nacionalidad: true },
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
    nroAfiliado: formData.get("nroAfiliado") || undefined,
    nacionalidadId: formData.get("nacionalidadId") || undefined,
    estadoCivil: formData.get("estadoCivil") || undefined,
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
        ? new Date(`${parsed.data.birthDate}T00:00:00`)
        : null,
      address: parsed.data.address || null,
      provinciaId: parsed.data.provinciaId || null,
      obraSocialId: parsed.data.obraSocialId || null,
      nroAfiliado: parsed.data.nroAfiliado || null,
      nacionalidadId: parsed.data.nacionalidadId || null,
      estadoCivil: parsed.data.estadoCivil || null,
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
    nroAfiliado: formData.get("nroAfiliado") || undefined,
    nacionalidadId: formData.get("nacionalidadId") || undefined,
    estadoCivil: formData.get("estadoCivil") || undefined,
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
        ? new Date(`${parsed.data.birthDate}T00:00:00`)
        : null,
      address: parsed.data.address || null,
      provinciaId: parsed.data.provinciaId || null,
      obraSocialId: parsed.data.obraSocialId || null,
      nroAfiliado: parsed.data.nroAfiliado || null,
      nacionalidadId: parsed.data.nacionalidadId || null,
      estadoCivil: parsed.data.estadoCivil || null,
    },
  });

  revalidatePath("/dashboard/pacientes");
  return { success: true };
}

export async function deletePatient(id: string) {
  const appointmentCount = await prisma.appointment.count({
    where: { patientId: id, status: { not: "Cancelado" } },
  });
  if (appointmentCount > 0) {
    return {
      error: `El paciente tiene ${appointmentCount} turno${appointmentCount > 1 ? "s" : ""} activo${appointmentCount > 1 ? "s" : ""}. Cancelelos antes de eliminar el paciente.`,
    };
  }

  await prisma.patient.delete({ where: { id } });
  revalidatePath("/dashboard/pacientes");
  return { success: true };
}
