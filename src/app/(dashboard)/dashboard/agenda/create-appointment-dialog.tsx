"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createAppointment } from "@/services/appointment";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PatientCombobox } from "./patient-combobox";
import type { PatientSearchResult } from "@/types";

export type CreateSlot = {
  professionalId: string;
  startDateTime: string;
  endDateTime: string;
  professionalName: string;
};

function formatSlotDisplay(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function CreateAppointmentDialog({
  slot,
  open,
  onOpenChange,
}: {
  slot: CreateSlot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(
    createAppointment,
    null
  );
  const [selectedPatient, setSelectedPatient] =
    useState<PatientSearchResult | null>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Turno creado exitosamente");
      onOpenChange(false);
      setSelectedPatient(null);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setSelectedPatient(null);
    }
  }, [open]);

  if (!slot) return null;

  const startDisplay = formatSlotDisplay(slot.startDateTime);
  const endDisplay = formatSlotDisplay(slot.endDateTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Turno</DialogTitle>
          <DialogDescription>
            {slot.professionalName} — {startDisplay} a {endDisplay}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="professionalId" value={slot.professionalId} />
          <input type="hidden" name="startDateTime" value={slot.startDateTime} />
          <input type="hidden" name="endDateTime" value={slot.endDateTime} />
          <input
            type="hidden"
            name="patientId"
            value={selectedPatient?.id ?? ""}
          />

          <div className="space-y-2">
            <Label>Paciente</Label>
            <PatientCombobox onSelect={setSelectedPatient} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-notes">Notas (opcional)</Label>
            <textarea
              id="create-notes"
              name="notes"
              rows={2}
              className="flex w-full border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Motivo de consulta, observaciones..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={pending || !selectedPatient}
            >
              {pending ? "Creando..." : "Crear Turno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
