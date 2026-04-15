'use client';

import { useState, useRef } from 'react';
import { Popover } from '@/components/ui/popover';
import { PopoverContent } from '@/components/ui/popover';
import type { FaceName, ToothProps, ToothOverlay } from './types';
import { STATUS_FILL_COLORS, getFacePolygons, isMesialRight } from './constants';
import { ToothPopoverContent } from './ToothPopoverContent';

const FACE_ORDER: FaceName[] = ['vestibular', 'lingual', 'mesial', 'distal', 'oclusal'];

function OverlaySVG({ overlay }: { overlay: ToothOverlay }) {
  switch (overlay) {
    case 'extraction':
      return (
        <g stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
          <line x1="15" y1="15" x2="85" y2="85" />
          <line x1="85" y1="15" x2="15" y2="85" />
        </g>
      );
    case 'absent':
      return (
        <g stroke="#334155" strokeWidth="3" strokeLinecap="round">
          <line x1="15" y1="15" x2="85" y2="85" />
          <line x1="85" y1="15" x2="15" y2="85" />
        </g>
      );
    case 'crown':
      return (
        <circle cx="50" cy="50" r="42" fill="none" stroke="#2563eb" strokeWidth="2.5" />
      );
    default:
      return null;
  }
}

export function Tooth({
  toothId,
  state,
  onFaceChange,
  onOverlayChange,
  isUpper,
  readOnly,
  isSelected,
  onSelect,
}: ToothProps) {
  const [activeFace, setActiveFace] = useState<FaceName | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const polygons = getFacePolygons(isUpper, isMesialRight(toothId));

  const handleClick = (face: FaceName) => {
    if (readOnly) return;
    if (onSelect) {
      onSelect();
    } else {
      setActiveFace(face);
    }
  };

  return (
    <Popover
      open={activeFace !== null}
      onOpenChange={(open) => {
        if (!open) setActiveFace(null);
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className={[
          'h-12 w-12 sm:h-14 sm:w-14',
          isSelected ? 'ring-2 ring-primary' : '',
        ].join(' ')}
      >
        {/* Face polygons */}
        <g>
          {FACE_ORDER.map((face) => (
            <polygon
              key={face}
              points={polygons[face]}
              fill={STATUS_FILL_COLORS[state.faces[face]]}
              stroke="#64748b"
              strokeWidth="1.5"
              className="cursor-pointer transition-all hover:brightness-90"
              onClick={() => handleClick(face)}
            />
          ))}
        </g>

        {/* Overlay */}
        <g pointerEvents="none">
          <OverlaySVG overlay={state.overlay} />
        </g>
      </svg>

      {activeFace && (
        <PopoverContent
          side={isUpper ? 'bottom' : 'top'}
          sideOffset={6}
          anchor={svgRef}
        >
          <ToothPopoverContent
            toothId={toothId}
            face={activeFace}
            currentFaceStatus={state.faces[activeFace]}
            currentOverlay={state.overlay}
            onFaceSelect={(status) => {
              onFaceChange(activeFace, status);
              setActiveFace(null);
            }}
            onOverlaySelect={(overlay) => {
              onOverlayChange(overlay);
              setActiveFace(null);
            }}
          />
        </PopoverContent>
      )}
    </Popover>
  );
}
