import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

/* Tuned once, shared by every draggable canvas on the site. */
const FRICTION = 0.935;
const MIN_VELOCITY = 0.05;
const MAX_VELOCITY = 62;
const EDGE_RESISTANCE = 0.32; /* rubber-band factor while dragging past a bound */
const EDGE_SETTLE = 0.16; /* pull-back rate once released outside the bounds */
const GLIDE_RATE = 0.15; /* keyboard / button glide toward a target */
const DRAG_THRESHOLD = 6;
const MAX_SKEW = 1.3;
const DRAG_SCALE = 0.995;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resist(value: number, min: number, max: number): number {
  if (value > max) return max + (value - max) * EDGE_RESISTANCE;
  if (value < min) return min + (value - min) * EDGE_RESISTANCE;
  return value;
}

export interface DragFieldOptions {
  /** Disables momentum, skew and glide easing. */
  reduced: boolean;
  /**
   * Distance a single arrow-key press travels, in px. A getter, so it can read
   * a layout that is only measured after this hook runs.
   */
  stepDistance: () => number;
}

export interface DragFieldHandlers {
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onClickCapture: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
}

export interface DragField {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  layerRef: React.RefObject<HTMLDivElement | null>;
  /** Measured canvas width — drive the layout from this, never from a guess. */
  canvasWidth: number;
  dragging: boolean;
  handlers: DragFieldHandlers;
  step: (direction: number) => void;
  /**
   * Recompute the bounds now. Call it from a layout effect after the layer's
   * width changes so dragging is live on the same frame, rather than waiting
   * for the ResizeObserver to deliver.
   */
  remeasure: () => void;
}

/**
 * Horizontal drag engine for a card field that is wider than its canvas.
 *
 * One pointer-event set, one RAF loop that halts itself when idle, and one
 * ResizeObserver watching both canvas and layer so the bounds are always
 * measured rather than hard-coded. React state changes exactly twice per
 * gesture — every frame writes straight to the layer's transform.
 */
