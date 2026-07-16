import { useLayoutEffect, useRef } from 'react';
import { SplitLines } from '../motion/SplitLines';
import { Reveal } from '../motion/Reveal';
import { scrollToId } from '../../lib/scroll';
import { SERVICE_CATEGORIES } from '../../data/services';
import { gsap, EASE_OUT } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const serviceTotal = SERVICE_CATEGORIES.reduce((total, category) => total + category.services.length, 0);
const serviceModes = ['Diagnose', 'Shape', 'Launch'];

export function Services() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.service-card');

      cards.forEach((card, index) => {
        const fromLeft = index % 2 === 0;
        const visual = card.querySelector<HTMLElement>('.service-card__visual');
        const services = gsap.utils.toArray<HTMLElement>(card.querySelectorAll('.service-card__service'));

        gsap.from(card, {
          autoAlpha: 0,
          x: fromLeft ? -38 : 38,
          y: 24,
          rotate: fromLeft ? -0.7 : 0.7,
          duration: 0.9,
          ease: EASE_OUT,
          scrollTrigger: { trigger: card, start: 'top 84%', once: true },
        });

        if (visual) {
          gsap.to(visual, {
            yPercent: fromLeft ? -4 : 4,
            rotate: fromLeft ? 0.9 : -0.9,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        }

        gsap.from(services, {
          autoAlpha: 0,
          y: 10,
          duration: 0.45,
          ease: EASE_OUT,
          stagger: 0.035,
          scrollTrigger: { trigger: card, start: 'top 72%', once: true },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={rootRef} id="services" className="services section--navy" aria-labelledby="services-heading">
      <div className="container services__container">
        <div className="services__shell">
          <div className="services__sticky">
            <p className="eyebrow t-label">What we do</p>
            <SplitLines as="h2" id="services-heading" className="services__title t-display">
              Not a menu of services. <em className="t-accent t-italic">A system for momentum.</em>
            </SplitLines>
            <Reveal>
              <p className="services__lede">
                We connect strategy, communication, craft, and technology so each decision feeds the next one.
              </p>
            </Reveal>

            <div className="services__metrics" aria-label="Solu1ions service structure">
              <span className="services__metric">
                <strong>{String(SERVICE_CATEGORIES.length).padStart(2, '0')}</strong>
                <span>Disciplines</span>
              </span>
              <span className="services__metric">
                <strong>{serviceTotal}</strong>
                <span>Services</span>
              </span>
              <span className="services__metric">
                <strong>01</strong>
                <span>Partner</span>
              </span>
            </div>

            <div className="services__modes" aria-label="How we move work forward">
              {serviceModes.map((mode) => (
                <span key={mode}>{mode}</span>
              ))}
            </div>

            <a
              href="#contact"
              className="btn services__cta"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('#contact');
              }}
            >
              Build your stack <span aria-hidden="true">-&gt;</span>
            </a>
          </div>

          <div className="services__stack">
            <div className="services__axis" aria-hidden="true">
              {SERVICE_CATEGORIES.map((category) => (
                <span key={category.id}>{category.index}</span>
              ))}
            </div>

            {SERVICE_CATEGORIES.map((category, index) => {
              const visibleServices = category.services.slice(0, 5);
              const hiddenCount = category.services.length - visibleServices.length;

              return (
                <article
                  key={category.id}
                  id={category.id}
                  className={`service-card service-card--${index + 1} service-card--${index % 2 === 0 ? 'left' : 'right'}`}
                  aria-labelledby={`${category.id}-title`}
                >
                  <div className="service-card__top">
                    <span className="service-card__index t-display" aria-hidden="true">
                      {category.index}
                    </span>
                    <span className="service-card__signal t-label">
                      {index % 2 === 0 ? 'Inside the business' : 'Facing the market'}
                    </span>
                  </div>

                  <div className="service-card__body">
                    <div className="service-card__copy">
                      <SplitLines as="h3" id={`${category.id}-title`} className="service-card__title t-display">
                        {category.title[0]} <em className="t-accent t-italic">{category.title[1]}</em>
                      </SplitLines>
                      <Reveal y={28}>
                        <p className="service-card__desc">{category.description}</p>
                      </Reveal>
                    </div>

                    <Reveal variant="zoom" className="service-card__visual">
                      {category.media.treatment === 'cursor-mark' ? (
                        <span className="service-card__cursor-mark" role="img" aria-label={category.media.alt} />
                      ) : (
                        <img
                          src={category.media.src}
                          alt={category.media.alt}
                          loading="lazy"
                          decoding="async"
                          className={category.media.contain ? 'service-card__img service-card__img--contain' : 'service-card__img'}
                        />
                      )}
                    </Reveal>
                  </div>

                  <ul className="service-card__services" aria-label={`${category.title[0]} services`}>
                    {visibleServices.map((service) => (
                      <li key={service} className="service-card__service">
                        {service}
                      </li>
                    ))}
                    {hiddenCount > 0 && <li className="service-card__service service-card__service--more">+{hiddenCount}</li>}
                  </ul>

                  <a
                    href="#contact"
                    className="arrow-link service-card__link"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId('#contact');
                    }}
                  >
                    Discuss this line <span className="arrow" aria-hidden="true">-&gt;</span>
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
