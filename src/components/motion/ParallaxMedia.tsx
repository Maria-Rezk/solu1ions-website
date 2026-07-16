import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface ParallaxMediaProps {
  src: string;
  alt: string;
  /** Total vertical drift in percent across the scroll range. */
  speed?: number;
  className?: string;
  width?: number;
  height?: number;
  eager?: boolean;
}

/** Image with a subtle scrub-linked vertical parallax inside a clipped frame. */
export function ParallaxMedia({
  src,
  alt,
  speed = 12,
  className,
  width,
  height,
  eager = false,
}: ParallaxMediaProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        { yPercent: -speed },
        {
          yPercent: speed,
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }, frame);
    return () => ctx.revert();
  }, [reduced, speed]);

  return (
    <div ref={frameRef} className={`parallax-frame ${className ?? ''}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="parallax-frame__img"
      />
    </div>
  );
}
