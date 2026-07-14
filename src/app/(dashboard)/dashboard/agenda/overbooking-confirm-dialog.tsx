"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";
import type { AppointmentWithDetails } from "@/types";

function formatTime(date: Date): string {
  return date.toLocaleString("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function OverbookingConfirmDialog({
  open,
  onOpenChange,
  conflictingAppointment,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictingAppointment: AppointmentWithDetails | null;
  onConfirm: () => void;
}) {
  if (!conflictingAppointment) return null;

  const colors = APPOINTMENT_STATUS_COLORS[conflictingAppointment.status];
  const startTime = formatTime(new Date(conflictingAppointment.startDateTime));
  const endTime = formatTime(new Date(conflictingAppointment.endDateTime));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert className="size-4 text-amber-500 shrink-0" />
            Confirmar Sobreturno
          </DialogTitle>
          <DialogDescription>
            El profesional ya tiene un turno asignado en ese horario.
          </DialogDescription>
        </DialogHeader>

        <div className="border border-border bg-muted/40 p-3 space-y-1 text-sm">
          <p className="font-medium">
            {conflictingAppointment.patient.lastName}, {conflictingAppointment.patient.firstName}
          </p>
          <p className="text-muted-foreground text-xs">
            DNI {conflictingAppointment.patient.dni}
          </p>
          <p className="text-muted-foreground text-xs">
            {startTime} – {endTime}
          </p>
          <span
            className={cn(
              "inline-block text-xs px-2 py-0.5 font-medium mt-1",
              colors.bg,
              colors.text
            )}
          >
            {APPOINTMENT_STATUS_LABELS[conflictingAppointment.status]}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          ¿Querés crear un sobreturno de todas formas? Esta acción quedará registrada.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            Crear sobreturno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
