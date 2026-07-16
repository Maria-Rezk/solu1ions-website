import { useRef } from 'react';
import type { Project } from '../../types';
import { SplitLines } from '../motion/SplitLines';
import { Reveal } from '../motion/Reveal';
import { useCurvedReveal } from '../../hooks/useCurvedReveal';
import { PROJECTS } from '../../data/projects';
import chromeFan from '../../assets/pattern-chrome.webp';

/**
 * Branded placeholder used until real case-study media is supplied
 * (`project.media === null`). It is deliberately typographic â€” a tinted
 * brand surface, the chrome fan, and an honest "preview" tag â€” so nothing
 * on the page pretends to be a photograph that doesn't exist yet.
 */
function ProjectVisual({ project, index }: { project: Project; index: number }) {
  if (project.media) {
    return (
      <img
        src={project.media.src}
        alt={project.media.alt}
        loading="lazy"
        decoding="async"
        className="project__img"
      />
    );
  }
  return (
    <div className="project__placeholder" style={{ background: project.tint }} aria-hidden="true">
      <img src={chromeFan} alt="" loading="lazy" decoding="async" className="project__fan" />
      <span className="project__number t-display">{String(index + 1).padStart(2, '0')}</span>
      <span className="project__tag t-label">Case study â€” media in production</span>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Reveal className={`project ${index === 0 ? 'project--wide' : ''}`}>
      <article aria-label={`${project.project} for ${project.client}`}>
        <div className="project__media" data-cursor="View">
          <ProjectVisual project={project} index={index} />
        </div>
        <div className="project__meta">
          <div className="project__head">
            <h3 className="project__title t-display">{project.project}</h3>
            <span className="project__year t-muted">{project.year}</span>
          </div>
          <p className="project__client">
            {project.client} <span className="t-muted">â€” {project.category}</span>
          </p>
          <ul className="project__services" aria-label="Services delivered">
            {project.services.map((s) => (
              <li key={s} className="project__chip t-label">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </Reveal>
  );
}

/** Selected work â€” real engagements from the studio's roster. */
export function Work() {
  const ref = useRef<HTMLElement>(null);
  useCurvedReveal(ref, { radius: 96 });

  return (
    <section ref={ref} id="work" className="section work work--panel" aria-labelledby="work-heading">
      <div className="container">
        <div className="section-head work__head">
          <p className="eyebrow t-label">Selected work</p>
          <SplitLines as="h2" id="work-heading" className="work__title t-display">
            Work we <em className="t-accent t-italic">stand behind.</em>
          </SplitLines>
          <p className="work__note t-muted">
            A selection of recent engagements. Full case studies are being prepared for release.
          </p>
        </div>

        <div className="work__grid">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
