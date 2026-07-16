import { useRef, type ReactNode, type PointerEvent } from 'react';
import { gsap } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useIsTouch } from '../../hooks/useIsTouch';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/** Magnetic hover attraction for buttons/links (desktop pointers only). */
export function Magnetic({ children, strength = 0.32, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const touch = useIsTouch();
  const enabled = !reduced && !touch;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    gsap.to(el, { x, y, duration: 0.4, ease: 'power3.out' });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el || !enabled) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: 'inline-block' }}
      onPointerMove={enabled ? onMove : undefined}
      onPointerLeave={enabled ? onLeave : undefined}
    >
      {children}
    </div>
  );
}
