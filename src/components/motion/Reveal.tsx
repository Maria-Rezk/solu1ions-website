import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap, EASE_OUT, EASE_INOUT } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** fade = rise + fade · wipe = clip-path unmask · zoom = media scale-in */
  variant?: 'fade' | 'wipe' | 'zoom';
  delay?: number;
  y?: number;
}

/** Scroll-triggered entrance wrapper for blocks and media. */
export function Reveal({ children, className, variant = 'fade', delay = 0, y = 44 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      const trigger = { trigger: el, start: 'top 82%', once: true } as const;
      if (variant === 'wipe') {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: EASE_INOUT, delay, scrollTrigger: trigger },
        );
      } else if (variant === 'zoom') {
        gsap.fromTo(
          el,
          { autoAlpha: 0, scale: 1.08 },
          { autoAlpha: 1, scale: 1, duration: 1.3, ease: EASE_OUT, delay, scrollTrigger: trigger },
        );
      } else {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y },
          { autoAlpha: 1, y: 0, duration: 1, ease: EASE_OUT, delay, scrollTrigger: trigger },
        );
      }
    }, el);

    return () => ctx.revert();
  }, [reduced, variant, delay, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
