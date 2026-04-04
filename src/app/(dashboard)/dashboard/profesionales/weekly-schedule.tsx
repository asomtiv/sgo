"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createAvailability, deleteAvailability } from "@/services/availability";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { WORK_DAYS } from "@/lib/constants";
import type { AvailabilityBlock } from "@/types";

export function WeeklySchedule({
  professionalId,
  availabilities,
  onMutate,
}: {
  professionalId: string;
  availabilities: AvailabilityBlock[];
  onMutate: () => void;
}) {
  const [addingDay, setAddingDay] = useState<number | null>(null);

  // Group availabilities by day
  const byDay = new Map<number, AvailabilityBlock[]>();
  for (const block of availabilities) {
    const existing = byDay.get(block.dayOfWeek) ?? [];
    existing.push(block);
    byDay.set(block.dayOfWeek, existing);
  }

  return (
    <div className="space-y-3">
      {WORK_DAYS.map((day) => (
        <DayRow
          key={day.value}
          day={day}
          blocks={byDay.get(day.value) ?? []}
          professionalId={professionalId}
          isAdding={addingDay === day.value}
          onToggleAdd={() =>
            setAddingDay(addingDay === day.value ? null : day.value)
          }
          onMutate={onMutate}
        />
      ))}
    </div>
  );
}

function DayRow({
  day,
  blocks,
  professionalId,
  isAdding,
  onToggleAdd,
  onMutate,
}: {
  day: (typeof WORK_DAYS)[number];
  blocks: AvailabilityBlock[];
  professionalId: string;
  isAdding: boolean;
  onToggleAdd: () => void;
  onMutate: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{day.label}</Label>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleAdd}
          title="Agregar bloque"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {blocks.length === 0 && !isAdding && (
        <p className="text-xs text-muted-foreground">Sin horario</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {blocks.map((block) => (
          <BlockBadge key={block.id} block={block} onMutate={onMutate} />
        ))}
      </div>

      {isAdding && (
        <AddBlockForm
          professionalId={professionalId}
          dayOfWeek={day.value}
          onDone={() => {
            onToggleAdd();
            onMutate();
          }}
        />
      )}
    </div>
  );
}

function BlockBadge({
  block,
  onMutate,
}: {
  block: AvailabilityBlock;
  onMutate: () => void;
}) {
  const [state, formAction, pending] = useActionState(deleteAvailability, null);

  useEffect(() => {
    if (state?.success) {
      onMutate();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onMutate]);

  return (
    <form action={formAction} className="inline-flex">
      <input type="hidden" name="id" value={block.id} />
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
        {block.startTime} - {block.endTime}
        <button
          type="submit"
          disabled={pending}
          className="hover:text-destructive transition-colors"
          title="Eliminar bloque"
        >
          <X className="size-3" />
        </button>
      </span>
    </form>
  );
}

function AddBlockForm({
  professionalId,
  dayOfWeek,
  onDone,
}: {
  professionalId: string;
  dayOfWeek: number;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(createAvailability, null);

  useEffect(() => {
    if (state?.success) {
      onDone();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex items-end gap-2">
      <input type="hidden" name="professionalId" value={professionalId} />
      <input type="hidden" name="dayOfWeek" value={dayOfWeek} />
      <div className="space-y-1">
        <Label className="text-xs">Desde</Label>
        <input
          type="time"
          name="startTime"
          required
          className="flex h-8 w-full border border-input bg-transparent px-2 py-1 text-sm shadow-xs transition-[color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Hasta</Label>
        <input
          type="time"
          name="endTime"
          required
          className="flex h-8 w-full border border-input bg-transparent px-2 py-1 text-sm shadow-xs transition-[color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : "Agregar"}
      </Button>
    </form>
  );
}
