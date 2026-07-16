import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { MILESTONES } from '../../data/milestones';

/**
 * "The Story Behind Each Year" — the site's signature moment. On desktop the
 * section pins and the five silver figures travel horizontally with the
 * scroll; on touch/small screens and with reduced motion it degrades to a
 * clean vertical sequence. Content is verbatim from the brand guidelines.
 */
export function Journey() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      section.classList.add('is-pinned');
      const distance = () => track.scrollWidth - section.clientWidth;

      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      return () => section.classList.remove('is-pinned');
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="journey" ref={sectionRef} className="journey" aria-labelledby="journey-heading">
      <div ref={trackRef} className="journey__track">
        <header className="journey__intro">
          <p className="eyebrow t-label">The story behind each year</p>
          <h2 id="journey-heading" className="journey__title t-display">
            Five years. <em className="t-accent t-italic">Five figures.</em>
          </h2>
          <p className="journey__lede">
            Every year at Solu1ions is marked by a silver figure — a character for how that
            chapter was lived.
          </p>
          <span className="journey__hint t-label" aria-hidden="true">
            Keep scrolling <span className="arrow">→</span>
          </span>
        </header>

        {MILESTONES.map((m) => (
          <figure key={m.year} className="journey__panel">
            <span className="journey__year t-display" aria-hidden="true">
              {m.year}
            </span>
            <img
              src={m.image.src}
              alt={m.image.alt}
              width="837"
              height="1500"
              loading="lazy"
              decoding="async"
              className="journey__statue"
            />
            <figcaption className="journey__caption">
              <span className="t-label t-accent">{m.year}</span>
              <h3 className="journey__name t-display">{m.title}</h3>
              <p>{m.story}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="journey__progress" aria-hidden="true">
        <div ref={barRef} className="journey__progress-bar" />
      </div>
    </section>
  );
}
