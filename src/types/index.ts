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

export type PatientWithProvincia = {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthDate: Date | null;
  address: string | null;
  provinciaId: string | null;
  provincia: { id: string; name: string } | null;
  obraSocialId: string | null;
  obraSocial: { id: string; name: string } | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfessionalWithDetails = {
  id: string;
  licenseNumber: string;
  isActive: boolean;
  speciality: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    email: string;
    role: Role;
    profile: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string | null;
    } | null;
  };
  createdAt: Date;
  updatedAt: Date;
};
