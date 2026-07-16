import { useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react';
import { gsap, ScrollTrigger, SplitText, EASE_OUT } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface SplitLinesProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  id?: string;
  /** Seconds before the first line moves (after the trigger fires). */
  delay?: number;
  /** Per-line stagger in seconds. */
  stagger?: number;
  /** Animate immediately instead of waiting for a scroll trigger. */
  immediate?: boolean;
}

/**
 * Masked line-by-line reveal. Splitting waits for fonts so line breaks are
 * final; with reduced motion the text simply appears.
 */
export function SplitLines({
  children,
  as: Tag = 'p',
  className,
  id,
  delay = 0,
  stagger = 0.09,
  immediate = false,
}: SplitLinesProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    let split: SplitText | null = null;
    let trigger: ScrollTrigger | null = null;
    let tween: gsap.core.Tween | null = null;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return;
      split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
      gsap.set(el, { opacity: 1 });
      tween = gsap.fromTo(
        split.lines,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1.15,
          ease: EASE_OUT,
          delay,
          stagger,
          scrollTrigger: immediate
            ? undefined
            : { trigger: el, start: 'top 80%', once: true },
        },
      );
      trigger = tween.scrollTrigger ?? null;
    });

    return () => {
      cancelled = true;
      trigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, [reduced, delay, stagger, immediate]);

  return (
    <Tag ref={ref} id={id} className={className} data-split="">
      {children}
    </Tag>
  );
}
