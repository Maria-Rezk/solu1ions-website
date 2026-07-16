import { useLayoutEffect, useRef } from 'react';
import type { ServiceCategory } from '../../types';
import { gsap, EASE_OUT } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { SplitLines } from '../motion/SplitLines';
import { Reveal } from '../motion/Reveal';
import { ParallaxMedia } from '../motion/ParallaxMedia';
import { scrollToId } from '../../lib/scroll';
import { SERVICE_CATEGORIES } from '../../data/services';

/** Staggered entrance for the individual service rows of one chapter. */
function ServiceList({ services }: { services: string[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('li'), {
        autoAlpha: 0,
        x: -26,
        duration: 0.7,
        ease: EASE_OUT,
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <ul ref={ref} className="chapter__list">
      {services.map((service, i) => (
        <li key={service} className="chapter__row">
          <span className="chapter__row-index t-label" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="chapter__row-name">{service}</span>
          <span className="chapter__row-arrow" aria-hidden="true">→</span>
        </li>
      ))}
    </ul>
  );
}

function Chapter({ category, flip }: { category: ServiceCategory; flip: boolean }) {
  const light = category.tone === 'light';

  return (
    <article
      id={category.id}
      className={[
        'chapter',
        light ? 'chapter--light on-light' : '',
        flip ? 'chapter--flip' : '',
      ].join(' ')}
      aria-labelledby={`${category.id}-title`}
    >
      <div className="chapter__inner container">
        <div className="chapter__info">
          <span className="chapter__index t-display" aria-hidden="true">
            {category.index}
          </span>
          <SplitLines as="h3" id={`${category.id}-title`} className="chapter__title t-display">
            {category.title[0]} <em className="t-italic">{category.title[1]}</em>
          </SplitLines>
          <Reveal>
            <p className="chapter__desc">{category.description}</p>
          </Reveal>
          <ServiceList services={category.services} />
          <Reveal delay={0.1}>
            <a
              href="#contact"
              className="arrow-link chapter__cta"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('#contact');
              }}
            >
              Discuss {category.title[0].toLowerCase()}{' '}
              <span className="arrow" aria-hidden="true">↗</span>
            </a>
          </Reveal>
        </div>

        <Reveal variant="wipe" className="chapter__media">
          <ParallaxMedia
            src={category.media.src}
            alt={category.media.alt}
            speed={category.media.contain ? 6 : 10}
            className={category.media.contain ? 'chapter__frame chapter__frame--object' : 'chapter__frame'}
          />
        </Reveal>
      </div>
    </article>
  );
}

/**
 * Service architecture — four numbered chapters, each pairing a discipline
 * with one of the brand's chrome objects. The numbering mirrors the brand
 * book's own sectioning (01 Our Logo, 02 Our Colors, …).
 */
export function Services() {
  return (
    <section id="services" className="section services" aria-labelledby="services-heading">
      <div className="container section-head services__head">
        <p className="eyebrow t-label">What we do</p>
        <SplitLines as="h2" id="services-heading" className="services__title t-display">
          Four disciplines. <em className="t-accent t-italic">One partner.</em>
        </SplitLines>
      </div>

      {SERVICE_CATEGORIES.map((category, i) => (
        <Chapter key={category.id} category={category} flip={i % 2 === 1} />
      ))}
    </section>
  );
}
