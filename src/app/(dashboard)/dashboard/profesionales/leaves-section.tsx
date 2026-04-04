"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createLeave, deleteLeave } from "@/services/availability";
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
import { X } from "lucide-react";
import { LEAVE_TYPE_LABELS } from "@/lib/constants";
import type { LeaveRecord } from "@/types";
import type { TipoAusencia } from "@/generated/prisma/client";

function leaveTypeName(value: unknown) {
  return LEAVE_TYPE_LABELS[value as TipoAusencia] ?? "Seleccionar tipo...";
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function LeavesSection({
  professionalId,
  leaves,
  onMutate,
}: {
  professionalId: string;
  leaves: LeaveRecord[];
  onMutate: () => void;
}) {
  return (
    <div className="space-y-4">
      <AddLeaveForm professionalId={professionalId} onDone={onMutate} />

      {leaves.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay ausencias registradas
        </p>
      ) : (
        <div className="space-y-2">
          {leaves.map((leave) => (
            <LeaveRow key={leave.id} leave={leave} onMutate={onMutate} />
          ))}
        </div>
      )}
    </div>
  );
}

function AddLeaveForm({
  professionalId,
  onDone,
}: {
  professionalId: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(createLeave, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Ausencia registrada");
      onDone();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-3 border border-border p-3">
      <input type="hidden" name="professionalId" value={professionalId} />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Fecha inicio</Label>
          <Input type="date" name="startDate" required />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Fecha fin</Label>
          <Input type="date" name="endDate" required />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Tipo</Label>
        <Select name="type">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar tipo...">
              {(value: unknown) => leaveTypeName(value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(
              Object.entries(LEAVE_TYPE_LABELS) as [TipoAusencia, string][]
            ).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Descripción (opcional)</Label>
        <Input name="description" placeholder="Motivo de la ausencia..." />
      </div>
      <Button type="submit" size="sm" disabled={pending} className="w-full">
        {pending ? "Registrando..." : "Registrar ausencia"}
      </Button>
    </form>
  );
}

function LeaveRow({
  leave,
  onMutate,
}: {
  leave: LeaveRecord;
  onMutate: () => void;
}) {
  const [state, formAction, pending] = useActionState(deleteLeave, null);

  useEffect(() => {
    if (state?.success) {
      onMutate();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onMutate]);

  const typeLabel = LEAVE_TYPE_LABELS[leave.type];

  return (
    <div className="flex items-center justify-between border border-border p-2 text-sm">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            {typeLabel}
          </span>
          <span className="text-muted-foreground">
            {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
          </span>
        </div>
        {leave.description && (
          <p className="text-xs text-muted-foreground">{leave.description}</p>
        )}
      </div>
      <form action={formAction}>
        <input type="hidden" name="id" value={leave.id} />
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          disabled={pending}
          title="Eliminar ausencia"
        >
          <X className="size-3.5" />
        </Button>
      </form>
    </div>
  );
}
