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

import { Hero } from './components/sections/Hero';
import { Ticker } from './components/sections/Ticker';
import { Intro } from './components/sections/Intro';
import { Services } from './components/sections/Services';
import { Journey } from './components/sections/Journey';
import { Work } from './components/sections/Work';
import { Clients } from './components/sections/Clients';
import { Approach } from './components/sections/Approach';
import { Testimonials } from './components/sections/Testimonials';
import { Contact } from './components/sections/Contact';

export function App() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = usePrefersReducedMotion();

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
        <Hero ready={ready} />
        <Ticker />
        <Intro />
        <Services />
        <Journey />
        <Work />
        <Clients />
        <Approach />
        <Testimonials />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
