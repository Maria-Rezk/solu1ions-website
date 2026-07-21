import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Project } from '../../types';
import { PROJECTS } from '../../data/projects';
import { SITE } from '../../data/site';
import { gsap, EASE_OUT } from '../../lib/gsap';
import { navigateTo } from '../../lib/scroll';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Marquee } from '../motion/Marquee';
import chromeFan from '../../assets/pattern-chrome.webp';

const FILTERS = ['All Projects', 'Strategy', 'Creative', 'Digital', 'Marketing'] as const;

type Filter = (typeof FILTERS)[number];
type ViewMode = 'grid' | 'list';

const FILTER_KEYWORDS: Record<Filter, string[]> = {
  'All Projects': [],
  Strategy: ['strategy', 'strategic', 'consult', 'communications', 'proposal'],
  Creative: ['creative', 'production', 'design', 'content', 'direction'],
  Digital: ['digital', 'web', 'ux', 'ui', 'development', 'product', 'platform', 'rtl'],
  Marketing: ['marketing', 'campaign', 'social', 'influencer'],
};

function projectMatches(project: Project, filter: Filter): boolean {
  if (filter === 'All Projects') return true;

  const haystack = [project.client, project.project, project.category, ...project.services]
    .join(' ')
    .toLowerCase();

  return FILTER_KEYWORDS[filter].some((keyword) => haystack.includes(keyword));
}

function ProjectVisual({ project, index, compact = false }: { project: Project; index: number; compact?: boolean }) {
  if (project.media) {
    return (
      <img
        src={project.media.src}
        alt={project.media.alt}
        loading="lazy"
        decoding="async"
        className="case-visual__img"
      />
    );
  }

  return (
    <div
      className={`case-visual__placeholder${compact ? ' case-visual__placeholder--compact' : ''}`}
      style={{ background: project.tint }}
      aria-hidden="true"
    >
      <img src={chromeFan} alt="" loading="lazy" decoding="async" className="case-visual__fan" />
      <span className="case-visual__number t-display">{String(index + 1).padStart(2, '0')}</span>
      <span className="case-visual__tag t-label">Case study in production</span>
    </div>
  );
}

