import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { Magnetic } from '../motion/Magnetic';
import { ParallaxMedia } from '../motion/ParallaxMedia';
import { Logo } from './Logo';
import { navigateTo } from '../../lib/scroll';
import { useCurvedReveal } from '../../hooks/useCurvedReveal';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { gsap, EASE_OUT } from '../../lib/gsap';
import { NAV_ITEMS, SOCIALS, SITE } from '../../data/site';
import { SERVICE_CATEGORIES } from '../../data/services';
import glassMark from '../../assets/mark-glass.webp';

/**
 * High-impact footer: the frosted-glass brand mark as a drifting watermark,
 * full navigation and service columns, verified contact channels, and a
 * magnetic back-to-top control.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  useCurvedReveal(ref, { radius: 96 });

  /* Progressive entrance: brand statement → link columns → legal row.
     A single early once-trigger so nothing is ever gated behind long motion. */
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: EASE_OUT, autoAlpha: 0 },
        scrollTrigger: { trigger: root, start: 'top 78%', once: true },
      });
      tl.from('.footer__brand', { y: 30, duration: 0.85 }, 0);
      tl.from('.footer__col', { y: 24, duration: 0.75, stagger: 0.09 }, 0.18);
      tl.from('.footer__bottom', { y: 16, duration: 0.65 }, 0.5);
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    navigateTo(href);
  };

  return (
    <footer ref={ref} className="footer" aria-label="Footer">
      <div className="footer__watermark" aria-hidden="true">
        <ParallaxMedia src={glassMark} alt="" speed={7} className="footer__watermark-media" />
      </div>

      <div className="container footer__inner">
        <div className="footer__brand">
          <a href="#home" className="footer__logo" onClick={(e) => go(e, '#home')} aria-label="Solu1ions â€” back to top">
            <Logo variant="wordmark" className="footer__logo-mark" title="" />
          </a>
          <p className="footer__tagline t-display">
            One partner. <em className="t-accent t-italic">Every solution.</em>
          </p>
        </div>

        <nav className="footer__col" aria-label="Footer navigation">
          <h2 className="t-label t-accent">Navigate</h2>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={(e) => go(e, item.href)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer__col" aria-label="Services">
          <h2 className="t-label t-accent">Services</h2>
          <ul>
            {SERVICE_CATEGORIES.map((c) => (
              <li key={c.id}>
                <a href={`#${c.id}`} onClick={(e) => go(e, `#${c.id}`)}>
                  {c.title.join(' ')}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col">
          <h2 className="t-label t-accent">Contact</h2>
          <ul>
            <li>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li className="t-muted">{SITE.location}</li>
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <p className="t-muted">
          آ© {year} {SITE.legalName}. All rights reserved.
        </p>
        <p className="t-muted footer__made">Made in Damascus.</p>
        <Magnetic strength={0.4}>
          <button
            type="button"
            className="footer__top"
            onClick={() => navigateTo('#home')}
            aria-label="Back to top"
            data-cursor="Top"
          >
            â†‘
          </button>
        </Magnetic>
      </div>
    </footer>
  );
}
