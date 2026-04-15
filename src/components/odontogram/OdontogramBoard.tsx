'use client';

import { useState, useRef } from 'react';
import type { FaceName, FaceStatus, ToothOverlay, OdontogramProps } from './types';
import { UPPER_ROW, LOWER_ROW, UPPER_TEMP_ROW, LOWER_TEMP_ROW, DEFAULT_TOOTH_STATE } from './constants';
import { ToothRow } from './ToothRow';
import { ProsthesisToolbar } from './ProsthesisToolbar';
import { ProsthesisOverlay } from './ProsthesisOverlay';

export function OdontogramBoard({ data, onChange, readOnly }: OdontogramProps) {
  const [prosthesisMode, setProsthesisMode] = useState(false);
  const [selectedTeeth, setSelectedTeeth] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFaceChange = (toothId: string, face: FaceName, status: FaceStatus) => {
    if (!onChange) return;
    const tooth = data.teeth[toothId] ?? DEFAULT_TOOTH_STATE;
    onChange({
      ...data,
      teeth: {
        ...data.teeth,
        [toothId]: { ...tooth, faces: { ...tooth.faces, [face]: status } },
      },
    });
  };

  const handleOverlayChange = (toothId: string, overlay: ToothOverlay) => {
    if (!onChange) return;
    const tooth = data.teeth[toothId] ?? DEFAULT_TOOTH_STATE;
    onChange({
      ...data,
      teeth: {
        ...data.teeth,
        [toothId]: { ...tooth, overlay },
      },
    });
  };

  const handleToggleSelect = (toothId: string) => {
    setSelectedTeeth((prev) => {
      const next = new Set(prev);
      if (next.has(toothId)) {
        next.delete(toothId);
      } else {
        next.add(toothId);
      }
      return next;
    });
  };

  const handleCreateProsthesis = () => {
    if (!onChange) return;
    const id = crypto.randomUUID();
    onChange({
      ...data,
      prostheses: [...data.prostheses, { id, teeth: Array.from(selectedTeeth) }],
    });
    setSelectedTeeth(new Set());
    setProsthesisMode(false);
  };

  const handleRemoveProsthesis = (prosthesisId: string) => {
    if (!onChange) return;
    onChange({
      ...data,
      prostheses: data.prostheses.filter((p) => p.id !== prosthesisId),
    });
  };

  const handleCancelProsthesis = () => {
    setProsthesisMode(false);
    setSelectedTeeth(new Set());
  };

  const rowProps = {
    teeth: data.teeth,
    onFaceChange: handleFaceChange,
    onOverlayChange: handleOverlayChange,
    readOnly,
    prosthesisMode,
    selectedTeeth,
    onToggleSelect: handleToggleSelect,
  };

  return (
    <div ref={containerRef} className="relative inline-flex flex-col items-center gap-2 bg-secondary border border-border p-6 pt-14">
      <ProsthesisToolbar
        isActive={prosthesisMode}
        onToggle={() => {
          setProsthesisMode(!prosthesisMode);
          setSelectedTeeth(new Set());
        }}
        selectedCount={selectedTeeth.size}
        onCreate={handleCreateProsthesis}
        onCancel={handleCancelProsthesis}
        readOnly={readOnly}
      />

      <ToothRow toothIds={UPPER_TEMP_ROW} isUpper={true} {...rowProps} />
      <ToothRow toothIds={UPPER_ROW} isUpper={true} {...rowProps} />

      <div className="w-full border-t border-border" />

      <ToothRow toothIds={LOWER_ROW} isUpper={false} {...rowProps} />
      <ToothRow toothIds={LOWER_TEMP_ROW} isUpper={false} {...rowProps} />

      <ProsthesisOverlay
        prostheses={data.prostheses}
        containerRef={containerRef}
        onRemove={handleRemoveProsthesis}
        readOnly={readOnly}
      />
    </div>
  );
}
