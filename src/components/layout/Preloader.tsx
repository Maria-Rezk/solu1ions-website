import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, EASE_INOUT, EASE_OUT } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { MARQUEE_WORDS, SITE } from '../../data/site';

interface PreloaderProps {
  onComplete: () => void;
}

const WORDS = [SITE.name.toUpperCase(), ...MARQUEE_WORDS.map((w) => w.toUpperCase())];

/**
 * Full-screen brand loader: cycles the brand vocabulary behind a live
 * counter, lands on the closing statement, then wipes upward into the hero.
 * No artificial delay beyond the choreography itself (~3s); reduced motion
 * skips straight to the page.
 */
export function Preloader({ onComplete }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const closingRef = useRef<HTMLParagraphElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const done = useRef(onComplete);
  done.current = onComplete;

  // Reduced motion: no loader at all.
  useEffect(() => {
    if (reduced) done.current();
  }, [reduced]);

  useLayoutEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;

    document.body.style.overflow = 'hidden';
    let cancelled = false;

    const ctx = gsap.context(() => {
      const words = wordsRef.current;
      gsap.set(words, { yPercent: 110 });
      gsap.set(closingRef.current, { autoAlpha: 0, y: 24 });

      const counter = { value: 0 };
      const tl = gsap.timeline({ paused: true });

      const perWord = 0.42;
      words.forEach((word, i) => {
        const at = i * perWord;
        tl.to(word, { yPercent: 0, duration: 0.34, ease: EASE_OUT }, at);
        if (i < words.length - 1) {
          tl.to(word, { yPercent: -110, duration: 0.3, ease: EASE_INOUT }, at + perWord);
        }
      });

      const wordsEnd = words.length * perWord + 0.15;
      tl.to(
        counter,
        {
          value: 100,
          duration: wordsEnd,
          ease: 'power1.inOut',
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(Math.round(counter.value)).padStart(3, '0');
            }
          },
        },
        0,
      );
      tl.to(barRef.current, { scaleX: 1, duration: wordsEnd, ease: 'power1.inOut' }, 0);

      tl.to(words[words.length - 1], { yPercent: -110, duration: 0.3, ease: EASE_INOUT }, wordsEnd);
      tl.to(closingRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE_OUT }, wordsEnd + 0.05);
      tl.to(
        root,
        {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.9,
          ease: EASE_INOUT,
          onComplete: () => {
            document.body.style.overflow = '';
            ScrollTrigger.refresh();
            done.current();
          },
        },
        wordsEnd + 0.95,
      );

      // Start once fonts are usable so the type never swaps mid-sequence.
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(() => {
        if (!cancelled) tl.play();
      });
    }, root);

    return () => {
      cancelled = true;
      document.body.style.overflow = '';
      ctx.revert();
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div ref={rootRef} className="preloader" role="status" aria-label="Loading Solu1ions">
      <div className="preloader__center" aria-hidden="true">
        <div className="preloader__words t-display">
          {WORDS.map((word, i) => (
            <span
              key={word}
              ref={(el) => {
                if (el) wordsRef.current[i] = el;
              }}
              className="preloader__word"
            >
              {word}
            </span>
          ))}
        </div>
        <p ref={closingRef} className="preloader__closing t-display">
          One partner. <span className="t-accent t-italic">Every solution.</span>
        </p>
      </div>

      <div className="preloader__meta" aria-hidden="true">
        <span className="t-label">{SITE.legalName}</span>
        <div className="preloader__progress">
          <span ref={counterRef} className="preloader__counter t-display">
            000
          </span>
          <div className="preloader__bar">
            <div ref={barRef} className="preloader__bar-fill" />
          </div>
        </div>
        <span className="t-label">Loading</span>
      </div>
    </div>
  );
}
