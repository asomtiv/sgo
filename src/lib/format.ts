import type { Role } from "@/generated/prisma/client";

type Profile = { firstName: string; lastName: string } | null | undefined;

/**
 * Formats a user's display name.
 * Prepends "Dr/a." when the role is Profesional.
 */
export function formatDisplayName(
  profile: Profile,
  fallback: string,
  role?: Role
): string {
  if (!profile) return fallback;
  const fullName = `${profile.firstName} ${profile.lastName}`;
  if (role === "Profesional") return `Dr/a. ${fullName}`;
  return fullName;
}
