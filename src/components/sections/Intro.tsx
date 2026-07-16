import { useLayoutEffect, useRef } from 'react';
import { SplitLines } from '../motion/SplitLines';
import { Reveal } from '../motion/Reveal';
import { scrollToId } from '../../lib/scroll';
import { gsap, EASE_INOUT, EASE_OUT } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { MISSION, VALUES, VISION } from '../../data/values';
import markChrome from '../../assets/mark-chrome.webp';
import logoSketches from '../../assets/logo-sketches.webp';
import patternChrome from '../../assets/pattern-chrome.webp';

const aboutPoints = [
  ['Pressure', 'When the business has too many moving parts and no clear next move.'],
  ['Alignment', 'When strategy, content, design, and technology need to move as one system.'],
  ['Momentum', 'When the idea is strong, but needs structure, ownership, and launch rhythm.'],
] as const;

export function Intro() {
  const rootRef = useRef<HTMLElement>(null);
  const signalRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    let cleanup = () => {};

    const ctx = gsap.context(() => {
      const signal = signalRef.current;
      const chrome = signal?.querySelector<HTMLElement>('.intro__pill-chrome');
      const sketch = signal?.querySelector<HTMLElement>('.intro__pill-sketch');
      const fan = signal?.querySelector<HTMLElement>('.intro__pill-fan');
      const label = signal?.querySelector<HTMLElement>('.intro__pill-label');

      gsap.from('.intro__rail span', {
        scaleX: 0,
        transformOrigin: 'left',
        duration: 1.2,
        ease: EASE_INOUT,
        stagger: 0.08,
        scrollTrigger: { trigger: root, start: 'top 76%', once: true },
      });

      gsap.from('.intro__media-pill, .intro__mvv-card, .intro__points li', {
        autoAlpha: 0,
        y: 26,
        duration: 0.9,
        ease: EASE_OUT,
        stagger: 0.055,
        scrollTrigger: { trigger: root, start: 'top 62%', once: true },
      });

      gsap.from('.intro__value-chip', {
        autoAlpha: 0,
        y: 12,
        duration: 0.55,
        ease: EASE_OUT,
        stagger: 0.025,
        scrollTrigger: { trigger: '.intro__mvv', start: 'top 72%', once: true },
      });

      gsap.from('.intro__statement-line', {
        yPercent: 110,
        duration: 1.05,
        ease: EASE_OUT,
        stagger: 0.075,
        scrollTrigger: { trigger: root, start: 'top 72%', once: true },
      });

      gsap.from('.intro__pill-label', {
        autoAlpha: 0,
        yPercent: 80,
        duration: 0.9,
        ease: EASE_OUT,
        scrollTrigger: { trigger: root, start: 'top 70%', once: true },
      });

      gsap.from('.intro__media-orbit', {
        clipPath: 'inset(0 50% 0 50%)',
        duration: 1.05,
        ease: EASE_INOUT,
        scrollTrigger: { trigger: root, start: 'top 70%', once: true },
      });

      gsap.to('.intro__beam', {
        xPercent: 36,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
      });

      gsap.to('.intro__word', {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
      });

      gsap.to('.intro__media-pill', {
        yPercent: -7,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
      });

      gsap.to('.intro__statement', {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
      });

      gsap.to('.intro__pill-chrome', {
        xPercent: -5,
        yPercent: -6,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
      });

      gsap.to('.intro__pill-fan', {
        rotate: 28,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
      });

      if (signal && chrome && sketch && fan && label) {
        const chromeX = gsap.quickTo(chrome, 'x', { duration: 0.65, ease: 'power3.out' });
        const chromeY = gsap.quickTo(chrome, 'y', { duration: 0.65, ease: 'power3.out' });
        const sketchX = gsap.quickTo(sketch, 'x', { duration: 0.55, ease: 'power3.out' });
        const sketchY = gsap.quickTo(sketch, 'y', { duration: 0.55, ease: 'power3.out' });
        const fanRot = gsap.quickTo(fan, 'rotate', { duration: 0.55, ease: 'power3.out' });
        const labelY = gsap.quickTo(label, 'y', { duration: 0.45, ease: 'power3.out' });

        const onMove = (event: PointerEvent) => {
          const rect = signal.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          chromeX(x * -18);
          chromeY(y * -12);
          sketchX(x * 16);
          sketchY(y * 10);
          fanRot(8 + x * 16);
          labelY(y * -8);
        };

        const onLeave = () => {
          chromeX(0);
          chromeY(0);
          sketchX(0);
          sketchY(0);
          fanRot(8);
          labelY(0);
        };

        signal.addEventListener('pointermove', onMove);
        signal.addEventListener('pointerleave', onLeave);
        cleanup = () => {
          signal.removeEventListener('pointermove', onMove);
          signal.removeEventListener('pointerleave', onLeave);
        };
      }
    }, root);

    return () => {
      cleanup();
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section ref={rootRef} id="about" className="section intro" aria-labelledby="intro-heading">
      <div className="intro__ambient" aria-hidden="true">
        <span className="intro__beam" />
        <span className="intro__beam intro__beam--slow" />
      </div>

      <div className="container">
        <div className="intro__rail" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="intro__hero">
          <p className="eyebrow t-label">About Solu1ions</p>
          <SplitLines as="p" className="intro__word t-display" delay={0.05}>
            we
          </SplitLines>
          <Reveal className="intro__media-pill" delay={0.08}>
            <div ref={signalRef} className="intro__media-orbit" data-cursor="Move">
              <img className="intro__pill-chrome" src={markChrome} alt="" loading="lazy" decoding="async" />
              <img className="intro__pill-sketch" src={logoSketches} alt="" loading="lazy" decoding="async" />
              <img className="intro__pill-fan" src={patternChrome} alt="" loading="lazy" decoding="async" />
              <span className="intro__pill-label t-display">connect</span>
            </div>
          </Reveal>
          <h2 id="intro-heading" className="intro__statement t-display" aria-label="Pressure to momentum">
            <span className="intro__statement-mask">
              <span className="intro__statement-line">Pressure</span>
            </span>
            <span className="intro__statement-mask intro__statement-mask--to">
              <span className="intro__statement-line">to</span>
            </span>
            <span className="intro__statement-mask">
              <span className="intro__statement-line">Momentum</span>
            </span>
          </h2>
        </div>

        <div className="intro__editorial">
          <Reveal className="intro__copy">
            <p className="intro__about-text">
              Solu1ions aligns strategy, marketing, creative direction, and digital execution into{' '}
              <em>one clear operating rhythm.</em>
            </p>
          </Reveal>

          <Reveal className="intro__brief" delay={0.14}>
            <p className="t-label t-accent">Built for</p>
            <ul className="intro__points">
              {aboutPoints.map(([label, point], index) => (
                <li key={label}>
                  <span className="intro__point-index t-label" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <strong>{label}</strong>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href="#services"
              className="arrow-link intro__link"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('#services');
              }}
            >
              See the system <span className="arrow" aria-hidden="true">-&gt;</span>
            </a>
          </Reveal>
        </div>

        <Reveal className="intro__mvv" delay={0.12}>
          <div className="intro__mvv-head">
            <p className="t-label t-accent">Mission / Vision / Values</p>
            <span className="t-label" aria-hidden="true">
              03 pillars
            </span>
          </div>

          <div className="intro__mvv-grid">
            <article className="intro__mvv-card">
              <span className="intro__mvv-index t-label">01</span>
              <h3 className="intro__mvv-title t-display">Vision</h3>
              <p>{VISION}</p>
            </article>

            <article className="intro__mvv-card">
              <span className="intro__mvv-index t-label">02</span>
              <h3 className="intro__mvv-title t-display">Mission</h3>
              <p>{MISSION}</p>
            </article>

            <article className="intro__mvv-card intro__mvv-card--values">
              <span className="intro__mvv-index t-label">03</span>
              <h3 className="intro__mvv-title t-display">Values</h3>
              <ul className="intro__value-list" aria-label="Solu1ions values">
                {VALUES.map((value) => (
                  <li key={value.index} className="intro__value-chip">
                    <span>{value.index}</span>
                    {value.name}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
