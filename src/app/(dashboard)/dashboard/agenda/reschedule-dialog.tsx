"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { rescheduleAppointment } from "@/services/appointment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppointmentWithDetails } from "@/types";

export function RescheduleDialog({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: AppointmentWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(
    rescheduleAppointment,
    null
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (state?.success) {
      toast.success("Turno reprogramado exitosamente");
      onOpenChange(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  useEffect(() => {
    if (open && appointment) {
      // Pre-fill with current date/time
      const start = new Date(appointment.startDateTime);
      const argentina = start.toLocaleString("sv-SE", {
        timeZone: "America/Argentina/Buenos_Aires",
      });
      const [d, t] = argentina.split(" ");
      setDate(d);
      setTime(t.slice(0, 5));
    }
  }, [open, appointment]);

  if (!appointment) return null;

  // Calculate duration in minutes from the original appointment
  const durationMs =
    new Date(appointment.endDateTime).getTime() -
    new Date(appointment.startDateTime).getTime();
  const durationMin = durationMs / 60000;

  // Build ISO strings for the new time
  const startDateTime = date && time ? `${date}T${time}:00-03:00` : "";
  const endDateTime =
    date && time
      ? (() => {
          const start = new Date(`${date}T${time}:00-03:00`);
          const end = new Date(start.getTime() + durationMin * 60000);
          return end.toISOString();
        })()
      : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reprogramar Turno</DialogTitle>
          <DialogDescription>
            {appointment.patient.lastName}, {appointment.patient.firstName} —
            Duración: {durationMin} min
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={appointment.id} />
          <input type="hidden" name="startDateTime" value={startDateTime} />
          <input type="hidden" name="endDateTime" value={endDateTime} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reschedule-date">Fecha</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-time">Hora</Label>
              <Input
                id="reschedule-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
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
              disabled={pending || !date || !time}
            >
              {pending ? "Reprogramando..." : "Reprogramar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
