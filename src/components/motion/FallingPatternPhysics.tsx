import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import {
  Bodies,
  Body,
  Common,
  Composite,
  Engine,
  Sleeping,
  type Vector,
} from 'matter-js';
import decomp from 'poly-decomp';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import './FallingPatternPhysics.css';

const ART_RATIO = 439.88 / 555.08;
const FIXED_STEP = 1000 / 60;
const RELEASE_WINDOW = 350;
const SETTLE_CHECK_AFTER = 2800;
const MAX_SIMULATION_TIME = 8600;

const COLLIDER_POINTS = [
  { x: 0.55, y: 0.03 },
  { x: 0.88, y: 0.03 },
  { x: 0.98, y: 0.16 },
  { x: 0.92, y: 0.39 },
  { x: 0.75, y: 0.62 },
  { x: 0.52, y: 0.8 },
  { x: 0.14, y: 0.96 },
  { x: 0.1, y: 0.82 },
  { x: 0.2, y: 0.52 },
  { x: 0.42, y: 0.37 },
] as const;

export interface FallingPatternPhysicsHandle {
  release: () => void;
}

interface FallingPatternPhysicsProps {
  patternSrc: string;
  className?: string;
  seed?: string;
}

interface GridProfile {
  name: 'mobile' | 'tablet' | 'desktop';
  columns: number;
  tileFill: number;
  rowSpacing: number;
}

interface GridPiece {
  id: number;
  element: HTMLSpanElement;
  width: number;
  height: number;
  x: number;
  y: number;
  releaseAt: number;
  velocityX: number;
  velocityY: number;
  angularVelocity: number;
  body?: Body;
  released: boolean;
}

