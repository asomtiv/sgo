import type { FaceName, FaceStatus, ToothFaces, ToothOverlay, ToothState } from './types';

/**
 * Hex fill colors for SVG polygons.
 * Using fixed hex values that work well in both light and dark modes.
 * - healthy: neutral light (off-white with visible contrast)
 * - decay: red
 * - restored: blue
 * - absent: dark gray
 */
export const STATUS_FILL_COLORS: Record<FaceStatus, string> = {
  healthy: '#f8fafc',   // slate-50 — blanco casi puro, contrasta sobre secondary
  decay: '#ef4444',     // red-500
  restored: '#3b82f6',  // blue-500
  absent: '#475569',    // slate-600
};

/**
 * Hex colors for inline rendering (color indicators in popover).
 */
export const STATUS_INDICATOR_COLORS: Record<FaceStatus, string> = {
  healthy: '#94a3b8',
  decay: '#ef4444',
  restored: '#3b82f6',
  absent: '#475569',
};

export const FACE_LABELS: Record<FaceName, string> = {
  vestibular: 'Vestibular',
  lingual: 'Lingual',
  mesial: 'Mesial',
  distal: 'Distal',
  oclusal: 'Oclusal',
};

export const STATUS_OPTIONS: { value: FaceStatus; label: string }[] = [
  { value: 'healthy', label: 'Sano' },
  { value: 'decay', label: 'A restaurar' },
  { value: 'restored', label: 'Restaurado' },
  { value: 'absent', label: 'Ausente' },
];

// SVG polygon coordinates (viewBox 0 0 100 100)
const TOP_TRAPEZOID = '5,5 95,5 70,30 30,30';
const BOTTOM_TRAPEZOID = '30,70 70,70 95,95 5,95';
const LEFT_TRAPEZOID = '5,5 30,30 30,70 5,95';
const RIGHT_TRAPEZOID = '70,30 95,5 95,95 70,70';
const CENTER_SQUARE = '30,30 70,30 70,70 30,70';

export function getFacePolygons(
  isUpper: boolean,
  mesialIsRight: boolean
): Record<FaceName, string> {
  return {
    vestibular: isUpper ? TOP_TRAPEZOID : BOTTOM_TRAPEZOID,
    lingual: isUpper ? BOTTOM_TRAPEZOID : TOP_TRAPEZOID,
    mesial: mesialIsRight ? RIGHT_TRAPEZOID : LEFT_TRAPEZOID,
    distal: mesialIsRight ? LEFT_TRAPEZOID : RIGHT_TRAPEZOID,
    oclusal: CENTER_SQUARE,
  };
}

export function isMesialRight(toothId: string): boolean {
  const quadrant = parseInt(toothId[0], 10);
  return quadrant === 1 || quadrant === 4 || quadrant === 5 || quadrant === 8;
}

// FDI tooth numbering layouts
export const UPPER_ROW: string[] = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
];

export const LOWER_ROW: string[] = [
  '48', '47', '46', '45', '44', '43', '42', '41',
  '31', '32', '33', '34', '35', '36', '37', '38',
];

export const UPPER_TEMP_ROW: string[] = [
  '55', '54', '53', '52', '51',
  '61', '62', '63', '64', '65',
];

export const LOWER_TEMP_ROW: string[] = [
  '85', '84', '83', '82', '81',
  '71', '72', '73', '74', '75',
];

export const DEFAULT_FACES: ToothFaces = {
  vestibular: 'healthy',
  lingual: 'healthy',
  mesial: 'healthy',
  distal: 'healthy',
  oclusal: 'healthy',
};

export const DEFAULT_TOOTH_STATE: ToothState = {
  faces: DEFAULT_FACES,
  overlay: 'none',
};

export const OVERLAY_OPTIONS: { value: ToothOverlay; label: string; color: string }[] = [
  { value: 'none', label: 'Sin tratamiento', color: 'transparent' },
  { value: 'extraction', label: 'Extracción', color: '#ef4444' },
  { value: 'absent', label: 'Ausente', color: '#334155' },
  { value: 'crown', label: 'Corona', color: '#2563eb' },
];
