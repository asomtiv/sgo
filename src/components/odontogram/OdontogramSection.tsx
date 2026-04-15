"use client";

import { useState, useCallback, useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OdontogramBoard } from "./OdontogramBoard";
import { updateOdontogram } from "@/services/historia-clinica";
import type { OdontogramData } from "@/types";

const EMPTY_ODONTOGRAM: OdontogramData = { teeth: {}, prostheses: [] };

function normalizeOdontogramData(raw: unknown): OdontogramData {
  if (!raw || typeof raw !== "object") return EMPTY_ODONTOGRAM;
  const obj = raw as Record<string, unknown>;
  return {
    teeth: (obj.teeth && typeof obj.teeth === "object" ? obj.teeth : {}) as OdontogramData["teeth"],
    prostheses: Array.isArray(obj.prostheses) ? obj.prostheses : [],
  };
}

interface OdontogramSectionProps {
  historiaClinicaId: string;
  initialData: unknown;
  canEdit: boolean;
}

export function OdontogramSection({ historiaClinicaId, initialData, canEdit }: OdontogramSectionProps) {
  const [data, setData] = useState<OdontogramData>(() => normalizeOdontogramData(initialData));
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback((newData: OdontogramData) => {
    setData(newData);
    setIsDirty(true);
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateOdontogram({
        historiaClinicaId,
        odontograma: data,
      });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Odontograma guardado");
        setIsDirty(false);
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Odontograma</h2>
        {canEdit && (
          <Button
            onClick={handleSave}
            disabled={!isDirty || isPending}
            variant={isDirty ? "default" : "ghost"}
            size="sm"
          >
            <Save className="size-4 mr-1.5" />
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        )}
      </div>
      <div className="overflow-x-auto flex justify-center">
        <OdontogramBoard
          data={data}
          onChange={canEdit ? handleChange : undefined}
          readOnly={!canEdit}
        />
      </div>
    </div>
  );
}