export function useDragField({ reduced, stepDistance }: DragFieldOptions): DragField {
  const canvasRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [dragging, setDragging] = useState(false);

  const engine = useRef({
    x: 0,
    velocity: 0,
    skew: 0,
    scale: 1,
    min: 0,
    max: 0,
    dragging: false,
    moved: false,
    startPointer: 0,
    startX: 0,
    lastPointer: 0,
    lastTime: 0,
    glide: null as number | null,
    raf: 0,
    running: false,
    reduced: false,
    step: (() => 0) as () => number,
  });

  engine.current.reduced = reduced;
  engine.current.step = stepDistance;

  const applyTransform = useCallback(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const e = engine.current;
    layer.style.transform = `translate3d(${e.x.toFixed(2)}px, 0, 0) skewX(${e.skew.toFixed(3)}deg) scale(${e.scale.toFixed(4)})`;
  }, []);

  const frame = useCallback(() => {
    const e = engine.current;

    if (!e.dragging) {
      if (e.glide !== null) {
        e.x += (e.glide - e.x) * GLIDE_RATE;
        if (Math.abs(e.glide - e.x) < 0.4) {
          e.x = e.glide;
          e.glide = null;
        }
      } else if (e.velocity !== 0 || e.x > e.max || e.x < e.min) {
        e.x += e.velocity;
        e.velocity *= FRICTION;

        if (e.x > e.max) {
          e.x += (e.max - e.x) * EDGE_SETTLE;
          e.velocity *= 0.55;
        } else if (e.x < e.min) {
          e.x += (e.min - e.x) * EDGE_SETTLE;
          e.velocity *= 0.55;
        }

        const settled =
          Math.abs(e.velocity) < MIN_VELOCITY && e.x <= e.max + 0.5 && e.x >= e.min - 0.5;
        if (settled) {
          e.velocity = 0;
          e.x = clamp(e.x, e.min, e.max);
        }
      }
    }

    const targetSkew =
      e.dragging && !e.reduced ? clamp(-e.velocity * 0.085, -MAX_SKEW, MAX_SKEW) : 0;
    const targetScale = e.dragging && !e.reduced ? DRAG_SCALE : 1;
    e.skew += (targetSkew - e.skew) * 0.14;
    e.scale += (targetScale - e.scale) * 0.14;

    applyTransform();

    const idle =
      !e.dragging &&
      e.glide === null &&
      e.velocity === 0 &&
      Math.abs(e.skew) < 0.004 &&
      Math.abs(e.scale - 1) < 0.0004;

    if (idle) {
      e.skew = 0;
      e.scale = 1;
      applyTransform();
      e.running = false;
      return;
    }
    e.raf = requestAnimationFrame(frame);
  }, [applyTransform]);

  const start = useCallback(() => {
    const e = engine.current;
    if (e.running) return;
    e.running = true;
    e.raf = requestAnimationFrame(frame);
  }, [frame]);

  /* Bounds are always measured: canvas width minus the real layer width. */
  const remeasure = useCallback(() => {
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    if (!canvas || !layer) return;

    const width = canvas.clientWidth;
    if (width === 0) return;
    const e = engine.current;
    e.max = 0;
    e.min = Math.min(0, width - layer.offsetWidth);
    e.glide = null;
    e.velocity = 0;
    e.x = clamp(e.x, e.min, e.max);
    applyTransform();
    setCanvasWidth((prev) => (prev === width ? prev : width));
  }, [applyTransform]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    if (!canvas || !layer) return;

    remeasure();
    const observer = new ResizeObserver(remeasure);
    observer.observe(canvas);
    observer.observe(layer);
    return () => observer.disconnect();
  }, [remeasure]);

  useEffect(() => {
    const e = engine.current;
    return () => {
      cancelAnimationFrame(e.raf);
      e.running = false;
    };
  }, []);

  const step = useCallback(
    (direction: number) => {
      const e = engine.current;
      if (e.min === e.max) return;
      const from = e.glide ?? e.x;
      e.velocity = 0;
      e.glide = clamp(from - direction * e.step(), e.min, e.max);
      if (e.reduced) {
        e.x = e.glide;
        e.glide = null;
        applyTransform();
        return;
      }
      start();
    },
    [applyTransform, start],
  );

  const handlers: DragFieldHandlers = {
    onPointerDown: (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const e = engine.current;
      if (e.min === e.max) return; /* nothing to explore */

      e.dragging = true;
      e.moved = false;
      e.glide = null;
      e.velocity = 0;
      e.startPointer = event.clientX;
      e.startX = e.x;
      e.lastPointer = event.clientX;
      e.lastTime = event.timeStamp;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* pointer already released — drag still tracks via the bubbled events */
      }
      setDragging(true);
      start();
    },

    onPointerMove: (event) => {
      const e = engine.current;
      if (!e.dragging) return;

      const delta = event.clientX - e.startPointer;
      if (Math.abs(delta) > DRAG_THRESHOLD) e.moved = true;
      e.x = resist(e.startX + delta, e.min, e.max);

      const elapsed = event.timeStamp - e.lastTime;
      if (elapsed > 8) {
        /* px per ~16ms frame */
        e.velocity = ((event.clientX - e.lastPointer) / elapsed) * 16;
        e.lastPointer = event.clientX;
        e.lastTime = event.timeStamp;
      }
    },

    onPointerUp: (event) => endDrag(event),
    onPointerCancel: (event) => endDrag(event),

    onClickCapture: (event) => {
      if (!engine.current.moved) return;
      event.preventDefault();
      event.stopPropagation();
      engine.current.moved = false;
    },

    onKeyDown: (event) => {
      const e = engine.current;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        e.velocity = 0;
        e.glide = e.max;
        if (e.reduced) {
          e.x = e.max;
          e.glide = null;
          applyTransform();
        } else start();
      } else if (event.key === 'End') {
        event.preventDefault();
        e.velocity = 0;
        e.glide = e.min;
        if (e.reduced) {
          e.x = e.min;
          e.glide = null;
          applyTransform();
        } else start();
      }
    },
  };

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const e = engine.current;
    if (!e.dragging) return;
    e.dragging = false;

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      /* capture already lost */
    }

    if (e.reduced) {
      e.velocity = 0;
      e.x = clamp(e.x, e.min, e.max);
    } else if (event.timeStamp - e.lastTime > 90) {
      e.velocity = 0; /* paused before releasing — no throw */
    } else {
      e.velocity = clamp(e.velocity, -MAX_VELOCITY, MAX_VELOCITY);
    }

    setDragging(false);
    start();
  }

  return { canvasRef, layerRef, canvasWidth, dragging, handlers, step, remeasure };
}
