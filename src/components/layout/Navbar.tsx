import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { gsap, ScrollTrigger, EASE_OUT } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { scrollToId } from '../../lib/scroll';
import { Magnetic } from '../motion/Magnetic';
import { Logo } from './Logo';

interface NavbarProps {
  menuOpen: boolean;
  onMenuToggle: () => void;
  ready: boolean;
}

/**
 * Fixed navigation: hides on scroll-down, returns on scroll-up, gains a
 * translucent navy surface once past the hero. Forced visible while the
 * fullscreen menu is open.
 */
export function Navbar({ menuOpen, onMenuToggle, ready }: NavbarProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;

  // Entrance after the preloader.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      gsap.set(el, { autoAlpha: 1, y: 0 });
      return;
    }
    gsap.set(el, { autoAlpha: 0, y: -24 });
    if (ready) {
      gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE_OUT, delay: 0.2 });
    }
  }, [ready, reduced]);

  // Scroll behavior.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        el.classList.toggle('is-scrolled', self.scroll() > 60);
        if (menuOpenRef.current) {
          el.classList.remove('is-hidden');
          return;
        }
        const hide = self.direction === 1 && self.scroll() > 240;
        el.classList.toggle('is-hidden', hide);
      },
    });
    return () => trigger.kill();
  }, []);

  const handleAnchor = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToId('#home');
  };

  return (
    <header ref={ref} className={`navbar ${menuOpen ? 'is-menu-open' : ''}`}>
      <div className="navbar__inner container">
        <a href="#home" className="navbar__brand" onClick={handleAnchor} aria-label="Solu1ions — back to top">
          <Logo variant="wordmark" className="navbar__logo" title="" />
        </a>

        <div className="navbar__actions">
          <Magnetic className="navbar__cta-wrap">
            <a
              href="#contact"
              className="btn btn--solid navbar__cta"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('#contact');
              }}
            >
              Start a project
            </a>
          </Magnetic>

          <Magnetic strength={0.4}>
            <button
              type="button"
              className="navbar__menu-btn"
              onClick={onMenuToggle}
              aria-expanded={menuOpen}
              aria-controls="fullscreen-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              data-cursor={menuOpen ? 'Close' : 'Menu'}
            >
              <span className="navbar__menu-lines" aria-hidden="true">
                <span />
                <span />
              </span>
              <span className="navbar__menu-text t-label">{menuOpen ? 'Close' : 'Menu'}</span>
            </button>
          </Magnetic>
        </div>
      </div>
    </header>
  );
}
