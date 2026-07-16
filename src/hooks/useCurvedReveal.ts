import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface CurvedRevealOptions {
  /** Corner radius (px) while the section is entering; unrounds to 0. */
  radius?: number;
  /** Scrub the previous section slightly under this one as it rises. */
  lift?: number;
}

/**
 * Tajreed "animate--radius / curved" entrance. As a dark section rises into
 * view its top corners un-round (large radius → 0) while it lifts a little,
 * scrubbed to scroll — the curtain-over-the-previous-section reveal used on
 * the reference's projects and footer panels. Desktop/tablet + motion only;
 * reduced-motion and phones leave the section square and flat.
 */
export function useCurvedReveal(
  ref: RefObject<HTMLElement | null>,
  { radius = 90, lift = 0 }: CurvedRevealOptions = {},
) {
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        gsap.fromTo(
          el,
          { borderTopLeftRadius: radius, borderTopRightRadius: radius, y: lift },
          {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, [ref, reduced, radius, lift]);
}
