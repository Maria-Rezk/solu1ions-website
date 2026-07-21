import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useIsTouch } from '../../hooks/useIsTouch';

/** Frosted-glass cursor, disabled for touch and reduced-motion users. */
export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
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

    const cursor = cursorRef.current;
    if (!cursor) return;

    gsap.set(cursor, { autoAlpha: 0 });
    const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.16, ease: 'power3.out' });
    const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.16, ease: 'power3.out' });

    let shown = false;
    const onMove = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.to(cursor, { autoAlpha: 1, duration: 0.24 });
      }
      cursorX(e.clientX);
      cursorY(e.clientY);
    };

    /* Sections may retitle their cursor while the pointer stays put — e.g. the
       testimonial canvas swapping DRAG for DRAGGING — so watch the attribute
       of whichever element is currently hovered. */
    let hovered: HTMLElement | null = null;
    const observer = new MutationObserver(() => {
      if (hovered) setLabel(hovered.dataset.cursor ?? '');
    });

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
      if (target) {
        hovered = target;
        observer.disconnect();
        observer.observe(target, { attributes: true, attributeFilter: ['data-cursor'] });
        setLabel(target.dataset.cursor ?? '');
        setActive(true);
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-cursor]')) {
        hovered = null;
        observer.disconnect();
        setActive(false);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.documentElement.classList.remove('has-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className={`cursor-glass ${active ? 'is-active' : ''}`}
      aria-hidden="true"
    >
      <span>{label}</span>
    </div>
  );
}
