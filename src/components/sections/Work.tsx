import { useLayoutEffect, useRef } from 'react';
import type { Project } from '../../types';
import { gsap } from '../../lib/gsap';
import { PROJECTS } from '../../data/projects';
import chromeFan from '../../assets/pattern-chrome.webp';

/**
 * Branded placeholder used until real case-study media is supplied
 * (`project.media === null`) — a tinted brand surface, the chrome fan, and an
 * honest "in production" tag, so nothing pretends to be a photo that doesn't
 * exist yet.
 */
function ProjectVisual({ project, index }: { project: Project; index: number }) {
  if (project.media) {
    return (
      <img
        src={project.media.src}
        alt={project.media.alt}
        loading="lazy"
        decoding="async"
        className="wcard__img"
      />
    );
  }
  return (
    <div className="wcard__placeholder" style={{ background: project.tint }} aria-hidden="true">
      <img src={chromeFan} alt="" loading="lazy" decoding="async" className="wcard__fan" />
      <span className="wcard__number t-display">{String(index + 1).padStart(2, '0')}</span>
      <span className="wcard__ptag t-label">Case study — in production</span>
    </div>
  );
}

/**
 * Selected Work — the Tajreed horizontal gallery: a dark, curved panel that
 * pins and scrolls a row of rounded project cards sideways as you scroll
 * down. On tablet/mobile and under reduced motion it becomes a clean vertical
 * stack. Reuses the pin mechanism proven in the Journey section.
 */
export function Work() {
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
      const distance = () => Math.max(0, track.scrollWidth - section.clientWidth);

      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
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
    <section ref={sectionRef} id="work" className="work work--panel" aria-labelledby="work-heading">
      <span className="work__label t-label" aria-hidden="true">
        Selected Work <span className="t-accent">/ 2026</span>
      </span>
      <div ref={trackRef} className="work__track">
        <header className="work__intro">
          <p className="eyebrow t-label">Selected work</p>
          <h2 id="work-heading" className="work__title t-display">
            Work we <em className="t-accent t-italic">stand behind.</em>
          </h2>
          <p className="work__note t-muted">
            A selection of recent engagements. Full case studies are being prepared for release.
          </p>
          <span className="work__hint t-label" aria-hidden="true">
            Scroll <span className="arrow">→</span>
          </span>
        </header>

        {PROJECTS.map((project, i) => (
          <article key={project.id} className="wcard" aria-label={`${project.project} for ${project.client}`}>
            <div className="wcard__media" data-cursor="View">
              <ProjectVisual project={project} index={i} />
            </div>
            <div className="wcard__meta">
              <div className="wcard__head">
                <h3 className="wcard__title t-display">{project.project}</h3>
                <span className="wcard__year t-muted">{project.year}</span>
              </div>
              <p className="wcard__client">
                {project.client} <span className="t-muted">— {project.category}</span>
              </p>
              <ul className="wcard__services" aria-label="Services delivered">
                {project.services.map((s) => (
                  <li key={s} className="wcard__chip t-label">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="work__progress" aria-hidden="true">
        <div ref={barRef} className="work__progress-bar" />
      </div>
    </section>
  );
}
