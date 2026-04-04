"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateAppointmentStatus } from "@/services/appointment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from "@/lib/constants";
import { formatDisplayName } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppointmentWithDetails } from "@/types";

function formatDateTime(date: Date): string {
  return date.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  onReschedule,
}: {
  appointment: AppointmentWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateAppointmentStatus,
    null
  );
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (state?.success) {
      toast.success("Estado del turno actualizado");
      onOpenChange(false);
      setCancelling(false);
      setCancelReason("");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setCancelling(false);
      setCancelReason("");
    }
  }, [open]);

  if (!appointment) return null;

  const colors = APPOINTMENT_STATUS_COLORS[appointment.status];
  const profName = formatDisplayName(
    appointment.professional.user.profile,
    "Profesional",
    appointment.professional.user.role
  );

  const isEditable =
    appointment.status === "Pendiente" || appointment.status === "Confirmado";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle del Turno</DialogTitle>
          <DialogDescription>
            {profName} —{" "}
            {formatDateTime(new Date(appointment.startDateTime))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Patient info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Paciente</span>
              <p className="font-medium">
                {appointment.patient.lastName},{" "}
                {appointment.patient.firstName}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">DNI</span>
              <p className="font-medium">{appointment.patient.dni}</p>
            </div>
          </div>

          {/* Time */}
          <div className="text-sm">
            <span className="text-muted-foreground">Horario</span>
            <p className="font-medium">
              {formatDateTime(new Date(appointment.startDateTime))} —{" "}
              {new Date(appointment.endDateTime).toLocaleString("sv-SE", {
                timeZone: "America/Argentina/Buenos_Aires",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
          </div>

          {/* Status */}
          <div className="text-sm">
            <span className="text-muted-foreground">Estado</span>
            <div className="mt-0.5">
              <Badge
                className={cn(colors.bg, colors.text, colors.border, "border")}
              >
                {APPOINTMENT_STATUS_LABELS[appointment.status]}
              </Badge>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notas</span>
              <p>{appointment.notes}</p>
            </div>
          )}

          {/* Cancellation reason */}
          {appointment.cancellationReason && (
            <div className="text-sm">
              <span className="text-muted-foreground">
                Motivo de cancelación
              </span>
              <p>{appointment.cancellationReason}</p>
            </div>
          )}

          {/* Cancel form */}
          {cancelling && (
            <form action={formAction} className="space-y-2">
              <input type="hidden" name="id" value={appointment.id} />
              <input type="hidden" name="status" value="Cancelado" />
              <div className="space-y-1">
                <Label htmlFor="cancel-reason" className="text-xs">
                  Motivo de cancelación
                </Label>
                <Input
                  id="cancel-reason"
                  name="cancellationReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Motivo..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelling(false)}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={pending || !cancelReason.trim()}
                >
                  {pending ? "Cancelando..." : "Confirmar Cancelación"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {isEditable && !cancelling && (
          <DialogFooter className="flex-wrap gap-2">
            {appointment.status === "Pendiente" && (
              <form action={formAction}>
                <input type="hidden" name="id" value={appointment.id} />
                <input type="hidden" name="status" value="Confirmado" />
                <Button type="submit" size="sm" disabled={pending}>
                  {pending ? "..." : "Confirmar"}
                </Button>
              </form>
            )}
            {appointment.status === "Confirmado" && (
              <>
                <form action={formAction}>
                  <input type="hidden" name="id" value={appointment.id} />
                  <input type="hidden" name="status" value="Completado" />
                  <Button type="submit" size="sm" disabled={pending}>
                    {pending ? "..." : "Completar"}
                  </Button>
                </form>
                <form action={formAction}>
                  <input type="hidden" name="id" value={appointment.id} />
                  <input type="hidden" name="status" value="Ausente" />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                  >
                    {pending ? "..." : "Marcar Ausente"}
                  </Button>
                </form>
              </>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReschedule}
            >
              Reprogramar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setCancelling(true)}
            >
              Cancelar Turno
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
