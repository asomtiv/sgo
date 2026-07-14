"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createEvolucion, updateEvolucion } from "@/services/evolucion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDisplayName } from "@/lib/format";
import type { AppointmentForEvolucion, EvolucionWithDetails } from "@/types";

type ItemRow = { diente: string; prestacion: string };

function formatAppointmentLabel(apt: AppointmentForEvolucion): string {
  const date = new Date(apt.startDateTime).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const prof = formatDisplayName(apt.professional.user.profile, "Profesional", apt.professional.user.role);
  return `${date} — ${prof}`;
}

export function EvolucionForm({
  patientId,
  availableAppointments,
  evolucion,
  onCancel,
  onSuccess,
}: {
  patientId: string;
  availableAppointments: AppointmentForEvolucion[];
  evolucion?: EvolucionWithDetails;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!evolucion;
  const action = isEdit ? updateEvolucion : createEvolucion;

  const [state, formAction, pending] = useActionState(action, null);
  const [items, setItems] = useState<ItemRow[]>(
    isEdit ? evolucion.items.map((i) => ({ diente: i.diente, prestacion: i.prestacion })) : [{ diente: "", prestacion: "" }]
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(isEdit ? "Evolución actualizada" : "Evolución registrada");
      onSuccess();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, isEdit, onSuccess]);

  function addItem() {
    setItems((prev) => [...prev, { diente: "", prestacion: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof ItemRow, value: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  return (
    <form
      action={formAction}
      className="border border-border p-4 space-y-5"
    >
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      {isEdit && <input type="hidden" name="id" value={evolucion.id} />}

      {/* Turno */}
      <div className="space-y-1.5">
        <Label htmlFor="appointmentId">Turno</Label>
        {isEdit ? (
          <p className="text-sm font-medium border border-input px-3 py-2 bg-muted/40">
            {formatAppointmentLabel({
              id: evolucion.appointmentId,
              startDateTime: evolucion.appointment.startDateTime,
              endDateTime: evolucion.appointment.endDateTime,
              status: evolucion.appointment.status,
              professional: evolucion.professional,
            })}
          </p>
        ) : (
          <Select name="appointmentId">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccioná un turno..." />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {availableAppointments.map((apt) => (
                <SelectItem key={apt.id} value={apt.id}>
                  {formatAppointmentLabel(apt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {!isEdit && availableAppointments.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No hay turnos completados o confirmados disponibles para vincular.
          </p>
        )}
      </div>

      {/* Dientes y prestaciones */}
      <div className="space-y-2">
        <Label>Dientes y prestaciones</Label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="Diente"
                value={item.diente}
                onChange={(e) => updateItem(index, "diente", e.target.value)}
                className="w-24 shrink-0"
              />
              <Input
                placeholder="Prestación realizada"
                value={item.prestacion}
                onChange={(e) => updateItem(index, "prestacion", e.target.value)}
                className="flex-1"
              />
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(index)}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
          <Plus className="size-3.5" />
          Agregar fila
        </Button>
      </div>

      {/* Observaciones */}
      <div className="space-y-1.5">
        <Label htmlFor="observations">Observaciones (opcional)</Label>
        <textarea
          id="observations"
          name="observations"
          rows={3}
          defaultValue={evolucion?.observations ?? ""}
          className="flex w-full border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Notas adicionales, indicaciones, próximos pasos..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={pending || items.every((i) => !i.diente && !i.prestacion)}
        >
          {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar evolución"}
        </Button>
      </div>
    </form>
  );
}
