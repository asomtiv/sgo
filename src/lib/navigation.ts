import {
  Users,
  Stethoscope,
  CalendarDays,
  Package,
  UserCog,
  LayoutDashboard,
} from "lucide-react";
import type { Role } from "@/generated/prisma/client";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Admin", "Profesional", "Recepcion"],
  },
  {
    title: "Agenda",
    href: "/dashboard/agenda",
    icon: CalendarDays,
    roles: ["Admin", "Profesional", "Recepcion"],
  },
  {
    title: "Pacientes",
    href: "/dashboard/pacientes",
    icon: Users,
    roles: ["Admin", "Profesional", "Recepcion"],
  },
  {
    title: "Profesionales",
    href: "/dashboard/profesionales",
    icon: Stethoscope,
    roles: ["Admin", "Recepcion"],
  },
  {
    title: "Insumos",
    href: "/dashboard/insumos",
    icon: Package,
    roles: ["Admin"],
  },
  {
    title: "Gestión de Usuarios",
    href: "/dashboard/usuarios",
    icon: UserCog,
    roles: ["Admin"],
  },
];
