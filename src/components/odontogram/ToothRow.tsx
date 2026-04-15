'use client';

import React from 'react';
import type { FaceName, FaceStatus, ToothOverlay, ToothState } from './types';
import { DEFAULT_TOOTH_STATE } from './constants';
import { Tooth } from './Tooth';

interface ToothRowProps {
  toothIds: string[];
  teeth: Record<string, ToothState>;
  onFaceChange: (toothId: string, face: FaceName, status: FaceStatus) => void;
  onOverlayChange: (toothId: string, overlay: ToothOverlay) => void;
  isUpper: boolean;
  readOnly?: boolean;
  prosthesisMode?: boolean;
  selectedTeeth?: Set<string>;
  onToggleSelect?: (toothId: string) => void;
}

export function ToothRow({
  toothIds,
  teeth,
  onFaceChange,
  onOverlayChange,
  isUpper,
  readOnly,
  prosthesisMode,
  selectedTeeth,
  onToggleSelect,
}: ToothRowProps) {
  const midlineIndex = Math.floor(toothIds.length / 2);

  return (
    <div className="flex items-end justify-center gap-0.5">
      {toothIds.map((id, i) => (
        <React.Fragment key={id}>
          {i === midlineIndex && (
            <div className="mx-1 h-16 w-px self-center bg-border" />
          )}
          <div className="flex flex-col items-center gap-0.5" data-tooth-id={id}>
            {isUpper && (
              <span className="font-sans font-bold text-[10px] text-muted-foreground">{id}</span>
            )}
            <Tooth
              toothId={id}
              state={teeth[id] ?? DEFAULT_TOOTH_STATE}
              onFaceChange={(face, status) => onFaceChange(id, face, status)}
              onOverlayChange={(overlay) => onOverlayChange(id, overlay)}
              isUpper={isUpper}
              readOnly={readOnly}
              isSelected={prosthesisMode && selectedTeeth?.has(id)}
              onSelect={prosthesisMode ? () => onToggleSelect?.(id) : undefined}
            />
            {!isUpper && (
              <span className="font-sans font-bold text-[10px] text-muted-foreground">{id}</span>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
