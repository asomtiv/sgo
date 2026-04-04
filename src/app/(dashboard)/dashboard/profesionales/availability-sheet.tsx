"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getProfessionalAvailability,
  updateSlotDuration,
} from "@/services/availability";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WeeklySchedule } from "./weekly-schedule";
import { LeavesSection } from "./leaves-section";
import { SLOT_DURATION_OPTIONS } from "@/lib/constants";
import { formatDisplayName } from "@/lib/format";
import type { ProfessionalWithDetails } from "@/types";
import type { ProfessionalAvailabilityData } from "@/types";

type Tab = "horarios" | "ausencias";

export function AvailabilitySheet({
  professional,
  open,
  onOpenChange,
}: {
  professional: ProfessionalWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<Tab>("horarios");
  const [data, setData] = useState<ProfessionalAvailabilityData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!professional) return;
    setLoading(true);
    try {
      const result = await getProfessionalAvailability(professional.id);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [professional]);

  // Fetch data when sheet opens
  useEffect(() => {
    if (open && professional) {
      fetchData();
    } else if (!open) {
      setData(null);
      setTab("horarios");
    }
  }, [open, professional, fetchData]);

  if (!professional) return null;

  const name = formatDisplayName(professional.user.profile, professional.user.email, professional.user.role);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Disponibilidad — {name}</SheetTitle>
          <SheetDescription>
            Configurar horarios de atención y ausencias
          </SheetDescription>
        </SheetHeader>

        {/* Tab toggle */}
        <div className="flex gap-1 border border-border p-1 mx-4">
          <button
            type="button"
            onClick={() => setTab("horarios")}
            className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "horarios"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Horarios
          </button>
          <button
            type="button"
            onClick={() => setTab("ausencias")}
            className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "ausencias"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ausencias
          </button>
        </div>

        <div className="px-4 pb-4">
          {loading ? (
            <div className="space-y-3 py-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : !data ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Error al cargar datos
            </p>
          ) : tab === "horarios" ? (
            <div className="space-y-4 pt-2">
              <SlotDurationForm
                professionalId={professional.id}
                currentDuration={data.slotDuration}
                onMutate={fetchData}
              />
              <div className="border-t border-border pt-3">
                <WeeklySchedule
                  professionalId={professional.id}
                  availabilities={data.availabilities}
                  onMutate={fetchData}
                />
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <LeavesSection
                professionalId={professional.id}
                leaves={data.leaves}
                onMutate={fetchData}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SlotDurationForm({
  professionalId,
  currentDuration,
  onMutate,
}: {
  professionalId: string;
  currentDuration: number;
  onMutate: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateSlotDuration, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Duración actualizada");
      onMutate();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onMutate]);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="professionalId" value={professionalId} />
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Duración de turno (min)</Label>
        <Select name="slotDuration" defaultValue={String(currentDuration)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: unknown) => `${value} min`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SLOT_DURATION_OPTIONS.map((min) => (
              <SelectItem key={min} value={String(min)}>
                {min} minutos
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : "Guardar"}
      </Button>
    </form>
  );
}
