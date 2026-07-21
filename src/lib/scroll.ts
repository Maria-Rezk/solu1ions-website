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

function scrollToTop(): void {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.1 });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function normalizePath(path: string): string {
  const clean = path.replace(/\/+$/, '');
  return clean || '/';
}

function notifyRouteChange(): void {
  window.dispatchEvent(new Event('popstate'));
}

/** Navigate between the home anchors and lightweight SPA pages. */
export function navigateTo(href: string): void {
  if (href.startsWith('#')) {
    if (normalizePath(window.location.pathname) === '/') {
      if (window.location.hash !== href) {
        window.history.replaceState(null, '', href);
      }
      scrollToId(href);
      return;
    }

    window.history.pushState(null, '', `/${href}`);
    notifyRouteChange();
    window.setTimeout(() => scrollToId(href), 80);
    return;
  }

  const nextPath = normalizePath(href);
  if (normalizePath(window.location.pathname) === nextPath) {
    scrollToTop();
    return;
  }

  window.history.pushState(null, '', nextPath);
  notifyRouteChange();
  window.requestAnimationFrame(scrollToTop);
}
