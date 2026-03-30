"use server";

import { prisma } from "@/lib/prisma";

export async function getAllSpecialities() {
  return prisma.speciality.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getAllProvincias() {
  return prisma.provincia.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getAllObrasSociales() {
  return prisma.obraSocial.findMany({
    orderBy: { name: "asc" },
  });
}
