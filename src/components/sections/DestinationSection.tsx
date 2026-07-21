import { useLayoutEffect, useRef } from 'react';
import { gsap, EASE_OUT } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import {
  FallingPatternPhysics,
  type FallingPatternPhysicsHandle,
} from '../motion/FallingPatternPhysics';
import patternUnit from '../../assets/brand/pattern-unit.svg';
import './DestinationSection.css';

export function DestinationSection() {
  const rootRef = useRef<HTMLElement>(null);
  const physicsRef = useRef<FallingPatternPhysicsHandle>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const lockupParts = root.querySelectorAll(
      '.destination__the, .destination__one, .destination__rest',
    );
    const fold = root.querySelector('.destination__one-fold');

    if (reduced) {
      gsap.set(lockupParts, { autoAlpha: 1, y: 0 });
      if (fold) gsap.set(fold, { y: 0, scaleY: 1 });
      return;
    }

    const context = gsap.context(() => {
      gsap.set(lockupParts, { autoAlpha: 0, y: 20 });
      if (fold) gsap.set(fold, { y: 7, scaleY: 0.97, transformOrigin: '88% 14%' });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 60%',
          once: true,
        },
      });

      timeline
        .call(() => physicsRef.current?.release(), [], 0.25)
        .to(
          lockupParts,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.045,
          },
          0.48,
        );

      if (fold) {
        timeline.to(
          fold,
          {
            y: 0,
            scaleY: 1,
            duration: 0.8,
            ease: EASE_OUT,
          },
          0.6,
        );
      }
    }, root);

    return () => context.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="destination"
      className="destination"
      aria-label="Solu1ions - The 1 Destination Company"
    >
      <div className="destination__lockup">
        <p className="destination__tagline" aria-label="The 1 Destination Company">
          <span className="destination__the" aria-hidden="true">
            The
          </span>
          <svg
            className="destination__one"
            viewBox="1381.03 35.63 357.89 350.58"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <radialGradient
                id="destination-one-fold"
                cx="1475.21"
                cy="193.88"
                fx="1475.21"
                fy="193.88"
                r="52.23"
                gradientTransform="translate(2428.76 1387.41) rotate(-143.68) scale(1 2.05)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset=".38" stopColor="#540721" />
                <stop offset="1" stopColor="#c9144b" />
              </radialGradient>
            </defs>
            <path
              fill="url(#destination-one-fold)"
              d="M1491.23,120.26l-76.86,265.93,63.59.02,76.85-265.9-63.58-.05Z"
            />
            <path
              className="destination__one-fold"
              fill="#c9144b"
              d="M1554.81,120.3c-23.57,71.33-104.24,126.13-173.78,129.02l16.19-56.05c40.08-2.83,80.14-34.39,94.02-72.98h63.58Z"
            />
          </svg>
          <span className="destination__rest" aria-hidden="true">
            Destination
            <br />
            Company
          </span>
        </p>
      </div>

      <FallingPatternPhysics
        ref={physicsRef}
        patternSrc={patternUnit}
        className="destination__physics"
        seed="solu1ions-destination-pattern"
      />
    </section>
  );
}
