"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createHistoriaClinicaSchema, updateHistoriaClinicaSchema, updateOdontogramSchema } from "@/types/schemas";
import type { PatientFichaData } from "@/types";

export async function getPatientFicha(id: string): Promise<PatientFichaData | null> {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      provincia: true,
      obraSocial: true,
      nacionalidad: true,
      historiaClinica: true,
    },
  });
  if (!patient) return null;
  return patient as unknown as PatientFichaData;
}

export async function createHistoriaClinica(input: unknown) {
  const parsed = createHistoriaClinicaSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos" };

  const existing = await prisma.historiaClinica.findUnique({
    where: { patientId: parsed.data.patientId },
  });
  if (existing) return { error: "Este paciente ya tiene una historia clínica" };

  await prisma.historiaClinica.create({
    data: {
      patientId: parsed.data.patientId,
      alergias: parsed.data.alergias,
      alergiasDetalle: parsed.data.alergiasDetalle ?? null,
      enfermedadContagiosa: parsed.data.enfermedadContagiosa,
      contagiosaDetalle: parsed.data.contagiosaDetalle ?? null,
      embarazada: parsed.data.embarazada,
      embarazadaMeses: parsed.data.embarazadaMeses ?? null,
      anamnesis: parsed.data.anamnesis,
      examenClinico: parsed.data.examenClinico,
      historiaOdontologica: parsed.data.historiaOdontologica,
    },
  });

  revalidatePath(`/dashboard/pacientes/${parsed.data.patientId}`);
  return { success: true };
}

export async function updateHistoriaClinica(input: unknown) {
  const parsed = updateHistoriaClinicaSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos" };

  const historia = await prisma.historiaClinica.findUnique({
    where: { id: parsed.data.id },
  });
  if (!historia) return { error: "Historia clínica no encontrada" };

  await prisma.historiaClinica.update({
    where: { id: parsed.data.id },
    data: {
      alergias: parsed.data.alergias,
      alergiasDetalle: parsed.data.alergiasDetalle ?? null,
      enfermedadContagiosa: parsed.data.enfermedadContagiosa,
      contagiosaDetalle: parsed.data.contagiosaDetalle ?? null,
      embarazada: parsed.data.embarazada,
      embarazadaMeses: parsed.data.embarazadaMeses ?? null,
      anamnesis: parsed.data.anamnesis,
      examenClinico: parsed.data.examenClinico,
      historiaOdontologica: parsed.data.historiaOdontologica,
    },
  });

  revalidatePath(`/dashboard/pacientes/${historia.patientId}`);
  return { success: true };
}

export async function updateOdontogram(input: unknown) {
  const parsed = updateOdontogramSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos de odontograma inválidos" };

  const historia = await prisma.historiaClinica.findUnique({
    where: { id: parsed.data.historiaClinicaId },
  });
  if (!historia) return { error: "Historia clínica no encontrada" };

  await prisma.historiaClinica.update({
    where: { id: parsed.data.historiaClinicaId },
    data: { odontograma: parsed.data.odontograma as object },
  });

  revalidatePath(`/dashboard/pacientes/${historia.patientId}`);
  return { success: true };
}
