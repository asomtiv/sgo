"use client";

import { useActionState, useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { updateAppointmentStatus, deleteAppointment } from "@/services/appointment";
import { Button } from "@/components/ui/button";
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

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-muted-foreground text-xs">{label}</span>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  );
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
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteAppointment,
    null
  );
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success("Estado del turno actualizado");
      onOpenChange(false);
      setConfirmCancel(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  useEffect(() => {
    if (deleteState?.success) {
      toast.success("Turno eliminado");
      onOpenChange(false);
      setConfirmDelete(false);
    } else if (deleteState?.error) {
      toast.error(deleteState.error);
    }
  }, [deleteState, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setConfirmCancel(false);
      setConfirmDelete(false);
    }
  }, [open]);

  if (!appointment) return null;

  const colors = APPOINTMENT_STATUS_COLORS[appointment.status];
  const profName = formatDisplayName(
    appointment.professional.user.profile,
    "Profesional",
    appointment.professional.user.role
  );
  const assignedByName = appointment.createdBy
    ? formatDisplayName(
        appointment.createdBy.profile,
        "Usuario",
        appointment.createdBy.role
      )
    : "—";

  const endTime = new Date(appointment.endDateTime).toLocaleString("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const isEditable =
    appointment.status === "Pendiente" || appointment.status === "Confirmado";


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del Turno</DialogTitle>
          <DialogDescription>
            {profName} —{" "}
            {formatDateTime(new Date(appointment.startDateTime))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Paciente */}
          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Paciente"
              value={`${appointment.patient.lastName}, ${appointment.patient.firstName}`}
            />
            <Field label="DNI" value={appointment.patient.dni} />
            <Field label="Celular" value={appointment.patient.phone ?? "—"} />
          </div>

          {/* Turno */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Horario"
              value={`${formatDateTime(new Date(appointment.startDateTime))} — ${endTime}`}
            />
            <Field
              label="Estado"
              value={
                <Badge
                  className={cn(colors.bg, colors.text, colors.border, "border mt-0.5")}
                >
                  {APPOINTMENT_STATUS_LABELS[appointment.status]}
                </Badge>
              }
            />
          </div>

          {/* Notas */}
          {appointment.notes && (
            <Field label="Notas" value={appointment.notes} />
          )}

          {/* Motivo de cancelación */}
          {appointment.cancellationReason && (
            <Field
              label="Motivo de cancelación"
              value={appointment.cancellationReason}
            />
          )}

          {/* Auditoría */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border">
            <Field label="Asignado por" value={assignedByName} />
            <Field
              label="Fecha de asignación"
              value={formatDateTime(new Date(appointment.createdAt))}
            />
          </div>

        </div>

        {(appointment.status === "Ausente" || appointment.status === "Completado") && (
          <DialogFooter className="flex-wrap gap-2">
            {confirmDelete ? (
              <>
                <span className="text-sm text-muted-foreground self-center mr-auto">
                  ¿Está seguro de eliminar este turno?
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deletePending}
                >
                  No
                </Button>
                <form action={deleteFormAction}>
                  <input type="hidden" name="id" value={appointment.id} />
                  <Button type="submit" variant="destructive" size="sm" disabled={deletePending}>
                    {deletePending ? "Eliminando..." : "Sí, eliminar"}
                  </Button>
                </form>
              </>
            ) : (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                Eliminar Turno
              </Button>
            )}
          </DialogFooter>
        )}

        {isEditable && (
          <DialogFooter className="block">
            {confirmCancel ? (
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-sm text-muted-foreground">
                  ¿Está seguro de cancelar el turno?
                </span>
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmCancel(false)}
                    disabled={pending}
                  >
                    No
                  </Button>
                  <form action={formAction}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <input type="hidden" name="status" value="Cancelado" />
                    <Button type="submit" variant="destructive" size="sm" disabled={pending}>
                      {pending ? "Cancelando..." : "Sí, cancelar"}
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                {/* Left: reschedule icon */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={onReschedule}
                  title="Reprogramar"
                >
                  <CalendarClock className="size-4" />
                </Button>

                {/* Right: action buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmCancel(true)}
                  >
                    Cancelar Turno
                  </Button>
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
                        <input type="hidden" name="status" value="Ausente" />
                        <Button type="submit" variant="outline" size="sm" disabled={pending}>
                          {pending ? "..." : "Marcar Ausente"}
                        </Button>
                      </form>
                      <form action={formAction}>
                        <input type="hidden" name="id" value={appointment.id} />
                        <input type="hidden" name="status" value="Completado" />
                        <Button type="submit" size="sm" disabled={pending}>
                          {pending ? "..." : "Completar"}
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
