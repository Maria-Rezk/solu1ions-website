/* Ambient types for poly-decomp (no bundled typings). Only the surface
   Matter.js touches through `Common.setDecomp` is declared. */
declare module 'poly-decomp' {
  type DecompPoint = [number, number];

  interface PolyDecomp {
    makeCCW(polygon: DecompPoint[]): boolean;
    quickDecomp(polygon: DecompPoint[]): DecompPoint[][];
    decomp(polygon: DecompPoint[]): DecompPoint[][];
    isSimple(polygon: DecompPoint[]): boolean;
    removeCollinearPoints(polygon: DecompPoint[], thresholdAngle?: number): number;
    removeDuplicatePoints(polygon: DecompPoint[], precision?: number): void;
  }

  const polyDecomp: PolyDecomp;
  export default polyDecomp;
}
