"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Mail, Hash, Phone, Calendar } from "lucide-react";
import { EditProfessionalDialog } from "./professional-dialogs";
import { AvailabilitySheet } from "./availability-sheet";
import { formatDisplayName } from "@/lib/format";
import type { ProfessionalWithDetails } from "@/types";

type Speciality = { id: string; name: string };

const SPECIALITY_COLORS = [
  { bg: "bg-sky-500",      text: "text-sky-800",      badgeBg: "bg-sky-100      dark:bg-sky-900/40",      badgeText: "text-sky-800 dark:text-sky-300" },
  { bg: "bg-violet-500",   text: "text-violet-800",   badgeBg: "bg-violet-100   dark:bg-violet-900/40",   badgeText: "text-violet-800 dark:text-violet-300" },
  { bg: "bg-emerald-500",  text: "text-emerald-800",  badgeBg: "bg-emerald-100  dark:bg-emerald-900/40",  badgeText: "text-emerald-800 dark:text-emerald-300" },
  { bg: "bg-amber-500",    text: "text-amber-800",    badgeBg: "bg-amber-100    dark:bg-amber-900/40",    badgeText: "text-amber-800 dark:text-amber-300" },
  { bg: "bg-rose-500",     text: "text-rose-800",     badgeBg: "bg-rose-100     dark:bg-rose-900/40",     badgeText: "text-rose-800 dark:text-rose-300" },
  { bg: "bg-teal-500",     text: "text-teal-800",     badgeBg: "bg-teal-100     dark:bg-teal-900/40",     badgeText: "text-teal-800 dark:text-teal-300" },
  { bg: "bg-orange-500",   text: "text-orange-800",   badgeBg: "bg-orange-100   dark:bg-orange-900/40",   badgeText: "text-orange-800 dark:text-orange-300" },
  { bg: "bg-indigo-500",   text: "text-indigo-800",   badgeBg: "bg-indigo-100   dark:bg-indigo-900/40",   badgeText: "text-indigo-800 dark:text-indigo-300" },
  { bg: "bg-pink-500",     text: "text-pink-800",     badgeBg: "bg-pink-100     dark:bg-pink-900/40",     badgeText: "text-pink-800 dark:text-pink-300" },
  { bg: "bg-cyan-500",     text: "text-cyan-800",     badgeBg: "bg-cyan-100     dark:bg-cyan-900/40",     badgeText: "text-cyan-800 dark:text-cyan-300" },
] as const;

function buildColorMap(specialities: Speciality[]) {
  const map = new Map<string, (typeof SPECIALITY_COLORS)[number]>();
  specialities.forEach((s, i) => {
    map.set(s.id, SPECIALITY_COLORS[i % SPECIALITY_COLORS.length]);
  });
  return map;
}

export function ProfessionalsGrid({
  professionals,
  specialities,
  isAdmin = true,
}: {
  professionals: ProfessionalWithDetails[];
  specialities: Speciality[];
  isAdmin?: boolean;
}) {
  const [selectedProfessional, setSelectedProfessional] =
    useState<ProfessionalWithDetails | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [availabilityProfessional, setAvailabilityProfessional] =
    useState<ProfessionalWithDetails | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const colorMap = buildColorMap(specialities);

  return (
    <>
      <div className="grid grid-cols-5 gap-4">
        {professionals.map((prof) => {
          const name = formatDisplayName(prof.user.profile, prof.user.email, prof.user.role);
          const initials = prof.user.profile
            ? `${prof.user.profile.firstName[0]}${prof.user.profile.lastName[0]}`
            : prof.user.email[0].toUpperCase();

          const color = colorMap.get(prof.speciality.id) ?? SPECIALITY_COLORS[0];

          return (
            <Card
              key={prof.id}
              className="flex flex-col items-center p-4 text-center gap-3"
            >
              {/* Top row: estado izq, editar der */}
              <div className="w-full flex justify-between items-start">
                {prof.isActive ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Inactivo
                  </span>
                )}
                {isAdmin && (
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setAvailabilityProfessional(prof);
                        setAvailabilityOpen(true);
                      }}
                      title="Disponibilidad"
                    >
                      <Calendar className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setSelectedProfessional(prof);
                        setEditOpen(true);
                      }}
                      title="Editar"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Avatar + identidad */}
              <div className="flex flex-col items-center gap-2">
                <div className={`flex size-24 items-center justify-center ${color.bg} text-white text-3xl font-bold`}>
                  {initials}
                </div>
                <p className="text-sm font-semibold leading-tight line-clamp-2 px-1">
                  {name}
                </p>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${color.badgeBg} ${color.badgeText}`}>
                  {prof.speciality.name}
                </span>
              </div>

              {/* Datos */}
              <div className="w-full space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-1.5">
                  <Hash className="size-3.5 shrink-0" />
                  <span className="truncate">{prof.licenseNumber}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate">{prof.user.email}</span>
                </div>
                {prof.user.profile?.phone && (
                  <div className="flex items-center justify-center gap-1.5">
                    <Phone className="size-3.5 shrink-0" />
                    <span className="truncate">{prof.user.profile.phone}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <EditProfessionalDialog
        key={`edit-prof-${selectedProfessional?.id}`}
        professional={selectedProfessional}
        specialities={specialities}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AvailabilitySheet
        key={`avail-${availabilityProfessional?.id}`}
        professional={availabilityProfessional}
        open={availabilityOpen}
        onOpenChange={setAvailabilityOpen}
      />
    </>
  );
}
