import { useEffect, useRef, type ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  /** Seconds for one full loop. */
  duration?: number;
  reverse?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Infinite, seamless marquee. Content is duplicated (clone is aria-hidden)
 * and moved with a pure-CSS transform loop — no per-frame JS. The global
 * reduced-motion rule freezes it automatically, and the loop pauses while
 * the marquee is outside the viewport.
 */
export function Marquee({ children, duration = 24, reverse = false, className, ariaLabel }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => el.classList.toggle('is-offscreen', !entry.isIntersecting),
      { rootMargin: '80px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`marquee ${className ?? ''}`}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
      <div
        className={`marquee__track ${reverse ? 'marquee__track--reverse' : ''}`}
        style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
      >
        <div className="marquee__group">{children}</div>
        <div className="marquee__group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
