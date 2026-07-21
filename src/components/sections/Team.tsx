import { memo, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { TeamMember } from '../../types';
import { TEAM_MEMBERS } from '../../data/team';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useDragField } from '../../hooks/useDragField';
import { gsap, EASE_OUT } from '../../lib/gsap';
import './Team.css';

/* Scatter presets are authored against this card width and scaled from it. */
const REFERENCE_CARD = 400;
const EDGE_PAD = 56;

type LayoutMode = 'desktop' | 'tablet' | 'mobile';

interface CardLayout {
  x: number;
  y: number;
  rotate: number;
  /** Relative offset the card animates in from. */
  enterX: number;
  enterY: number;
  enterRotate: number;
}

interface FieldLayout {
  mode: LayoutMode;
  cardWidth: number;
  contentWidth: number;
  cards: CardLayout[];
}

const MOBILE_ROTATIONS = [-2, 1.6, -1.2, 2, -1.8, 1.2, -2, 1.5];

function resolveMode(width: number): LayoutMode {
  if (width >= 1120) return 'desktop';
  if (width >= 720) return 'tablet';
  return 'mobile';
}

/** Mirrors the CSS card width so JS and CSS never disagree. */
function resolveCardWidth(mode: LayoutMode, canvasWidth: number): number {
  if (mode === 'mobile') return Math.min(canvasWidth * 0.86, 380);
  if (mode === 'tablet') return Math.min(Math.max(300, canvasWidth * 0.34), 340);
  return Math.min(Math.max(320, canvasWidth * 0.26), 430);
}

/** Measured height budget, so no card can ever clip the canvas floor. */
interface FitMetrics {
  canvasHeight: number;
  cardHeight: number;
}

/**
 * Deterministic composition — the same viewport always produces the same
 * scatter. Nothing here is randomised at render time.
 */
function buildLayout(
  members: TeamMember[],
  canvasWidth: number,
  fit: FitMetrics,
): FieldLayout {
  const mode = resolveMode(canvasWidth);
  const cardWidth = resolveCardWidth(mode, canvasWidth);
  const scale = cardWidth / REFERENCE_CARD;

  const placed = members.map((member, index) => {
    if (mode === 'mobile') {
      return {
        x: index * (cardWidth + 22),
        y: index % 2 === 0 ? 6 : 30,
        rotate: MOBILE_ROTATIONS[index % MOBILE_ROTATIONS.length],
      };
    }
    if (mode === 'tablet') {
      return {
        x: member.initialX * scale,
        y: member.initialY * scale * 0.8,
        rotate: member.initialRotation * 0.62,
      };
    }
    return {
      x: member.initialX * scale,
      y: member.initialY * scale,
      rotate: member.initialRotation,
    };
  });

  /* A rotated card's bounding box is taller and wider than the card itself —
     reserve that overhang so no corner is ever clipped by the canvas. */
  const overhang = mode === 'mobile' ? 14 : cardWidth * 0.12 + 10;

  /* Once the real card height is known, fit the vertical spread to the canvas:
     compress it so no card runs off the bottom, expand it so the composition
     never clusters at the top leaving dead space. Mobile keeps its deliberately
     light stagger and only ever compresses. */
  if (fit.canvasHeight > 0 && fit.cardHeight > 0) {
    const budget = Math.max(0, fit.canvasHeight - fit.cardHeight - overhang);
    const lowest = placed.reduce((max, c) => Math.max(max, c.y), 0);
    if (lowest > 0 && (mode !== 'mobile' || lowest > budget)) {
      const factor = budget / lowest;
      placed.forEach((card) => {
        card.y *= factor;
      });
    }
  }

  placed.forEach((card) => {
    card.x += overhang / 2;
    card.y += overhang / 2;
  });

  const contentWidth = placed.reduce((max, c) => Math.max(max, c.x + cardWidth), 0) + EDGE_PAD;
  const focalX = Math.min(canvasWidth, contentWidth) / 2;
  const focalY = mode === 'mobile' ? 18 : 110;

  return {
    mode,
    cardWidth,
    contentWidth,
    cards: placed.map((card) => ({
      ...card,
      enterX: (focalX - (card.x + cardWidth / 2)) * 0.55,
      enterY: (focalY - card.y) * 0.5,
      enterRotate: -card.rotate * 0.55,
    })),
  };
}

/* ---- Card ---------------------------------------------------------------- */
interface CardProps {
  member: TeamMember;
  layout: CardLayout;
  index: number;
}

