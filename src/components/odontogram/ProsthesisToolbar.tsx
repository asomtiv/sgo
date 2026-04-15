'use client';

import { Button } from '@/components/ui/button';

interface ProsthesisToolbarProps {
  isActive: boolean;
  onToggle: () => void;
  selectedCount: number;
  onCreate: () => void;
  onCancel: () => void;
  readOnly?: boolean;
}

export function ProsthesisToolbar({
  isActive,
  onToggle,
  selectedCount,
  onCreate,
  onCancel,
  readOnly,
}: ProsthesisToolbarProps) {
  if (readOnly) return null;

  return (
    <div className="absolute right-4 top-4 flex items-center gap-2">
      {!isActive && (
        <Button variant="outline" size="sm" onClick={onToggle}>
          Marcar Prótesis
        </Button>
      )}

      {isActive && (
        <>
          <span className="text-xs text-muted-foreground">
            {selectedCount === 0
              ? 'Selecciona dientes'
              : `${selectedCount} seleccionado${selectedCount > 1 ? 's' : ''}`}
          </span>

          <Button
            size="sm"
            onClick={onCreate}
            disabled={selectedCount < 2}
          >
            Marcar
          </Button>

          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </>
      )}
    </div>
  );
}
