import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useIsTouch } from '../../hooks/useIsTouch';

/**
 * Custom cursor: magenta dot + trailing ring. Elements opt into the large
 * labelled state with `data-cursor="View"`. Disabled on touch devices and
 * when the user prefers reduced motion (native cursor is restored).
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [active, setActive] = useState(false);
  const reduced = usePrefersReducedMotion();
  const touch = useIsTouch();
  const enabled = !reduced && !touch;

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove('has-cursor');
      return;
    }
    document.documentElement.classList.add('has-cursor');

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    gsap.set([dot, ring], { autoAlpha: 0 });
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

    let shown = false;
    const onMove = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
      if (target) {
        setLabel(target.dataset.cursor ?? '');
        setActive(true);
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-cursor]')) {
        setActive(false);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.documentElement.classList.remove('has-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={ringRef} className={`cursor-ring ${active ? 'is-active' : ''}`} aria-hidden="true">
        <span>{label}</span>
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
