import { memo, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Testimonial } from '../../types';
import { TESTIMONIALS, TESTIMONIAL_PLACEHOLDERS } from '../../data/testimonials';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useDragField } from '../../hooks/useDragField';
import { gsap, EASE_OUT } from '../../lib/gsap';
import './Testimonials.css';


/* ---- Layout ------------------------------------------------------------- */
type LayoutMode = 'desktop' | 'tablet' | 'mobile';

interface CardLayout {
  x: number;
  y: number;
  rotate: number;
  /** Offset the card starts from during the entrance (relative, in px). */
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

const MOBILE_ROTATIONS = [-2.5, 2, -1.5, 2.5, -2, 1.5];
const EDGE_PAD = 48;

function resolveMode(width: number): LayoutMode {
  if (width >= 1120) return 'desktop';
  if (width >= 720) return 'tablet';
  return 'mobile';
}

/**
 * Deterministic scatter — derived from the desktop preset stored on each
 * testimonial so a given viewport always produces the same composition.
 */
function buildLayout(items: Testimonial[], canvasWidth: number): FieldLayout {
  const mode = resolveMode(canvasWidth);
  const cardWidth =
    mode === 'desktop' ? 460 : mode === 'tablet' ? 372 : Math.min(canvasWidth * 0.84, 360);
  const gutter = mode === 'mobile' ? 16 : 0;

  const placed = items.map((item, index) => {
    if (mode === 'mobile') {
      return {
        x: index * (cardWidth + gutter),
        y: index % 2 === 0 ? 8 : 34,
        rotate: MOBILE_ROTATIONS[index % MOBILE_ROTATIONS.length],
      };
    }
    if (mode === 'tablet') {
      return {
        x: item.initialX * 0.8,
        y: item.initialY * 0.78,
        rotate: item.initialRotation * 0.6,
      };
    }
    return { x: item.initialX, y: item.initialY, rotate: item.initialRotation };
  });

  const contentWidth = placed.reduce((max, card) => Math.max(max, card.x + cardWidth), 0) + EDGE_PAD;
  const focalX = Math.min(canvasWidth, contentWidth) / 2;
  const focalY = mode === 'mobile' ? 20 : 120;

  const cards: CardLayout[] = placed.map((card) => ({
    ...card,
    enterX: (focalX - (card.x + cardWidth / 2)) * 0.55,
    enterY: (focalY - card.y) * 0.5,
    enterRotate: -card.rotate * 0.55,
  }));

  return { mode, cardWidth, contentWidth, cards };
}

/* ---- Card --------------------------------------------------------------- */
interface CardProps {
  testimonial: Testimonial;
  layout: CardLayout;
  index: number;
  eager: boolean;
  sample: boolean;
}

const TestimonialCard = memo(function TestimonialCard({
  testimonial,
  layout,
  index,
  eager,
  sample,
}: CardProps) {
  const style = {
    '--pt-x': `${layout.x}px`,
    '--pt-y': `${layout.y}px`,
    '--pt-rot': layout.rotate,
    '--pt-drift-dur': `${5.4 + (index % 4) * 0.9}s`,
    '--pt-drift-delay': `${(index % 5) * 0.42}s`,
    '--pt-drift-y': `${index % 2 === 0 ? -4 : 3}px`,
    zIndex: index + 1,
  } as CSSProperties;

  return (
    <article className="pt-card" style={style}>
      <div
        className="pt-card__enter"
        data-enter-x={layout.enterX}
        data-enter-y={layout.enterY}
        data-enter-rotate={layout.enterRotate}
      >
        <div className="pt-card__drift">
          <div className="pt-card__surface">
            <div className="pt-head">
              <div className="pt-avatar" aria-hidden={testimonial.avatar ? undefined : 'true'}>
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar.src}
                    alt={testimonial.avatar.alt}
                    width="56"
                    height="56"
                    loading={eager ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable="false"
                  />
                ) : (
                  <span className="t-label">{testimonial.initials ?? testimonial.name.charAt(0)}</span>
                )}
              </div>

              <div className="pt-det">
                <p className="pt-name">{testimonial.name}</p>
                <p className="pt-title t-muted">
                  {testimonial.role} <span aria-hidden="true">|</span> {testimonial.company}
                </p>
              </div>

              {sample && (
                <span className="pt-flag t-label" title="Placeholder content">
                  Sample
                </span>
              )}
            </div>

            <blockquote className="pt-content">
              <p className="pt-quote">{testimonial.quote}</p>
            </blockquote>
          </div>
        </div>
      </div>
    </article>
  );
});