function FilterButton({
  filter,
  active,
  count,
  onClick,
}: {
  filter: Filter;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`case-filter${active ? ' is-active' : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      <span>{filter}</span>
      <span className="case-filter__count">{String(count).padStart(2, '0')}</span>
    </button>
  );
}

export function CaseStudiesPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [filter, setFilter] = useState<Filter>('All Projects');
  const [view, setView] = useState<ViewMode>('grid');

  const filteredProjects = useMemo(
    () => PROJECTS.filter((project) => projectMatches(project, filter)),
    [filter],
  );

  const featured = filteredProjects[0] ?? PROJECTS[0];

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (reduced) {
      gsap.set(root.querySelectorAll('.case-reveal'), { autoAlpha: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.case-reveal',
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE_OUT, stagger: 0.08 },
      );
      gsap.fromTo(
        '.case-hero__feature',
        { autoAlpha: 0, y: 36, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: EASE_OUT, delay: 0.18 },
      );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.case-card, .case-row',
        { autoAlpha: 0, y: 22, scale: 0.992 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: EASE_OUT, stagger: 0.045 },
      );
    }, root);

    return () => ctx.revert();
  }, [filter, view, reduced]);

  return (
    <div ref={rootRef} className={`case-page case-page--${view}`}>
      <section className="case-hero" aria-labelledby="case-studies-heading">
        <div className="case-hero__rail" aria-hidden="true">
          <Marquee duration={34} className="case-rail">
            {PROJECTS.map((project, index) => (
              <span key={project.id} className="case-rail__item">
                {String(index + 1).padStart(2, '0')}. {project.client}
              </span>
            ))}
            <span className="case-rail__drag">(DRAG)</span>
          </Marquee>
        </div>

        <div className="container case-hero__inner">
          <div className="case-hero__copy case-reveal">
            <p className="eyebrow t-label">Case studies</p>
            <h1 id="case-studies-heading" className="case-hero__title t-display">
              Crafted systems.
              <br />
              <em className="t-accent t-italic">Measurable</em> motion.
            </h1>
          </div>

          <div className="case-hero__side case-reveal">
            <p>
              A sharper home for Solu1ions work: campaigns, digital systems, and operating rhythm
              built around clear outcomes.
            </p>
            <a
              href="/#contact"
              className="case-hero__link arrow-link"
              onClick={(event) => {
                event.preventDefault();
                navigateTo('#contact');
              }}
            >
              Build custom request <span className="arrow" aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </div>

        <div className="container case-hero__feature case-reveal">
          <article className="case-feature" aria-label={`Featured case study: ${featured.project}`}>
            <div className="case-feature__media">
              <ProjectVisual project={featured} index={PROJECTS.findIndex((project) => project.id === featured.id)} />
            </div>

            <div className="case-feature__meta">
              <p className="t-label t-accent">Featured system</p>
              <h2 className="case-feature__title t-display">{featured.project}</h2>
              <div className="case-feature__facts">
                <span>{featured.client}</span>
                <span>{featured.category}</span>
                <span>{featured.year}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="case-work on-light" aria-labelledby="case-work-heading">
        <div className="container case-work__inner">
          <div className="case-work__head">
            <div>
              <p className="t-label t-accent">Our work</p>
              <h2 id="case-work-heading" className="case-work__title t-display">
                Selected projects,
                <br />
                built to move.
              </h2>
            </div>
            <p className="case-work__copy">
              Browse the current Solu1ions case-study library by capability, then switch between a
              cinematic grid and a compact list view.
            </p>
          </div>

          <div className="case-toolbar" aria-label="Case study controls">
            <div className="case-filters" aria-label="Filter case studies">
              {FILTERS.map((item) => (
                <FilterButton
                  key={item}
                  filter={item}
                  active={filter === item}
                  count={PROJECTS.filter((project) => projectMatches(project, item)).length}
                  onClick={() => setFilter(item)}
                />
              ))}
            </div>

            <div className="case-view-toggle" aria-label="Choose view">
              {(['grid', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={view === mode ? 'is-active' : ''}
                  aria-pressed={view === mode}
                  onClick={() => setView(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {view === 'grid' ? (
            <div className="case-grid" aria-live="polite">
              {filteredProjects.map((project, index) => (
                <article
                  key={project.id}
                  className="case-card"
                  style={{ '--case-card-delay': `${index * 60}ms` } as CSSProperties}
                >
                  <div className="case-card__media" data-cursor="View">
                    <ProjectVisual project={project} index={PROJECTS.findIndex((item) => item.id === project.id)} compact />
                  </div>
                  <div className="case-card__body">
                    <div className="case-card__topline">
                      <span className="t-label t-accent">{String(index + 1).padStart(2, '0')}</span>
                      <span>{project.year}</span>
                    </div>
                    <h3 className="case-card__title t-display">{project.project}</h3>
                    <p className="case-card__client">{project.client}</p>
                    <p className="case-card__category">{project.category}</p>
                    <ul className="case-card__services" aria-label="Services">
                      {project.services.map((service) => (
                        <li key={service}>{service}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <ol className="case-list" aria-live="polite">
              {filteredProjects.map((project, index) => (
                <li key={project.id} className="case-row">
                  <article>
                    <span className="case-row__index t-label t-accent">{String(index + 1).padStart(2, '0')}</span>
                    <div className="case-row__main">
                      <h3 className="case-row__title t-display">{project.project}</h3>
                      <p>{project.client}</p>
                    </div>
                    <div className="case-row__meta">
                      <span>{project.category}</span>
                      <span>{project.year}</span>
                    </div>
                    <ProjectVisual project={project} index={PROJECTS.findIndex((item) => item.id === project.id)} compact />
                  </article>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="case-load" aria-label="Load more projects">
        <Marquee duration={18} reverse>
          <span className="case-load__text t-display">Load more projects</span>
          <span className="case-load__mark" aria-hidden="true">/</span>
          <span className="case-load__text t-display">More case studies soon</span>
          <span className="case-load__mark" aria-hidden="true">/</span>
        </Marquee>
      </section>

      <section className="case-cta">
        <div className="container case-cta__inner">
          <p className="t-label t-accent">{SITE.name} case-study pipeline</p>
          <h2 className="case-cta__title t-display">
            Have a project that needs its own operating rhythm?
          </h2>
          <a
            href="/#contact"
            className="btn btn--solid"
            onClick={(event) => {
              event.preventDefault();
              navigateTo('#contact');
            }}
          >
            Start a project
          </a>
        </div>
      </section>
    </div>
  );
}
