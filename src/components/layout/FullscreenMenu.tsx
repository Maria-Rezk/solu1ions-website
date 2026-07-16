import { useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react';
import { gsap, EASE_INOUT, EASE_OUT } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { scrollToId, getLenis } from '../../lib/scroll';
import { Marquee } from '../motion/Marquee';
import { NAV_ITEMS, SOCIALS, SITE } from '../../data/site';
import pattern from '../../assets/pattern-chrome.webp';

interface FullscreenMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Immersive fullscreen menu: navy panel descends, oversized numbered links
 * stagger in, contact details on the right, brand marquee at the base.
 * Traps focus, closes on Escape, locks page scroll while open.
 */
export function FullscreenMenu({ open, onClose }: FullscreenMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  // Build open/close timeline once.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.set(root, { yPercent: -100, visibility: 'hidden' });
      const tl = gsap.timeline({
        paused: true,
        onStart: () => gsap.set(root, { visibility: 'visible' }),
        onReverseComplete: () => gsap.set(root, { visibility: 'hidden' }),
      });
      tl.to(root, { yPercent: 0, duration: reduced ? 0.01 : 0.85, ease: EASE_INOUT });
      if (!reduced) {
        tl.fromTo(
          root.querySelectorAll('.fmenu__link'),
          { yPercent: 120 },
          { yPercent: 0, duration: 0.8, ease: EASE_OUT, stagger: 0.06 },
          '-=0.35',
        );
        tl.fromTo(
          root.querySelectorAll('.fmenu__aside > *'),
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE_OUT, stagger: 0.07 },
          '-=0.55',
        );
      }
      tlRef.current = tl;
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  // Drive timeline + scroll lock + focus management.
  useEffect(() => {
    const tl = tlRef.current;
    const lenis = getLenis();
    if (!tl) return;

    if (open) {
      lastFocused.current = document.activeElement as HTMLElement | null;
      lenis?.stop();
      document.body.style.overflow = 'hidden';
      tl.timeScale(1).play();
      rootRef.current?.querySelector<HTMLElement>('.fmenu__link a')?.focus();
    } else {
      tl.timeScale(1.5).reverse();
      lenis?.start();
      document.body.style.overflow = '';
      lastFocused.current?.focus();
    }
  }, [open]);

  // Escape + focus trap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = rootRef.current?.querySelectorAll<HTMLElement>('a[href], button');
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = rootRef.current?.contains(active as Node);
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onClose();
    // Let the panel begin closing before the page moves.
    window.setTimeout(() => scrollToId(href), reduced ? 0 : 250);
  };

  return (
    <div
      ref={rootRef}
      id="fullscreen-menu"
      className="fmenu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      inert={!open}
    >
      <img src={pattern} alt="" aria-hidden="true" className="fmenu__pattern" loading="lazy" />

      <div className="fmenu__inner container">
        <nav className="fmenu__nav" aria-label="Primary">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="fmenu__item">
                <span className="fmenu__mask">
                  <span className="fmenu__link">
                    <a href={item.href} onClick={(e) => go(e, item.href)} data-cursor="Go">
                      <span className="fmenu__index t-label t-accent">{item.index}</span>
                      <span className="fmenu__label t-display">{item.label}</span>
                    </a>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </nav>

        <aside className="fmenu__aside">
          <div>
            <p className="t-label t-accent">Get in touch</p>
            <a href={`mailto:${SITE.email}`} className="fmenu__email">
              {SITE.email}
            </a>
            <p className="t-muted fmenu__loc">{SITE.location}</p>
          </div>
          <div>
            <p className="t-label t-accent">Follow</p>
            <ul className="fmenu__socials">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="arrow-link">
                    {s.label} <span className="arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <a
            href="#contact"
            className="btn btn--solid"
            onClick={(e) => go(e, '#contact')}
          >
            Start a project
          </a>
        </aside>
      </div>

      <div className="fmenu__marquee" aria-hidden="true">
        <Marquee duration={20}>
          <span className="fmenu__marquee-text t-display">
            One partner <em className="t-accent">·</em> Every solution <em className="t-accent">·</em>{' '}
          </span>
        </Marquee>
      </div>
    </div>
  );
}
