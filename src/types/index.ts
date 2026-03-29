import type { Role } from "@/generated/prisma/client";

export type UserWithProfile = {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  } | null;
};
