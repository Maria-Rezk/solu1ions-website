export type BrandPieceLayer = 'back' | 'front';
export type BrandPieceVariant = 'red' | 'white' | 'outline';

export interface BrandPieceMotion {
  id: number;
  layer: BrandPieceLayer;
  variant: BrandPieceVariant;
  startX: number;
  startY: number;
  midX: number;
  midY: number;
  endX: number;
  endY: number;
  startRotation: number;
  midRotation: number;
  endRotation: number;
  scale: number;
  delay: number;
  duration: number;
  serviceStage: 1 | 2 | 3 | 4;
  compact: boolean;
  mobile: boolean;
}

/**
 * System Assembly motion map. Values are percentage offsets from the official
 * logo mark's release point, so the composition is deterministic at every size.
 */
export const BRAND_PIECE_MOTIONS: BrandPieceMotion[] = [
  { id: 1, layer: 'back', variant: 'red', startX: -2, startY: -3, midX: -8, midY: 8, endX: -12, endY: 23, startRotation: -12, midRotation: -38, endRotation: -18, scale: 0.86, delay: 0, duration: 0.82, serviceStage: 1, compact: true, mobile: true },
  { id: 2, layer: 'front', variant: 'white', startX: 1, startY: -1, midX: -1, midY: 12, endX: -3, endY: 29, startRotation: 8, midRotation: 31, endRotation: 14, scale: 0.62, delay: 0.08, duration: 0.76, serviceStage: 1, compact: true, mobile: true },
  { id: 3, layer: 'back', variant: 'outline', startX: -1, startY: 2, midX: 4, midY: 13, endX: 7, endY: 27, startRotation: -4, midRotation: 46, endRotation: 24, scale: 0.72, delay: 0.14, duration: 0.9, serviceStage: 1, compact: true, mobile: false },
  { id: 4, layer: 'back', variant: 'red', startX: 2, startY: 1, midX: 10, midY: 10, endX: 15, endY: 24, startRotation: 13, midRotation: 58, endRotation: 36, scale: 0.54, delay: 0.2, duration: 0.84, serviceStage: 1, compact: true, mobile: false },
  { id: 5, layer: 'front', variant: 'white', startX: 0, startY: -2, midX: 14, midY: 16, endX: 21, endY: 32, startRotation: -18, midRotation: 24, endRotation: 9, scale: 0.48, delay: 0.26, duration: 0.92, serviceStage: 1, compact: false, mobile: false },

  { id: 6, layer: 'back', variant: 'outline', startX: 1, startY: -2, midX: 15, midY: 8, endX: 23, endY: 22, startRotation: 4, midRotation: -42, endRotation: -19, scale: 0.76, delay: 0.02, duration: 0.86, serviceStage: 2, compact: true, mobile: true },
  { id: 7, layer: 'back', variant: 'red', startX: -1, startY: 1, midX: 19, midY: 15, endX: 29, endY: 29, startRotation: -8, midRotation: 39, endRotation: 17, scale: 0.9, delay: 0.1, duration: 0.94, serviceStage: 2, compact: true, mobile: true },
  { id: 8, layer: 'front', variant: 'white', startX: 2, startY: 0, midX: 23, midY: 10, endX: 34, endY: 25, startRotation: 11, midRotation: 61, endRotation: 34, scale: 0.58, delay: 0.16, duration: 0.8, serviceStage: 2, compact: true, mobile: false },
  { id: 9, layer: 'back', variant: 'red', startX: 0, startY: -1, midX: 27, midY: 17, endX: 39, endY: 32, startRotation: -16, midRotation: -63, endRotation: -31, scale: 0.67, delay: 0.21, duration: 0.9, serviceStage: 2, compact: true, mobile: false },
  { id: 10, layer: 'back', variant: 'outline', startX: -2, startY: 2, midX: 31, midY: 13, endX: 44, endY: 28, startRotation: 5, midRotation: 47, endRotation: 23, scale: 0.52, delay: 0.27, duration: 0.96, serviceStage: 2, compact: false, mobile: false },

  { id: 11, layer: 'back', variant: 'red', startX: 1, startY: -2, midX: 31, midY: 8, endX: 45, endY: 21, startRotation: -7, midRotation: 49, endRotation: 27, scale: 0.82, delay: 0, duration: 0.88, serviceStage: 3, compact: true, mobile: true },
  { id: 12, layer: 'front', variant: 'outline', startX: -1, startY: 0, midX: 35, midY: 16, endX: 50, endY: 30, startRotation: 9, midRotation: -51, endRotation: -22, scale: 0.62, delay: 0.08, duration: 0.94, serviceStage: 3, compact: true, mobile: true },
  { id: 13, layer: 'back', variant: 'white', startX: 2, startY: 2, midX: 39, midY: 11, endX: 55, endY: 25, startRotation: -14, midRotation: 36, endRotation: 12, scale: 0.52, delay: 0.15, duration: 0.82, serviceStage: 3, compact: true, mobile: false },
  { id: 14, layer: 'back', variant: 'red', startX: 0, startY: -1, midX: 43, midY: 19, endX: 59, endY: 34, startRotation: 6, midRotation: 67, endRotation: 41, scale: 0.7, delay: 0.22, duration: 0.92, serviceStage: 3, compact: true, mobile: false },
  { id: 15, layer: 'front', variant: 'outline', startX: -2, startY: 1, midX: 46, midY: 14, endX: 62, endY: 28, startRotation: -10, midRotation: -39, endRotation: -16, scale: 0.46, delay: 0.28, duration: 0.98, serviceStage: 3, compact: false, mobile: false },

  { id: 16, layer: 'back', variant: 'white', startX: 1, startY: -2, midX: 39, midY: 4, endX: 57, endY: 35, startRotation: 12, midRotation: 54, endRotation: 32, scale: 0.58, delay: 0.02, duration: 0.84, serviceStage: 4, compact: true, mobile: true },
  { id: 17, layer: 'back', variant: 'red', startX: -1, startY: 1, midX: 45, midY: 9, endX: 63, endY: 38, startRotation: -5, midRotation: -58, endRotation: -26, scale: 0.88, delay: 0.09, duration: 0.92, serviceStage: 4, compact: true, mobile: true },
  { id: 18, layer: 'front', variant: 'outline', startX: 2, startY: 0, midX: 49, midY: 15, endX: 68, endY: 41, startRotation: 8, midRotation: 43, endRotation: 19, scale: 0.64, delay: 0.16, duration: 0.88, serviceStage: 4, compact: true, mobile: false },
  { id: 19, layer: 'back', variant: 'red', startX: 0, startY: -1, midX: 53, midY: 20, endX: 71, endY: 44, startRotation: -13, midRotation: 71, endRotation: 44, scale: 0.7, delay: 0.23, duration: 0.96, serviceStage: 4, compact: true, mobile: false },
  { id: 20, layer: 'back', variant: 'white', startX: -2, startY: 2, midX: 56, midY: 10, endX: 74, endY: 36, startRotation: 7, midRotation: -46, endRotation: -21, scale: 0.5, delay: 0.3, duration: 0.9, serviceStage: 4, compact: false, mobile: false },
];
