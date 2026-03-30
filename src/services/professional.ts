"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createProfessionalSchema,
  updateProfessionalSchema,
} from "@/types/schemas";
import type { ProfessionalWithDetails } from "@/types";
import type { UserWithProfile } from "@/types";

export async function getAllProfessionals(): Promise<ProfessionalWithDetails[]> {
  return prisma.professional.findMany({
    include: {
      user: {
        include: { profile: true },
      },
      speciality: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAvailableUsersForProfessional(): Promise<
  UserWithProfile[]
> {
  return prisma.user.findMany({
    where: {
      role: "Profesional",
      professional: null,
      isActive: true,
    },
    include: { profile: true },
  });
}

export async function createProfessional(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = createProfessionalSchema.safeParse({
    userId: formData.get("userId"),
    licenseNumber: formData.get("licenseNumber"),
    specialityId: formData.get("specialityId"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const existingLicense = await prisma.professional.findUnique({
    where: { licenseNumber: parsed.data.licenseNumber },
  });

  if (existingLicense) {
    return { error: "Ya existe un profesional con esa matrícula" };
  }

  const existingUser = await prisma.professional.findUnique({
    where: { userId: parsed.data.userId },
  });

  if (existingUser) {
    return { error: "Este usuario ya tiene un perfil profesional" };
  }

  await prisma.professional.create({
    data: {
      userId: parsed.data.userId,
      licenseNumber: parsed.data.licenseNumber,
      specialityId: parsed.data.specialityId,
    },
  });

  revalidatePath("/dashboard/profesionales");
  return { success: true };
}

export async function updateProfessional(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = updateProfessionalSchema.safeParse({
    id: formData.get("id"),
    licenseNumber: formData.get("licenseNumber"),
    specialityId: formData.get("specialityId"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const existingLicense = await prisma.professional.findFirst({
    where: {
      licenseNumber: parsed.data.licenseNumber,
      NOT: { id: parsed.data.id },
    },
  });

  if (existingLicense) {
    return { error: "Ya existe otro profesional con esa matrícula" };
  }

  await prisma.professional.update({
    where: { id: parsed.data.id },
    data: {
      licenseNumber: parsed.data.licenseNumber,
      specialityId: parsed.data.specialityId,
    },
  });

  revalidatePath("/dashboard/profesionales");
  return { success: true };
}

export async function toggleProfessionalActive(id: string) {
  const professional = await prisma.professional.findUnique({
    where: { id },
  });

  if (!professional) {
    return { error: "Profesional no encontrado" };
  }

  const newStatus = !professional.isActive;

  await prisma.professional.update({
    where: { id },
    data: { isActive: newStatus },
  });

  revalidatePath("/dashboard/profesionales");
  return { success: true, isActive: newStatus };
}
