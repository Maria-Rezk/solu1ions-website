import { useLayoutEffect, useRef } from 'react';
import { gsap, EASE_OUT } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { scrollToId } from '../../lib/scroll';
import { SITE } from '../../data/site';

interface HeroProps {
  /** True once the preloader has finished — starts the entrance timeline. */
  ready: boolean;
}

/**
 * Editorial hero. Three masked display lines with an inline media "chip" —
 * the chrome Solu1ions 1T mark (the same treatment as the custom cursor) —
 * the kinetic-typography device the Tajreed reference uses.
 */
export function Hero({ ready }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  /* Entrance — plays once the preloader hands over. */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const lines = root.querySelectorAll<HTMLElement>('.hero__line');
    const rest = root.querySelectorAll<HTMLElement>('[data-hero-fade]');

    if (reduced) {
      gsap.set([...lines, ...rest], { clearProps: 'all', autoAlpha: 1, yPercent: 0, y: 0 });
      return;
    }

    gsap.set(lines, { yPercent: 112 });
    gsap.set(rest, { autoAlpha: 0, y: 22 });
    if (!ready) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });
      tl.to(lines, { yPercent: 0, duration: 1.25, stagger: 0.12 }, 0.05);
      tl.to(rest, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.7);
    }, root);
    return () => ctx.revert();
  }, [ready, reduced]);

  /* Ambient motion: the display drifts on scroll. */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      gsap.to('.hero__display', {
        yPercent: -8,
        autoAlpha: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="home" ref={rootRef} className="hero" aria-label="Introduction">
      <div className="hero__inner container">
        <p className="eyebrow t-label" data-hero-fade>
          {SITE.legalName} — {SITE.location}
        </p>

        <h1 className="hero__display t-display">
          <span className="hero__mask">
            <span className="hero__line">
              We build
              <span className="hero__chip" aria-hidden="true">
                <span className="hero__chip-mark" />
              </span>
            </span>
          </span>
          <span className="hero__mask">
            <span className="hero__line">businesses</span>
          </span>
          <span className="hero__mask">
            <span className="hero__line">
              <em className="t-accent t-italic">to lead.</em>
            </span>
          </span>
        </h1>

        <div className="hero__foot">
          <p className="hero__sub" data-hero-fade>
            {SITE.tagline} An integrated business-development partner — strategy, consultancy,
            marketing, creative production, and technology, connected under one roof.
          </p>

          <div className="hero__meta" data-hero-fade>
            <a
              href="#contact"
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('#contact');
              }}
            >
              Start a project
            </a>
            <a href={`mailto:${SITE.email}`} className="arrow-link">
              {SITE.email} <span className="arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="hero__scroll t-label"
        data-hero-fade
        onClick={() => scrollToId('#about')}
        aria-label="Scroll to the next section"
      >
        <span>Scroll to discover</span>
        <span className="hero__scroll-line" aria-hidden="true" />
      </button>
    </section>
  );
}