/* ---- Section ------------------------------------------------------------ */
interface TestimonialsProps {
  items?: Testimonial[];
}

/**
 * Success stories as a draggable editorial canvas: the cards sit in a fixed,
 * deliberately scattered composition and the whole field translates as one
 * layer under a single pointer/RAF engine. React state is only touched at the
 * start and end of a gesture — every frame writes straight to the transform.
 */
export function Testimonials({ items }: TestimonialsProps) {
  const sample = TESTIMONIALS.length === 0;
  const testimonials = items ?? (sample ? TESTIMONIAL_PLACEHOLDERS : TESTIMONIALS);

  const sectionRef = useRef<HTMLElement>(null);
  const layoutRef = useRef<FieldLayout | null>(null);
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  const { canvasRef, layerRef, canvasWidth, dragging, handlers, step, remeasure } = useDragField({
    reduced,
    stepDistance: () => (layoutRef.current?.cardWidth ?? 380) + 40,
  });

  const layout = useMemo(
    () => (canvasWidth > 0 ? buildLayout(testimonials, canvasWidth) : null),
    [canvasWidth, testimonials],
  );
  layoutRef.current = layout;

  /* The layer's width changes with the layout — refresh the drag bounds on the
     same frame so the field is draggable immediately. */
  useLayoutEffect(remeasure, [layout, remeasure]);

  /* Entrance choreography. */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !layout) return;

    if (reduced) {
      setReady(true);
      return;
    }

    const context = gsap.context(() => {
      gsap.set('.pt-card__enter', { autoAlpha: 0 });

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 74%', once: true },
        defaults: { ease: EASE_OUT },
        onComplete: () => setReady(true),
      });

      timeline
        .fromTo(
          '.testimonials__eyebrow',
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
        )
        .fromTo(
          '.testimonials__title-line > span',
          { yPercent: 112 },
          { yPercent: 0, duration: 0.9, stagger: 0.1 },
          0.08,
        )
        .fromTo(
          '.testimonials__intro, .testimonials__hint',
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
          0.26,
        )
        .fromTo(
          '.pt-card__enter',
          {
            autoAlpha: 0,
            scale: 0.9,
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
            duration: 1.05,
            stagger: 0.085,
            clearProps: 'willChange',
          },
          0.34,
        );
    }, section);

    return () => context.revert();
  }, [layout, reduced]);

  const layerStyle = useMemo(
    () =>
      ({
        width: layout ? `${layout.contentWidth}px` : undefined,
        '--pt-card-w': layout ? `${layout.cardWidth}px` : undefined,
      }) as CSSProperties,
    [layout],
  );

  if (testimonials.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className={`testimonials section${ready ? ' is-ready' : ''}`}
      aria-labelledby="testimonials-heading"
    >
      <header className="container testimonials__head">
        <p className="testimonials__eyebrow eyebrow t-label">Success stories</p>
        <h2 id="testimonials-heading" className="testimonials__title t-display">
          <span className="testimonials__title-line">
            <span>Words from</span>
          </span>{' '}
          <span className="testimonials__title-line">
            <span className="t-accent t-italic">the people we build with.</span>
          </span>
        </h2>
        <p className="testimonials__intro t-muted">
          {sample
            ? 'Sample layout — the cards below hold placeholder copy until approved client quotes are signed off.'
            : 'Partnerships that outlasted the brief, in the words of the people who lived them.'}
        </p>
        <p className="testimonials__hint t-label" aria-hidden="true">
          Drag to explore
        </p>
      </header>

      <div
        ref={canvasRef}
        className={`testimonials-canvas${dragging ? ' is-dragging' : ''}`}
        role="group"
        tabIndex={0}
        aria-label="Client testimonials — drag or use the left and right arrow keys to move through the collection"
        data-cursor={dragging ? 'Dragging' : 'Drag'}
        {...handlers}
      >
        <div ref={layerRef} className="testimonials-drag-layer" style={layerStyle}>
          {layout?.cards.map((card, index) => (
            <TestimonialCard
              key={testimonials[index].id}
              testimonial={testimonials[index]}
              layout={card}
              index={index}
              eager={index < 2}
              sample={sample}
            />
          ))}
        </div>

        <div className="pt-nav">
          <button type="button" className="pt-nav__button" onClick={() => step(-1)}>
            <span className="sr-only">Show previous testimonials</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7M8 12h12" />
            </svg>
          </button>
          <button type="button" className="pt-nav__button" onClick={() => step(1)}>
            <span className="sr-only">Show next testimonials</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7M4 12h12" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