interface BoundaryBodies {
  floor: Body;
  left: Body;
  right: Body;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function lerp(min: number, max: number, amount: number): number {
  return min + (max - min) * amount;
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index++) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: string): () => number {
  let state = hashSeed(seed);

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function getProfile(width: number): GridProfile {
  if (width < 640) {
    return {
      name: 'mobile',
      columns: clamp(Math.round(width / 78), 5, 6),
      tileFill: 0.95,
      rowSpacing: 1.34,
    };
  }

  if (width < 1024) {
    return {
      name: 'tablet',
      columns: clamp(Math.round(width / 112), 7, 9),
      tileFill: 0.94,
      rowSpacing: 1.18,
    };
  }

  return {
    name: 'desktop',
    columns: clamp(Math.round(width / 180), 8, 10),
    tileFill: 0.92,
    rowSpacing: 1.1,
  };
}

function setPieceTransform(piece: GridPiece, x: number, y: number, angle = 0): void {
  piece.element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${angle.toFixed(5)}rad)`;
}

function createPieceElement(
  root: HTMLDivElement,
  patternSrc: string,
  id: number,
  width: number,
): HTMLSpanElement {
  const element = document.createElement('span');
  const image = document.createElement('img');

  element.className = 'falling-pattern-physics__item';
  element.style.width = `${width.toFixed(2)}px`;
  element.dataset.piece = String(id);
  element.setAttribute('aria-hidden', 'true');

  image.className = 'falling-pattern-physics__piece';
  image.src = patternSrc;
  image.alt = '';
  image.draggable = false;
  image.decoding = 'async';
  image.loading = 'eager';
  image.setAttribute('aria-hidden', 'true');

  element.appendChild(image);
  root.appendChild(element);
  return element;
}

function buildGrid(
  root: HTMLDivElement,
  patternSrc: string,
  seed: string,
  width: number,
  height: number,
): GridPiece[] {
  const profile = getProfile(width);
  const random = createRandom(`${seed}:grid:${profile.name}:${Math.round(width)}x${Math.round(height)}`);
  const cellWidth = width / profile.columns;
  const tileWidth = cellWidth * profile.tileFill;
  const tileHeight = tileWidth * ART_RATIO;
  const rowPitch = tileHeight * profile.rowSpacing;
  const rowCount = Math.floor((height - tileHeight) / rowPitch) + 3;
  const pieces: GridPiece[] = [];

  root.replaceChildren();
  root.classList.remove('is-running', 'is-settled', 'is-reduced');
  root.classList.add('is-grid');
  root.dataset.profile = profile.name;

  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < profile.columns; column++) {
      const id = pieces.length;
      const x = column * cellWidth + (cellWidth - tileWidth) / 2;
      const y = (row - 2) * rowPitch + (row % 2 === 0 ? 0 : rowPitch * 0.035);
      const rowProgress = rowCount <= 1 ? 0 : row / (rowCount - 1);
      const releaseAt = clamp(
        (rowProgress * 0.38 + random() * 0.62) * RELEASE_WINDOW,
        0,
        RELEASE_WINDOW,
      );
      const element = createPieceElement(root, patternSrc, id, tileWidth);
      const piece: GridPiece = {
        id,
        element,
        width: tileWidth,
        height: tileHeight,
        x,
        y,
        releaseAt,
        velocityX: lerp(-0.28, 0.28, random()),
        velocityY: lerp(-0.03, 0.12, random()),
        angularVelocity: lerp(-0.007, 0.007, random()),
        released: false,
      };

      setPieceTransform(piece, x, y);
      pieces.push(piece);
    }
  }

  return pieces;
}

function buildReducedPile(
  root: HTMLDivElement,
  patternSrc: string,
  seed: string,
  width: number,
  height: number,
): void {
  const profile = getProfile(width);
  const random = createRandom(`${seed}:reduced:${profile.name}:${Math.round(width)}x${Math.round(height)}`);
  const tileWidth =
    profile.name === 'mobile'
      ? clamp(width * 0.17, 58, 70)
      : profile.name === 'tablet'
        ? clamp(width * 0.11, 72, 92)
        : clamp(width * 0.075, 88, 118);
  const tileHeight = tileWidth * ART_RATIO;
  const baseColumns = Math.ceil(width / (tileWidth * 0.78)) + 1;
  const rows = profile.name === 'mobile' ? 4 : 5;
  let id = 0;

  root.replaceChildren();
  root.classList.remove('is-grid', 'is-running');
  root.classList.add('is-settled', 'is-reduced');
  root.dataset.profile = profile.name;

  for (let row = 0; row < rows; row++) {
    const columns = Math.max(3, baseColumns - row * 2);
    const spread = width + tileWidth * 0.36 - row * tileWidth * 0.34;
    const startX = (width - spread) / 2;

    for (let column = 0; column < columns; column++) {
      const progress = columns === 1 ? 0.5 : column / (columns - 1);
      const element = createPieceElement(root, patternSrc, id, tileWidth);
      const piece: GridPiece = {
        id,
        element,
        width: tileWidth,
        height: tileHeight,
        x: startX + progress * (spread - tileWidth) + lerp(-tileWidth * 0.14, tileWidth * 0.14, random()),
        y:
          height -
          tileHeight * 0.72 -
          row * tileHeight * 0.62 +
          lerp(-tileHeight * 0.14, tileHeight * 0.14, random()),
        releaseAt: 0,
        velocityX: 0,
        velocityY: 0,
        angularVelocity: 0,
        released: true,
      };
      const angle = lerp(-0.58, 0.58, random());

      setPieceTransform(piece, piece.x, piece.y, angle);
      id += 1;
    }
  }
}

function createCollider(piece: GridPiece, random: () => number): Body {
  const inset = 0.8;
  const vertices: Vector[] = COLLIDER_POINTS.map((point) => ({
    x: (point.x - 0.5) * piece.width * inset,
    y: (point.y - 0.5) * piece.height * inset,
  }));

  const body = Bodies.fromVertices(
    piece.x + piece.width / 2,
    piece.y + piece.height / 2,
    [vertices],
    {
      label: `destination-pattern-${piece.id}`,
      restitution: lerp(0.08, 0.16, random()),
      friction: lerp(0.68, 0.84, random()),
      frictionStatic: 0.9,
      frictionAir: lerp(0.018, 0.032, random()),
      density: lerp(0.0012, 0.0017, random()),
      sleepThreshold: 42,
      slop: 0.04,
    },
    true,
    0.01,
    8,
    0.01,
  );

  Body.setAngle(body, 0);
  Body.setStatic(body, true);
  return body;
}

function createBoundaries(width: number, height: number): BoundaryBodies {
  const wallThickness = 96;
  const options = {
    isStatic: true,
    restitution: 0.04,
    friction: 0.86,
    frictionStatic: 0.96,
    label: 'destination-boundary',
  };

  return {
    floor: Bodies.rectangle(width / 2, height + wallThickness / 2 + 8, width + wallThickness * 2, wallThickness, options),
    left: Bodies.rectangle(-wallThickness / 2 + 3, height / 2, wallThickness, height * 3, options),
    right: Bodies.rectangle(width + wallThickness / 2 - 3, height / 2, wallThickness, height * 3, options),
  };
}

export const FallingPatternPhysics = forwardRef<
  FallingPatternPhysicsHandle,
  FallingPatternPhysicsProps
>(function FallingPatternPhysics(
  { patternSrc, className = '', seed = 'solu1ions-destination-pattern' },
  forwardedRef,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const releaseRef = useRef<() => void>(() => undefined);
  const reduced = usePrefersReducedMotion();

  useImperativeHandle(forwardedRef, () => ({ release: () => releaseRef.current() }), []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    Common.setDecomp(decomp);

    let width = root.clientWidth;
    let height = root.clientHeight;
    let pieces: GridPiece[] = [];
    let engine: Engine | null = null;
    let boundaries: BoundaryBodies | null = null;
    let frame = 0;
    let resizeTimer = 0;
    let started = false;
    let complete = false;
    let inViewport = true;
    let lastTime = 0;
    let accumulator = 0;
    let simulationTime = 0;
    let settledFor = 0;
    let releasedCount = 0;

    const syncPieces = () => {
      for (const piece of pieces) {
        if (!piece.body) continue;
        setPieceTransform(
          piece,
          piece.body.position.x - piece.width / 2,
          piece.body.position.y - piece.height / 2,
          piece.body.angle,
        );
      }
    };

    const finish = () => {
      if (complete) return;
      complete = true;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;

      for (const piece of pieces) {
        if (!piece.body || piece.body.isStatic) continue;
        Body.setVelocity(piece.body, { x: 0, y: 0 });
        Body.setAngularVelocity(piece.body, 0);
        Sleeping.set(piece.body, true);
      }

      syncPieces();
      root.classList.remove('is-running');
      root.classList.add('is-settled', 'is-interactive');
    };

    const releaseReadyPieces = () => {
      for (const piece of pieces) {
        if (!piece.body || piece.released || simulationTime < piece.releaseAt) continue;
        piece.released = true;
        releasedCount += 1;
        Body.setStatic(piece.body, false);
        Body.setVelocity(piece.body, { x: piece.velocityX, y: piece.velocityY });
        Body.setAngularVelocity(piece.body, piece.angularVelocity);
      }
    };

    const checkSettled = () => {
      if (simulationTime < SETTLE_CHECK_AFTER || releasedCount < pieces.length) return;

      let calmBodies = 0;
      for (const piece of pieces) {
        const body = piece.body;
        if (!body) continue;
        if (body.isSleeping || (body.speed < 0.13 && body.angularSpeed < 0.012)) calmBodies += 1;
      }

      if (calmBodies / pieces.length > 0.96) settledFor += FIXED_STEP;
      else settledFor = Math.max(0, settledFor - FIXED_STEP * 0.5);

      if (simulationTime > 7200) {
        for (const piece of pieces) {
          const body = piece.body;
          if (!body || body.isSleeping) continue;
          Body.setVelocity(body, { x: body.velocity.x * 0.9, y: body.velocity.y * 0.9 });
          Body.setAngularVelocity(body, body.angularVelocity * 0.82);
        }
      }

      if (settledFor > 720 || simulationTime >= MAX_SIMULATION_TIME) finish();
    };

    const tick = (time: number) => {
      if (!engine || complete || document.hidden || !inViewport) {
        frame = 0;
        return;
      }

      if (!lastTime) lastTime = time;
      accumulator += Math.min(time - lastTime, 80);
      lastTime = time;
      let steps = 0;

      while (accumulator >= FIXED_STEP && steps < 5) {
        releaseReadyPieces();
        Engine.update(engine, FIXED_STEP);
        simulationTime += FIXED_STEP;
        accumulator -= FIXED_STEP;
        steps += 1;
      }

      syncPieces();
      checkSettled();
      if (!complete) frame = requestAnimationFrame(tick);
    };

    const resume = () => {
      if (!started || complete || frame || document.hidden || !inViewport) return;
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    };

    const pause = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };

    const renderInitialState = () => {
      width = root.clientWidth;
      height = root.clientHeight;
      if (!width || !height) return;

      if (reduced) {
        buildReducedPile(root, patternSrc, seed, width, height);
        complete = true;
      } else {
        pieces = buildGrid(root, patternSrc, seed, width, height);
      }
    };

    const start = () => {
      if (started || complete || reduced || !pieces.length) return;
      started = true;
      root.classList.remove('is-grid');
      root.classList.add('is-running');

      const random = createRandom(`${seed}:matter:${Math.round(width)}x${Math.round(height)}`);
      engine = Engine.create({ enableSleeping: true });
      engine.gravity.x = 0;
      engine.gravity.y = 1;
      engine.gravity.scale = 0.001;

      for (const piece of pieces) {
        piece.body = createCollider(piece, random);
      }

      boundaries = createBoundaries(width, height);
      Composite.add(engine.world, [
        ...pieces.map((piece) => piece.body as Body),
        boundaries.floor,
        boundaries.left,
        boundaries.right,
      ]);
      resume();
    };

    const onPieceHover = (event: PointerEvent) => {
      if (reduced || !started || !engine || !complete || event.pointerType === 'touch') return;

      const target = event.target;
      const element =
        target instanceof Element
          ? target.closest<HTMLElement>('.falling-pattern-physics__item')
          : null;
      const pieceId = Number(element?.dataset.piece);
      const source = pieces[pieceId];
      if (!element || !source?.body || !root.contains(element)) return;

      const rootBounds = root.getBoundingClientRect();
      const clickX = event.clientX - rootBounds.left;
      const radius = source.width * 1.45;

      complete = false;
      simulationTime = RELEASE_WINDOW;
      settledFor = 0;
      accumulator = 0;
      root.classList.remove('is-settled');
      root.classList.add('is-running', 'is-interactive');

      for (const piece of pieces) {
        const body = piece.body;
        if (!body || body.isStatic) continue;

        const offsetX = body.position.x - source.body.position.x;
        const offsetY = body.position.y - source.body.position.y;
        const distance = Math.hypot(offsetX, offsetY);
        if (distance > radius) continue;

        const influence = 1 - distance / radius;
        const clickDirection = (body.position.x - clickX) / source.width;
        const fallbackDirection = piece.id % 2 === 0 ? -1 : 1;
        const direction = Math.abs(clickDirection) > 0.12 ? Math.sign(clickDirection) : fallbackDirection;
        const directBoost = piece.id === source.id ? 1 : 0;

        Sleeping.set(body, false);
        Body.setVelocity(body, {
          x: body.velocity.x + direction * (0.8 + influence * 2.1 + directBoost * 0.9),
          y: Math.min(body.velocity.y, 0) - (1.5 + influence * 3.5 + directBoost * 1.4),
        });
        Body.setAngularVelocity(
          body,
          body.angularVelocity + direction * (0.025 + influence * 0.055),
        );
      }

      resume();
    };

    releaseRef.current = start;
    renderInitialState();
    root.addEventListener('pointerover', onPieceHover);

    const visibilityObserver = new IntersectionObserver((entries) => {
      inViewport = entries.some((entry) => entry.isIntersecting);
      if (inViewport) resume();
      else pause();
    });
    visibilityObserver.observe(root);

    const onVisibilityChange = () => {
      if (document.hidden) pause();
      else resume();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const updateBoundaries = (nextWidth: number, nextHeight: number) => {
      if (!engine || !boundaries) return;
      Composite.remove(engine.world, [boundaries.floor, boundaries.left, boundaries.right]);
      boundaries = createBoundaries(nextWidth, nextHeight);
      Composite.add(engine.world, [boundaries.floor, boundaries.left, boundaries.right]);
    };

    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const nextWidth = root.clientWidth;
        const nextHeight = root.clientHeight;
        const materiallyChanged =
          Math.abs(nextWidth - width) > 18 || Math.abs(nextHeight - height) > 28;
        if (!nextWidth || !nextHeight || !materiallyChanged) return;

        if (!started) {
          width = nextWidth;
          height = nextHeight;
          if (reduced) buildReducedPile(root, patternSrc, seed, width, height);
          else pieces = buildGrid(root, patternSrc, seed, width, height);
          return;
        }

        updateBoundaries(nextWidth, nextHeight);
        width = nextWidth;
        height = nextHeight;
      }, 160);
    });
    resizeObserver.observe(root);

    return () => {
      releaseRef.current = () => undefined;
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      root.removeEventListener('pointerover', onPieceHover);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      if (engine) Engine.clear(engine);
      root.replaceChildren();
    };
  }, [patternSrc, reduced, seed]);

  return <div ref={rootRef} className={`falling-pattern-physics ${className}`} aria-hidden="true" />;
});
