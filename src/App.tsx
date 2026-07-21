import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './lib/gsap';
import { setLenis } from './lib/scroll';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

import { Preloader } from './components/layout/Preloader';
import { Navbar } from './components/layout/Navbar';
import { FullscreenMenu } from './components/layout/FullscreenMenu';
import { Footer } from './components/layout/Footer';
import { Cursor } from './components/motion/Cursor';
import { CaseStudiesPage } from './components/pages/CaseStudiesPage';

import { Hero } from './components/sections/Hero';
import { Ticker } from './components/sections/Ticker';
import { Intro } from './components/sections/Intro';
import { Services } from './components/sections/Services';
import { Journey } from './components/sections/Journey';
import { Work } from './components/sections/Work';
import { Clients } from './components/sections/Clients';
import { Testimonials } from './components/sections/Testimonials';
import { Team } from './components/sections/Team';
import { DestinationSection } from './components/sections/DestinationSection';
import { Contact } from './components/sections/Contact';
import { scrollToId } from './lib/scroll';

function normalizePath(path: string): string {
  const clean = path.replace(/\/+$/, '');
  return clean || '/';
}

export function App() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const reduced = usePrefersReducedMotion();
  const isCaseStudies = path === '/case-studies';

  /* Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger and
     the scroll position never disagree. Skipped entirely for reduced motion —
     the browser's native scroll takes over. */
  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  /* Hold the page still while the preloader plays. */
  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', !ready);
  }, [ready]);

  /* Mirror the media query as a class so CSS fallbacks can target it. */
  useEffect(() => {
    document.documentElement.classList.toggle('no-motion', reduced);
  }, [reduced]);

  useEffect(() => {
    const syncPath = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  useEffect(() => {
    document.title = isCaseStudies
      ? 'Case Studies — Solu1ions'
      : 'Solu1ions — One partner. Every solution.';
  }, [isCaseStudies]);

  useEffect(() => {
    if (isCaseStudies || !ready || !window.location.hash) return;

    const timer = window.setTimeout(() => scrollToId(window.location.hash), 120);
    return () => window.clearTimeout(timer);
  }, [isCaseStudies, path, ready]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {!ready && <Preloader onComplete={() => setReady(true)} />}

      <Cursor />
      <Navbar ready={ready} menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((v) => !v)} />
      <FullscreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main id="main">
        {isCaseStudies ? (
          <CaseStudiesPage />
        ) : (
          <>
            <Hero ready={ready} />
            <Ticker />
            <Intro />
            <Services />
            <Journey />
            <Work />
            <Clients />
            <Testimonials />
            <Team />
            <DestinationSection />
            <Contact />
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