const TeamMemberCard = memo(function TeamMemberCard({ member, layout, index }: CardProps) {
  const style = {
    '--tm-x': `${layout.x}px`,
    '--tm-y': `${layout.y}px`,
    '--tm-rot': layout.rotate,
    '--tm-drift-dur': `${6 + (index % 4) * 0.85}s`,
    '--tm-drift-delay': `${(index % 5) * 0.4}s`,
    '--tm-drift-y': `${index % 2 === 0 ? -4 : 3}px`,
    zIndex: index + 1,
  } as CSSProperties;

  return (
    <article
      className={`tm-card tm-card--${member.cardVariant ?? 'feature'}`}
      style={style}
      aria-labelledby={`tm-name-${member.id}`}
    >
      <div
        className="tm-card__enter"
        data-enter-x={layout.enterX}
        data-enter-y={layout.enterY}
        data-enter-rotate={layout.enterRotate}
      >
        <div className="tm-card__drift">
          <div className="tm-card__surface">
            <div className="tm-card__meta">
              <span className="tm-card__index t-label" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              {member.pending && (
                <span className="tm-card__flag t-label" title="Placeholder content">
                  Pending
                </span>
              )}
            </div>

            <blockquote className="tm-card__vision">
              <span className="tm-card__mark" aria-hidden="true">
                &ldquo;
              </span>
              <p>{member.vision}</p>
            </blockquote>

            <div className="tm-card__details">
              <h3 id={`tm-name-${member.id}`} className="tm-card__name t-display">
                {member.name}
              </h3>
              <p className="tm-card__position t-label">{member.position}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

/* ---- Section ------------------------------------------------------------- */
interface TeamProps {
  members?: TeamMember[];
}

/**
 * Our team as an explorable canvas: every person is a floating card in one
 * scattered field the visitor drags horizontally. Layout is measured and
 * deterministic; the pointer/RAF engine lives in useDragField, so this
 * component owns only composition and choreography.
 */
export function Team({ members = TEAM_MEMBERS }: TeamProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const layoutRef = useRef<FieldLayout | null>(null);
  const reduced = usePrefersReducedMotion();

  const { canvasRef, layerRef, canvasWidth, dragging, handlers, step, remeasure } = useDragField({
    reduced,
    stepDistance: () => (layoutRef.current?.cardWidth ?? 380) + 44,
  });

  const [fit, setFit] = useState<FitMetrics>({ canvasHeight: 0, cardHeight: 0 });

  const layout = useMemo(
    () => (canvasWidth > 0 ? buildLayout(members, canvasWidth, fit) : null),
    [canvasWidth, fit, members],
  );
  layoutRef.current = layout;

  /* The layer's width changes with the layout — refresh the drag bounds on the
     same frame so the field is draggable immediately. */
  useLayoutEffect(remeasure, [layout, remeasure]);

  /* Measure the canvas and the tallest card once per resize — card height is
     driven by width alone, so this settles in a single extra pass. */
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    if (!canvas || !layer || !layout) return;

    const measure = () => {
      const canvasHeight = canvas.clientHeight;
      let cardHeight = 0;
      for (const card of layer.children) {
        cardHeight = Math.max(cardHeight, (card as HTMLElement).offsetHeight);
      }
      if (canvasHeight === 0 || cardHeight === 0) return;
      setFit((prev) =>
        Math.abs(prev.canvasHeight - canvasHeight) < 1 && Math.abs(prev.cardHeight - cardHeight) < 1
          ? prev
          : { canvasHeight, cardHeight },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef, layerRef, layout]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !layout || reduced) return;

    const context = gsap.context(() => {
      gsap.set('.tm-card__enter', { autoAlpha: 0 });

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 72%', once: true },
        defaults: { ease: EASE_OUT },
      });

      timeline
        .fromTo('.team__eyebrow', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 })
        .fromTo(
          '.team__title-line > span',
          { yPercent: 112 },
          { yPercent: 0, duration: 0.9, stagger: 0.1 },
          0.08,
        )
        .fromTo(
          '.team__intro, .team__hint',
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
          0.26,
        )
        .fromTo(
          '.tm-card__enter',
          {
            autoAlpha: 0,
            scale: 0.91,
            x: (_i, el: HTMLElement) => Number(el.dataset.enterX ?? 0),
            y: (_i, el: HTMLElement) => Number(el.dataset.enterY ?? 0),
            rotate: (_i, el: HTMLElement) => Number(el.dataset.enterRotate ?? 0),
          },
          {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            y: 0,
            rotate: 0,
            duration: 1.1,
            stagger: 0.08,
            clearProps: 'willChange',
          },
          0.32,
        );
    }, section);

    return () => context.revert();
  }, [layout, reduced]);

  const layerStyle = useMemo(
    () =>
      ({
        width: layout ? `${layout.contentWidth}px` : undefined,
        '--tm-card-w': layout ? `${layout.cardWidth}px` : undefined,
      }) as CSSProperties,
    [layout],
  );

  if (members.length === 0) return null;

  return (
    <section ref={sectionRef} id="team" className="team section" aria-labelledby="team-heading">
      <div className="container team__head">
        <p className="team__eyebrow eyebrow t-label">Our team</p>
        <h2 id="team-heading" className="team__title t-display">
          <span className="team__title-line">
            <span>The people</span>
          </span>{' '}
          <span className="team__title-line">
            <span className="t-accent t-italic">behind the work.</span>
          </span>
        </h2>
        <p className="team__intro t-muted">
          A multidisciplinary team pairing strategy, creativity, technology, and execution — and
          the thinking each of them brings to it.
        </p>
        <p className="team__hint t-label" aria-hidden="true">
          Drag to meet the team
        </p>
      </div>

      <div
        ref={canvasRef}
        className={`team-canvas${dragging ? ' is-dragging' : ''}`}
        role="group"
        tabIndex={0}
        aria-label="Our team — drag, or use the left and right arrow keys, to move through the team"
        data-cursor={dragging ? 'Exploring' : 'Drag'}
        {...handlers}
      >
        <div ref={layerRef} className="team-drag-layer" style={layerStyle}>
          {layout?.cards.map((card, index) => (
            <TeamMemberCard
              key={members[index].id}
              member={members[index]}
              layout={card}
              index={index}
            />
          ))}
        </div>

        <div className="tm-nav">
          <button type="button" className="tm-nav__button" onClick={() => step(-1)}>
            <span className="sr-only">Show previous team members</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7M8 12h12" />
            </svg>
          </button>
          <button type="button" className="tm-nav__button" onClick={() => step(1)}>
            <span className="sr-only">Show next team members</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7M4 12h12" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
