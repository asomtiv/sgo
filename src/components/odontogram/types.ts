export type {
  OdontogramFaceName as FaceName,
  OdontogramFaceStatus as FaceStatus,
  OdontogramToothOverlay as ToothOverlay,
  OdontogramToothState as ToothState,
  OdontogramProsthesis as Prosthesis,
  OdontogramData,
} from '@/types';

export type ToothFaces = Record<
  import('@/types').OdontogramFaceName,
  import('@/types').OdontogramFaceStatus
>;

export interface ToothProps {
  toothId: string;
  state: import('@/types').OdontogramToothState;
  onFaceChange: (face: import('@/types').OdontogramFaceName, status: import('@/types').OdontogramFaceStatus) => void;
  onOverlayChange: (overlay: import('@/types').OdontogramToothOverlay) => void;
  isUpper: boolean;
  readOnly?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export interface OdontogramProps {
  data: import('@/types').OdontogramData;
  onChange?: (data: import('@/types').OdontogramData) => void;
  readOnly?: boolean;
}
