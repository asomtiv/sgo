"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import {
  createUserSchema,
  updateProfileSchema,
  updateRoleSchema,
  adminResetPasswordSchema,
} from "@/types/schemas";
import type { UserWithProfile } from "@/types";
import type { Role } from "@/generated/prisma/client";

export const getCurrentUser = cache(
  async (): Promise<UserWithProfile | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });

    return dbUser;
  }
);

export async function getAllUsers(): Promise<UserWithProfile[]> {
  const users = await prisma.user.findMany({
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  return users;
}

export async function createUser(_prevState: unknown, formData: FormData) {
  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    role: formData.get("role"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const { data: authData, error: authError } =
    await getSupabaseAdmin().auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
    });

  if (authError) {
    return { error: authError.message };
  }

  await prisma.user.create({
    data: {
      id: authData.user.id,
      email: parsed.data.email,
      role: parsed.data.role as Role,
      profile: {
        create: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone || null,
        },
      },
    },
  });

  revalidatePath("/dashboard/usuarios");
  return { success: true };
}

export async function updateUserRole(_prevState: unknown, formData: FormData) {
  const parsed = updateRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role as Role },
  });

  revalidatePath("/dashboard/usuarios");
  return { success: true };
}

export async function updateUserProfile(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = updateProfileSchema.safeParse({
    userId: formData.get("userId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  await prisma.profile.update({
    where: { userId: parsed.data.userId },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone ?? null,
    },
  });

  revalidatePath("/dashboard/usuarios");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Usuario no encontrado" };

  // Delete from Supabase Auth first
  const { error: authError } =
    await getSupabaseAdmin().auth.admin.deleteUser(userId);
  if (authError) return { error: authError.message };

  // Cascade deletes profile via Prisma schema relations
  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/dashboard/usuarios");
  return { success: true };
}

export async function toggleUserActive(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Usuario no encontrado" };

  const newStatus = !user.isActive;

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: newStatus },
  });

  // Sync professional isActive if the user has a professional record
  await prisma.professional.updateMany({
    where: { userId },
    data: { isActive: newStatus },
  });

  // Ban or unban in Supabase Auth
  await getSupabaseAdmin().auth.admin.updateUserById(userId, {
    ban_duration: newStatus ? "none" : "876600h",
  });

  revalidatePath("/dashboard/usuarios");
  revalidatePath("/dashboard/profesionales");
  return { success: true, isActive: newStatus };
}

export async function adminResetPassword(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = adminResetPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(
    parsed.data.userId,
    { password: parsed.data.password }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
