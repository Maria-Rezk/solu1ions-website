import type Lenis from 'lenis';

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null): void {
  lenis = instance;
}

export function getLenis(): Lenis | null {
  return lenis;
}

/** Smooth-scroll to a section id, respecting the Lenis instance if active. */
export function scrollToId(hash: string): void {
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}
